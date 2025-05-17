import { Controller, Get, Post, Body, Param, Delete, Put, Query, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags, ApiExtraModels } from '@nestjs/swagger';
import { InventoryService } from './inventory.service';
import { CreateInventoryDto } from './dto/create-inventory.dto';
import { UpdateInventoryDto } from './dto/update-inventory.dto';
import { InventoryResponseDto } from './dto/inventory-response.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Role } from 'src/common/decorators/roles-decorator';
import { Roles } from '@prisma/client';
import { ApiCustomResponse } from 'src/common/responses/ApiResponse';
import { ApiCustomErrorResponse } from 'src/common/responses/ApiError';
import CustomApiResponse from 'src/common/responses/ApiResponse';

@ApiTags('Inventory')
@Controller('inventory')
@ApiExtraModels(InventoryResponseDto)
@UseGuards(JwtAuthGuard, RolesGuard)
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Post()
  @Role(Roles.ADMIN, Roles.VENDOR)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create inventory for a product',
    description: 'Admin and vendor only endpoint to create inventory for a product'
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Inventory created successfully',
    schema: ApiCustomResponse(InventoryResponseDto)
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Inventory for this product already exists',
    schema: ApiCustomErrorResponse(HttpStatus.CONFLICT, 'Inventory for this product already exists')
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data',
    schema: ApiCustomErrorResponse(HttpStatus.BAD_REQUEST, 'Invalid input data')
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized',
    schema: ApiCustomErrorResponse(HttpStatus.UNAUTHORIZED, 'Unauthorized')
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Forbidden - Admin or vendor access required',
    schema: ApiCustomErrorResponse(HttpStatus.FORBIDDEN, 'Forbidden - Admin or vendor access required')
  })
  async create(@Body() createInventoryDto: CreateInventoryDto) {
    const inventory = await this.inventoryService.createInventory(createInventoryDto);
    return new CustomApiResponse(inventory);
  }

  @Get()
  @Role(Roles.ADMIN, Roles.VENDOR)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get all inventory',
    description: 'Admin and vendor only endpoint to get all inventory'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Inventory retrieved successfully',
    schema: ApiCustomResponse([InventoryResponseDto])
  })
  async findAll() {
    const inventory = await this.inventoryService.findAll();
    return new CustomApiResponse(inventory);
  }

  @Get('low-stock')
  @Role(Roles.ADMIN, Roles.VENDOR)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get low stock inventory',
    description: 'Admin and vendor only endpoint to get inventory items with low stock'
  })
  @ApiQuery({
    name: 'threshold',
    required: false,
    type: Number,
    description: 'Low stock threshold (default: 10)'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Low stock inventory retrieved successfully',
    schema: ApiCustomResponse([InventoryResponseDto])
  })
  async findLowStock(@Query('threshold') threshold: number) {
    const thresholdValue = threshold ? Number(threshold) : 10;
    const inventory = await this.inventoryService.findLowStock(thresholdValue);
    return new CustomApiResponse(inventory);
  }

  @Get('product/:productId')
  @Role(Roles.ADMIN, Roles.VENDOR)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get inventory by product ID',
    description: 'Admin and vendor only endpoint to get inventory for a specific product'
  })
  @ApiParam({
    name: 'productId',
    description: 'Product ID',
    type: String
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Inventory retrieved successfully',
    schema: ApiCustomResponse(InventoryResponseDto)
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Inventory not found for this product',
    schema: ApiCustomErrorResponse(HttpStatus.NOT_FOUND, 'Inventory not found for this product')
  })
  async findByProductId(@Param('productId') productId: string) {
    const inventory = await this.inventoryService.findByProductId(productId);
    return new CustomApiResponse(inventory);
  }

  @Put('product/:productId')
  @Role(Roles.ADMIN, Roles.VENDOR)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update inventory by product ID',
    description: 'Admin and vendor only endpoint to update inventory for a specific product'
  })
  @ApiParam({
    name: 'productId',
    description: 'Product ID',
    type: String
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Inventory updated successfully',
    schema: ApiCustomResponse(InventoryResponseDto)
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Inventory not found for this product',
    schema: ApiCustomErrorResponse(HttpStatus.NOT_FOUND, 'Inventory not found for this product')
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data',
    schema: ApiCustomErrorResponse(HttpStatus.BAD_REQUEST, 'Invalid input data')
  })
  async update(
    @Param('productId') productId: string,
    @Body() updateInventoryDto: UpdateInventoryDto
  ) {
    const inventory = await this.inventoryService.update(productId, updateInventoryDto);
    return new CustomApiResponse(inventory);
  }

  @Delete('product/:productId')
  @Role(Roles.ADMIN)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete inventory by product ID',
    description: 'Admin only endpoint to delete inventory for a specific product'
  })
  @ApiParam({
    name: 'productId',
    description: 'Product ID',
    type: String
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Inventory deleted successfully',
    schema: ApiCustomResponse({ message: 'Inventory deleted successfully' })
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Inventory not found for this product',
    schema: ApiCustomErrorResponse(HttpStatus.NOT_FOUND, 'Inventory not found for this product')
  })
  async remove(@Param('productId') productId: string) {
    await this.inventoryService.remove(productId);
    return new CustomApiResponse({ message: 'Inventory deleted successfully' });
  }
}
