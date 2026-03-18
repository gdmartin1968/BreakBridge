import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiQuery, ApiBearerAuth } from "@nestjs/swagger";
import { LocationsService } from "./locations.service";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";

@ApiTags("locations")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("locations")
export class LocationsController {
  constructor(private readonly service: LocationsService) {}

  @Get()
  @ApiOperation({ summary: "List locations for an organization" })
  @ApiQuery({ name: "orgId", required: false })
  findAll(@Query("orgId") orgId?: string) {
    return this.service.findAll(orgId);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get location by ID" })
  findOne(@Query("id") id: string) {
    return this.service.findOne(id);
  }
}
