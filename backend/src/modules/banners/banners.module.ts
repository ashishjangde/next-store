import { Module } from '@nestjs/common';
import { BannersService } from './banners.service';
import { BannersController } from './banners.controller';
import { BannerRepository } from '../../repositories/banner-repository';
import { PrismaModule } from '../../common/db/prisma/prisma.module';
import { StorageModule } from '../../common/storage/storage.module';

@Module({
  imports: [PrismaModule, StorageModule],
  controllers: [BannersController],
  providers: [BannersService, BannerRepository],
  exports: [BannersService, BannerRepository],
})
export class BannersModule {}
