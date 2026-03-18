import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, Query, UseGuards,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiQuery, ApiBearerAuth } from "@nestjs/swagger";
import { BreaksService } from "./breaks.service";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { CreateBreakPlanDto } from "./dto/create-break-plan.dto";
import { ProposeBreakPlanDto } from "./dto/propose-break-plan.dto";
import { UpdateBreakAssignmentDto } from "./dto/update-break-assignment.dto";

// Canonical URL path: /api/break-plans (master prompt requirement)
@ApiTags("break-plans")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("break-plans")
export class BreakPlansController {
  constructor(private readonly service: BreaksService) {}

  @Get()
  @ApiOperation({ summary: "List break plans for a location" })
  @ApiQuery({ name: "locationId", required: true })
  findAll(@Query("locationId") locationId: string) {
    return this.service.findAll(locationId);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get break plan by ID" })
  findOne(@Param("id") id: string) {
    return this.service.findOne(id);
  }

  @Get(":id/assignments")
  @ApiOperation({ summary: "Get all break assignments for a plan (break summary table)" })
  findAssignments(@Param("id") id: string) {
    return this.service.findAssignments(id);
  }

  @Post()
  @ApiOperation({ summary: "Create an empty break plan" })
  create(@Body() dto: CreateBreakPlanDto) {
    return this.service.create(dto);
  }

  @Post("propose")
  @ApiOperation({
    summary:
      "Auto-propose a break plan using the rules engine. Returns ordered BreakAssignment records.",
  })
  propose(@Body() dto: ProposeBreakPlanDto) {
    return this.service.propose(dto);
  }

  @Patch("assignments/:assignmentId")
  @ApiOperation({
    summary:
      "Update a break assignment (callout, exclude, adjust time, mark completed)",
  })
  updateAssignment(
    @Param("assignmentId") assignmentId: string,
    @Body() dto: UpdateBreakAssignmentDto,
  ) {
    return this.service.updateAssignment(assignmentId, dto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete (reset) a break plan" })
  remove(@Param("id") id: string) {
    return this.service.remove(id);
  }
}
