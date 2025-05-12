import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsOptional, IsString, Matches, MaxLength, MinLength } from "class-validator";

export class VerifyVerificationCode {

    @ApiProperty({ example: 'john@example.com' })
    @IsEmail({}, { message: 'Please provide a valid email address' })
    @IsOptional()
    email : string

    @ApiProperty({ example: 'johndoe' })
    @IsString({ message: 'Username must be a string' })
    @MinLength(3, { message: 'Username must be at least 3 characters long' })
    @Matches(/^[a-zA-Z0-9._]{3,10}$/, {
      message: 'Username can only contain letters, numbers, dots and underscores, and must be between 3-30 characters'
    })
    @IsOptional()
    username: string;

    @ApiProperty({ example: '123456' })
    @IsString({ message: 'OTP must be a string' })
    @MinLength(6, { message: 'OTP must be 6 characters' })
    @MaxLength(6, { message: 'OTP must be 6 characters' })
    verification_code: string;
}
