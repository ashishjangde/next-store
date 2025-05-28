import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Query,
  HttpStatus,
  Patch,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiQuery,
  ApiExtraModels,
} from '@nestjs/swagger';
import { BannersService } from './banners.service';
import { BannerCreateDto } from './dto/banner-create.dto';
import { BannerUpdateDto } from './dto/banner-update.dto';
import { BannerResponseDto } from './dto/banner-response.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Role } from '../../common/decorators/roles-decorator';
import { GetUser } from '../../common/decorators/user.decorator';
import { Public } from '../../common/decorators/public-decorator';
import { Roles, Users } from '@prisma/client';
import ApiResponseClass from '../../common/responses/ApiResponse';
import { ApiCustomResponse } from '../../common/responses/ApiResponse';
import { ApiCustomErrorResponse } from '../../common/responses/ApiError';

@ApiTags('Banners')
@Controller('banners')
@ApiExtraModels(BannerResponseDto)
export class BannersController {
  constructor(private readonly bannersService: BannersService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Role(Roles.ADMIN)
  @ApiBearerAuth()
  @UseInterceptors(FileInterceptor('image'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Create a new banner (Admin only)',
    description: 'Create a new banner with image upload. Only admins can create banners.',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Banner created successfully',
    schema: ApiCustomResponse(BannerResponseDto),
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data or missing image',
    schema: ApiCustomErrorResponse(HttpStatus.BAD_REQUEST, 'Banner image is required'),
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Admin access required',
    schema: ApiCustomErrorResponse(HttpStatus.FORBIDDEN, 'Admin access required'),
  })
  async createBanner(
    @Body() createBannerDto: BannerCreateDto,
    @UploadedFile() image: Express.Multer.File,
    @GetUser() user: Users,
  ) {
    const banner = await this.bannersService.createBanner(createBannerDto, image, user.id);
    return new ApiResponseClass(banner);
  }
  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Role(Roles.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get all banners (Admin only)',
    description: 'Retrieve all banners with optional filtering and pagination. Only admins can access this endpoint.',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number for pagination (default: 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of items per page (default: 10)',
  })
  @ApiQuery({
    name: 'include_inactive',
    required: false,
    type: Boolean,
    description: 'Include inactive banners in the response',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Banners retrieved successfully',
    schema: ApiCustomResponse([BannerResponseDto]),
  })
  async getAllBanners(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('include_inactive') includeInactive?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;
    const result = await this.bannersService.getAllBanners(
      includeInactive === 'true',
      pageNum,
      limitNum,
    );
    return new ApiResponseClass(result);
  }

  @Get('public')
  @Public()
  @ApiOperation({
    summary: 'Get active banners for public display',
    description: 'Retrieve only active banners for public display on the website.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Active banners retrieved successfully',
    schema: ApiCustomResponse([BannerResponseDto]),
  })
  async getActiveBanners() {
    const banners = await this.bannersService.getActiveBannersForPublic();
    return new ApiResponseClass(banners);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Role(Roles.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get banner by ID (Admin only)',
    description: 'Retrieve a specific banner by its ID. Only admins can access this endpoint.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Banner retrieved successfully',
    schema: ApiCustomResponse(BannerResponseDto),
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Banner not found',
    schema: ApiCustomErrorResponse(HttpStatus.NOT_FOUND, 'Banner not found'),
  })
  async getBannerById(@Param('id') id: string) {
    const banner = await this.bannersService.getBannerById(id);
    return new ApiResponseClass(banner);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Role(Roles.ADMIN)
  @ApiBearerAuth()
  @UseInterceptors(FileInterceptor('image'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Update banner (Admin only)',
    description: 'Update an existing banner with optional image replacement. Only admins can update banners.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Banner updated successfully',
    schema: ApiCustomResponse(BannerResponseDto),
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Banner not found',
    schema: ApiCustomErrorResponse(HttpStatus.NOT_FOUND, 'Banner not found'),
  })
  async updateBanner(
    @Param('id') id: string,
    @Body() updateBannerDto: BannerUpdateDto,
    @UploadedFile() image?: Express.Multer.File,
  ) {
    const banner = await this.bannersService.updateBanner(id, updateBannerDto, image);
    return new ApiResponseClass(banner);
  }

  @Patch(':id/toggle-status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Role(Roles.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Toggle banner active status (Admin only)',
    description: 'Toggle the active/inactive status of a banner. Only admins can perform this action.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Banner status toggled successfully',
    schema: ApiCustomResponse(BannerResponseDto),
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Banner not found',
    schema: ApiCustomErrorResponse(HttpStatus.NOT_FOUND, 'Banner not found'),
  })
  async toggleBannerStatus(@Param('id') id: string) {
    const banner = await this.bannersService.toggleBannerStatus(id);
    return new ApiResponseClass(banner);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Role(Roles.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Delete banner (Admin only)',
    description: 'Delete a banner permanently. This will also remove the associated image. Only admins can delete banners.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Banner deleted successfully',
    schema: ApiCustomResponse({ message: 'Banner deleted successfully' }),
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Banner not found',
    schema: ApiCustomErrorResponse(HttpStatus.NOT_FOUND, 'Banner not found'),
  })
  async deleteBanner(@Param('id') id: string) {
    await this.bannersService.deleteBanner(id);
    return new ApiResponseClass({ message: 'Banner deleted successfully' });
  }
}
