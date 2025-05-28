import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { BannerRepository } from '../../repositories/banner-repository';
import { S3Service } from '../../common/storage/s3.service';
import { BannerCreateDto } from './dto/banner-create.dto';
import { BannerUpdateDto } from './dto/banner-update.dto';
import { Banner } from '@prisma/client';

@Injectable()
export class BannersService {
  constructor(
    private readonly bannerRepository: BannerRepository,
    private readonly s3Service: S3Service,
  ) {}

  async createBanner(
    createBannerDto: BannerCreateDto, 
    image: Express.Multer.File,
    createdBy: string
  ): Promise<Banner> {
    if (!image) {
      throw new BadRequestException('Banner image is required');
    }

    // Upload image to S3
    const imageUrl = await this.s3Service.uploadFile(image, 'banners');

    const bannerData = {
      title: createBannerDto.title,
      description: createBannerDto.description,
      image_url: imageUrl,
      is_active: createBannerDto.is_active ?? true,
      sort_order: createBannerDto.sort_order ?? 0,
      creator: {
        connect: { id: createdBy }
      }
    };

    return this.bannerRepository.create(bannerData);
  }
  async getAllBanners(
    includeInactive = false,
    page = 1,
    limit = 10,
  ): Promise<{
    banners: Banner[];
    total: number;
    page: number;
    totalPages: number;
    limit: number;
  }> {
    const offset = (page - 1) * limit;
    
    const [banners, total] = await Promise.all([
      this.bannerRepository.findAll({ 
        includeInactive, 
        includeCreator: true,
        limit,
        offset,
      }),
      this.bannerRepository.count({ includeInactive }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      banners,
      total,
      page,
      totalPages,
      limit,
    };
  }

  async getBannerById(id: string): Promise<Banner> {
    const banner = await this.bannerRepository.findById(id);
    if (!banner) {
      throw new NotFoundException('Banner not found');
    }
    return banner;
  }

  async updateBanner(
    id: string, 
    updateBannerDto: BannerUpdateDto,
    image?: Express.Multer.File
  ): Promise<Banner> {
    const existingBanner = await this.bannerRepository.findById(id, false);
    if (!existingBanner) {
      throw new NotFoundException('Banner not found');
    }

    const updateData: any = { ...updateBannerDto };

    // If new image is provided, upload it and delete the old one
    if (image) {
      // Upload new image
      const newImageUrl = await this.s3Service.uploadFile(image, 'banners');
      updateData.image_url = newImageUrl;

      // Delete old image from S3
      if (existingBanner.image_url) {
        try {
          await this.s3Service.deleteFile(existingBanner.image_url);
        } catch (error) {
          console.warn('Failed to delete old banner image:', error);
        }
      }
    }

    return this.bannerRepository.update(id, updateData);
  }

  async deleteBanner(id: string): Promise<void> {
    const banner = await this.bannerRepository.findById(id, false);
    if (!banner) {
      throw new NotFoundException('Banner not found');
    }

    // Delete image from S3
    if (banner.image_url) {
      try {
        await this.s3Service.deleteFile(banner.image_url);
      } catch (error) {
        console.warn('Failed to delete banner image:', error);
      }
    }

    await this.bannerRepository.delete(id);
  }
  async getActiveBannersForPublic(): Promise<{
    id: string;
    title: string;
    description: string | null;
    image_url: string;
    sort_order: number;
    created_at: Date;
    updated_at: Date;
  }[]> {
    return this.bannerRepository.findActiveForPublic();
  }

  async toggleBannerStatus(id: string): Promise<Banner> {
    const banner = await this.bannerRepository.findById(id, false);
    if (!banner) {
      throw new NotFoundException('Banner not found');
    }

    return this.bannerRepository.update(id, {
      is_active: !banner.is_active
    });
  }
}
