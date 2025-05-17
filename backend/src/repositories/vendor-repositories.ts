import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/common/db/prisma/prisma.service';
import { handleDatabaseOperations } from 'src/common/utils/utils';
import { RedisService } from 'src/common/db/redis/redis.service';
import { Vendor, Prisma, Users, VendorStatus } from '@prisma/client';

@Injectable()
export class VendorRepositories {
  private readonly logger = new Logger(VendorRepositories.name);

  constructor(
    private prisma: PrismaService,
    private redis: RedisService
  ) {}

  private async cacheVendor(vendor: Vendor): Promise<void> {
    try {
      await this.redis.pipeline([
        { key: `vendor:id:${vendor.id}`, value: vendor },
        { key: `vendor:user_id:${vendor.user_id}`, value: vendor },
        { key: `vendor:gst_number:${vendor.gst_number}`, value: vendor }
      ]);
    } catch (error) {
      this.logger.error(`Error caching vendor: ${error.message}`, error);
    }
  }

  async createVendor(data: {
    user_id: string;
    gst_number: string;
    pan_number: string;
    shop_name: string;
    shop_address: string;
    phone_number: string;
  }): Promise<Vendor | null> {
    try {
      const vendor = await handleDatabaseOperations(() =>
        this.prisma.vendor.create({
          data: {
            ...data,
            status: 'PENDING',
          }
        }),
      );

      if (vendor) {
        await this.cacheVendor(vendor);
      }
      return vendor;
    } catch (error) {
      this.logger.error(`Error creating vendor: ${error.message}`, error);
      return null;
    }
  }

  async findVendorById(id: string): Promise<Vendor | null> {
    try {
      // Try to get from cache first
      const cachedVendor = await this.redis.get(`vendor:id:${id}`);
      if (cachedVendor) {
        return cachedVendor as Vendor;
      }

      // If not in cache, get from database
      const vendor = await handleDatabaseOperations(() =>
        this.prisma.vendor.findUnique({
          where: { id }
        }),
      );

      if (vendor) {
        await this.cacheVendor(vendor);
      }
      return vendor;
    } catch (error) {
      this.logger.error(`Error finding vendor by ID: ${error.message}`, error);
      return null;
    }
  }

  async findVendorByUserId(user_id: string): Promise<Vendor | null> {
    try {
      // Try to get from cache first
      const cachedVendor = await this.redis.get(`vendor:user_id:${user_id}`);
      if (cachedVendor) {
        return cachedVendor as Vendor;
      }

      // If not in cache, get from database
      const vendor = await handleDatabaseOperations(() =>
        this.prisma.vendor.findUnique({
          where: { user_id }
        }),
      );

      if (vendor) {
        await this.cacheVendor(vendor);
      }
      return vendor;
    } catch (error) {
      this.logger.error(`Error finding vendor by user ID: ${error.message}`, error);
      return null;
    }
  }

  async findVendorByGSTNumber(gst_number: string): Promise<Vendor | null> {
    try {
      // Try to get from cache first
      const cachedVendor = await this.redis.get(`vendor:gst_number:${gst_number}`);
      if (cachedVendor) {
        return cachedVendor as Vendor;
      }

      // If not in cache, get from database
      const vendor = await handleDatabaseOperations(() =>
        this.prisma.vendor.findUnique({
          where: { gst_number }
        }),
      );

      if (vendor) {
        await this.cacheVendor(vendor);
      }
      return vendor;
    } catch (error) {
      this.logger.error(`Error finding vendor by GST number: ${error.message}`, error);
      return null;
    }
  }

  async updateVendor(id: string, data: Partial<Omit<Vendor, 'id' | 'user_id' | 'created_at' | 'updated_at'>>): Promise<Vendor | null> {
    try {
      const vendor = await handleDatabaseOperations(() =>
        this.prisma.vendor.update({
          where: { id },
          data
        }),
      );

      if (vendor) {
        await this.cacheVendor(vendor);
        // Also invalidate old caches if key fields were updated
        if (data.gst_number) {
          await this.redis.del(`vendor:gst_number:${data.gst_number}`);
        }
      }
      return vendor;
    } catch (error) {
      this.logger.error(`Error updating vendor: ${error.message}`, error);
      return null;
    }
  }

  async updateVendorStatus(id: string, status: VendorStatus): Promise<Vendor | null> {
    return this.updateVendor(id, { status });
  }  async findAllVendors(options?: {
    skip?: number;
    take?: number;
    status?: VendorStatus;
    search?: string;
    includeUser?: boolean;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<{ vendors: (Vendor & { User?: Users })[], total: number } | null> {
    try {
      const { 
        skip = 0, 
        take = 10, 
        status, 
        search,
        includeUser = false,
        sortBy = 'created_at',
        sortOrder = 'desc'
      } = options || {};
      
      // Build where clause with status and search if provided
      const where: Prisma.VendorWhereInput = {};
      
      // Add status filter if provided
      if (status) {
        where.status = status;
      }
      
      // Add search filter if provided
      if (search) {
        where.OR = [
          {
            shop_name: {
              contains: search,
              mode: 'insensitive'
            }
          },
          {
            shop_address: {
              contains: search,
              mode: 'insensitive'
            }
          },
          {
            gst_number: {
              contains: search,
              mode: 'insensitive'
            }
          }
        ];
      }

      // Validate sortBy field to prevent injection
      const validSortFields = ['created_at', 'updated_at', 'shop_name', 'status'];
      const orderBy = {};
      
      // Only use sortBy if it's a valid field, otherwise default to created_at
      const actualSortField = validSortFields.includes(sortBy) ? sortBy : 'created_at';
      orderBy[actualSortField] = sortOrder;
      
      const result = await handleDatabaseOperations(() => Promise.all([
        this.prisma.vendor.findMany({
          where,
          skip,
          take,
          orderBy,
          include: includeUser ? { User: true } : undefined
        }),
        this.prisma.vendor.count({ where })
      ]));
      
      if (!result) return null;
      const [vendors, total] = result;

      return { vendors, total };
    } catch (error) {
      this.logger.error(`Error finding vendors: ${error.message}`, error);
      return null;
    }
  }

  async deleteVendor(id: string): Promise<Vendor | null> {
    try {
      const vendor = await this.findVendorById(id);
      if (!vendor) return null;

      const deletedVendor = await handleDatabaseOperations(() =>
        this.prisma.vendor.delete({
          where: { id }
        }),
      );

      if (deletedVendor) {
        // Delete all related cache entries
        await this.redis.pipeline([
          { key: `vendor:id:${id}`, value: null },
          { key: `vendor:user_id:${vendor.user_id}`, value: null },
          { key: `vendor:gst_number:${vendor.gst_number}`, value: null }
        ]);
      }
      return deletedVendor;
    } catch (error) {
      this.logger.error(`Error deleting vendor: ${error.message}`, error);
      return null;
    }
  }

  async vendorExists(user_id: string): Promise<boolean> {
    try {
      const vendor = await this.findVendorByUserId(user_id);
      return vendor !== null;
    } catch (error) {
      this.logger.error(`Error checking if vendor exists: ${error.message}`, error);
      return false;
    }
  }

  async isGSTNumberTaken(gst_number: string): Promise<boolean> {
    try {
      const vendor = await this.findVendorByGSTNumber(gst_number);
      return vendor !== null;
    } catch (error) {
      this.logger.error(`Error checking if GST number is taken: ${error.message}`, error);
      return false;
    }
  }

  async isPANNumberTaken(pan_number: string): Promise<boolean> {
    try {
      const vendor = await handleDatabaseOperations(() =>
        this.prisma.vendor.findFirst({
          where: { pan_number }
        }),
      );
      return vendor !== null;
    } catch (error) {
      this.logger.error(`Error checking if PAN number is taken: ${error.message}`, error);
      return false;
    }
  }
  async countVendorsByStatus(status: VendorStatus): Promise<number> {
    try {
      const count = await handleDatabaseOperations(() =>
        this.prisma.vendor.count({
          where: { status }
        }),
      );
      return count || 0;
    } catch (error) {
      this.logger.error(`Error counting vendors by status: ${error.message}`, error);
      return 0;
    }
  }
}
