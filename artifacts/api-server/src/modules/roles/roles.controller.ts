import { Controller, Get, UseGuards } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { RolesService } from "./roles.service";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";

@ApiTags("roles")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("roles")
export class RolesController {
  constructor(private readonly service: RolesService) {}

  @Get()
  @ApiOperation({ summary: "List system roles (read-only in Phase 1)" })
  findAll() {
    return this.service.findAll();
  }
}
