import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/db/prisma/prisma.service';
import { Promotion, PromotionStatus, DiscountType, PromotionType, Prisma } from '@prisma/client';

export interface CreatePromotionDto {
  name: string;
  description?: string;
  code?: string;
  type: PromotionType;
  discount_type: DiscountType;
  discount_value: number;
  minimum_amount?: number;
  maximum_uses?: number;
  uses_per_user?: number;
  starts_at: Date;
  ends_at?: Date;
  applicable_categories?: string[];
  applicable_products?: string[];
}

export interface UpdatePromotionDto extends Partial<CreatePromotionDto> {
  status?: PromotionStatus;
  is_active?: boolean;
}

export interface PromotionUsageDto {
  promotion_id: string;
  user_id?: string;
  order_id?: string;
  discount_amount: number;
}

@Injectable()
export class PromotionsService {
  constructor(private prisma: PrismaService) {}
  async createPromotion(data: CreatePromotionDto, createdBy: string): Promise<Promotion> {
    // Generate unique code if not provided or if code type promotion
    let finalCode = data.code;
    if (data.type === 'DISCOUNT_CODE') {
      if (!finalCode) {
        finalCode = await this.generateUniqueCode();
      } else {
        // Check for uniqueness
        const existingPromotion = await this.prisma.promotion.findUnique({
          where: { code: finalCode }
        });
        if (existingPromotion) {
          throw new BadRequestException('Promotion code already exists');
        }
      }
    }

    // Validate dates
    if (data.ends_at && data.starts_at >= data.ends_at) {
      throw new BadRequestException('End date must be after start date');
    }

    try {
      return await this.prisma.promotion.create({
        data: {
          ...data,
          code: finalCode,
          created_by: createdBy,
          applicable_categories: data.applicable_categories || [],
          applicable_products: data.applicable_products || [],
        },
        include: {
          creator: {
            select: {
              id: true,
              name: true,
              email: true,
            }
          },
          _count: {
            select: {
              usage_history: true
            }
          }
        }
      });
    } catch (error) {
      if (error.code === 'P2002' && error.meta?.target?.includes('code')) {
        throw new BadRequestException('Promotion code already exists');
      }
      throw error;
    }
  }

  private async generateUniqueCode(): Promise<string> {
    let code: string;
    let isUnique = false;
    let attempts = 0;
    const maxAttempts = 10;

    while (!isUnique && attempts < maxAttempts) {
      // Generate code like: PROMO2025052701, SAVE20A1, etc.
      const prefix = 'PROMO';
      const timestamp = Date.now().toString().slice(-6); // Last 6 digits of timestamp
      const random = Math.random().toString(36).substring(2, 4).toUpperCase(); // 2 random chars
      code = `${prefix}${timestamp}${random}`;

      // Check if code exists
      const existing = await this.prisma.promotion.findUnique({
        where: { code }
      });

      if (!existing) {
        isUnique = true;
      }
      attempts++;
    }

    if (!isUnique) {
      throw new Error('Failed to generate unique promotion code');
    }

    return code!;
  }

  async getAllPromotions(page = 1, limit = 10, status?: PromotionStatus) {
    const skip = (page - 1) * limit;
    
    const where: Prisma.PromotionWhereInput = {};
    if (status) {
      where.status = status;
    }

    const [promotions, total] = await Promise.all([
      this.prisma.promotion.findMany({
        where,
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
        include: {
          creator: {
            select: {
              id: true,
              name: true,
              email: true,
            }
          },
          _count: {
            select: {
              usage_history: true
            }
          }
        }
      }),
      this.prisma.promotion.count({ where })
    ]);

    return {
      data: promotions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async getPromotionById(id: string): Promise<Promotion> {
    const promotion = await this.prisma.promotion.findUnique({
      where: { id },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        },
        usage_history: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              }
            }
          },
          orderBy: { used_at: 'desc' },
          take: 10
        },
        _count: {
          select: {
            usage_history: true
          }
        }
      }
    });

    if (!promotion) {
      throw new NotFoundException('Promotion not found');
    }

    return promotion;
  }

  async updatePromotion(id: string, data: UpdatePromotionDto): Promise<Promotion> {
    const existingPromotion = await this.prisma.promotion.findUnique({
      where: { id }
    });

    if (!existingPromotion) {
      throw new NotFoundException('Promotion not found');
    }

    // Validate discount code uniqueness if being updated
    if (data.code && data.code !== existingPromotion.code) {
      const codeExists = await this.prisma.promotion.findUnique({
        where: { code: data.code }
      });
      if (codeExists) {
        throw new BadRequestException('Promotion code already exists');
      }
    }

    // Validate dates if being updated
    if (data.starts_at || data.ends_at) {
      const startDate = data.starts_at || existingPromotion.starts_at;
      const endDate = data.ends_at || existingPromotion.ends_at;
      
      if (endDate && startDate >= endDate) {
        throw new BadRequestException('End date must be after start date');
      }
    }

    return this.prisma.promotion.update({
      where: { id },
      data,
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        },
        _count: {
          select: {
            usage_history: true
          }
        }
      }
    });
  }

  async deletePromotion(id: string): Promise<void> {
    const promotion = await this.prisma.promotion.findUnique({
      where: { id }
    });

    if (!promotion) {
      throw new NotFoundException('Promotion not found');
    }

    await this.prisma.promotion.delete({
      where: { id }
    });
  }

  async validatePromotionCode(code: string, userId?: string, orderAmount?: number): Promise<{
    valid: boolean;
    promotion?: Promotion;
    discountAmount?: number;
    message?: string;
  }> {
    const promotion = await this.prisma.promotion.findUnique({
      where: { 
        code,
        is_active: true,
        status: PromotionStatus.ACTIVE
      }
    });

    if (!promotion) {
      return { valid: false, message: 'Invalid promotion code' };
    }

    // Check if promotion has started
    if (new Date() < promotion.starts_at) {
      return { valid: false, message: 'Promotion has not started yet' };
    }

    // Check if promotion has expired
    if (promotion.ends_at && new Date() > promotion.ends_at) {
      return { valid: false, message: 'Promotion has expired' };
    }

    // Check minimum order amount
    if (promotion.minimum_amount && orderAmount && orderAmount < promotion.minimum_amount) {
      return { 
        valid: false, 
        message: `Minimum order amount of ₹${promotion.minimum_amount} required` 
      };
    }

    // Check total usage limit
    if (promotion.maximum_uses && promotion.current_uses >= promotion.maximum_uses) {
      return { valid: false, message: 'Promotion usage limit reached' };
    }

    // Check per-user usage limit
    if (promotion.uses_per_user && userId) {
      const userUsageCount = await this.prisma.promotionUsage.count({
        where: {
          promotion_id: promotion.id,
          user_id: userId
        }
      });

      if (userUsageCount >= promotion.uses_per_user) {
        return { valid: false, message: 'You have reached the usage limit for this promotion' };
      }
    }

    // Calculate discount amount
    let discountAmount = 0;
    if (orderAmount) {
      if (promotion.discount_type === DiscountType.PERCENTAGE) {
        discountAmount = (orderAmount * promotion.discount_value) / 100;
      } else if (promotion.discount_type === DiscountType.FIXED_AMOUNT) {
        discountAmount = promotion.discount_value;
      }
      // FREE_SHIPPING would be handled separately in order calculation
    }

    return {
      valid: true,
      promotion,
      discountAmount,
      message: 'Promotion code is valid'
    };
  }

  async recordPromotionUsage(data: PromotionUsageDto): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      // Record usage
      await tx.promotionUsage.create({
        data
      });

      // Increment current uses count
      await tx.promotion.update({
        where: { id: data.promotion_id },
        data: {
          current_uses: {
            increment: 1
          }
        }
      });
    });
  }

  async getPromotionStats() {
    const [
      totalPromotions,
      activePromotions,
      totalUsage,
      totalSavings
    ] = await Promise.all([
      this.prisma.promotion.count(),
      this.prisma.promotion.count({
        where: {
          status: PromotionStatus.ACTIVE,
          is_active: true
        }
      }),
      this.prisma.promotionUsage.count(),
      this.prisma.promotionUsage.aggregate({
        _sum: {
          discount_amount: true
        }
      })
    ]);

    return {
      totalPromotions,
      activePromotions,
      totalUsage,
      totalSavings: totalSavings._sum.discount_amount || 0
    };
  }
}
