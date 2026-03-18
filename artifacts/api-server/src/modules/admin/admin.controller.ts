import { Controller, Get, UseGuards } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { Roles, SystemRole } from "../../common/decorators/roles.decorator";
import { RolesGuard } from "../../common/guards/roles.guard";
import { PrismaService } from "../../prisma.service";

@ApiTags("admin")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("admin")
export class AdminController {
  constructor(private prisma: PrismaService) {}

  @Get("organizations")
  @Roles(SystemRole.PLATFORM_ADMIN)
  @ApiOperation({ summary: "Platform admin: list all organizations" })
  async listOrganizations() {
    return this.prisma.organization.findMany({
      include: { _count: { select: { locations: true, users: true } } },
      orderBy: { name: "asc" },
    });
  }

  @Get("users")
  @Roles(SystemRole.PLATFORM_ADMIN)
  @ApiOperation({ summary: "Platform admin: list all users across orgs" })
  async listUsers() {
    return this.prisma.user.findMany({
      include: {
        organization: { select: { name: true } },
        userRoles: { include: { role: true } },
      },
      orderBy: { displayName: "asc" },
      take: 100,
    });
  }

  @Get("status")
  @ApiOperation({ summary: "Platform health and stats overview" })
  async getStatus() {
    const [orgs, locations, classrooms, staff] = await Promise.all([
      this.prisma.organization.count(),
      this.prisma.location.count(),
      this.prisma.classroom.count(),
      this.prisma.staff.count({ where: { isActive: true } }),
    ]);

    return { organizations: orgs, locations, classrooms, activeStaff: staff };
  }
}
