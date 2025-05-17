import { Module } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CategoryController } from './category.controller';
import { CategoryRepository } from 'src/repositories/category-repository';
import { PrismaModule } from 'src/common/db/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [CategoryController],
  providers: [CategoryService, CategoryRepository],
  exports: [CategoryService],
})
export class CategoryModule {}
