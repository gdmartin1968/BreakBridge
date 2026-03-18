import { Controller, Post, Body, UseGuards } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { AttendanceImportsService } from "./attendance-imports.service";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { TadpolesImportDto } from "./dto/tadpoles-import.dto";

@ApiTags("attendance-imports")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("attendance-imports")
export class AttendanceImportsController {
  constructor(private readonly service: AttendanceImportsService) {}

  @Post("tadpoles")
  @ApiOperation({
    summary:
      "Import attendance from Tadpoles clipboard paste. Parses raw text, resolves staff, persists snapshot.",
  })
  importTadpoles(@Body() dto: TadpolesImportDto) {
    return this.service.importTadpoles(dto);
  }
}
