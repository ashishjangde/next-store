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









}
