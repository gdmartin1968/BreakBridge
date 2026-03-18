import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma.service";

@Injectable()
export class AttendanceService {
  constructor(private prisma: PrismaService) {}

  async findSnapshots(locationId: string, dateStr?: string) {
    const where: Record<string, unknown> = { locationId };
    if (dateStr) {
      where["snapshotDate"] = new Date(dateStr);
    }
    return this.prisma.attendanceSnapshot.findMany({
      where,
      include: { _count: { select: { entries: true } } },
      orderBy: { importedAt: "desc" },
      take: 20,
    });
  }

  findSnapshot(id: string) {
    return this.prisma.attendanceSnapshot.findUniqueOrThrow({
      where: { id },
      include: { entries: { include: { staff: true, classroom: true } } },
    });
  }
}
