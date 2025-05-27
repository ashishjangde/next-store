import { Module } from '@nestjs/common';
import { UiService } from './ui.service';
import { UiController } from './ui.controller';
import { ProductRepository } from '../../repositories/product-repository';
import { CategoryRepository } from '../../repositories/category-repository';
import { BannerRepository } from '../../repositories/banner-repository';
import { PrismaModule } from '../../common/db/prisma/prisma.module';
import { RedisModule } from '../../common/db/redis/redis.module';
import { ElasticsearchModule } from '../../common/db/elasticsearch/elasticsearch.module';

@Module({
  imports: [
    PrismaModule,
    RedisModule,
    ElasticsearchModule
  ],
  controllers: [UiController],
  providers: [
    UiService,
    ProductRepository,
    CategoryRepository,
    BannerRepository
  ],
  exports: [UiService]
})
export class UiModule {}
