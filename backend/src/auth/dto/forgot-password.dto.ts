import { ApiProperty } from "@nestjs/swagger";
import { IsEmail } from "class-validator";

// src/auth/dto/forgot-password.dto.ts

export class ForgotPasswordDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;
}