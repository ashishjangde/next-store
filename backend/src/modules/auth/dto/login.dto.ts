import { Injectable } from "@nestjs/common";
import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsOptional, IsString, Matches, MinLength } from "class-validator";

@Injectable()
export class LoginDto {

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
    username?: string;

     @ApiProperty({ example: 'Password123!' })
     @IsString({ message: 'Password must be a string' })
     @MinLength(8, { message: 'Password must be at least 8 characters long' })
     @Matches(
       /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
       {
         message: 
           'Password must contain at least one uppercase letter, one lowercase letter, one number and one special character'
       }
     )
    password :string
}