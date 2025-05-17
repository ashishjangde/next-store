import { Injectable, HttpStatus, Logger } from '@nestjs/common';
import { CreateVendorDto } from './dto/create-vendor.dto';
import { UpdateVendorDto } from './dto/update-vendor.dto';
import { Roles, VendorStatus, Vendor } from '@prisma/client';
import { VendorRepositories } from 'src/repositories/vendor-repositories';
import { UserRepositories } from 'src/repositories/user-repositories';
import ApiError from 'src/common/responses/ApiError';

@Injectable()
export class VendorService {
  private readonly logger = new Logger(VendorService.name);

  constructor(
    private vendorRepositories: VendorRepositories,
    private userRepositories: UserRepositories
  ) {}  
  
  async createVendor(createVendorDto: CreateVendorDto, userId: string): Promise<Vendor> {
    // Check if user already has a vendor profile
    const existingVendor = await this.vendorRepositories.findVendorByUserId(userId);

    if (existingVendor) {
      throw new ApiError(HttpStatus.CONFLICT, 'User already has a vendor profile');
    }

    // Check if GST or PAN number already exists
    const isGstTaken = await this.vendorRepositories.isGSTNumberTaken(createVendorDto.gst_number);

    if (isGstTaken) {
      throw new ApiError(HttpStatus.CONFLICT, 'GST number already exists');
    }

    const isPanTaken = await this.vendorRepositories.isPANNumberTaken(createVendorDto.pan_number);

    if (isPanTaken) {
      throw new ApiError(HttpStatus.CONFLICT, 'PAN number already exists');
    }

    // Create the vendor with PENDING status
    // Admin approval is required to become a vendor
    const vendor = await this.vendorRepositories.createVendor({
      ...createVendorDto,
      user_id: userId,
    });

    if (!vendor) {
      throw new ApiError(HttpStatus.BAD_REQUEST, 'Failed to create vendor application');
    }

    // No role is assigned at this point - roles are assigned when vendor is approved

    return vendor;
  }
  
  async getAllVendors(options?: { 
    page?: number; 
    limit?: number; 
    status?: VendorStatus;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<{
     vendors: Vendor[];
     total: number; 
     page: number; 
     limit: number; 
     totalPages: number; 
     approvedCount: number;
     pendingCount: number;
     rejectedCount: number;
     suspendedCount: number;
    }> {
    // Default values and pagination calculation
    const page = options?.page || 1;
    const limit = options?.limit || 10;
    const skip = (page - 1) * limit;
    
    const result = await this.vendorRepositories.findAllVendors({
      skip,
      take: limit,
      status: options?.status,
      search: options?.search,
      includeUser: true,
      sortBy: options?.sortBy,
      sortOrder: options?.sortOrder
    });

    if (!result) {
      throw new ApiError(HttpStatus.BAD_REQUEST, 'Failed to retrieve vendors');
    }
      // Calculate total pages for pagination
    const totalPages = Math.ceil(result.total / limit);
    
    // Get counts of vendors by status
    const statusCounts = await this.getVendorStatusCounts();
  
    
    return {
      ...result,
      page,
      limit,
      totalPages,
      approvedCount: statusCounts.APPROVED,
      pendingCount: statusCounts.PENDING,
      rejectedCount: statusCounts.REJECTED,
      suspendedCount: statusCounts.SUSPENDED
    };
  }

  async getVendorById(id: string): Promise<Vendor> {
    const vendor = await this.vendorRepositories.findVendorById(id);

    if (!vendor) {
      throw new ApiError(HttpStatus.NOT_FOUND, `Vendor with id ${id} not found`);
    }

    return vendor;
  }

  async getVendorByUserId(userId: string): Promise<Vendor> {
    const vendor = await this.vendorRepositories.findVendorByUserId(userId);

    if (!vendor) {
      throw new ApiError(HttpStatus.NOT_FOUND, `Vendor profile not found for this user`);
    }

    return vendor;
  }
  async updateVendor(id: string, updateVendorDto: UpdateVendorDto): Promise<Vendor> {
    const existingVendor = await this.vendorRepositories.findVendorById(id);

    if (!existingVendor) {
      throw new ApiError(HttpStatus.NOT_FOUND, `Vendor with id ${id} not found`);
    }    // GST and PAN numbers cannot be updated via UpdateVendorDto
    // They are immutable identifiers for a vendor account

    const updatedVendor = await this.vendorRepositories.updateVendor(id, updateVendorDto);
    
    if (!updatedVendor) {
      throw new ApiError(HttpStatus.BAD_REQUEST, 'Failed to update vendor');
    }
    
    return updatedVendor;
  }  async updateVendorStatus(id: string, status: VendorStatus): Promise<Vendor> {
    const existingVendor = await this.vendorRepositories.findVendorById(id);

    if (!existingVendor) {
      throw new ApiError(HttpStatus.NOT_FOUND, `Vendor with id ${id} not found`);
    }

    const updatedVendor = await this.vendorRepositories.updateVendorStatus(id, status);
    
    if (!updatedVendor) {
      throw new ApiError(HttpStatus.BAD_REQUEST, 'Failed to update vendor status');
    }
    
    // If status is changed to APPROVED, assign VENDOR role to user
    if (status === VendorStatus.APPROVED) {
      const user = await this.userRepositories.findUserById(existingVendor.user_id);
      
      if (user) {
        // Check if user already has VENDOR role
        if (!user.roles.includes(Roles.VENDOR)) {
          // Add VENDOR role
          const userData = { roles: { push: Roles.VENDOR } };
          const updatedUser = await this.userRepositories.updateUser(existingVendor.user_id, userData);
          
          if (!updatedUser) {
            this.logger.error(`Failed to update user roles for userId: ${existingVendor.user_id}`);
          } else {
            this.logger.log(`Assigned VENDOR role to user ${existingVendor.user_id}`);
          }
        }
      }
    }
    // If status is changed to REJECTED or SUSPENDED, remove VENDOR role
    else if (status === VendorStatus.REJECTED || status === VendorStatus.SUSPENDED) {
      const user = await this.userRepositories.findUserById(existingVendor.user_id);
      
      if (user && user.roles.includes(Roles.VENDOR)) {
        // Remove VENDOR role
        const updatedRoles = user.roles.filter(role => role !== Roles.VENDOR);
        await this.userRepositories.updateUser(existingVendor.user_id, { roles: { set: updatedRoles } });
        this.logger.log(`Removed VENDOR role from user ${existingVendor.user_id}`);
      }
    }
    
    return updatedVendor;
  }
  async deleteVendor(id: string): Promise<void> {
    const vendor = await this.vendorRepositories.findVendorById(id);

    if (!vendor) {
      throw new ApiError(HttpStatus.NOT_FOUND, `Vendor with id ${id} not found`);
    }

    // First remove VENDOR role from user
    const user = await this.userRepositories.findUserById(vendor.user_id);
    
    if (user) {
      const updatedRoles = user.roles.filter(role => role !== Roles.VENDOR);
      await this.userRepositories.updateUser(vendor.user_id, { roles: { set: updatedRoles } });
    }

    // Then delete vendor
    const deletedVendor = await this.vendorRepositories.deleteVendor(id);
    
    if (!deletedVendor) {
      throw new ApiError(HttpStatus.BAD_REQUEST, 'Failed to delete vendor');
    }
  }

  async getVendorStatusCounts(): Promise<Record<VendorStatus, number>> {
    try {
      // Get counts directly from the vendor repository
      const approvedCount = await this.vendorRepositories.countVendorsByStatus(VendorStatus.APPROVED);
      const pendingCount = await this.vendorRepositories.countVendorsByStatus(VendorStatus.PENDING);
      const rejectedCount = await this.vendorRepositories.countVendorsByStatus(VendorStatus.REJECTED);
      const suspendedCount = await this.vendorRepositories.countVendorsByStatus(VendorStatus.SUSPENDED);

      return {
        [VendorStatus.APPROVED]: approvedCount,
        [VendorStatus.PENDING]: pendingCount,
        [VendorStatus.REJECTED]: rejectedCount,
        [VendorStatus.SUSPENDED]: suspendedCount
      };
    } catch (error) {
      this.logger.error(`Error getting vendor status counts: ${error.message}`, error);
      // Return default values in case of error
      return {
        [VendorStatus.APPROVED]: 0,
        [VendorStatus.PENDING]: 0,
        [VendorStatus.REJECTED]: 0,
        [VendorStatus.SUSPENDED]: 0
      };
    }
  }
}
