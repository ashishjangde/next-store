import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength, Matches } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty({ example: 'CurrentPassword123!' })
  @IsString({ message: 'Current password must be a string' })
  currentPassword: string;

  @ApiProperty({ example: 'NewPassword456!' })
  @IsString({ message: 'New password must be a string' })
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    {
      message: 
        'Password must contain at least one uppercase letter, one lowercase letter, one number and one special character'
    }
  )
  newPassword: string;

  @ApiProperty({ example: 'NewPassword456!' })
  @IsString({ message: 'Confirm password must be a string' })
  confirmPassword: string;
}
