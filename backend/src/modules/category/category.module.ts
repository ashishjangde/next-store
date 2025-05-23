import { Module } from '@nestjs/common';
import { CategoryController } from './category.controller';
import { CategoryService } from './category.service';
import { CategoryRepository } from 'src/repositories/category-repository';
import { PrismaModule } from 'src/common/db/prisma/prisma.module';
import { RedisModule } from 'src/common/db/redis/redis.module';
import { StorageModule } from 'src/common/storage/storage.module';

@Module({
  imports: [
    PrismaModule,
    RedisModule,
    StorageModule
  ],
  controllers: [CategoryController],
  providers: [
    CategoryService,
    CategoryRepository
  ],
  exports: [CategoryService, CategoryRepository]
})
export class CategoryModule {}