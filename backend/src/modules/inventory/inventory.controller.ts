import { Controller, Get, Put, Body, Param, Query, UseGuards, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse as SwaggerResponse, ApiQuery } from '@nestjs/swagger';
import { InventoryService } from './inventory.service';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Role } from 'src/common/decorators/roles-decorator';
import { Roles } from '@prisma/client';
import { InventoryUpdateDto, VariationInventoryUpdateDto } from './dto/inventory-update.dto';
import { InventoryResponseDto, VariationInventoryResponseDto, LowStockProductDto, LowStockVariationDto } from './dto/inventory-response.dto';
import { GetUser } from 'src/common/decorators/user.decorator';
import { ApiCustomResponse } from 'src/common/responses/ApiResponse';
import { ApiCustomErrorResponse } from 'src/common/responses/ApiError';
import ApiResponse from 'src/common/responses/ApiResponse';

@Controller('inventory')
@ApiTags('Inventory')
@UseGuards(JwtAuthGuard, RolesGuard)
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get('product/:productId')
  @Role(Roles.ADMIN, Roles.VENDOR)
  @ApiOperation({ summary: 'Get product inventory', description: 'Get inventory details for a specific product' })
  @SwaggerResponse({
    status: HttpStatus.OK,
    description: 'Inventory found',
    schema: ApiCustomResponse(InventoryResponseDto)
  })
  @SwaggerResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Product or inventory not found',
    schema: ApiCustomErrorResponse(HttpStatus.NOT_FOUND, 'Product or inventory not found')
  })
  async getProductInventory(
    @Param('productId') productId: string
  ): Promise<ApiResponse<InventoryResponseDto>> {
    const inventory = await this.inventoryService.getProductInventory(productId);
    return new ApiResponse<InventoryResponseDto>(inventory);
  }

  @Put('product/:productId')
  @Role(Roles.ADMIN, Roles.VENDOR)
  @ApiOperation({ summary: 'Update product inventory', description: 'Update inventory details for a specific product' })
  @SwaggerResponse({
    status: HttpStatus.OK,
    description: 'Inventory updated',
    schema: ApiCustomResponse(InventoryResponseDto)
  })
  async updateProductInventory(
    @Param('productId') productId: string,
    @Body() updateDto: InventoryUpdateDto,
    @GetUser('id') vendorId: string
  ): Promise<ApiResponse<InventoryResponseDto>> {
    const inventory = await this.inventoryService.updateProductInventory(productId, updateDto, vendorId);
    return new ApiResponse<InventoryResponseDto>(inventory);
  }

  @Get('variation/:variationId')
  @Role(Roles.ADMIN, Roles.VENDOR)
  @ApiOperation({ summary: 'Get variation inventory', description: 'Get inventory details for a specific product variation' })
  @SwaggerResponse({
    status: HttpStatus.OK,
    description: 'Inventory found',
    schema: ApiCustomResponse(VariationInventoryResponseDto)
  })
  async getVariationInventory(
    @Param('variationId') variationId: string
  ): Promise<ApiResponse<VariationInventoryResponseDto>> {
    const inventory = await this.inventoryService.getVariationInventory(variationId);
    return new ApiResponse<VariationInventoryResponseDto>(inventory);
  }

  @Put('variation/:variationId')
  @Role(Roles.ADMIN, Roles.VENDOR)
  @ApiOperation({ summary: 'Update variation inventory', description: 'Update inventory details for a specific product variation' })
  @SwaggerResponse({
    status: HttpStatus.OK,
    description: 'Inventory updated',
    schema: ApiCustomResponse(VariationInventoryResponseDto)
  })
  async updateVariationInventory(
    @Param('variationId') variationId: string,
    @Body() updateDto: VariationInventoryUpdateDto,
    @GetUser('id') vendorId: string
  ): Promise<ApiResponse<VariationInventoryResponseDto>> {
    const inventory = await this.inventoryService.updateVariationInventory(variationId, updateDto, vendorId);
    return new ApiResponse<VariationInventoryResponseDto>(inventory);
  }

  @Get('low-stock/products')
  @Role(Roles.ADMIN, Roles.VENDOR)
  @ApiOperation({ summary: 'Get low stock products', description: 'Get products that are low on stock' })
  @ApiQuery({ name: 'threshold', type: Number, required: false, description: 'Custom low stock threshold' })
  @SwaggerResponse({
    status: HttpStatus.OK,
    description: 'Low stock products retrieved',
    schema: ApiCustomResponse([LowStockProductDto])
  })
  async getLowStockProducts(
    @Query('threshold') threshold?: number
  ): Promise<ApiResponse<LowStockProductDto[]>> {
    const products = await this.inventoryService.getLowStockProducts(threshold ? +threshold : undefined);
    return new ApiResponse<LowStockProductDto[]>(products);
  }

  @Get('low-stock/variations')
  @Role(Roles.ADMIN, Roles.VENDOR)
  @ApiOperation({ summary: 'Get low stock variations', description: 'Get product variations that are low on stock' })
  @ApiQuery({ name: 'threshold', type: Number, required: false, description: 'Custom low stock threshold' })
  @SwaggerResponse({
    status: HttpStatus.OK,
    description: 'Low stock variations retrieved',
    schema: ApiCustomResponse([LowStockVariationDto])
  })
  async getLowStockVariations(
    @Query('threshold') threshold?: number
  ): Promise<ApiResponse<LowStockVariationDto[]>> {
    const variations = await this.inventoryService.getLowStockVariations(threshold ? +threshold : undefined);
    return new ApiResponse<LowStockVariationDto[]>(variations);
  }
}
