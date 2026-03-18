import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiQuery, ApiBearerAuth } from "@nestjs/swagger";
import { ClassroomsService } from "./classrooms.service";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";

@ApiTags("classrooms")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("classrooms")
export class ClassroomsController {
  constructor(private readonly service: ClassroomsService) {}

  @Get()
  @ApiOperation({
    summary:
      "List classrooms for a location with live ratio status (Green / Fragile / Maxed)",
  })
  @ApiQuery({ name: "locationId", required: true })
  findAll(@Query("locationId") locationId: string) {
    return this.service.findAll(locationId);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get classroom by ID" })
  findOne(@Query("id") id: string) {
    return this.service.findOne(id);
  }
}
