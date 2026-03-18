import { Module } from "@nestjs/common";
import { JobsController } from "./jobs.controller";

/**
 * Jobs module — BullMQ queue scaffold.
 * Queue processors are deferred to Phase 2 (BullMQ + Redis execution).
 * Phase 1: module present, controller exposes queue status stub.
 * Named queues declared: "break-export", "attendance-import".
 */
@Module({
  controllers: [JobsController],
})
export class JobsModule {}
