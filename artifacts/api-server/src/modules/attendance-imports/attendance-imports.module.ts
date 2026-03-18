import { Module } from "@nestjs/common";
import { AttendanceImportsController } from "./attendance-imports.controller";
import { AttendanceImportsService } from "./attendance-imports.service";
import { TadpolesParserService } from "./tadpoles-parser.service";

@Module({
  controllers: [AttendanceImportsController],
  providers: [AttendanceImportsService, TadpolesParserService],
  exports: [AttendanceImportsService],
})
export class AttendanceImportsModule {}
