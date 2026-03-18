import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiQuery, ApiBearerAuth } from "@nestjs/swagger";
import { StaffService } from "./staff.service";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { CreateStaffDto } from "./dto/create-staff.dto";
import { UpdateStaffDto } from "./dto/update-staff.dto";

@ApiTags("staff")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("staff")
export class StaffController {
  constructor(private readonly service: StaffService) {}

  @Get()
  @ApiOperation({ summary: "List staff for a location with break context" })
  @ApiQuery({ name: "locationId", required: true })
  findAll(@Query("locationId") locationId: string) {
    return this.service.findAll(locationId);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get staff member by ID" })
  findOne(@Param("id") id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: "Create staff member" })
  create(@Body() dto: CreateStaffDto) {
    return this.service.create(dto);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update staff member" })
  update(@Param("id") id: string, @Body() dto: UpdateStaffDto) {
    return this.service.update(id, dto);
  }
}
