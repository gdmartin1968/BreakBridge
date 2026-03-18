import { Controller, Get, UseGuards } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";

@ApiTags("jobs")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("jobs")
export class JobsController {
  @Get()
  @ApiOperation({
    summary:
      "Job queue status. Phase 1 stub — BullMQ processors active in Phase 2.",
  })
  getStatus() {
    return {
      queues: [
        {
          name: "break-export",
          status: "scaffolded",
          pendingJobs: 0,
          note: "BullMQ processor deferred to Phase 2",
        },
        {
          name: "attendance-import",
          status: "scaffolded",
          pendingJobs: 0,
          note: "BullMQ processor deferred to Phase 2",
        },
      ],
      redisConnected: false,
      note: "Redis connection required. Set REDIS_URL environment variable to enable queues.",
    };
  }
}
