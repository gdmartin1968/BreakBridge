import {
  Controller, Get, Post, Delete,
  Body, Param, Query, UseGuards,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiQuery, ApiBearerAuth } from "@nestjs/swagger";
import { CoverageService } from "./coverage.service";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { CreateCoverageAssignmentDto } from "./dto/create-coverage-assignment.dto";

// Canonical URL path: /api/coverage-assignments (master prompt requirement)
@ApiTags("coverage-assignments")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("coverage-assignments")
export class CoverageAssignmentsController {
  constructor(private readonly service: CoverageService) {}

  @Get()
  @ApiOperation({ summary: "Get coverage assignments for a break plan (teacher → breaker map)" })
  @ApiQuery({ name: "breakPlanId", required: true })
  findAll(@Query("breakPlanId") breakPlanId: string) {
    return this.service.findAll(breakPlanId);
  }

  @Post()
  @ApiOperation({ summary: "Manually create a coverage assignment" })
  create(@Body() dto: CreateCoverageAssignmentDto) {
    return this.service.create(dto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Remove a coverage assignment" })
  remove(@Param("id") id: string) {
    return this.service.remove(id);
  }
}
