import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { PrismaModule } from "./prisma.module";
import { HealthModule } from "./modules/health/health.module";
import { AuthModule } from "./modules/auth/auth.module";
import { OrganizationsModule } from "./modules/organizations/organizations.module";
import { LocationsModule } from "./modules/locations/locations.module";
import { ClassroomsModule } from "./modules/classrooms/classrooms.module";
import { StaffModule } from "./modules/staff/staff.module";
import { UsersModule } from "./modules/users/users.module";
import { RolesModule } from "./modules/roles/roles.module";
import { AttendanceModule } from "./modules/attendance/attendance.module";
import { AttendanceImportsModule } from "./modules/attendance-imports/attendance-imports.module";
import { BreaksModule } from "./modules/breaks/breaks.module";
import { CoverageModule } from "./modules/coverage/coverage.module";
import { RuleEngineModule } from "./modules/rule-engine/rule-engine.module";
import { AuditModule } from "./modules/audit/audit.module";
import { IntegrationsModule } from "./modules/integrations/integrations.module";
import { ExportsModule } from "./modules/exports/exports.module";
import { JobsModule } from "./modules/jobs/jobs.module";
import { AdminModule } from "./modules/admin/admin.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    HealthModule,
    AuthModule,
    OrganizationsModule,
    LocationsModule,
    ClassroomsModule,
    StaffModule,
    UsersModule,
    RolesModule,
    AttendanceModule,
    AttendanceImportsModule,
    BreaksModule,
    CoverageModule,
    RuleEngineModule,
    AuditModule,
    IntegrationsModule,
    ExportsModule,
    JobsModule,
    AdminModule,
  ],
})
export class AppModule {}
