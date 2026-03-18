import { Module } from "@nestjs/common";
import { CoverageAssignmentsController } from "./coverage-assignments.controller";
import { CoverageService } from "./coverage.service";

@Module({
  controllers: [CoverageAssignmentsController],
  providers: [CoverageService],
  exports: [CoverageService],
})
export class CoverageModule {}
