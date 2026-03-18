import { Module } from "@nestjs/common";
import { BreakPlansController } from "./break-plans.controller";
import { BreaksService } from "./breaks.service";
import { RuleEngineModule } from "../rule-engine/rule-engine.module";

@Module({
  imports: [RuleEngineModule],
  controllers: [BreakPlansController],
  providers: [BreaksService],
  exports: [BreaksService],
})
export class BreaksModule {}
