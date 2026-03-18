import { Controller, Get, Param, Query, Res, UseGuards } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiQuery, ApiBearerAuth } from "@nestjs/swagger";
import type { Response } from "express";
import { ExportsService } from "./exports.service";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";

@ApiTags("exports")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("exports")
export class ExportsController {
  constructor(private readonly service: ExportsService) {}

  @Get("break-plan/:id")
  @ApiOperation({
    summary:
      "Export a break plan. format=csv returns a downloadable CSV. format=json returns UIPath-compatible envelope.",
  })
  @ApiQuery({ name: "format", enum: ["csv", "json"], required: false })
  async exportBreakPlan(
    @Param("id") id: string,
    @Query("format") format: "csv" | "json" = "csv",
    @Res() res: Response,
  ) {
    if (format === "csv") {
      const csv = await this.service.exportCsv(id);
      res.setHeader("Content-Type", "text/csv");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="break-plan-${id}.csv"`,
      );
      res.send(csv);
    } else {
      const json = await this.service.exportJson(id);
      res.json(json);
    }
  }
}
