import { Injectable, ConflictException, BadRequestException, Logger, HttpStatus } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { hashPassword , comparePassword } from 'src/common/utils/password.utils';
import { OtpUtil } from 'src/common/utils/otp.util';
import { MulterS3ConfigService } from 'src/common/storage/multer-s3.config';
import { EmailService } from 'src/common/utils/email.service';
import { ReturnAuthDto } from './dto/return-auth-dto';
import ApiError from 'src/common/responses/ApiError';
import { plainToClass } from 'class-transformer';
import { UserRepositories } from 'src/repositories/user-repositories';
import { Roles, Users } from '@prisma/client';
import { LoginDto } from './dto/login.dto';
import { JwtService } from 'src/common/jwt/jwt.service';
import { SessionRepositories } from 'src/repositories/session-repositories';
import { ResetPasswordDto } from './dto/reset-password.dto';
import {VerifyVerificationCode } from './dto/verify-verificationcode.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';

@Injectable()
export class AuthService {

  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly userRepo: UserRepositories,
    private readonly multerS3Service: MulterS3ConfigService,
    private readonly emailService: EmailService,
    private readonly jwtService: JwtService,
    private readonly sessionRepo : SessionRepositories
  ) {}

  async register(registerDto: RegisterDto, file?: Express.Multer.File) {
    this.logger.debug(`Starting registration for email: ${registerDto.email}`);
    const { email, password, username } = registerDto;

    const existingUser = await this.userRepo.findUserByEmail(email);
    this.logger.debug(`Existing user check result: ${!!existingUser}`);

    if (existingUser?.is_verified) {
      this.logger.debug(`Registration blocked - verified user exists with email: ${email}`);
      throw new ApiError(
        HttpStatus.CONFLICT,
        'Account already exists with this email'
      );
    }

    if (username) {
      this.logger.debug(`Checking username availability: ${username}`);
      const existingUsername = await this.userRepo.findUserByUsername(username, true);
      if (existingUsername) {
        this.logger.debug(`Registration blocked - username ${username} already taken`);
        throw new ApiError(
          HttpStatus.CONFLICT,
          'Username already taken by a verified user'
        );
      }
    }

    const hashedPassword = await hashPassword(password);
    const verificationCode = OtpUtil.generateOtp();
    const verificationExpiry = OtpUtil.getExpirationTime(10);

    const userData = {
      ...registerDto,
      password: hashedPassword,
      profile_picture: null,
      verification_code: verificationCode,
      verification_code_expire_at: verificationExpiry,
      is_verified: false,
      roles: [Roles.USER]
    };

    let user: Users;
    if (existingUser) {
      this.logger.log(`Updating existing unverified user: ${existingUser.id}`);
      const updatedUser = await this.userRepo.updateUser(existingUser.id, userData);
      if (!updatedUser) {
        this.logger.error(`Failed to update user: ${existingUser.id}`);
        throw new ApiError(HttpStatus.BAD_REQUEST, 'Failed to update user');
      }
      user = updatedUser;
    } else {
      this.logger.log('Creating new user');
      const newUser = await this.userRepo.createUser(userData);
      if (!newUser) {
        this.logger.error('Failed to create new user');
        throw new ApiError(HttpStatus.BAD_REQUEST, 'Failed to create user');
      }
      user = newUser;
    }

    if (file) {
      this.logger.debug('Processing profile picture upload');
      try {
        if (existingUser?.profile_picture) {
          this.logger.debug(`Deleting existing profile picture: ${existingUser.profile_picture}`);
          await this.multerS3Service.deleteFile(existingUser.profile_picture);
        }

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

        if (fileInfo) {
          this.logger.debug('Updating user with new profile picture URL');
          const updatedUser = await this.userRepo.updateUser(user.id, {
            profile_picture: (fileInfo as any).url
          });
          if (!updatedUser) {
            throw new ApiError(HttpStatus.INTERNAL_SERVER_ERROR, 'Failed to update profile picture');
          }
          user = updatedUser;
        }
      } catch (error) {
        this.logger.error(`File upload error: ${error.message}`, error.stack);
      }
    }

    this.logger.log(`Sending verification email to: ${user.email}`);
    this.emailService.sendVerificationEmail(
      user.email,
      user.name,
      verificationCode
    );

    this.logger.debug(`Registration completed for user: ${user.id}`);
    return {
      isExisting: !!existingUser,
      data: plainToClass(ReturnAuthDto, user)
    };
  }

  async verify(verifyDto: VerifyVerificationCode, ipAddress?: string, userAgent?: string) {
    const { email, username, verification_code } = verifyDto;
  
    // Find user by username or email
    const user = username 
      ? await this.userRepo.findUserByUsername(username, false)
      : email 
        ? await this.userRepo.findUserByEmail(email)
        : null;
  
    if (!user) {
      throw new ApiError(
        HttpStatus.NOT_FOUND,
        "User Not Found With This Username or Email"
      );
    }
  
    if (user.is_verified) {
      throw new ApiError(
        HttpStatus.BAD_REQUEST,
        "User Already Verified"
      );
    }
  
    if (!user.verification_code || !user.verification_code_expire_at) {
      throw new ApiError(
        HttpStatus.BAD_REQUEST,
        "Verification code not found or expired"
      );
    }
  
    if (user.verification_code !== verification_code) {
      throw new ApiError(
        HttpStatus.BAD_REQUEST,
        "Invalid Verification Code"
      );
    }
  
    if (new Date() > user.verification_code_expire_at) {
      throw new ApiError(
        HttpStatus.BAD_REQUEST,
        "Verification Code Expired"
      );
    }
  
    // Update user verification status
    const verifiedUser = await this.userRepo.updateUser(user.id, {
      is_verified: true,
      verification_code: null,
      verification_code_expire_at: null
    });
  
    if (!verifiedUser) {
      throw new ApiError(
        HttpStatus.INTERNAL_SERVER_ERROR,
        "Failed to verify user"
      );
    }
  
    const accessToken = this.jwtService.CreateAccessToken(verifiedUser);
    const { token: refreshToken, expiresAt } = this.jwtService.CreateRefreshToken(verifiedUser.id);
  
    // Store refresh token in session
    const session = await this.sessionRepo.createSession(
      verifiedUser.id,
      refreshToken,
      expiresAt,
      ipAddress,
      userAgent
    );
  
    if (!session) {
      throw new ApiError(
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Failed to create session'
      );
    }
  
    return {
      user: plainToClass(ReturnAuthDto, verifiedUser),
      tokens: {
        accessToken,
        refreshToken
      }
    };
  }
  

  async login(loginDto: LoginDto, ipAddress?: string, userAgent?: string) {
    const { username, email, password } = loginDto;
    this.logger.debug(`Login attempt for ${username ? 'username: ' + username : 'email: ' + email}`);
  
    try {
      let existingUser: Users | null;
  
      // Find the user by email or username
      if (email) {
        existingUser = await this.userRepo.findUserByEmail(email);
      } else if (username) {
        existingUser = await this.userRepo.findUserByUsername(username);
      } else {
        throw new ApiError(HttpStatus.BAD_REQUEST, "Username or email required");
      }
  
      // Check if user exists
      if (!existingUser) {
        throw new ApiError(
          HttpStatus.NOT_FOUND,
          `User Not Found With This ${username ? 'Username' : 'Email'}`
        );
      }
  
      // Check if user is verified
      if (!existingUser.is_verified) {
        throw new ApiError(HttpStatus.BAD_REQUEST, "User Not Verified");
      }
  
      // CRITICAL: Always check lockout status first before any password verification
      if (existingUser.retry_timestamp && new Date() < new Date(existingUser.retry_timestamp)) {
        this.logger.debug(`Rejecting login attempt for locked account: ${existingUser.id}`);
        throw new ApiError(
          HttpStatus.TOO_MANY_REQUESTS,
          `Account is temporarily locked. Please try again after ${new Date(existingUser.retry_timestamp).toLocaleTimeString()}`
        );
      }
  
      // Verify password
      const isPasswordValid = await comparePassword(password, existingUser.password);
      if (!isPasswordValid) {
        // Increment failed attempts counter
        const loginAttempts = (existingUser.incorect_attempt || 0) + 1;
        const updateData: any = { incorect_attempt: loginAttempts };
  
        if (loginAttempts >= 3) {
          // Lock the account for 15 minutes
          const retryTime = new Date();
          retryTime.setMinutes(retryTime.getMinutes() + 15);
          updateData.retry_timestamp = retryTime;
  
          await this.userRepo.updateUser(existingUser.id, updateData);
  
          this.logger.debug(`Account locked after 3 invalid attempts for user: ${existingUser.id}`);
          throw new ApiError(
            HttpStatus.TOO_MANY_REQUESTS,
            `Account is temporarily locked. Please try again after ${retryTime.toLocaleTimeString()}`
          );
        }
  
        await this.userRepo.updateUser(existingUser.id, updateData);
        throw new ApiError(HttpStatus.UNAUTHORIZED, "Invalid Credentials");
      }
  
      // Login success - reset lockout counters
      await this.userRepo.updateUser(existingUser.id, {
        incorect_attempt: 0,
        retry_timestamp: null
      });
  
      // Generate tokens and create session
      const accessToken = this.jwtService.CreateAccessToken(existingUser);
      const { token: refreshToken, expiresAt } = this.jwtService.CreateRefreshToken(existingUser.id);
  
      const session = await this.sessionRepo.createSession(
        existingUser.id,
        refreshToken,
        expiresAt,
        ipAddress,
        userAgent
      );
  
      if (!session) {
        throw new ApiError(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to create session");
      }
  
      this.logger.debug(`Login successful for user: ${existingUser.id}`);
      return {
        user: plainToClass(ReturnAuthDto, existingUser),
        tokens: {
          accessToken,
          refreshToken
        }
      };
    } catch (error) {
      this.logger.error(`Login error: ${error.message}`, error.stack);
      throw error;
    }
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const { email, username } = forgotPasswordDto;
    let user: Users;

    if (username) {
        const existing_user  = await this.userRepo.findUserByUsername(username);
        if (!existing_user) throw new ApiError(HttpStatus.NOT_FOUND, "User not found");
        user = existing_user;
    } else if (email) {
      const existing_user = await this.userRepo.findUserByEmail(email);
        if (!existing_user) throw new ApiError(HttpStatus.NOT_FOUND, "User not found");
        user = existing_user;
    } else {
        throw new ApiError(HttpStatus.BAD_REQUEST, "Email or username required");
    }

    if(!user.is_verified){
      throw new ApiError(HttpStatus.NOT_FOUND, "User not Verified");
    }
    const verificationCode = OtpUtil.generateOtp();
    const verificationHash = await hashPassword(verificationCode);
    const verificationExpiry = OtpUtil.getExpirationTime(15);

    const updatedUser = await this.userRepo.updateUser(user.id, {
        verification_code: verificationCode,
        verification_code_expire_at: verificationExpiry,
        vefification_hash: verificationHash,
        incorect_attempt: 0
    });

    if (!updatedUser) {
        throw new ApiError(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to update user");
    }

    await this.emailService.sendPasswordResetEmail(
        updatedUser.email,
        updatedUser.name,
        verificationCode
    );

    return { message: "Reset instructions sent to email"};
}

async verifyOtp(verifyOtpDto: VerifyVerificationCode) {
  const { verification_code, email, username } = verifyOtpDto;

  const user = username 
      ? await this.userRepo.findUserByUsername(username)
      : email 
          ? await this.userRepo.findUserByEmail(email)
          : null;

  if (!user) {
      throw new ApiError(HttpStatus.NOT_FOUND, "Invalid reset request");
  }
  if(!user.is_verified){
    throw new ApiError(HttpStatus.NOT_FOUND, "User not Verified");
  }
  if (user.retry_timestamp && new Date() < user.retry_timestamp) {
      throw new ApiError(
          HttpStatus.TOO_MANY_REQUESTS, 
          `Please try again after ${new Date(user.retry_timestamp).toLocaleTimeString()}`
      );
  }

  if (user.verification_code !== verification_code) {
      const attempts = (user.incorect_attempt || 0) + 1;
      let updateData: any = { incorect_attempt: attempts };

      if (attempts >= 3) {
          const retryTime = new Date();
          retryTime.setMinutes(retryTime.getMinutes() + 15);
          updateData.retry_timestamp = retryTime;
          updateData.incorect_attempt = 0;

          await this.emailService.sendVerificationEmail(
              user.email,
              user.name,
              user.verification_code!
          );
      }

      await this.userRepo.updateUser(user.id, updateData);
      throw new ApiError(HttpStatus.BAD_REQUEST, "Invalid Verification Code");
  }

  if (user.verification_code_expire_at && new Date() > user.verification_code_expire_at) {
      throw new ApiError(HttpStatus.BAD_REQUEST, "Verification Code Expired");
  }

  return { verified: true };
}


async resetPassword(hash: string | null | undefined, resetPasswordDto: ResetPasswordDto) {
  const { email, username, password, verification_code } = resetPasswordDto;
  this.logger.debug(`Attempting password reset for email: ${email} or username: ${username}`);

  let user: Users | null = null;

  if (hash && hash !== 'undefined') {
    this.logger.debug(`Trying to find user by verification hash`);
    user = await this.userRepo.findUserByVerificationHash(hash);
    if (!user) {
      throw new ApiError(HttpStatus.NOT_FOUND, "Invalid reset request");
    }
  } else {
    if (!username && !email) {
      throw new ApiError(HttpStatus.BAD_REQUEST, "Username or Email is required");
    }

    this.logger.debug(`Finding user by ${username ? 'username' : 'email'}`);
    user = username
      ? await this.userRepo.findUserByUsername(username)
      : await this.userRepo.findUserByEmail(email!);

    if (!user) {
      throw new ApiError(HttpStatus.NOT_FOUND, "User not found");
    }

    if(!user.is_verified){
      throw new ApiError(HttpStatus.NOT_FOUND, "User not Verified");
    }

    this.logger.debug(`Validating verification code for user: ${user.id}`);
    if (!user.verification_code || !user.verification_code_expire_at) {
      throw new ApiError(HttpStatus.BAD_REQUEST, "Verification code not found or expired");
    }

    if (user.verification_code !== verification_code) {
      throw new ApiError(HttpStatus.BAD_REQUEST, "Invalid verification code");
    }

    if (new Date() > user.verification_code_expire_at) {
      throw new ApiError(HttpStatus.BAD_REQUEST, "Verification code expired");
    }
  }

  this.logger.debug(`Resetting password for user: ${user.id}`);
  const hashedPassword = await hashPassword(password);

  const updatedUser = await this.userRepo.updateUser(user.id, {
    password: hashedPassword,
    verification_code: null,
    verification_code_expire_at: null,
    vefification_hash: null,
    incorect_attempt: 0,
    retry_timestamp: null,
  });

  if (!updatedUser) {
    throw new ApiError(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to reset password");
  }

  this.logger.debug(`Password reset successful for user: ${user.id}`);
  return { message: "Password reset successful" };
}



async handleOAuthLogin(user: Users, ipAddress?: string, userAgent?: string) {
    const accessToken = this.jwtService.CreateAccessToken(user);
    const { token: refreshToken, expiresAt } = this.jwtService.CreateRefreshToken(user.id);

    const session = await this.sessionRepo.createSession(
      user.id,
      refreshToken,
      expiresAt,
      ipAddress,
      userAgent
    );

    if (!session) {
      throw new ApiError(
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Failed to create session'
      );
    }

    return {
      user,
      tokens: {
        accessToken,
        refreshToken
      }
    };
}

async refreshToken(refreshToken: string, ipAddress?: string, userAgent?: string) {
    const session = await this.sessionRepo.findSessionByToken(refreshToken);
    if (!session) {
      throw new ApiError(HttpStatus.UNAUTHORIZED, 'Invalid Session');
    }

    if (new Date() > session.expires_at) {
      await this.sessionRepo.deleteSession(session.id);
      throw new ApiError(HttpStatus.UNAUTHORIZED, 'Refresh token expired');
    }

    // Only generate new access token
    const accessToken = this.jwtService.CreateAccessToken(session.Users);

    return {
      user: session.Users,
      tokens: {
        accessToken
      }
    };
}

async logout(refreshToken: string): Promise<boolean> {
    const session = await this.sessionRepo.findSessionByToken(refreshToken);
    if (session) {
      return this.sessionRepo.deleteSession(session.id);
    }
    return true;
  }

}
