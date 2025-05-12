import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsOptional, IsString, Matches, MaxLength, MinLength } from "class-validator";

export class ResetPasswordDto {
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

    @ApiProperty({ example: 'NewPassword123!' })
    @IsString({ message: 'Password must be a string' })
    @MinLength(8, { message: 'Password must be at least 8 characters long' })
    @Matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
        {
            message: 'Password must contain uppercase, lowercase, number and special character'
        }
    )
    password: string;
}
