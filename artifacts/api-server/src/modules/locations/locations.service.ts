import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma.service";

@Injectable()
export class LocationsService {
  constructor(private prisma: PrismaService) {}

  findAll(orgId?: string) {
    return this.prisma.location.findMany({
      where: orgId ? { organizationId: orgId } : undefined,
      orderBy: { createdAt: "asc" },
    });
  }

  findOne(id: string) {
    return this.prisma.location.findUniqueOrThrow({ where: { id } });
  }
}
