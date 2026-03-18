import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma.service";
import { RuleEngineService, RatioStatus } from "../rule-engine/rule-engine.service";

@Injectable()
export class ClassroomsService {
  constructor(
    private prisma: PrismaService,
    private ruleEngine: RuleEngineService,
  ) {}

  async findAll(locationId: string) {
    const now = new Date();
    const timeHHMM = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

    const [classrooms, config] = await Promise.all([
      this.prisma.classroom.findMany({
        where: { locationId },
        include: {
          staff: { where: { isActive: true } },
          snapshotEntries: {
            take: 50,
            orderBy: { snapshot: { importedAt: "desc" } },
            include: { snapshot: true },
          },
        },
        orderBy: { sortOrder: "asc" },
      }),
      this.ruleEngine.getConfig(locationId),
    ]);

    return classrooms.map((c) => {
      // Get kid count from the most recent snapshot entry for this classroom
      const latestEntry = c.snapshotEntries
        .filter((e) => e.kidsCount !== null)
        .sort((a, b) => b.snapshot.importedAt.getTime() - a.snapshot.importedAt.getTime())[0];

      const currentKids =
        latestEntry?.kidsCount ??
        // If no snapshot, use 60% of capacity as a sensible default
        Math.floor(c.capacity * 0.6);

      const presentStaff = c.staff.filter((s) => s.isActive);
      const currentStaff = presentStaff.length;

      const ratioStatus: RatioStatus = this.ruleEngine.evaluateRatioStatus(
        c,
        currentKids,
        currentStaff,
      );

      const napWindowActive = this.ruleEngine.isNapWindowActive(c, timeHHMM);
      const pastBreakCutoff = !this.ruleEngine.isWithinBreakWindow(timeHHMM, config);

      // Remove large nested arrays from response to keep it lean
      const { snapshotEntries, staff, ...rest } = c;
      return {
        ...rest,
        staffCount: currentStaff,
        currentKids,
        ratioStatus,
        napWindowActive,
        pastBreakCutoff,
        canSendOnBreak: ratioStatus === "GREEN" && !pastBreakCutoff,
      };
    });
  }

  findOne(id: string) {
    return this.prisma.classroom.findUniqueOrThrow({ where: { id } });
  }
}
