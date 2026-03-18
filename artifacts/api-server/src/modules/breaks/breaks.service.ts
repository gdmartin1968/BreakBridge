import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma.service";
import { RuleEngineService } from "../rule-engine/rule-engine.service";
import { CreateBreakPlanDto } from "./dto/create-break-plan.dto";
import { ProposeBreakPlanDto } from "./dto/propose-break-plan.dto";
import { UpdateBreakAssignmentDto } from "./dto/update-break-assignment.dto";

// Time helpers (local HH:MM strings throughout)
function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

function toHHMM(totalMinutes: number): string {
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

@Injectable()
export class BreaksService {
  constructor(
    private prisma: PrismaService,
    private ruleEngine: RuleEngineService,
  ) {}

  findAll(locationId: string) {
    return this.prisma.breakPlan.findMany({
      where: { locationId },
      include: { _count: { select: { assignments: true } } },
      orderBy: { planDate: "desc" },
      take: 10,
    });
  }

  findOne(id: string) {
    return this.prisma.breakPlan.findUniqueOrThrow({ where: { id } });
  }

  findAssignments(breakPlanId: string) {
    return this.prisma.breakAssignment.findMany({
      where: { breakPlanId },
      include: {
        staff: true,
        classroom: true,
        coverageAssignment: { include: { breaker: true } },
      },
      orderBy: { breakStart: "asc" },
    });
  }

  create(dto: CreateBreakPlanDto) {
    return this.prisma.breakPlan.create({
      data: {
        locationId: dto.locationId,
        planDate: new Date(dto.planDate),
        snapshotId: dto.snapshotId,
      },
    });
  }

  // ── Break Proposal Algorithm ─────────────────────────────────────────────

  async propose(dto: ProposeBreakPlanDto) {
    const { locationId } = dto;
    const planDate = dto.planDate ? new Date(dto.planDate) : new Date();

    // 1. Load rule config
    const config = await this.ruleEngine.getConfig(locationId);
    const breakDuration = config.defaultBreakMins;
    const cutoffTime = toMinutes(config.breakCutoffTime);
    const startTime = 8 * 60; // 08:00 — earliest possible break start

    // 2. Load all classrooms + active staff for the location
    const [classrooms, allStaff] = await Promise.all([
      this.prisma.classroom.findMany({ where: { locationId }, orderBy: { sortOrder: "asc" } }),
      this.prisma.staff.findMany({
        where: { locationId, isActive: true },
        include: { classroom: true },
        orderBy: [{ classroom: { sortOrder: "asc" } }, { lastName: "asc" }],
      }),
    ]);

    // 3. Load snapshot if provided — resolve kids counts and call-outs
    const calledOutIds = new Set<string>();
    const kidsCountByClassroom = new Map<string, number>();

    if (dto.snapshotId) {
      const entries = await this.prisma.attendanceSnapshotEntry.findMany({
        where: { snapshotId: dto.snapshotId },
      });
      for (const e of entries) {
        if (e.isCalledOut || e.status === "CALLED_OUT" || e.status === "ABSENT") {
          calledOutIds.add(e.staffId);
        }
        if (e.kidsCount !== null && e.kidsCount !== undefined) {
          const existing = kidsCountByClassroom.get(e.classroomId) ?? 0;
          if (e.kidsCount > existing) {
            kidsCountByClassroom.set(e.classroomId, e.kidsCount);
          }
        }
      }
    }

    // 4. Separate breakers from classroom staff
    const breakers = allStaff.filter((s) => s.role === "BREAKER" && !calledOutIds.has(s.id));
    const classroomStaff = allStaff.filter(
      (s) => s.role === "CLASSROOM" && s.classroomId && !calledOutIds.has(s.id),
    );

    // 5. Group classroom staff by classroom
    const staffByClassroom = new Map<string, typeof classroomStaff>();
    for (const s of classroomStaff) {
      if (!s.classroomId) continue;
      if (!staffByClassroom.has(s.classroomId)) {
        staffByClassroom.set(s.classroomId, []);
      }
      staffByClassroom.get(s.classroomId)!.push(s);
    }

    // 6. Determine eligible staff (can take a break without breaching ratio)
    const eligible: Array<{ staff: (typeof classroomStaff)[0]; classroom: (typeof classrooms)[0] }> = [];

    for (const classroom of classrooms) {
      const roomStaff = staffByClassroom.get(classroom.id) ?? [];
      const kidsCount = kidsCountByClassroom.get(classroom.id) ?? Math.floor(classroom.capacity * 0.6);
      const currentStaffCount = roomStaff.length;

      // A staff member can take a break if the remaining staff still meets ratio
      for (const s of roomStaff) {
        if (s.noBreaks) continue;

        const canLeave =
          this.ruleEngine.evaluateRatioStatus(
            classroom,
            kidsCount,
            currentStaffCount - 1,
          ) !== "FRAGILE" ||
          currentStaffCount - 1 >= Math.ceil(kidsCount * classroom.minStaffRatio);

        if (canLeave && !s.noBreaks) {
          eligible.push({ staff: s, classroom });
        }
      }
    }

    // 7. Schedule breaks — distribute evenly across the day before cutoff
    const usableWindow = cutoffTime - startTime;
    const gapBetweenBreaks = Math.max(
      config.minBreakGapMins,
      eligible.length > 1 ? Math.floor(usableWindow / eligible.length) : usableWindow,
    );

    const assignments: Array<{
      staffId: string;
      classroomId: string;
      breakStart: string;
      breakEnd: string;
      durationMins: number;
      breakerStaffId: string | null;
    }> = [];

    let cursor = startTime + 30; // first break 30 min after open
    let breakerIndex = 0;

    for (const { staff, classroom } of eligible) {
      if (cursor + breakDuration > cutoffTime) break; // past cutoff

      const breakStart = toHHMM(cursor);
      const breakEnd = toHHMM(cursor + breakDuration);

      // Assign a breaker (round-robin)
      const breaker =
        breakers.length > 0 ? breakers[breakerIndex % breakers.length] : null;
      if (breakers.length > 0) breakerIndex++;

      assignments.push({
        staffId: staff.id,
        classroomId: classroom.id,
        breakStart,
        breakEnd,
        durationMins: breakDuration,
        breakerStaffId: breaker?.id ?? null,
      });

      cursor += gapBetweenBreaks;
    }

    // 8. Persist plan + assignments in a transaction
    const plan = await this.prisma.breakPlan.create({
      data: {
        locationId,
        planDate,
        snapshotId: dto.snapshotId,
        generatedBy: "AUTO_PROPOSED",
        status: "ACTIVE",
        assignments: {
          create: assignments.map((a) => ({
            staffId: a.staffId,
            classroomId: a.classroomId,
            breakStart: a.breakStart,
            breakEnd: a.breakEnd,
            durationMins: a.durationMins,
            status: "PENDING",
          })),
        },
      },
      include: { assignments: { include: { staff: true, classroom: true } } },
    });

    // 9. Create coverage assignments (teacher → breaker)
    for (let i = 0; i < assignments.length; i++) {
      const a = assignments[i];
      if (!a.breakerStaffId) continue;
      const planAssignment = plan.assignments[i];
      await this.prisma.coverageAssignment.create({
        data: {
          breakPlanId: plan.id,
          breakAssignmentId: planAssignment.id,
          breakerStaffId: a.breakerStaffId,
          startTime: a.breakStart,
          endTime: a.breakEnd,
          isManual: false,
        },
      });
    }

    return {
      breakPlanId: plan.id,
      status: plan.status,
      generatedBy: plan.generatedBy,
      assignmentsCount: plan.assignments.length,
      assignments: plan.assignments.map((a) => ({
        staffName: a.staff.displayName,
        classroom: a.classroom.name,
        breakStart: a.breakStart,
        breakEnd: a.breakEnd,
        durationMins: a.durationMins,
        status: a.status,
      })),
      breakersAvailable: breakers.length,
      eligibleStaff: eligible.length,
    };
  }

  updateAssignment(id: string, dto: UpdateBreakAssignmentDto) {
    return this.prisma.breakAssignment.update({
      where: { id },
      data: {
        ...(dto.status !== undefined && { status: dto.status }),
        ...(dto.breakStart !== undefined && { breakStart: dto.breakStart }),
        ...(dto.breakEnd !== undefined && { breakEnd: dto.breakEnd }),
        ...(dto.isExcluded !== undefined && { isExcluded: dto.isExcluded }),
        ...(dto.isCalledOut !== undefined && { isCalledOut: dto.isCalledOut }),
        ...(dto.note !== undefined && { note: dto.note }),
        isManualOverride: true,
      },
      include: { staff: true, classroom: true },
    });
  }

  async remove(id: string) {
    await this.prisma.breakPlan.delete({ where: { id } });
    return { deleted: id };
  }
}
