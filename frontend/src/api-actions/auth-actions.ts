import { 
  CreateUserInput, 
  LoginInput, 
  VerifyUserinput,
  ForgotPassowrdInput,
  VerifiyVerificationCodeSchema,
  ResetPasswordInput
} from "@/schema/auth-schema";
import { axiosInstance } from "@/hooks/custom-axios-interceptor";
import axios from "axios";
import { BACKEND_URL } from "@/constants/constants";
export const AuthActions = {
  registerUser: async (data: CreateUserInput): Promise<ApiResponse<IUser>> => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value instanceof File || value instanceof Blob) {
        formData.append(key, value);
      } else if (key !== "confirmPassword") {
        formData.append(key, value as string);
      }
    });

    const response = await axiosInstance.post<ApiResponse<IUser>>(
      "/auth/register",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  },

  verifyUser: async (data: VerifyUserinput): Promise<ApiResponse<IUser>> => {
    const isEmail = data.identifier.includes("@");
    const loginData = {
      [isEmail ? "email" : "username"]: data.identifier,
      verification_code: data.verification_code,
    };
    const response = await axiosInstance.post<ApiResponse<IUser>>(
      "/auth/verify-user",
      loginData
    );
    return response.data;
  },

  login: async (data: LoginInput): Promise<ApiResponse<IUser>> => {
    const isEmail = data.identifier.includes("@");
    const loginData = {
      [isEmail ? "email" : "username"]: data.identifier,
      password: data.password,
    };
    const response = await axios.post<ApiResponse<IUser>>(
      `${BACKEND_URL}/auth/login`,
      loginData ,{
        withCredentials : true
      }
    );
    return response.data;
  },

  googleLogin: async () => {

    window.location.href = `${BACKEND_URL}/auth/google`;
  },

  githubLogin: async () => {
    window.location.href = `${BACKEND_URL}/auth/github`;
  },

  handleOAuthCallback: async (provider: 'google' | 'github', code: string): Promise<ApiResponse<IUser>> => {
    const response = await axios.get<ApiResponse<IUser>>(
      `${BACKEND_URL}/auth/${provider}/callback?code=${code}`,
      { withCredentials: true }
    );
    return response.data;
  },

  forgotPassword: async (data: ForgotPassowrdInput): Promise<ApiResponse<{ message: string }>> => {
    const isEmail = data.identifier.includes("@");
    const forgotData = {
      [isEmail ? "email" : "username"]: data.identifier,
    };
    const response = await axiosInstance.post<ApiResponse<{ message: string }>>(
      "/auth/forgot-password",
      forgotData
    );
    return response.data;
  },

  verifyVerificationCode: async (data: VerifiyVerificationCodeSchema): Promise<ApiResponse<{ message: string }>> => {
    const isEmail = data.identifier.includes("@");
    const verifyData = {
      [isEmail ? "email" : "username"]: data.identifier,
      verification_code: data.verification_code.toString().padStart(6, '0'),
    };
    const response = await axiosInstance.post<ApiResponse<{ message: string }>>(
      "/auth/verify-verification_code",
      verifyData
    );
    return response.data;
  },

  resetPassword: async (data: ResetPasswordInput , hash?  : string): Promise<ApiResponse<{ message: string }>> => {
    const isEmail = data.identifier.includes("@");
    const resetData = {
      [isEmail ? "email" : "username"]: data.identifier,
      verification_code: data.verification_code,
      password: data.password
    };
    const response = await axiosInstance.post<ApiResponse<{ message: string }>>(
      `/auth/reset-password/${hash}`,
      resetData
    );
    return response.data;
  },

  refreshToken: async (): Promise<ApiResponse<IUser>> => {
    const response = await axiosInstance.post<ApiResponse<IUser>>(
      "/auth/refresh-token"
    );
    return response.data;
  },

  logout: async (): Promise<
    ApiResponse<{
      message: string;
    }>
  > => {
    const response = await axiosInstance.post<
      ApiResponse<{
        message: string;
      }>
    >("/auth/logout");
    return response.data;
  },
};
