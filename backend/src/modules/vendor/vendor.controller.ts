import { Controller, Post, Get, Put, Delete, Body, Param, UseGuards, Req, Res, HttpStatus, HttpCode, Query } from '@nestjs/common';
import { VendorService } from './vendor.service';
import { CreateVendorDto } from './dto/create-vendor.dto';
import { UpdateVendorDto } from './dto/update-vendor.dto';
import { UpdateVendorStatusDto } from './dto/update-vendor-status.dto';
import { VendorResponseDto } from './dto/vendor-response.dto';
import { VendorRequestResponseDto } from './dto/vendor-request-response.dto';
import { QueryVendorDto } from './dto/query-vendor.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Role } from '../../common/decorators/roles-decorator';
import { Roles, VendorStatus } from '@prisma/client';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiExtraModels } from '@nestjs/swagger';
import { Response } from 'express';
import ApiResponseClass from 'src/common/responses/ApiResponse';
import { ApiCustomResponse } from 'src/common/responses/ApiResponse';
import { ApiCustomErrorResponse } from 'src/common/responses/ApiError';
import ApiError from 'src/common/responses/ApiError';

@ApiTags('Vendors')
@Controller('vendor')
@ApiExtraModels(VendorResponseDto, VendorRequestResponseDto)
export class VendorController {
  constructor(private readonly vendorService: VendorService) {}  

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Submit application to become a vendor',
    description: 'Create a vendor application that will require admin approval'
  })
  @ApiResponse({
    status: HttpStatus.CREATED, 
    description: 'Vendor application submitted successfully',
    schema: ApiCustomResponse(VendorRequestResponseDto)
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data',
    schema: ApiCustomErrorResponse(HttpStatus.BAD_REQUEST, 'Invalid input data')
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Vendor profile already exists or duplicate GST/PAN number',
    schema: ApiCustomErrorResponse(HttpStatus.CONFLICT, 'Vendor already exists')
  })
  async createVendor(
    @Body() createVendorDto: CreateVendorDto, 
    @Req() req,
    @Res() res: Response
  ) {
      const vendor = await this.vendorService.createVendor(createVendorDto, req.user.id);
      const responseData = {
        ...vendor,
        message: 'Your vendor application has been submitted and is pending admin approval'
      };
      
      return res.status(HttpStatus.CREATED).json(
        new ApiResponseClass(responseData)
      );
    
  }    

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Role(Roles.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Get all vendors with filtering and pagination (Admin only)',
    description: 'Retrieve a paginated list of all vendor applications with options to filter by status and sort results'
  })
  @ApiResponse({
    status: HttpStatus.OK, 
    description: 'List of all vendors with pagination data',
    schema: ApiCustomResponse({
      vendors: [VendorResponseDto],
      total: 0,
      page: 1,
      limit: 10,
      totalPages: 1,
      approvedCount: 0,
      pendingCount: 0,
      rejectedCount: 0,
      suspendedCount: 0
    })
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized',
    schema: ApiCustomErrorResponse(HttpStatus.UNAUTHORIZED, 'Unauthorized')
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Forbidden - Admin access required',
    schema: ApiCustomErrorResponse(HttpStatus.FORBIDDEN, 'Admin access required')
  })
  async getAllVendors(
    @Query() queryVendorDto: QueryVendorDto,
    @Req() req, 
    @Res() res: Response
  ) {
    const result = await this.vendorService.getAllVendors(queryVendorDto);
    
    return res.status(HttpStatus.OK).json(
      new ApiResponseClass(result)
    );
  }


  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Get current vendor profile',
    description: 'Retrieve the vendor profile for the currently logged in user'
  })
  @ApiResponse({
    status: HttpStatus.OK, 
    description: 'Vendor profile retrieved successfully',
    schema: ApiCustomResponse(VendorRequestResponseDto)
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Vendor profile not found',
    schema: ApiCustomErrorResponse(HttpStatus.NOT_FOUND, 'Vendor profile not found')
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized',
    schema: ApiCustomErrorResponse(HttpStatus.UNAUTHORIZED, 'Unauthorized')
  })
  async getVendorProfile(@Req() req, @Res() res: Response) {
      const vendor = await this.vendorService.getVendorByUserId(req.user.id);
      
      let message = '';
      switch (vendor.status) {
        case VendorStatus.APPROVED:
          message = 'Your vendor account is approved and active.';
          break;
        case VendorStatus.PENDING:
          message = 'Your vendor application is pending approval from an administrator.';
          break;
        case VendorStatus.REJECTED:
          message = 'Your vendor application has been rejected. Please contact support for details.';
          break;
        case VendorStatus.SUSPENDED:
          message = 'Your vendor account has been suspended. Please contact support for details.';
          break;
        default:
          message = `Your vendor account status is: ${vendor.status}`;
      }
      
      return res.status(HttpStatus.OK).json(
        new ApiResponseClass({
          ...vendor,
          message
        })
      );
    
  }
  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Role(Roles.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Get vendor by ID (Admin only)',
    description: 'Retrieve a specific vendor by their ID'
  })
  @ApiResponse({
    status: HttpStatus.OK, 
    description: 'Vendor profile retrieved successfully',
    schema: ApiCustomResponse(VendorResponseDto)
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Vendor not found',
    schema: ApiCustomErrorResponse(HttpStatus.NOT_FOUND, 'Vendor not found')
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Forbidden - Admin access required',
    schema: ApiCustomErrorResponse(HttpStatus.FORBIDDEN, 'Admin access required')
  })
  async getVendorById(@Param('id') id: string, @Res() res: Response) {
      const vendor = await this.vendorService.getVendorById(id);
      return res.status(HttpStatus.OK).json(
        new ApiResponseClass(vendor)
      );
   
  }
  @Put('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Update current vendor profile',
    description: 'Update your own vendor profile information'
  })
  @ApiResponse({
    status: HttpStatus.OK, 
    description: 'Vendor profile updated successfully',
    schema: ApiCustomResponse(VendorResponseDto)
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Vendor profile not found',
    schema: ApiCustomErrorResponse(HttpStatus.NOT_FOUND, 'Vendor profile not found')
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data',
    schema: ApiCustomErrorResponse(HttpStatus.BAD_REQUEST, 'Invalid input data')
  })
  async updateVendorProfile(
    @Body() updateVendorDto: UpdateVendorDto, 
    @Req() req,
    @Res() res: Response
  ) {
      const vendor = await this.vendorService.getVendorByUserId(req.user.id);
      const updatedVendor = await this.vendorService.updateVendor(vendor.id, updateVendorDto);
      
      return res.status(HttpStatus.OK).json(
        new ApiResponseClass(updatedVendor)
      );
   
  
  }  @Put(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Role(Roles.ADMIN)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Approve or reject vendor application (Admin only)',
    description: 'Update vendor status and manage their role permissions'
  })
  @ApiResponse({
    status: HttpStatus.OK, 
    description: 'Vendor status updated successfully',
    schema: ApiCustomResponse(VendorRequestResponseDto)
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Vendor not found',
    schema: ApiCustomErrorResponse(HttpStatus.NOT_FOUND, 'Vendor not found')
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Forbidden - Admin access required',
    schema: ApiCustomErrorResponse(HttpStatus.FORBIDDEN, 'Admin access required')
  })
  async updateVendorStatus(
    @Param('id') id: string,
    @Body() updateVendorStatusDto: UpdateVendorStatusDto,
    @Res() res: Response
  ) {
      const vendor = await this.vendorService.updateVendorStatus(id, updateVendorStatusDto.status);
      
      let message = '';
      switch (updateVendorStatusDto.status) {
        case VendorStatus.APPROVED:
          message = 'Vendor application approved. User has been granted vendor privileges.';
          break;
        case VendorStatus.REJECTED:
          message = 'Vendor application has been rejected.';
          break;
        case VendorStatus.SUSPENDED:
          message = 'Vendor account has been suspended and vendor privileges revoked.';
          break;
        default:
          message = `Vendor status has been updated to ${updateVendorStatusDto.status}.`;
      }
      
      return res.status(HttpStatus.OK).json(
        new ApiResponseClass({
          ...vendor,
          message
        })
      );
    
  }
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Role(Roles.ADMIN)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Delete vendor (Admin only)',
    description: 'Permanently delete a vendor account and revoke vendor privileges'
  })
  @ApiResponse({
    status: HttpStatus.OK, 
    description: 'Vendor deleted successfully',
    schema: ApiCustomResponse({ message: 'Vendor deleted successfully' })
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Vendor not found',
    schema: ApiCustomErrorResponse(HttpStatus.NOT_FOUND, 'Vendor not found')
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Forbidden - Admin access required',
    schema: ApiCustomErrorResponse(HttpStatus.FORBIDDEN, 'Admin access required')
  })
  async deleteVendor(@Param('id') id: string, @Res() res: Response) {
      await this.vendorService.deleteVendor(id);
      return res.status(HttpStatus.OK).json(
        new ApiResponseClass({ message: 'Vendor deleted successfully' })
      );
  
  }
}
