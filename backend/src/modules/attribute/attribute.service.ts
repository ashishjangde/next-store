import { Injectable, Logger, HttpStatus } from '@nestjs/common';
import { AttributeRepository } from 'src/repositories/attribute-repository';
import { Prisma } from '@prisma/client';
import ApiError from 'src/common/responses/ApiError';
import { plainToClass } from 'class-transformer';
import { AttributeResponseDto } from './dto/attribute-response.dto';
import { AttributeCreateDto } from './dto/attribute-create.dto';
import { AttributeValueCreateDto } from './dto/attribute-value-create.dto';
import { AttributeValueResponseDto } from './dto/attribute-value-response.dto';
import { PrismaService } from 'src/common/db/prisma/prisma.service';

@Injectable()
export class AttributeService {
  private readonly logger = new Logger(AttributeService.name);

  constructor(
    private readonly attributeRepo: AttributeRepository,
    private readonly prisma: PrismaService // Add PrismaService to constructor
  ) {}

  async createAttribute(createDto: AttributeCreateDto) {
    this.logger.debug(`Creating new attribute: ${createDto.name}`);
    
    try {
      // Check if attribute with the same name already exists
      const existingAttribute = await this.attributeRepo.findAttributeByName(createDto.name);
      if (existingAttribute) {
        throw new ApiError(HttpStatus.CONFLICT, 'Attribute with this name already exists');
      }
      
      // Prepare attribute data
      const attributeData: Prisma.AttributeCreateInput = {
        name: createDto.name,
        description: createDto.description,
        type: createDto.type || 'string'
      };
      
      // Create attribute in database
      const attribute = await this.attributeRepo.createAttribute(attributeData);
      
      if (!attribute) {
        throw new ApiError(
          HttpStatus.INTERNAL_SERVER_ERROR,
          'Failed to create attribute'
        );
      }
      
      this.logger.debug(`Attribute created successfully: ${attribute.id}`);
      return plainToClass(AttributeResponseDto, attribute, {
        excludeExtraneousValues: false,
        enableImplicitConversion: true
      });
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      
      this.logger.error(`Error creating attribute: ${error.message}`, error.stack);
      throw new ApiError(
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Failed to create attribute'
      );
    }
  }

  async getAllAttributes(
    page: number = 1, 
    limit: number = 10, 
    search: string = '',
    includeValues: boolean = true
  ) {
    try {
      const result = await this.attributeRepo.findAllAttributes(
        page, 
        limit,
        search,
        includeValues
      );
      
      // Process data to ensure values are correctly formatted
      const processedData = result.data.map(attribute => {
        // Ensure values is always an array
        if (includeValues) {
          if (!attribute.values || !Array.isArray(attribute.values) || 
              (Array.isArray(attribute.values[0]) && attribute.values.every(Array.isArray))) {
            attribute.values = [];
          }
        }
        return attribute;
      });

      return {
        data: plainToClass(AttributeResponseDto, processedData, {
          excludeExtraneousValues: false,
          enableImplicitConversion: true
        }),
        total: result.total,
        page,
        limit
      };
    } catch (error) {
      this.logger.error(`Error getting attributes: ${error.message}`, error.stack);
      throw new ApiError(
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Failed to retrieve attributes'
      );
    }
  }

  async getAttribute(id: string, includeValues: boolean = true) {
    try {
      const attribute = await this.attributeRepo.findAttributeById(id, includeValues);
      
      if (!attribute) {
        throw new ApiError(HttpStatus.NOT_FOUND, 'Attribute not found');
      }
      
      // Fix values structure if needed
      if (includeValues) {
        if (!attribute.values || !Array.isArray(attribute.values) || 
            (Array.isArray(attribute.values[0]) && attribute.values.every(Array.isArray))) {
          attribute.values = [];
        }
      }
      
      return plainToClass(AttributeResponseDto, attribute, {
        excludeExtraneousValues: false,
        enableImplicitConversion: true
      });
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      
      this.logger.error(`Error getting attribute: ${error.message}`, error.stack);
      throw new ApiError(
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Failed to retrieve attribute'
      );
    }
  }

  async addAttributeValue(attributeId: string, createDto: AttributeValueCreateDto) {
    try {
      // Check if attribute exists
      const attribute = await this.attributeRepo.findAttributeById(attributeId);
      if (!attribute) {
        throw new ApiError(HttpStatus.NOT_FOUND, 'Attribute not found');
      }
      
      // Check if value already exists
      const existingValue = await this.attributeRepo.findAttributeValueByAttributeAndValue(
        attributeId,
        createDto.value
      );
      
      if (existingValue) {
        throw new ApiError(HttpStatus.CONFLICT, 'Value already exists for this attribute');
      }
      
      // Prepare attribute value data
      const valueData: Prisma.AttributeValueCreateInput = {
        value: createDto.value,
        display_value: createDto.display_value || createDto.value,
        attribute: {
          connect: {
            id: attributeId
          }
        }
      };
      
      // Create attribute value in database
      const attributeValue = await this.attributeRepo.createAttributeValue(valueData);
      
      if (!attributeValue) {
        throw new ApiError(
          HttpStatus.INTERNAL_SERVER_ERROR,
          'Failed to create attribute value'
        );
      }
      
      return plainToClass(AttributeValueResponseDto, attributeValue, {
        excludeExtraneousValues: false,
        enableImplicitConversion: true
      });
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      
      this.logger.error(`Error adding attribute value: ${error.message}`, error.stack);
      throw new ApiError(
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Failed to add attribute value'
      );
    }
  }

  async getAttributeValues(attributeId: string) {
    try {
      // Check if attribute exists
      const attribute = await this.attributeRepo.findAttributeById(attributeId);
      if (!attribute) {
        throw new ApiError(HttpStatus.NOT_FOUND, 'Attribute not found');
      }
      
      // Get attribute values
      const values = await this.attributeRepo.getAttributeValues(attributeId);
      
      return plainToClass(AttributeValueResponseDto, values, {
        excludeExtraneousValues: false,
        enableImplicitConversion: true
      });
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      
      this.logger.error(`Error getting attribute values: ${error.message}`, error.stack);
      throw new ApiError(
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Failed to retrieve attribute values'
      );
    }
  }

  async deleteAttributeValue(id: string) {
    try {
      const success = await this.attributeRepo.deleteAttributeValue(id);
      
      if (!success) {
        throw new ApiError(HttpStatus.NOT_FOUND, 'Attribute value not found');
      }
      
      return { success: true };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      
      this.logger.error(`Error deleting attribute value: ${error.message}`, error.stack);
      throw new ApiError(
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Failed to delete attribute value'
      );
    }
  }

  async updateAttribute(id: string, updateDto: any) {
    try {
      // Check if attribute exists
      const existingAttribute = await this.attributeRepo.findAttributeById(id);
      if (!existingAttribute) {
        throw new ApiError(HttpStatus.NOT_FOUND, 'Attribute not found');
      }
      
      // Check for name uniqueness if name is being updated
      if (updateDto.name && updateDto.name !== existingAttribute.name) {
        const nameExists = await this.attributeRepo.findAttributeByName(updateDto.name);
        if (nameExists) {
          throw new ApiError(HttpStatus.CONFLICT, 'Attribute with this name already exists');
        }
      }
      
      // Update attribute
      const attribute = await this.attributeRepo.updateAttribute(id, updateDto, true);
      
      if (!attribute) {
        throw new ApiError(
          HttpStatus.INTERNAL_SERVER_ERROR,
          'Failed to update attribute'
        );
      }
      
      return plainToClass(AttributeResponseDto, attribute, {
        excludeExtraneousValues: false,
        enableImplicitConversion: true
      });
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      
      this.logger.error(`Error updating attribute: ${error.message}`, error.stack);
      throw new ApiError(
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Failed to update attribute'
      );
    }
  }

  async deleteAttribute(id: string) {
    try {
      // Check if attribute exists
      const attribute = await this.attributeRepo.findAttributeById(id, true);
      if (!attribute) {
        throw new ApiError(HttpStatus.NOT_FOUND, 'Attribute not found');
      }
      
      // Get products that use this attribute for proper notification
      let productCount = 0;
      try {
        productCount = await this.prisma.productAttributeValue.count({
          where: { attribute_value_id: id }
        });
      } catch (countError) {
        this.logger.error(`Error counting products with attribute: ${countError.message}`);
        // Continue with deletion even if count fails
      }

      // Get categories that use this attribute
      const categoriesWithAttribute = attribute.categories || [];
      
      // Proceed with deletion
      const success = await this.attributeRepo.deleteAttribute(id);
      
      if (!success) {
        throw new ApiError(
          HttpStatus.INTERNAL_SERVER_ERROR,
          'Failed to delete attribute'
        );
      }
      
      return { 
        success: true,
        deleted: {
          attribute: attribute.name,
          productCount,
          categoryCount: categoriesWithAttribute.length
        }
      };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      
      this.logger.error(`Error deleting attribute: ${error.message}`, error.stack);
      throw new ApiError(
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Failed to delete attribute'
      );
    }
  }

  // Complete the incomplete method that was causing errors
  async debugAttribute(id: string) {
    try {
      const attribute = await this.attributeRepo.findAttributeById(id, true);
      if (!attribute) {
        throw new ApiError(HttpStatus.NOT_FOUND, 'Attribute not found');
      }
      
      return attribute;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      
      throw new ApiError(
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Failed to debug attribute'
      );
    }
  }
}
