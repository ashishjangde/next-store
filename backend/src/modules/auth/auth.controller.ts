import { Controller, Post, Body, UploadedFile, UseInterceptors, HttpStatus, Res, Req, HttpCode, Get, Param, UseGuards, UnauthorizedException } from '@nestjs/common';
import { ApiConsumes, ApiOperation, ApiResponse, ApiExtraModels } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { RegisterDto } from './dto/register.dto';
import { AuthService } from './auth.service';
import { Public } from 'src/common/decorators/public-decorator';
import { ApiCustomResponse } from 'src/common/responses/ApiResponse';
import { ReturnAuthDto } from './dto/return-auth-dto';
import CustomApiResponse from 'src/common/responses/ApiResponse';
import ApiError, { ApiCustomErrorResponse } from 'src/common/responses/ApiError';
import { Response, Request } from 'express';
import { plainToClass } from 'class-transformer';
import { LoginDto } from './dto/login.dto';
import { AuthGuard } from '@nestjs/passport';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { VerifyVerificationCode } from './dto/verify-verificationcode.dto';
import { Users } from '@prisma/client';

@Controller('auth')
@ApiExtraModels(ReturnAuthDto)
export class AuthController {

  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post("register")
  @ApiOperation({
    summary: "Create New User",
    description: "Register new user with profile picture"
  })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'User successfully registered',
    schema: ApiCustomResponse(ReturnAuthDto)
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Email or username already exists',
    schema: ApiCustomErrorResponse(HttpStatus.CONFLICT, 'Email or username already exists')
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data',
    schema: ApiCustomErrorResponse(HttpStatus.BAD_REQUEST, 'Invalid input data')
  })
  @UseInterceptors(FileInterceptor('profile_picture', { storage: false }))
  async Register(
    @Body() registerDto: RegisterDto,
    @Res() res: Response,
    @UploadedFile() file?: Express.Multer.File
  ) {
    const result = await this.authService.register(registerDto, file); 
    res.status(result.isExisting ? HttpStatus.OK : HttpStatus.CREATED)
      .json(new CustomApiResponse(plainToClass(ReturnAuthDto, result.data)));
  };

  async CheckUsernameAvailable (){

  };

  @Public()
  @Post("verify-user")
  @HttpCode(200)
  @ApiOperation({
    summary: "User Verification One Time",
    description: "Verify username with one time verification code"
  })
  async Verify(
    @Body() verifyDto : VerifyVerificationCode,
    @Req() req : Request,
    @Res() res : Response
  ){
    const ipAddress = req.ip;
    const userAgent = req.get('user-agent');
    const result = await this.authService.verify(verifyDto, ipAddress , userAgent);
    this.setAuthCookies(res, result.tokens);
    return res.json(new CustomApiResponse(plainToClass(ReturnAuthDto,result.user)));
  }

  @Public()
  @Post('login')
  @HttpCode(200)
  @ApiOperation({
    summary: "User Login",
    description: "Login with email/username and password"
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Login successful',
    schema : ApiCustomResponse(ReturnAuthDto)
  })
  async Login(
    @Body() loginDto: LoginDto,
    @Req() req: Request,
    @Res() res: Response
  ) {
    const ipAddress = req.ip;
    const userAgent = req.get('user-agent');
    const result = await this.authService.login(loginDto, ipAddress, userAgent);
    this.setAuthCookies(res, result.tokens);
    return res.json(new CustomApiResponse(plainToClass(ReturnAuthDto,result.user)));
  };

  @Public()
  @Get('google')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: "Initiate Google OAuth2 Login" })
  async GoogleLogin() {
    // This will redirect to Google
  }

  @Public()
  @Get('github')
  @UseGuards(AuthGuard('github'))
  @ApiOperation({ summary: "Initiate GitHub OAuth2 Login" })
  async GithubLogin() {
    // This will redirect to GitHub
  }

  @Public()
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: "Handle Google OAuth2 Callback" })
  async GoogleLoginCallback(
    @Req() req: Request,
    @Res() res: Response
  ) {
    if (!req.user) {
      throw new UnauthorizedException('No user from Google');
    }

    const ipAddress = req.ip;
    const userAgent = req.get('user-agent');
    const { tokens, user } = await this.authService.handleOAuthLogin(req.user as Users, ipAddress, userAgent);
    
    this.setAuthCookies(res, tokens);
    return res.json(new CustomApiResponse(plainToClass(ReturnAuthDto, user)));
  }

  @Public()
  @Get('github/callback')
  @UseGuards(AuthGuard('github'))
  @ApiOperation({ summary: "Handle GitHub OAuth2 Callback" })
  async GithubLoginCallback(
    @Req() req: Request,
    @Res() res: Response
  ) {
    try {
      if (!req.user) {
        throw new UnauthorizedException('No user from GitHub');
      }

      const ipAddress = req.ip;
      const userAgent = req.get('user-agent');
      const { tokens, user } = await this.authService.handleOAuthLogin(req.user as Users, ipAddress, userAgent);
      
      this.setAuthCookies(res, tokens);
      return res.json(new CustomApiResponse(plainToClass(ReturnAuthDto, user)));
    } catch (error) {
      if (error.message?.includes('authorization code expired')) {
        return res.status(HttpStatus.UNAUTHORIZED)
          .json(new CustomApiResponse(null, new ApiError(
            HttpStatus.UNAUTHORIZED,
            'GitHub authorization code expired',
            ['Please try logging in again']
          )));
      }
      throw error;
    }
  }

  @Public()
  @Post('refresh-token')
  @HttpCode(200)
  @ApiOperation({ summary: "Refresh Access Token" })
  async RefreshToken(
    @Req() req: Request,
    @Res() res: Response
  ) {
    const refreshToken = req.cookies?.refresh_token;
    
    if (!refreshToken) {
      throw new ApiError(HttpStatus.UNAUTHORIZED, 'Refresh token is required');
    }
  
    const result = await this.authService.refreshToken(
      refreshToken,
      req.ip,
      req.get('user-agent')
    );
    
    this.setAuthCookies(res, result.tokens);
    return res.json(new CustomApiResponse(plainToClass(ReturnAuthDto, result.user)));
  }

  @Public()
  @Post('forgot-password')
  @HttpCode(200)
  @ApiOperation({ summary: "Initiate Password Reset" })
  async ForgotPassword(
    @Body() forgotPasswordDto: ForgotPasswordDto
  ) {
    const result = await this.authService.forgotPassword(forgotPasswordDto);
    return new CustomApiResponse(result);
  }

  @Public()
  @Post('verify-verification_code')
  @ApiOperation({ summary: "Verify Reset Password OTP" })
  async VerifyVerificationCode(
    @Body() verifyVerificationCode: VerifyVerificationCode
  ) {
    const result = await this.authService.verifyOtp(verifyVerificationCode);
    return new CustomApiResponse(result);
  }

  @Public()
  @Post('reset-password/:hash')
  @HttpCode(200)
  @ApiOperation({ summary: "Reset Password with Valid Hash or Body" })
  async ResetPassword(
    @Param('hash') hash: string,
    @Body() resetPasswordDto: ResetPasswordDto
  ) {
    const result = await this.authService.resetPassword(hash, resetPasswordDto);
    return new CustomApiResponse(result);
  }

  @Post('logout')
  @ApiOperation({ summary: "Logout user and clear session" })
  @HttpCode(200)
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Logout successful',
    schema: ApiCustomResponse({ message: 'Logged out successfully' })
  })
  async Logout(@Req() req: Request, @Res() res: Response) {
    const refreshToken = req.cookies?.refresh_token;
    if (refreshToken) {
      await this.authService.logout(refreshToken);
    }
    
    // Clear cookies
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
  
    return res.json(new CustomApiResponse({ message: 'Logged out successfully' }));
  }

  private setAuthCookies(res: Response, tokens: { accessToken?: string, refreshToken?: string }) {
    const isProduction = process.env.NODE_ENV === 'production';
    const domain = process.env.COOKIE_DOMAIN || 'localhost';
    
    // Set new access token if provided
    if (tokens.accessToken) {
      res.cookie('access_token', tokens.accessToken, {
        httpOnly: true,
        path: "/",
        secure: isProduction,
        sameSite: isProduction ? 'none' : 'lax',
        maxAge: 10 * 60 * 1000 // 10 minutes
      });
    }

    // Set refresh token only if provided (during login/register)
    if (tokens.refreshToken) {
      res.cookie('refresh_token', tokens.refreshToken, {
        httpOnly: true,
        path: '/',
        secure: isProduction,
        sameSite: isProduction ? 'none' : 'lax',
        maxAge: 9 * 30 * 24 * 60 * 60 * 1000 // 9 months
      });
    }
  }
}


