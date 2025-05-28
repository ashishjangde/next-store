import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/db/prisma/prisma.service';
import { Banner, Prisma } from '@prisma/client';

@Injectable()
export class BannerRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.BannerCreateInput): Promise<Banner> {
    return this.prisma.banner.create({
      data,
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      }
    });
  }
  async findAll(options?: {
    includeInactive?: boolean;
    includeCreator?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<Banner[]> {
    const { includeInactive = false, includeCreator = true, limit, offset } = options || {};
    
    return this.prisma.banner.findMany({
      where: includeInactive ? {} : { is_active: true },
      orderBy: [
        { sort_order: 'asc' },
        { created_at: 'desc' }
      ],
      include: includeCreator ? {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      } : undefined,
      ...(limit && { take: limit }),
      ...(offset && { skip: offset }),
    });
  }

  async count(options?: {
    includeInactive?: boolean;
  }): Promise<number> {
    const { includeInactive = false } = options || {};
    
    return this.prisma.banner.count({
      where: includeInactive ? {} : { is_active: true },
    });
  }

  async findById(id: string, includeCreator = true): Promise<Banner | null> {
    return this.prisma.banner.findUnique({
      where: { id },
      include: includeCreator ? {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      } : undefined
    });
  }

  async update(id: string, data: Prisma.BannerUpdateInput): Promise<Banner> {
    return this.prisma.banner.update({
      where: { id },
      data,
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      }
    });
  }

  async delete(id: string): Promise<Banner> {
    return this.prisma.banner.delete({
      where: { id }
    });
  }
  async findActiveForPublic(): Promise<{
    id: string;
    title: string;
    description: string | null;
    image_url: string;
    sort_order: number;
    created_at: Date;
    updated_at: Date;
  }[]> {
    return this.prisma.banner.findMany({
      where: { is_active: true },
      orderBy: [
        { sort_order: 'asc' },
        { created_at: 'desc' }
      ],
      select: {
        id: true,
        title: true,
        description: true,
        image_url: true,
        sort_order: true,
        created_at: true,
        updated_at: true,
      }
    });
  }
}
