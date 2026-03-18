import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma.service";
import { CreateStaffDto } from "./dto/create-staff.dto";
import { UpdateStaffDto } from "./dto/update-staff.dto";

@Injectable()
export class StaffService {
  constructor(private prisma: PrismaService) {}

  findAll(locationId: string) {
    return this.prisma.staff.findMany({
      where: { locationId, isActive: true },
      include: { classroom: true },
      orderBy: { lastName: "asc" },
    });
  }

  findOne(id: string) {
    return this.prisma.staff.findUniqueOrThrow({ where: { id }, include: { classroom: true } });
  }

  create(dto: CreateStaffDto) {
    return this.prisma.staff.create({ data: dto });
  }

  update(id: string, dto: UpdateStaffDto) {
    return this.prisma.staff.update({ where: { id }, data: dto });
  }
}
