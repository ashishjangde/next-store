import { Controller, Get, Post, Body, Patch, Param, Delete, Query, HttpStatus, Res, HttpCode, ParseUUIDPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse as SwaggerResponse, ApiQuery, ApiExtraModels } from '@nestjs/swagger';
import { AttributeService } from './attribute.service';
import { AttributeCreateDto } from './dto/attribute-create.dto';
import { AttributeResponseDto } from './dto/attribute-response.dto';
import { AttributeValueCreateDto } from './dto/attribute-value-create.dto';
import { AttributeValueResponseDto } from './dto/attribute-value-response.dto';
import ApiResponse from 'src/common/responses/ApiResponse';
import { ApiCustomResponse } from 'src/common/responses/ApiResponse';
import { ApiCustomErrorResponse } from 'src/common/responses/ApiError';
import { Public } from 'src/common/decorators/public-decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Role } from 'src/common/decorators/roles-decorator';
import { Roles } from '@prisma/client';

@Controller('attributes')
@ApiTags('Attributes')
@ApiExtraModels(AttributeResponseDto, AttributeValueResponseDto)
export class AttributeController {
  constructor(private readonly attributeService: AttributeService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Role(Roles.ADMIN)
  @Post()
  @ApiOperation({
    summary: "Create a new attribute (Admin only)",
    description: "Create a new attribute for products"
  })
  @SwaggerResponse({
    status: HttpStatus.CREATED,
    description: 'Attribute successfully created',
    schema: ApiCustomResponse(AttributeResponseDto)
  })
  @SwaggerResponse({
    status: HttpStatus.CONFLICT,
    description: 'Attribute with this name already exists',
    schema: ApiCustomErrorResponse(HttpStatus.CONFLICT, 'Attribute with this name already exists')
  })
  async createAttribute(@Body() createDto: AttributeCreateDto): Promise<ApiResponse<AttributeResponseDto>> {
    const attribute = await this.attributeService.createAttribute(createDto);
    return new ApiResponse<AttributeResponseDto>(attribute);
  }

  @Public()
  @Get()
  @ApiOperation({
    summary: "Get all attributes",
    description: "Retrieve all attributes with pagination"
  })
  @ApiQuery({ name: 'page', type: Number, required: false, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', type: Number, required: false, description: 'Items per page (default: 10)' })
  @SwaggerResponse({
    status: HttpStatus.OK,
    description: 'Attributes found',
    schema: ApiCustomResponse({ data: [AttributeResponseDto], total: 0, page: 1, limit: 10 })
  })
  async getAllAttributes(
    @Query('page') page?: number,
    @Query('limit') limit?: number
  ): Promise<ApiResponse<{ data: AttributeResponseDto[], total: number, page: number, limit: number }>> {
    const result = await this.attributeService.getAllAttributes(
      page ? +page : 1,
      limit ? +limit : 10
    );
    
    return new ApiResponse(result);
  }

  @Public()
  @Get(':id')
  @ApiOperation({
    summary: "Get attribute by ID",
    description: "Retrieve an attribute by its ID with optional values"
  })
  @ApiQuery({
    name: 'includeValues',
    type: Boolean,
    required: false,
    description: 'Whether to include attribute values'
  })
  @SwaggerResponse({
    status: HttpStatus.OK,
    description: 'Attribute found',
    schema: ApiCustomResponse(AttributeResponseDto)
  })
  @SwaggerResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Attribute not found',
    schema: ApiCustomErrorResponse(HttpStatus.NOT_FOUND, 'Attribute not found')
  })
  async getAttribute(
    @Param('id') id: string,
    @Query('includeValues') includeValues?: string
  ): Promise<ApiResponse<AttributeResponseDto>> {
    const includeValuesBool = includeValues !== 'false'; // Include values by default
    const attribute = await this.attributeService.getAttribute(id, includeValuesBool);
    
    return new ApiResponse<AttributeResponseDto>(attribute);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Role(Roles.ADMIN)
  @Post(':attributeId/values')
  @ApiOperation({
    summary: "Add attribute value (Admin only)",
    description: "Add a new value to an existing attribute"
  })
  @SwaggerResponse({
    status: HttpStatus.CREATED,
    description: 'Attribute value successfully added',
    schema: ApiCustomResponse(AttributeValueResponseDto)
  })
  @SwaggerResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Attribute not found',
    schema: ApiCustomErrorResponse(HttpStatus.NOT_FOUND, 'Attribute not found')
  })
  @SwaggerResponse({
    status: HttpStatus.CONFLICT,
    description: 'Value already exists for this attribute',
    schema: ApiCustomErrorResponse(HttpStatus.CONFLICT, 'Value already exists for this attribute')
  })
  async addAttributeValue(
    @Param('attributeId') attributeId: string,
    @Body() createDto: AttributeValueCreateDto
  ): Promise<ApiResponse<AttributeValueResponseDto>> {
    const attributeValue = await this.attributeService.addAttributeValue(attributeId, createDto);
    return new ApiResponse<AttributeValueResponseDto>(attributeValue);
  }

  @Public()
  @Get(':attributeId/values')
  @ApiOperation({
    summary: "Get attribute values",
    description: "Retrieve all values for a specific attribute"
  })
  @SwaggerResponse({
    status: HttpStatus.OK,
    description: 'Attribute values found',
    schema: ApiCustomResponse([AttributeValueResponseDto])
  })
  @SwaggerResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Attribute not found',
    schema: ApiCustomErrorResponse(HttpStatus.NOT_FOUND, 'Attribute not found')
  })
  async getAttributeValues(
    @Param('attributeId') attributeId: string
  ): Promise<ApiResponse<AttributeValueResponseDto[]>> {
    const values = await this.attributeService.getAttributeValues(attributeId);
    return new ApiResponse<AttributeValueResponseDto[]>(values);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Role(Roles.ADMIN)
  @Delete('values/:id')
  @ApiOperation({
    summary: "Delete attribute value (Admin only)",
    description: "Delete a value from an attribute"
  })
  @SwaggerResponse({
    status: HttpStatus.OK,
    description: 'Attribute value successfully deleted',
    schema: ApiCustomResponse({ success: true })
  })
  @SwaggerResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Attribute value not found',
    schema: ApiCustomErrorResponse(HttpStatus.NOT_FOUND, 'Attribute value not found')
  })
  async deleteAttributeValue(
    @Param('id') id: string
  ): Promise<ApiResponse<{ success: boolean }>> {
    const result = await this.attributeService.deleteAttributeValue(id);
    return new ApiResponse<{ success: boolean }>(result);
  }
}
