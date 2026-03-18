import { Controller, Get, Put, Body, Query, UseGuards } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiQuery, ApiBearerAuth } from "@nestjs/swagger";
import { RuleEngineService } from "./rule-engine.service";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { UpdateRuleConfigDto } from "./dto/update-rule-config.dto";

// Canonical URL path: /api/rule-engine (master prompt requirement)
// RuleEngineService itself has no business HTTP controller — only config endpoints.
@ApiTags("rule-engine")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("rule-engine")
export class RuleEngineController {
  constructor(private readonly service: RuleEngineService) {}

  @Get("config")
  @ApiOperation({ summary: "Get rule configuration for a location" })
  @ApiQuery({ name: "locationId", required: true })
  getConfig(@Query("locationId") locationId: string) {
    return this.service.getConfig(locationId);
  }

  @Put("config")
  @ApiOperation({ summary: "Update rule configuration for a location" })
  updateConfig(@Body() dto: UpdateRuleConfigDto) {
    return this.service.updateConfig(dto);
  }
}
