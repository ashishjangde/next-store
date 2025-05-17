import { Injectable, Logger, HttpStatus } from '@nestjs/common';
import { Users } from '@prisma/client';
import { UserRepositories } from 'src/repositories/user-repositories';
import { SessionRepositories } from 'src/repositories/session-repositories';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import ApiError from 'src/common/responses/ApiError';
import { hashPassword, comparePassword } from 'src/common/utils/password.utils';
import { MulterS3ConfigService } from 'src/common/storage/multer-s3.config';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);
  
  constructor(
    private readonly userRepo: UserRepositories,
    private readonly sessionRepo: SessionRepositories,
    private readonly multerS3Service: MulterS3ConfigService,
  ) {}

  async getUserProfile(userId: string): Promise<Users> {
    const user = await this.userRepo.findUserById(userId);
    
    if (!user) {
      throw new ApiError(HttpStatus.NOT_FOUND, 'User not found');
    }
    
    return user;
  }

  async updateProfile(userId: string, updateProfileDto: UpdateProfileDto): Promise<Users> {
    const user = await this.userRepo.findUserById(userId);
    
    if (!user) {
      throw new ApiError(HttpStatus.NOT_FOUND, 'User not found');
    }

    // Check if email update is requested and validate it's not taken
    if (updateProfileDto.email && updateProfileDto.email !== user.email) {
      const existingEmail = await this.userRepo.findUserByEmail(updateProfileDto.email);
      if (existingEmail) {
        throw new ApiError(HttpStatus.CONFLICT, 'Email is already in use');
      }
    }

    // Check if username update is requested and validate it's not taken
    if (updateProfileDto.username && updateProfileDto.username !== user.username) {
      const existingUsername = await this.userRepo.findUserByUsername(updateProfileDto.username, true);
      if (existingUsername) {
        throw new ApiError(HttpStatus.CONFLICT, 'Username is already taken');
      }
    }

    const updatedUser = await this.userRepo.updateUser(userId, updateProfileDto);
    
    if (!updatedUser) {
      throw new ApiError(HttpStatus.INTERNAL_SERVER_ERROR, 'Failed to update profile');
    }
    
    return updatedUser;
  }

  async updateProfilePicture(userId: string, file: Express.Multer.File): Promise<Users> {
    const user = await this.userRepo.findUserById(userId);
    
    if (!user) {
      throw new ApiError(HttpStatus.NOT_FOUND, 'User not found');
    }

    try {
      // Delete existing profile picture if exists
      if (user.profile_picture) {
        await this.multerS3Service.deleteFile(user.profile_picture);
      }

      // Upload new profile picture
      const multerOptions = this.multerS3Service.createMulterOptions('profilePicture');
      
      const fileInfo = await new Promise((resolve, reject) => {
        multerOptions.storage._handleFile(
          { file } as any,
          file,
          (error: any, info: any) => {
            if (error) {
              this.logger.error(`Upload handler error: ${error.message}`, error.stack);
              reject(error);
            } else {
              this.logger.debug(`Upload successful: ${JSON.stringify(info)}`);
              resolve(info);
            }
          }
        );
      });

      if (!fileInfo) {
        throw new ApiError(HttpStatus.INTERNAL_SERVER_ERROR, 'Failed to upload profile picture');
      }

      const updatedUser = await this.userRepo.updateUser(userId, {
        profile_picture: (fileInfo as any).url
      });

      if (!updatedUser) {
        throw new ApiError(HttpStatus.INTERNAL_SERVER_ERROR, 'Failed to update user with new profile picture');
      }

      return updatedUser;
    } catch (error) {
      this.logger.error(`Error updating profile picture: ${error.message}`);
      throw new ApiError(
        HttpStatus.INTERNAL_SERVER_ERROR, 
        'Failed to update profile picture'
      );
    }
  }
  async changePassword(userId: string, changePasswordDto: ChangePasswordDto, currentSessionToken?: string): Promise<void> {
    const { currentPassword, newPassword, confirmPassword } = changePasswordDto;
    
    if (newPassword !== confirmPassword) {
      throw new ApiError(HttpStatus.BAD_REQUEST, 'New password and confirm password do not match');
    }

    const user = await this.userRepo.findUserById(userId);
    
    if (!user) {
      throw new ApiError(HttpStatus.NOT_FOUND, 'User not found');
    }

    // Verify current password
    const isPasswordValid = await comparePassword(currentPassword, user.password);
    
    if (!isPasswordValid) {
      throw new ApiError(HttpStatus.UNAUTHORIZED, 'Current password is incorrect');
    }

    // Hash new password and update
    const hashedPassword = await hashPassword(newPassword);
    
    const updatedUser = await this.userRepo.updateUser(userId, {
      password: hashedPassword
    });

    if (!updatedUser) {
      throw new ApiError(HttpStatus.INTERNAL_SERVER_ERROR, 'Failed to update password');
    }
    
    // Delete all other sessions for security
    if (currentSessionToken) {
      try {
        const result = await this.sessionRepo.deleteAllSessionsExceptOne(userId, currentSessionToken);
        this.logger.debug(`Deleted ${result.count} sessions after password change for user: ${userId}`);
      } catch (error) {
        this.logger.error(`Failed to delete other sessions after password change: ${error.message}`);
        // Don't throw error, as the password was changed successfully
      }
    }
  }
  async deleteAccount(userId: string): Promise<void> {
    const user = await this.userRepo.findUserById(userId);
    
    if (!user) {
      throw new ApiError(HttpStatus.NOT_FOUND, 'User not found');
    }

    // Delete all sessions for this user first
    try {
      const result = await this.sessionRepo.deleteAllUserSessions(userId);
      this.logger.debug(`Deleted ${result.count} sessions for user: ${userId}`);
    } catch (error) {
      this.logger.error(`Failed to delete sessions for user ${userId}: ${error.message}`);
      // Continue with account deletion even if session deletion fails
    }

    // Delete profile picture if exists
    if (user.profile_picture) {
      try {
        await this.multerS3Service.deleteFile(user.profile_picture);
      } catch (error) {
        this.logger.error(`Error deleting profile picture: ${error.message}`);
      }
    }

    const deleted = await this.userRepo.deleteUser(userId);
    
    if (!deleted) {
      throw new ApiError(HttpStatus.INTERNAL_SERVER_ERROR, 'Failed to delete user account');
    }
  }
}
