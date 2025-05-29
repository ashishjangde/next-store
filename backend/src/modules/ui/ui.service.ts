import { Injectable } from '@nestjs/common';
import { ProductRepository } from '../../repositories/product-repository';
import { CategoryRepository } from '../../repositories/category-repository';
import { BannerRepository } from '../../repositories/banner-repository';
import { PrismaService } from '../../common/db/prisma/prisma.service';

@Injectable()
export class UiService {
  constructor(
    private readonly productRepository: ProductRepository,
    private readonly categoryRepository: CategoryRepository,
    private readonly bannerRepository: BannerRepository,
    private readonly prisma: PrismaService,
  ) {}

  async getHomePageData(userId?: string) {
    const [
      banners,
      categories,
      featuredProducts,
      trendingProducts,
      suggestions,
      newProducts
    ] = await Promise.all([
      this.getActiveBanners(),
      this.getCategoriesWithFeaturedProducts(),
      this.getFeaturedProductsByCategory(),
      this.getTrendingProducts(),
      userId ? this.getUserSuggestions(userId) : null,
      this.getNewProducts()
    ]);

    return {
      banners,
      categories,
      featuredProducts,
      trendingProducts,
      suggestions,
      newProducts
    };
  }




  
  async getActiveBanners() {
    return this.bannerRepository.findActiveForPublic();
  }  async getCategoriesWithFeaturedProducts() {
    // Get featured categories of any level with product counts
    const categories = await this.prisma.category.findMany({
      where: {
        active: true,
        is_featured: true, // Only featured categories (any level)
      },
      take: 12,
      orderBy: { 
        created_at: 'asc' 
      },
      include: {
        _count: {
          select: { products: true }
        }
      }
    });

    return categories;
  }
  async getFeaturedProductsByCategory() {
    // Get featured products grouped by category
    const categories = await this.prisma.category.findMany({
      where: {
        active: true,
        level: 2, // Only level 2 categories can have products
      },
      take: 6,
      include: {
        products: {
          where: {
            is_active: true,
            archived: false,
            product_type: 'PARENT'
          },
          take: 4,
          orderBy: { created_at: 'desc' },
          include: {
            Inventory: true,
            _count: {
              select: { OrderItems: true }
            }
          }
        }
      }
    });

    return categories.filter(category => category.products.length > 0);
  }

  async getTrendingProducts() {
    // Get most ordered products (trending)
    const trendingProducts = await this.prisma.product.findMany({
      where: {
        is_active: true,
        archived: false,
        product_type: 'PARENT'
      },
      include: {
        Inventory: true,
        category: true,
        _count: {
          select: { OrderItems: true }
        }
      },
      orderBy: {
        OrderItems: {
          _count: 'desc'
        }
      },
      take: 8
    });

    // If no trending products found, return some newer products
    if (trendingProducts.length === 0) {
      return this.getNewProducts(8);
    }

    return trendingProducts;
  }

  async getUserSuggestions(userId: string) {
    // Get user's product history
    const userHistory = await this.prisma.productHistory.findMany({
      where: { user_id: userId },
      orderBy: { visited_at: 'desc' },
      take: 10,
      include: {
        Product: {
          include: {
            category: true
          }
        }
      }
    });

    if (userHistory.length === 0) {
      return this.getNewProducts(6);
    }    // Get categories from user's history
    const categoryIds = userHistory
      .map(h => h.Product.category_id)
      .filter((id): id is string => id !== null)
      .slice(0, 3);

    if (categoryIds.length === 0) {
      return this.getNewProducts(6);
    }

    // Get suggested products from similar categories
    const suggestions = await this.prisma.product.findMany({
      where: {
        is_active: true,
        archived: false,
        product_type: 'PARENT',
        category_id: {
          in: categoryIds
        },
        id: {
          notIn: userHistory.map(h => h.product_id)
        }
      },
      include: {
        Inventory: true,
        category: true,
        _count: {
          select: { OrderItems: true }
        }
      },
      orderBy: [
        { OrderItems: { _count: 'desc' } },
        { created_at: 'desc' }
      ],
      take: 6
    });

    // If not enough suggestions, fill with new products
    if (suggestions.length < 6) {
      const newProducts = await this.getNewProducts(6 - suggestions.length);
      return [...suggestions, ...newProducts];
    }

    return suggestions;
  }

  async getNewProducts(limit = 6) {
    return this.prisma.product.findMany({
      where: {
        is_active: true,
        archived: false,
        product_type: 'PARENT'
      },
      include: {
        Inventory: true,
        category: true,
        _count: {
          select: { OrderItems: true }
        }
      },
      orderBy: { created_at: 'desc' },
      take: limit
    });
  }

  async getProductsByCategory(categoryId: string, limit = 10) {
    return this.prisma.product.findMany({
      where: {
        category_id: categoryId,
        is_active: true,
        archived: false,
        product_type: 'PARENT'
      },
      include: {
        Inventory: true,
        category: true,
        _count: {
          select: { OrderItems: true }
        }
      },
      orderBy: { created_at: 'desc' },
      take: limit
    });
  }

  async recordProductView(userId: string, productId: string) {
    // Record or update user's product view history
    try {
      await this.prisma.productHistory.upsert({
        where: {
          user_id_product_id: {
            user_id: userId,
            product_id: productId
          }
        },
        update: {
          visited_at: new Date()
        },
        create: {
          user_id: userId,
          product_id: productId,
          visited_at: new Date()
        }
      });
    } catch (error) {
      console.log('Error recording product view:', error);
    }
  }
  async getCategoryPageData(categorySlug: string) {
    const category = await this.prisma.category.findUnique({
      where: { slug: categorySlug },
      include: {
        products: {
          where: {
            is_active: true,
            archived: false,
            product_type: 'PARENT'
          },
          take: 20,
          include: {
            Inventory: true,
            _count: {
              select: { OrderItems: true }
            }
          }
        },
        children: {
          where: { active: true }
        }
      }
    });

    return {
      category,
    };
  }
}
