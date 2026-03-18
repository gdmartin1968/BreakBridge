import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsNotEmpty } from "class-validator";

export class TadpolesImportDto {
  @ApiProperty({ description: "Location ID to associate the import with" })
  @IsString()
  @IsNotEmpty()
  locationId!: string;

  @ApiProperty({
    description: "Raw clipboard text pasted from the Tadpoles staff status view",
  })
  @IsString()
  @IsNotEmpty()
  rawText!: string;
}
