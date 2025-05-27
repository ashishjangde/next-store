import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Body, 
  Param, 
  Query, 
  UseGuards,
  Request
} from '@nestjs/common';
import { PromotionsService, CreatePromotionDto, UpdatePromotionDto } from './promotions.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles-decorator';
import { PromotionStatus } from '@prisma/client';

@Controller('admin/promotions')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class PromotionsController {
  constructor(private readonly promotionsService: PromotionsService) {}

  @Post()
  async createPromotion(@Body() createPromotionDto: CreatePromotionDto, @Request() req) {
    return this.promotionsService.createPromotion(createPromotionDto, req.user.id);
  }

  @Get()
  async getAllPromotions(
    @Query('page') page = '1',
    @Query('limit') limit = '10',
    @Query('status') status?: PromotionStatus
  ) {
    return this.promotionsService.getAllPromotions(
      parseInt(page), 
      parseInt(limit), 
      status
    );
  }

  @Get('stats')
  async getPromotionStats() {
    return this.promotionsService.getPromotionStats();
  }

  @Get(':id')
  async getPromotionById(@Param('id') id: string) {
    return this.promotionsService.getPromotionById(id);
  }

  @Put(':id')
  async updatePromotion(
    @Param('id') id: string, 
    @Body() updatePromotionDto: UpdatePromotionDto
  ) {
    return this.promotionsService.updatePromotion(id, updatePromotionDto);
  }

  @Delete(':id')
  async deletePromotion(@Param('id') id: string) {
    await this.promotionsService.deletePromotion(id);
    return { message: 'Promotion deleted successfully' };
  }
}

@Controller('promotions')
export class PublicPromotionsController {
  constructor(private readonly promotionsService: PromotionsService) {}

  @Post('validate')
  async validatePromotionCode(
    @Body() validateDto: { 
      code: string; 
      userId?: string; 
      orderAmount?: number; 
    }
  ) {
    return this.promotionsService.validatePromotionCode(
      validateDto.code,
      validateDto.userId,
      validateDto.orderAmount
    );
  }
}
