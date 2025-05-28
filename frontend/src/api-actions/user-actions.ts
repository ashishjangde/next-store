import axiosInstance from "@/hooks/custom-axios-interceptor";

export const UserActions = {
  // Get current user profile
  getUserProfile: async (
    cookies?: string
  ): Promise<ApiResponse<IUser>> => {
    const response = await axiosInstance.get<ApiResponse<IUser>>(
      "/user/profile",
      {
        headers: cookies ? { Cookie: cookies } : {},
      }
    );
    return response.data;
  },

  // Update current user profile
  updateUserProfile: async (
    userData: IUpdateProfile,
    cookies?: string
  ): Promise<ApiResponse<IUser>> => {
    const response = await axiosInstance.put<ApiResponse<IUser>>(
      "/user/profile",
      userData,
      {
        headers: cookies ? { Cookie: cookies } : {},
      }
    );
    return response.data;
  },

  // Update profile picture
  updateProfilePicture: async (
    file: File,
    cookies?: string
  ): Promise<ApiResponse<IUser>> => {
    const formData = new FormData();
    formData.append('profile_picture', file);

    const response = await axiosInstance.put<ApiResponse<IUser>>(
      "/user/profile-picture",
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          ...(cookies ? { Cookie: cookies } : {}),
        },
      }
    );
    return response.data;
  },

  // Change password
  changePassword: async (
    passwordData: IChangePassword,
    cookies?: string
  ): Promise<ApiResponse<IPasswordChangeResponse>> => {
    const response = await axiosInstance.post<ApiResponse<IPasswordChangeResponse>>(
      "/user/change-password",
      passwordData,
      {
        headers: cookies ? { Cookie: cookies } : {},
      }
    );
    return response.data;
  },

  // Delete user account
  deleteAccount: async (
    cookies?: string
  ): Promise<ApiResponse<IAccountDeleteResponse>> => {
    const response = await axiosInstance.delete<ApiResponse<IAccountDeleteResponse>>(
      "/user/account",
      {
        headers: cookies ? { Cookie: cookies } : {},
      }
    );
    return response.data;
  },
};