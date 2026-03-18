import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsString, IsNotEmpty, IsOptional, IsDateString } from "class-validator";

export class CreateBreakPlanDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  locationId!: string;

  @ApiProperty({ description: "ISO date string YYYY-MM-DD" })
  @IsDateString()
  planDate!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  snapshotId?: string;
}
