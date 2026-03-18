import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma.service";

@Injectable()
export class ExportsService {
  constructor(private prisma: PrismaService) {}

  async exportCsv(breakPlanId: string): Promise<string> {
    const assignments = await this.getAssignments(breakPlanId);
    const plan = await this.prisma.breakPlan.findUniqueOrThrow({
      where: { id: breakPlanId },
    });

    const header = "staffName,classroom,breakStart,breakEnd,coveredBy,status";
    const rows = assignments.map((a) => {
      const coveredBy = a.coverageAssignment?.breaker?.displayName ?? "";
      return [
        this.csvEscape(a.staff.displayName),
        this.csvEscape(a.classroom.name),
        a.breakStart,
        a.breakEnd,
        this.csvEscape(coveredBy),
        a.status,
      ].join(",");
    });

    return [header, ...rows].join("\n");
  }

  async exportJson(breakPlanId: string) {
    const assignments = await this.getAssignments(breakPlanId);
    const plan = await this.prisma.breakPlan.findUniqueOrThrow({
      where: { id: breakPlanId },
    });

    return {
      breakPlanId: plan.id,
      locationId: plan.locationId,
      generatedAt: new Date().toISOString(),
      assignments: assignments.map((a) => ({
        staffId: a.staffId,
        staffName: a.staff.displayName,
        classroom: a.classroom.name,
        breakStart: a.breakStart,
        breakEnd: a.breakEnd,
        coveredBy: a.coverageAssignment?.breaker?.displayName ?? null,
        status: a.status.toLowerCase(),
      })),
    };
  }

  private async getAssignments(breakPlanId: string) {
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

  private csvEscape(value: string): string {
    if (value.includes(",") || value.includes('"') || value.includes("\n")) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  }
}
