import { Module } from '@nestjs/common';
import { PromotionsService } from './promotions.service';
import { PromotionsController, PublicPromotionsController } from './promotions.controller';
import { PrismaService } from '../../common/db/prisma/prisma.service';

@Module({
  controllers: [PromotionsController, PublicPromotionsController],
  providers: [PromotionsService, PrismaService],
  exports: [PromotionsService],
})
export class PromotionsModule {}
