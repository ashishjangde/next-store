import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class UserResponseDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  id: string;

  @ApiProperty({ example: 'John Doe' })
  name: string;

  @ApiProperty({ example: 'john@example.com' })
  email: string;

  @ApiProperty({ example: 'johndoe' })
  username: string;

  @ApiProperty({ example: 'https://s3.amazonaws.com/bucket/profile-picture.jpg' })
  @IsOptional()
  profile_picture?: string;

  @ApiProperty({ example: ['USER'] })
  roles: string[];

  @ApiProperty({ example: 'ACTIVE' })
  account_status: string;

  @ApiProperty({ example: true })
  is_verified: boolean;

  @ApiProperty({ example: '2023-01-01T00:00:00.000Z' })
  created_at: Date;

  @ApiProperty({ example: '2023-01-01T00:00:00.000Z' })
  updated_at: Date;
}
