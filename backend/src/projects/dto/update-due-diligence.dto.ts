import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsArray, IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength, ValidateNested } from "class-validator";

// FIXED: Added proper DTO for documents
export class DueDiligenceDocumentDto {
  @ApiPropertyOptional({ example: 'Verification Report' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: 'https://cloudinary.com/report.pdf' })
  @IsString()
  @IsNotEmpty()
  url: string;
}

export class UpdateDueDiligenceDto {
  @ApiPropertyOptional({ 
    example: 'Verified all documents. Land title is authentic.',
    description: 'Due diligence notes'
  })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;

  @ApiPropertyOptional({
    type: [DueDiligenceDocumentDto],
    description: 'Additional due diligence documents',
    example: [{
      name: 'Verification Report',
      url: 'https://cloudinary.com/report.pdf'
    }]
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DueDiligenceDocumentDto)
  documents?: DueDiligenceDocumentDto[];

  @ApiPropertyOptional({ 
    example: 'in_progress', 
    description: 'Due diligence status',
    enum: ['pending', 'in_progress', 'completed'] 
  })
  @IsOptional()
  @IsEnum(['pending', 'in_progress', 'completed'])
  status?: string;
}