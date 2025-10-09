import { ApiProperty } from "@nestjs/swagger";
import { IsString, MinLength } from "class-validator";

// src/auth/dto/reset-password.dto.ts

export class ResetPasswordDto {
  @ApiProperty({ example: 'reset-token-here' })
  @IsString()
  token: string;

  @ApiProperty({ example: 'NewPassword123!' })
  @IsString()
  @MinLength(8)
  newPassword: string;
}
