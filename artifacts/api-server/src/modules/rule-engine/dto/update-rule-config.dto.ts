import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsString, IsNotEmpty, IsOptional, IsNumber, IsInt } from "class-validator";

export class UpdateRuleConfigDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  locationId!: string;

  @ApiPropertyOptional({ description: "HH:MM — no breaks allowed after this time", default: "15:00" })
  @IsOptional()
  @IsString()
  breakCutoffTime?: string;

  @ApiPropertyOptional({ default: 30 })
  @IsOptional()
  @IsInt()
  defaultBreakMins?: number;

  @ApiPropertyOptional({ default: 30 })
  @IsOptional()
  @IsInt()
  minBreakGapMins?: number;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @IsInt()
  maxBreaksPerStaff?: number;
}
