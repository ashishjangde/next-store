import { Injectable, Logger, HttpStatus } from '@nestjs/common';
import { AttributeRepository } from 'src/repositories/attribute-repository';
import { Prisma } from '@prisma/client';
import ApiError from 'src/common/responses/ApiError';
import { plainToClass } from 'class-transformer';
import { AttributeResponseDto } from './dto/attribute-response.dto';
import { AttributeCreateDto } from './dto/attribute-create.dto';
import { AttributeValueCreateDto } from './dto/attribute-value-create.dto';
import { AttributeValueResponseDto } from './dto/attribute-value-response.dto';

@Injectable()
export class AttributeService {
  private readonly logger = new Logger(AttributeService.name);

  constructor(
    private readonly attributeRepo: AttributeRepository
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

  async getAllAttributes(page: number = 1, limit: number = 10) {
    try {
      const result = await this.attributeRepo.findAllAttributes(page, limit);
      
      return {
        data: plainToClass(AttributeResponseDto, result.data, {
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
}
