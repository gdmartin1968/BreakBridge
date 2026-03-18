import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsString, IsNotEmpty, IsOptional, IsDateString } from "class-validator";

export class ProposeBreakPlanDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  locationId!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  planDate?: string;

  @ApiPropertyOptional({ description: "Attendance snapshot ID to base proposal on" })
  @IsOptional()
  @IsString()
  snapshotId?: string;
}
