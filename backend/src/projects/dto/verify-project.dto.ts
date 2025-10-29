import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString, MaxLength } from "class-validator";

export class VerifyProjectDto {
  @ApiPropertyOptional({ 
    example: 'Project verified and approved for funding',
    description: 'Optional verification notes' 
  })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;
}