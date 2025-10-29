import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, MaxLength } from "class-validator";

export class RejectProjectDto {
  @ApiProperty({ 
    example: 'Incomplete documentation. Missing land ownership proof.',
    description: 'Reason for rejecting the project'
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  reason: string;
}