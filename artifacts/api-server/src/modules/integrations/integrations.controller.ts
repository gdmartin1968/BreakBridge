import { Controller, Get, UseGuards } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";

/**
 * Integrations module — external system adapters.
 * Tadpoles import is handled via /api/attendance-imports/tadpoles.
 * This controller exposes integration metadata and future adapter endpoints.
 */
@ApiTags("integrations")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("integrations")
export class IntegrationsController {
  @Get()
  @ApiOperation({ summary: "List available integrations and their status" })
  listIntegrations() {
    return {
      integrations: [
        {
          id: "tadpoles",
          name: "Tadpoles",
          description: "Attendance snapshot import via clipboard paste",
          status: "active",
          importEndpoint: "/api/attendance-imports/tadpoles",
        },
        {
          id: "uipath",
          name: "UIPath Automation",
          description: "Break plan export for RPA automation",
          status: "planned",
          exportEndpoint: "/api/exports/break-plan/:id?format=json",
        },
      ],
    };
  }
}
