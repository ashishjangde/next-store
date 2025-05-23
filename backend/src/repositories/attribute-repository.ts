import { Injectable, Logger } from '@nestjs/common';
import { Attribute, AttributeValue, Prisma } from '@prisma/client';
import { PrismaService } from 'src/common/db/prisma/prisma.service';
import { RedisService } from 'src/common/db/redis/redis.service';
import { handleDatabaseOperations } from 'src/common/utils/utils';

@Injectable()
export class AttributeRepository {
  private readonly logger = new Logger(AttributeRepository.name);

  constructor(
    private prisma: PrismaService,
    private redis: RedisService
  ) {}

  private async cacheAttribute(attribute: Attribute): Promise<void> {
    try {
      await this.redis.pipeline([
        { key: `attribute:id:${attribute.id}`, value: attribute },
        { key: `attribute:name:${attribute.name}`, value: attribute }
      ]);
    } catch (error) {
      this.logger.error(`Error caching attribute: ${error.message}`, error);
    }
  }

  async createAttribute(data: Prisma.AttributeCreateInput): Promise<Attribute | null> {
    try {
      const attribute = await handleDatabaseOperations(() =>
        this.prisma.attribute.create({ data })
      );

      if (attribute) {
        await this.cacheAttribute(attribute);
      }
      return attribute;
    } catch (error) {
      this.logger.error(`Error creating attribute: ${error.message}`, error);
      return null;
    }
  }

  async findAttributeById(id: string, includeValues: boolean = false): Promise<any | null> {
    const cacheKey = `attribute:id:${id}`;
    try {
      // Only use cache when not including values
      const cached = includeValues ? null : await this.redis.get<Attribute>(cacheKey);
      
      if (cached && !includeValues) {
        return cached;
      }

      // Fix the query to get values properly
      const attribute = await handleDatabaseOperations(() =>
        this.prisma.attribute.findUnique({
          where: { id },
          include: includeValues ? {
            values: true,
            categories: { 
              include: {
                category: true
              }
            }
          } : undefined
        })
      );

      // Fix values array if it's empty or malformed
      if (attribute && includeValues) {
        const attributeWithValues = attribute as Attribute & { values: AttributeValue[] };
        // Ensure values is a properly structured array
        if (!Array.isArray(attributeWithValues.values) || attributeWithValues.values.length === 0 || 
            (Array.isArray(attributeWithValues.values[0]) && attributeWithValues.values.every(Array.isArray))) {
          attributeWithValues.values = [];
        }
      }

      if (attribute && !includeValues) {
        await this.redis.set(cacheKey, attribute, 3600);
      }
      
      return attribute;
    } catch (error) {
      this.logger.error(`Error finding attribute by ID: ${error.message}`, error);
      return null;
    }
  }

  async findAttributeByName(name: string, includeValues: boolean = false): Promise<any | null> {
    const cacheKey = `attribute:name:${name}`;
    try {
      const cached = await this.redis.get<Attribute>(cacheKey);
      
      if (cached && !includeValues) {
        return cached;
      }

      const attribute = await handleDatabaseOperations(() =>
        this.prisma.attribute.findUnique({
          where: { name },
          include: includeValues ? {
            values: true,
            categories: { // Changed from categoryAttributes to categories
              include: {
                category: true
              }
            }
          } : undefined
        })
      );

      if (attribute && !includeValues) {
        await this.redis.set(cacheKey, attribute, 3600);
      }
      
      return attribute;
    } catch (error) {
      this.logger.error(`Error finding attribute by name: ${error.message}`, error);
      return null;
    }
  }

  async findAllAttributes(
    page: number = 1,
    limit: number = 10,
    search: string = '',
    includeValues: boolean = true
  ): Promise<{ data: any[], total: number }> {
    try {
      const skip = (page - 1) * limit;
      
      // Prepare where clause for search
      const where: Prisma.AttributeWhereInput = {};
      
      // Add name search if search term is provided
      if (search.trim()) {
        where.name = {
          contains: search,
          mode: 'insensitive'  // Case insensitive search
        };
      }
      
      const result = await handleDatabaseOperations(() => 
        Promise.all([
          this.prisma.attribute.findMany({
            skip,
            take: limit,
            where,
            orderBy: { name: 'asc' },
            include: includeValues ? {
              values: true
            } : undefined
          }),
          this.prisma.attribute.count({ where })
        ])
      );

      const [attributes, total] = result || [[], 0];

      // Fix values array if needed
      if (includeValues && attributes?.length) {
        attributes.forEach((attr: Attribute & { values?: AttributeValue[] }) => {
          // Ensure values is a properly structured array
          if (!Array.isArray(attr.values) || attr.values.length === 0 || 
              (Array.isArray(attr.values[0]) && attr.values.every(Array.isArray))) {
            attr.values = [];
          }
        });
      }

      return {
        data: attributes,
        total
      };
    } catch (error) {
      this.logger.error(`Error finding all attributes: ${error.message}`, error);
      return {
        data: [],
        total: 0
      };
    }
  }

  async updateAttribute(
    id: string,
    data: Prisma.AttributeUpdateInput,
    includeValues: boolean = false
  ): Promise<Attribute | null> {
    try {
      const attribute = await handleDatabaseOperations(() =>
        this.prisma.attribute.update({
          where: { id },
          data,
          include: includeValues ? {
            values: true
          } : undefined
        })
      );

      if (attribute) {
        // First delete old cache entries
        await this.redis.pipelineDel([
          `attribute:id:${id}`,
          `attribute:name:${attribute.name}`
        ]);

        // Then set new cache entries
        await this.cacheAttribute(attribute);
      }

      return attribute;
    } catch (error) {
      this.logger.error(`Error updating attribute: ${error.message}`, error);
      return null;
    }
  }

  async deleteAttribute(id: string): Promise<boolean> {
    try {
      const attribute = await this.findAttributeById(id);
      if (!attribute) return false;
      
      // First step: Delete attribute from products
      await handleDatabaseOperations(() =>
        this.prisma.productAttributeValue.deleteMany({
          where: { attribute_value_id: id }
        })
      );

      // Second step: Delete all associated category attributes
      await handleDatabaseOperations(() =>
        this.prisma.categoryAttribute.deleteMany({
          where: { attribute_id: id }
        })
      );

      // Third step: Delete all attribute values
      await handleDatabaseOperations(() =>
        this.prisma.attributeValue.deleteMany({
          where: { attribute_id: id }
        })
      );

      // Final step: Delete the attribute itself
      await handleDatabaseOperations(() =>
        this.prisma.attribute.delete({ where: { id } })
      );

      // Clear cache
      await this.redis.pipelineDel([
        `attribute:id:${id}`,
        `attribute:name:${attribute.name}`
      ]);
      
      // Also invalidate related category caches
      if (attribute.categories && attribute.categories.length > 0) {
        const categoryIds = attribute.categories.map(ca => ca.category_id);
        const categoryCacheKeys = categoryIds.map(cid => `category:id:${cid}`);
        if (categoryCacheKeys.length > 0) {
          await this.redis.pipelineDel(categoryCacheKeys);
        }
      }

      return true;
    } catch (error) {
      this.logger.error(`Error deleting attribute: ${error.message}`, error);
      return false;
    }
  }

  // Methods for AttributeValue
  async createAttributeValue(
    data: Prisma.AttributeValueCreateInput
  ): Promise<AttributeValue | null> {
    try {
      const attributeValue = await handleDatabaseOperations(() =>
        this.prisma.attributeValue.create({
          data
        })
      );

      // Invalidate attribute cache
      if (attributeValue) {
        await this.redis.pipelineDel([
          `attribute:id:${attributeValue.attribute_id}`
        ]);
      }

      return attributeValue;
    } catch (error) {
      this.logger.error(`Error creating attribute value: ${error.message}`, error);
      return null;
    }
  }

  async findAttributeValueById(id: string): Promise<AttributeValue | null> {
    try {
      const attributeValue = await handleDatabaseOperations(() =>
        this.prisma.attributeValue.findUnique({
          where: { id }
        })
      );
      
      return attributeValue;
    } catch (error) {
      this.logger.error(`Error finding attribute value by ID: ${error.message}`, error);
      return null;
    }
  }

  async findAttributeValueByAttributeAndValue(
    attributeId: string,
    value: string
  ): Promise<AttributeValue | null> {
    try {
      const attributeValue = await handleDatabaseOperations(() =>
        this.prisma.attributeValue.findFirst({
          where: {
            attribute_id: attributeId,
            value
          }
        })
      );
      
      return attributeValue;
    } catch (error) {
      this.logger.error(`Error finding attribute value: ${error.message}`, error);
      return null;
    }
  }

  async getAttributeValues(attributeId: string): Promise<AttributeValue[]> {
    try {
      const attributeValues = await handleDatabaseOperations(() =>
        this.prisma.attributeValue.findMany({
          where: {
            attribute_id: attributeId
          }
        })
      );

      return attributeValues ?? [];
    } catch (error) {
      this.logger.error(`Error getting attribute values: ${error.message}`, error);
      return [];
    }
  }

  async updateAttributeValue(
    id: string,
    data: Prisma.AttributeValueUpdateInput
  ): Promise<AttributeValue | null> {
    try {
      const attributeValue = await handleDatabaseOperations(() =>
        this.prisma.attributeValue.update({
          where: { id },
          data
        })
      );

      // Invalidate attribute cache
      if (attributeValue) {
        await this.redis.pipelineDel([
          `attribute:id:${attributeValue.attribute_id}`
        ]);
      }

      return attributeValue;
    } catch (error) {
      this.logger.error(`Error updating attribute value: ${error.message}`, error);
      return null;
    }
  }

  async deleteAttributeValue(id: string): Promise<boolean> {
    try {
      const attributeValue = await this.findAttributeValueById(id);
      if (!attributeValue) return false;

      // Delete the attribute value
      await handleDatabaseOperations(() =>
        this.prisma.attributeValue.delete({ where: { id } })
      );

      // Invalidate attribute cache
      await this.redis.pipelineDel([
        `attribute:id:${attributeValue.attribute_id}`
      ]);

      return true;
    } catch (error) {
      this.logger.error(`Error deleting attribute value: ${error.message}`, error);
      return false;
    }
  }
}
