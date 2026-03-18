import { Controller, Get, Post, Body, Param, UseGuards } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { OrganizationsService } from "./organizations.service";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { CreateOrganizationDto } from "./dto/create-organization.dto";

@ApiTags("organizations")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("organizations")
export class OrganizationsController {
  constructor(private readonly service: OrganizationsService) {}

  @Get()
  @ApiOperation({ summary: "List all organizations (platform admin)" })
  findAll() {
    return this.service.findAll();
  }

  @Get(":id")
  @ApiOperation({ summary: "Get organization by ID" })
  findOne(@Param("id") id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: "Create organization" })
  create(@Body() dto: CreateOrganizationDto) {
    return this.service.create(dto);
  }
}
