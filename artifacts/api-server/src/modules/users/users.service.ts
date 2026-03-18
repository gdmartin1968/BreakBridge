import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  findAll(orgId: string) {
    return this.prisma.user.findMany({
      where: { organizationId: orgId },
      include: { userRoles: { include: { role: true } } },
      orderBy: { displayName: "asc" },
    });
  }

  findOne(id: string) {
    return this.prisma.user.findUniqueOrThrow({
      where: { id },
      include: { userRoles: { include: { role: true } }, locationAccess: true },
    });
  }

  create(dto: CreateUserDto) {
    return this.prisma.user.create({ data: dto });
  }

  update(id: string, dto: UpdateUserDto) {
    return this.prisma.user.update({ where: { id }, data: dto });
  }
}
