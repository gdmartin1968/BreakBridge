import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiQuery, ApiBearerAuth } from "@nestjs/swagger";
import { AttendanceService } from "./attendance.service";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";

@ApiTags("attendance")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("attendance")
export class AttendanceController {
  constructor(private readonly service: AttendanceService) {}

  @Get("snapshots")
  @ApiOperation({ summary: "List attendance snapshots for a location + date" })
  @ApiQuery({ name: "locationId", required: true })
  @ApiQuery({ name: "date", required: false, description: "YYYY-MM-DD" })
  findSnapshots(
    @Query("locationId") locationId: string,
    @Query("date") date?: string,
  ) {
    return this.service.findSnapshots(locationId, date);
  }

  @Get("snapshots/:id")
  @ApiOperation({ summary: "Get snapshot with entries" })
  findSnapshot(@Query("id") id: string) {
    return this.service.findSnapshot(id);
  }
}
