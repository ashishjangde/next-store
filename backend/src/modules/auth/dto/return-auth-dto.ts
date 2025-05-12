import { ApiProperty } from '@nestjs/swagger';
import { AccountStatus, Roles } from '@prisma/client';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class ReturnAuthDto {
  @Expose()
  @ApiProperty({ example: 'uuid-string' })
  id: string;

  @Expose()
  @ApiProperty({ example: 'John Doe' })
  name: string;

  @Expose()
  @ApiProperty({ example: 'john@example.com' })
  email: string;

  @Expose()
  @ApiProperty({ example: 'johndoe' })
  username: string;

  @Expose()
  @ApiProperty({ example: 'http://example.com/uploads/profiles/user.jpg' })
  profile_picture: string;

  @Expose()
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  access_token: string;

  @Expose()
  @ApiProperty({ 
    description: 'User roles',
    enum: Roles,
    isArray: true 
  })
  roles: Roles[];

  @Expose()
  @ApiProperty({ 
    description: 'Account status',
    enum: AccountStatus,
    default: AccountStatus.ACTIVE 
  })
  accountStatus: AccountStatus;

  @Expose()
  @ApiProperty({ 
    description: 'Email verification status',
    example: false 
  })
  is_verified: boolean;

  @Expose()
  @ApiProperty({ 
    description: 'User creation timestamp',
    example: '2023-01-01T00:00:00Z' 
  })
  created_at: Date;

  @Expose()
  @ApiProperty({ 
    description: 'Last update timestamp',
    example: '2023-01-01T00:00:00Z' 
  })
  updated_at: Date;
}
