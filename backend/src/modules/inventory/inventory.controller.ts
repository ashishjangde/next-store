import { Controller, Get, Put, Body, Param, Query, UseGuards, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse as SwaggerApiResponse, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { InventoryService } from './inventory.service';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Role } from 'src/common/decorators/roles-decorator';
import { GetUser } from 'src/common/decorators/user.decorator';
import { Roles, Users } from '@prisma/client';
import { InventoryUpdateDto, VariationInventoryUpdateDto } from './dto/inventory-update.dto';
import { InventoryResponseDto, VariationInventoryResponseDto, LowStockProductDto } from './dto/inventory-response.dto';
import { ApiCustomErrorResponse } from 'src/common/responses/ApiError';
import ApiResponseClass from 'src/common/responses/ApiResponse';
import ApiError from 'src/common/responses/ApiError';
import { VendorRepositories } from 'src/repositories/vendor-repositories';

@Controller('inventory')
@ApiTags('Inventory')
@UseGuards(JwtAuthGuard, RolesGuard)
export class InventoryController {
  constructor(
    private readonly inventoryService: InventoryService,
    private readonly vendorRepository: VendorRepositories
  ) {}

  @Get('vendor')
  @Role(Roles.VENDOR, Roles.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get all inventory items for vendor',
    description: 'Retrieves inventory details for all products belonging to the authenticated vendor'
  })  @SwaggerApiResponse({
    status: HttpStatus.OK,
    description: 'Inventory items retrieved successfully',
    type: [InventoryResponseDto]
  })
  @SwaggerApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'User is not authenticated'
  })
  async getVendorInventories(@GetUser() user: Users) {
    try {
      // Get vendor information
      const vendor = await this.vendorRepository.findVendorByUserId(user.id);
      
      // If admin but not a vendor, return error
      if (user.roles.includes(Roles.ADMIN) && !vendor) {        return new ApiResponseClass(null, new ApiError(HttpStatus.FORBIDDEN, 'Admin users must have a vendor account to access vendor inventory'));
      }
      
      // Use vendor.id if exists, otherwise user.id (for admin-vendors)
      const vendorId = vendor?.id || user.id;
      
      const inventories = await this.inventoryService.getInventoriesByVendorId(vendorId);
      return new ApiResponseClass(inventories);
    } catch (error) {
      if (error instanceof ApiError) {
        return new ApiResponseClass(null, error);
      }
      return new ApiResponseClass(null, new ApiError(HttpStatus.INTERNAL_SERVER_ERROR, 'Internal server error'));
    }
  }

  @Get('low-stock')
  @Role(Roles.VENDOR, Roles.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get low stock products',
    description: 'Retrieves products with inventory levels below their threshold or a specified value'
  })
  @ApiQuery({
    name: 'threshold',
    required: false,
    type: Number,
    description: 'Optional threshold value. If not provided, uses each product\'s own threshold'
  })  @SwaggerApiResponse({
    status: HttpStatus.OK,
    description: 'Low stock products retrieved successfully',
    type: [LowStockProductDto]
  })
  async getLowStockProducts(
    @GetUser() user: Users,
    @Query('threshold') threshold?: number
  ) {
    try {
      // Get vendor information
      const vendor = await this.vendorRepository.findVendorByUserId(user.id);
      
      // If admin but not a vendor, return error
      if (user.roles.includes(Roles.ADMIN) && !vendor) {        return new ApiResponseClass(null, new ApiError(HttpStatus.FORBIDDEN, 'Admin users must have a vendor account to access vendor inventory'));
      }
      
      // Use vendor.id if exists, otherwise user.id (for admin-vendors)
      const vendorId = vendor?.id || user.id;
      
      const lowStockProducts = await this.inventoryService.getLowStockProducts(
        vendorId, 
        threshold ? Number(threshold) : undefined
      );
      
      return new ApiResponseClass(lowStockProducts);
    } catch (error) {
      if (error instanceof ApiError) {
        return new ApiResponseClass(null, error);
      }
      return new ApiResponseClass(null, new ApiError(HttpStatus.INTERNAL_SERVER_ERROR, 'Internal server error'));
    }
  }

  @Get(':productId')
  @Role(Roles.VENDOR, Roles.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get inventory for a specific product',
    description: 'Retrieves inventory details for a specific product'
  })  @SwaggerApiResponse({
    status: HttpStatus.OK,
    description: 'Inventory retrieved successfully',
    type: InventoryResponseDto
  })
  @SwaggerApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Product or inventory not found'
  })  async getInventory(@Param('productId') productId: string) {
    try {
      const inventory = await this.inventoryService.getInventoryByProductId(productId);
      return new ApiResponseClass(inventory);
    } catch (error) {
      if (error instanceof ApiError) {
        return new ApiResponseClass(null, error);
      }
      return new ApiResponseClass(null, new ApiError(HttpStatus.INTERNAL_SERVER_ERROR, 'Internal server error'));
    }
  }

  @Put(':productId')
  @Role(Roles.VENDOR, Roles.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update inventory for a specific product',
    description: 'Updates inventory details for a specific product'
  })  @SwaggerApiResponse({
    status: HttpStatus.OK,
    description: 'Inventory updated successfully',
    type: InventoryResponseDto
  })
  @SwaggerApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Product not found or does not belong to this vendor',
    schema: ApiCustomErrorResponse(HttpStatus.NOT_FOUND, 'Product not found or does not belong to this vendor')
  })
  async updateInventory(
    @GetUser() user: Users,
    @Param('productId') productId: string,
    @Body() updateDto: InventoryUpdateDto
  ) {
    try {
      // Get vendor information
      const vendor = await this.vendorRepository.findVendorByUserId(user.id);
        // If admin but not a vendor, return error
      if (user.roles.includes(Roles.ADMIN) && !vendor) {
        return new ApiResponseClass(null, new ApiError(HttpStatus.FORBIDDEN, 'Admin users must have a vendor account to update inventory'));
      }
      
      // Use vendor.id if exists, otherwise user.id (for admin-vendors)
      const vendorId = vendor?.id || user.id;
      
      const updatedInventory = await this.inventoryService.updateInventory(vendorId, productId, updateDto);
      return new ApiResponseClass(updatedInventory);
    } catch (error) {
      if (error instanceof ApiError) {
        return new ApiResponseClass(null, error);
      }
      return new ApiResponseClass(null, new ApiError(HttpStatus.INTERNAL_SERVER_ERROR, 'Internal server error'));
    }
  }

  @Put('parent/:parentProductId/variants')
  @Role(Roles.VENDOR, Roles.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update inventory for multiple product variants',
    description: 'Updates inventory for multiple variants of a parent product in a single operation'
  })  @SwaggerApiResponse({
    status: HttpStatus.OK,
    description: 'Variant inventories updated successfully',
    type: VariationInventoryResponseDto
  })
  @SwaggerApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Parent product not found or does not belong to this vendor',
    schema: ApiCustomErrorResponse(HttpStatus.NOT_FOUND, 'Parent product not found or does not belong to this vendor')
  })
  @SwaggerApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid request data',
    schema: ApiCustomErrorResponse(HttpStatus.BAD_REQUEST, 'Invalid request data')
  })
  async updateVariantInventories(
    @GetUser() user: Users,
    @Param('parentProductId') parentProductId: string,
    @Body() updateDto: VariationInventoryUpdateDto
  ) {
    try {
      // Get vendor information
      const vendor = await this.vendorRepository.findVendorByUserId(user.id);
        // If admin but not a vendor, return error
      if (user.roles.includes(Roles.ADMIN) && !vendor) {
        return new ApiResponseClass(null, new ApiError(HttpStatus.FORBIDDEN, 'Admin users must have a vendor account to update inventory'));
      }
      
      // Use vendor.id if exists, otherwise user.id (for admin-vendors)
      const vendorId = vendor?.id || user.id;
      
      const result = await this.inventoryService.updateVariantInventories(vendorId, parentProductId, updateDto);
      return new ApiResponseClass(result);
    } catch (error) {
      if (error instanceof ApiError) {
        return new ApiResponseClass(null, error);
      }
      return new ApiResponseClass(null, new ApiError(HttpStatus.INTERNAL_SERVER_ERROR, 'Internal server error'));
    }
  }
}
