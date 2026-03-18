import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma.service";
import { CreateOrganizationDto } from "./dto/create-organization.dto";

@Injectable()
export class OrganizationsService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.organization.findMany({ orderBy: { name: "asc" } });
  }

  findOne(id: string) {
    return this.prisma.organization.findUniqueOrThrow({ where: { id } });
  }

  create(dto: CreateOrganizationDto) {
    return this.prisma.organization.create({ data: dto });
  }
}
