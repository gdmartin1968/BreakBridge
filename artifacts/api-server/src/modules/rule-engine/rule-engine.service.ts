import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma.service";
import { UpdateRuleConfigDto } from "./dto/update-rule-config.dto";
import type { RuleConfig, AttendanceSnapshot, Classroom, Staff } from "@workspace/prisma";

export type RatioStatus = "GREEN" | "FRAGILE" | "MAXED";

export interface ClassroomStatus {
  classroomId: string;
  ratioStatus: RatioStatus;
  currentKids: number;
  currentStaff: number;
  napWindowActive: boolean;
  pastBreakCutoff: boolean;
}

@Injectable()
export class RuleEngineService {
  constructor(private prisma: PrismaService) {}

  // ── Config management ────────────────────────────────────────────────────

  async getConfig(locationId: string) {
    const existing = await this.prisma.ruleConfig.findUnique({ where: { locationId } });
    if (existing) return existing;
    // Create default config on first access
    return this.prisma.ruleConfig.create({
      data: {
        locationId,
        breakCutoffTime: "15:00",
        defaultBreakMins: 30,
        minBreakGapMins: 30,
        maxBreaksPerStaff: 1,
      },
    });
  }

  async updateConfig(dto: UpdateRuleConfigDto) {
    return this.prisma.ruleConfig.upsert({
      where: { locationId: dto.locationId },
      create: { ...dto },
      update: { ...dto },
    });
  }

  // ── Core rule evaluation (pure functions — no I/O) ───────────────────────

  /**
   * Evaluate ratio status for a classroom given current kids and staff counts.
   * GREEN:  at or above minimum staff ratio
   * FRAGILE: one staff departure would breach ratio
   * MAXED:  at or above maximum kids capacity
   */
  evaluateRatioStatus(
    classroom: Pick<Classroom, "maxKidsPerRoom" | "minStaffRatio">,
    currentKids: number,
    currentStaff: number,
  ): RatioStatus {
    if (currentKids >= classroom.maxKidsPerRoom) return "MAXED";
    const requiredStaff = Math.ceil(currentKids * classroom.minStaffRatio);
    if (currentStaff <= requiredStaff) return "FRAGILE";
    return "GREEN";
  }

  /**
   * Determine if a staff member is eligible for a break given the current snapshot.
   * Phase 1: basic eligibility — not called out, not excluded, not no-breaks.
   */
  isEligibleForBreak(
    staff: Pick<Staff, "noBreaks" | "role">,
    options: { isCalledOut: boolean; isExcluded: boolean },
  ): boolean {
    if (staff.noBreaks) return false;
    if (options.isCalledOut || options.isExcluded) return false;
    if (staff.role === "NON_CLASSROOM") return false;
    return true;
  }

  /**
   * Check if current time is within the break window (before cutoff).
   */
  isWithinBreakWindow(timeHHMM: string, ruleConfig: Pick<RuleConfig, "breakCutoffTime">): boolean {
    const [h, m] = timeHHMM.split(":").map(Number);
    const [ch, cm] = ruleConfig.breakCutoffTime.split(":").map(Number);
    const now = h * 60 + m;
    const cutoff = ch * 60 + cm;
    return now < cutoff;
  }

  /**
   * Check if nap window is currently active for a classroom.
   */
  isNapWindowActive(
    classroom: Pick<Classroom, "isNapRoom" | "napWindowStart" | "napWindowEnd">,
    currentTimeHHMM: string,
  ): boolean {
    if (!classroom.isNapRoom || !classroom.napWindowStart || !classroom.napWindowEnd) {
      return false;
    }
    const [h, m] = currentTimeHHMM.split(":").map(Number);
    const current = h * 60 + m;
    const [sh, sm] = classroom.napWindowStart.split(":").map(Number);
    const [eh, em] = classroom.napWindowEnd.split(":").map(Number);
    return current >= sh * 60 + sm && current <= eh * 60 + em;
  }
}
