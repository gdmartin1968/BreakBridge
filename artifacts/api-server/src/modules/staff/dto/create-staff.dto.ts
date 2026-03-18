import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsEnum } from "class-validator";
import { StaffRole } from "@workspace/prisma";

export class CreateStaffDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  locationId!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  classroomId?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  firstName!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  lastName!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  displayName!: string;

  @ApiPropertyOptional({ enum: StaffRole })
  @IsOptional()
  @IsEnum(StaffRole)
  role?: StaffRole;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  noBreaks?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  force30Min?: boolean;
}
