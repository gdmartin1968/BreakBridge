import { Module } from "@nestjs/common";
import { ClassroomsController } from "./classrooms.controller";
import { ClassroomsService } from "./classrooms.service";
import { RuleEngineModule } from "../rule-engine/rule-engine.module";

@Module({
  imports: [RuleEngineModule],
  controllers: [ClassroomsController],
  providers: [ClassroomsService],
  exports: [ClassroomsService],
})
export class ClassroomsModule {}
