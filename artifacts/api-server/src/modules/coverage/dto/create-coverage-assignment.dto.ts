import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsNotEmpty } from "class-validator";

export class CreateCoverageAssignmentDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  breakPlanId!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  breakAssignmentId!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  breakerStaffId!: string;

  @ApiProperty({ description: "HH:MM" })
  @IsString()
  @IsNotEmpty()
  startTime!: string;

  @ApiProperty({ description: "HH:MM" })
  @IsString()
  @IsNotEmpty()
  endTime!: string;
}
