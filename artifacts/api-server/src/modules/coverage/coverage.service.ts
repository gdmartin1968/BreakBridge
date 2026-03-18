import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma.service";
import { CreateCoverageAssignmentDto } from "./dto/create-coverage-assignment.dto";

@Injectable()
export class CoverageService {
  constructor(private prisma: PrismaService) {}

  findAll(breakPlanId: string) {
    return this.prisma.coverageAssignment.findMany({
      where: { breakPlanId },
      include: {
        breaker: true,
        breakAssignment: { include: { staff: true, classroom: true } },
      },
      orderBy: { startTime: "asc" },
    });
  }

  create(dto: CreateCoverageAssignmentDto) {
    return this.prisma.coverageAssignment.create({
      data: {
        breakPlanId: dto.breakPlanId,
        breakAssignmentId: dto.breakAssignmentId,
        breakerStaffId: dto.breakerStaffId,
        startTime: dto.startTime,
        endTime: dto.endTime,
        isManual: true,
      },
      include: { breaker: true },
    });
  }

  async remove(id: string) {
    await this.prisma.coverageAssignment.delete({ where: { id } });
    return { deleted: id };
  }
}
