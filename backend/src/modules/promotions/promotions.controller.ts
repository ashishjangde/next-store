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
import { Role } from '../../common/decorators/roles-decorator';
import { PromotionStatus } from '@prisma/client';
import ApiResponse from '../../common/responses/ApiResponse';

@Controller('admin/promotions')
@UseGuards(JwtAuthGuard, RolesGuard)  @Role('ADMIN')
export class PromotionsController {
  constructor(private readonly promotionsService: PromotionsService) {}
  @Post()
  async createPromotion(@Body() createPromotionDto: CreatePromotionDto, @Request() req) {
    const promotion = await this.promotionsService.createPromotion(createPromotionDto, req.user.id);
    return new ApiResponse(promotion);
  }

  @Get()
  async getAllPromotions(
    @Query('page') page = '1',
    @Query('limit') limit = '10',
    @Query('status') status?: PromotionStatus
  ) {
    const result = await this.promotionsService.getAllPromotions(
      parseInt(page), 
      parseInt(limit), 
      status
    );
    return new ApiResponse(result);
  }

  @Get('stats')
  async getPromotionStats() {
    const stats = await this.promotionsService.getPromotionStats();
    return new ApiResponse(stats);
  }

  @Get(':id')
  async getPromotionById(@Param('id') id: string) {
    const promotion = await this.promotionsService.getPromotionById(id);
    return new ApiResponse(promotion);
  }

  @Put(':id')
  async updatePromotion(
    @Param('id') id: string, 
    @Body() updatePromotionDto: UpdatePromotionDto
  ) {
    const promotion = await this.promotionsService.updatePromotion(id, updatePromotionDto);
    return new ApiResponse(promotion);
  }

  @Delete(':id')
  async deletePromotion(@Param('id') id: string) {
    await this.promotionsService.deletePromotion(id);
    return new ApiResponse({ message: 'Promotion deleted successfully' });
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
    const result = await this.promotionsService.validatePromotionCode(
      validateDto.code,
      validateDto.userId,
      validateDto.orderAmount
    );
    return new ApiResponse(result);
  }
}
