import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString, IsBoolean, IsEnum } from "class-validator";
import { BreakAssignmentStatus } from "@workspace/prisma";

export class UpdateBreakAssignmentDto {
  @ApiPropertyOptional({ enum: BreakAssignmentStatus })
  @IsOptional()
  @IsEnum(BreakAssignmentStatus)
  status?: BreakAssignmentStatus;

  @ApiPropertyOptional({ description: "HH:MM" })
  @IsOptional()
  @IsString()
  breakStart?: string;

  @ApiPropertyOptional({ description: "HH:MM" })
  @IsOptional()
  @IsString()
  breakEnd?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isExcluded?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isCalledOut?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  note?: string;
}
