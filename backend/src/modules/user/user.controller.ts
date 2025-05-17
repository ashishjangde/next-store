import { Controller, Get, Put, Delete, Post, UseGuards, Req, Res, Body, UseInterceptors, UploadedFile, HttpStatus, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes, ApiExtraModels } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { UserService } from './user.service';
import { ApiFile } from '../../common/decorators/api-file.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { ApiCustomResponse } from 'src/common/responses/ApiResponse';
import { ApiCustomErrorResponse } from 'src/common/responses/ApiError';
import CustomApiResponse from 'src/common/responses/ApiResponse';
import { Response } from 'express';
import { plainToClass } from 'class-transformer';

@ApiTags('Users')
@Controller('user')
@ApiExtraModels(UserResponseDto)
export class UserController {
  constructor(private readonly userService: UserService) {}
  
  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Get user profile',
    description: 'Retrieve the profile of the currently logged in user'
  })
  @ApiResponse({
    status: HttpStatus.OK, 
    description: 'User profile retrieved successfully',
    schema: ApiCustomResponse(UserResponseDto)
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'User not found',
    schema: ApiCustomErrorResponse(HttpStatus.NOT_FOUND, 'User not found')
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized',
    schema: ApiCustomErrorResponse(HttpStatus.UNAUTHORIZED, 'Unauthorized')
  })
  async getUserProfile(@Req() req, @Res() res: Response) {
    const user = await this.userService.getUserProfile(req.user.id);
    
    return res.status(HttpStatus.OK).json(
      new CustomApiResponse(plainToClass(UserResponseDto, user))
    );
  }

  @Put('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Update user profile',
    description: 'Update user profile information (name, username, email)'
  })
  @ApiResponse({
    status: HttpStatus.OK, 
    description: 'User profile updated successfully',
    schema: ApiCustomResponse(UserResponseDto)
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Email or username already in use',
    schema: ApiCustomErrorResponse(HttpStatus.CONFLICT, 'Email or username already in use')
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'User not found',
    schema: ApiCustomErrorResponse(HttpStatus.NOT_FOUND, 'User not found')
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data',
    schema: ApiCustomErrorResponse(HttpStatus.BAD_REQUEST, 'Invalid input data')
  })
  async updateUserProfile(
    @Body() updateProfileDto: UpdateProfileDto, 
    @Req() req, 
    @Res() res: Response
  ) {
    const updatedUser = await this.userService.updateProfile(req.user.id, updateProfileDto);
    
    return res.status(HttpStatus.OK).json(
      new CustomApiResponse(plainToClass(UserResponseDto, updatedUser))
    );
  }
  @Put('profile-picture')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @UseInterceptors(FileInterceptor('profile_picture', { storage: false }))
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Update profile picture',
    description: 'Upload a new profile picture'
  })
  @ApiFile('profile_picture')
  @ApiResponse({
    status: HttpStatus.OK, 
    description: 'Profile picture updated successfully',
    schema: ApiCustomResponse(UserResponseDto)
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'User not found',
    schema: ApiCustomErrorResponse(HttpStatus.NOT_FOUND, 'User not found')
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Failed to upload profile picture',
    schema: ApiCustomErrorResponse(HttpStatus.INTERNAL_SERVER_ERROR, 'Failed to upload profile picture')
  })
  async updateProfilePicture(
    @UploadedFile() file: Express.Multer.File,
    @Req() req, 
    @Res() res: Response
  ) {
    if (!file) {
      return res.status(HttpStatus.BAD_REQUEST).json(
        new CustomApiResponse(null, { 
          statusCode: HttpStatus.BAD_REQUEST, 
          message: 'No file uploaded',
          errors: ['Please upload a valid image file'] 
        })
      );
    }
    
    const updatedUser = await this.userService.updateProfilePicture(req.user.id, file);
    
    return res.status(HttpStatus.OK).json(
      new CustomApiResponse(plainToClass(UserResponseDto, updatedUser))
    );
  }
  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Change password',
    description: 'Update user password with verification of current password. For security, this will invalidate all other active sessions.'
  })
  @ApiResponse({
    status: HttpStatus.OK, 
    description: 'Password changed successfully',
    schema: ApiCustomResponse({ message: 'Password changed successfully' })
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Current password is incorrect',
    schema: ApiCustomErrorResponse(HttpStatus.UNAUTHORIZED, 'Current password is incorrect')
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data or passwords do not match',
    schema: ApiCustomErrorResponse(HttpStatus.BAD_REQUEST, 'Passwords do not match')
  })
  async changePassword(
    @Body() changePasswordDto: ChangePasswordDto,
    @Req() req, 
    @Res() res: Response
  ) {
    // Get current session token from cookie
    const currentToken = req.cookies?.refresh_token;
    
    await this.userService.changePassword(req.user.id, changePasswordDto, currentToken);
    
    return res.status(HttpStatus.OK).json(
      new CustomApiResponse({ message: 'Password changed successfully, all other devices have been logged out' })
    );
  }
  @Delete('account')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Delete account',
    description: 'Permanently delete the user account and associated data, including all active sessions'
  })
  @ApiResponse({
    status: HttpStatus.OK, 
    description: 'Account deleted successfully',
    schema: ApiCustomResponse({ message: 'Account deleted successfully' })
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'User not found',
    schema: ApiCustomErrorResponse(HttpStatus.NOT_FOUND, 'User not found')
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Failed to delete account',
    schema: ApiCustomErrorResponse(HttpStatus.INTERNAL_SERVER_ERROR, 'Failed to delete account')
  })
  async deleteAccount(@Req() req, @Res() res: Response) {
    await this.userService.deleteAccount(req.user.id);
    
    // Clear authentication cookies
    res.clearCookie('access_token', {
      httpOnly: true,
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
    });
    
    res.clearCookie('refresh_token', {
      httpOnly: true,
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
    });
    
    return res.status(HttpStatus.OK).json(
      new CustomApiResponse({ message: 'Account deleted successfully' })
    );
  }



}
