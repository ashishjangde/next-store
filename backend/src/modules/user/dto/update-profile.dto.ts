import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class UpdateProfileDto {
  @ApiProperty({ example: 'John Doe' })
  @IsOptional()
  @IsString({ message: 'Name must be a string' })
  @MinLength(2, { message: 'Name must be at least 2 characters long' })
  @MaxLength(50, { message: 'Name cannot exceed 50 characters' })
  name?: string;

  @ApiProperty({ example: 'johndoe' })
  @IsOptional()
  @IsString({ message: 'Username must be a string' })
  @MinLength(3, { message: 'Username must be at least 3 characters long' })
  @Matches(/^[a-zA-Z0-9._]{3,30}$/, {
    message: 'Username can only contain letters, numbers, dots and underscores, and must be between 3-30 characters'
  })
  username?: string;

  @ApiProperty({ example: 'john@example.com' })
  @IsOptional()
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email?: string;
}
