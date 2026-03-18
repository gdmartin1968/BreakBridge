import { Controller, Get } from "@nestjs/common";
import { ApiTags, ApiOperation } from "@nestjs/swagger";

@ApiTags("health")
@Controller()
export class HealthController {
  @Get("healthz")
  @ApiOperation({ summary: "Health check" })
  check() {
    return { status: "ok" };
  }
}
