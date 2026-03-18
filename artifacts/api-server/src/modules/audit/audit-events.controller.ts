import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiQuery, ApiBearerAuth } from "@nestjs/swagger";
import { AuditService } from "./audit.service";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";

// Canonical URL path: /api/audit-events (master prompt requirement)
@ApiTags("audit-events")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("audit-events")
export class AuditEventsController {
  constructor(private readonly service: AuditService) {}

  @Get()
  @ApiOperation({ summary: "List audit events (paginated, scoped to org/location)" })
  @ApiQuery({ name: "locationId", required: false })
  @ApiQuery({ name: "entityType", required: false })
  @ApiQuery({ name: "entityId", required: false })
  @ApiQuery({ name: "page", required: false, type: Number })
  @ApiQuery({ name: "pageSize", required: false, type: Number })
  findAll(
    @Query("locationId") locationId?: string,
    @Query("entityType") entityType?: string,
    @Query("entityId") entityId?: string,
    @Query("page") page = "1",
    @Query("pageSize") pageSize = "25",
  ) {
    return this.service.findAll({
      locationId,
      entityType,
      entityId,
      page: Number(page),
      pageSize: Number(pageSize),
    });
  }
}
