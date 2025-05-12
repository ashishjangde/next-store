import axios, { AxiosError, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from "axios";
import { BACKEND_URL } from "@/constants/constants";
import { useAuthStore } from "@/store/auth-store";

export const axiosInstance = axios.create({
  baseURL: BACKEND_URL,
  timeout: 10000,
  withCredentials: true, 
});

// Request interceptor
axiosInstance.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    if (!config.data || !(config.data instanceof FormData)) {
      config.headers['Content-Type'] = 'application/json';
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError<any>) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };
    
    if (error.response?.data?.apiError?.statusCode === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const response = await axios.post(
          `${BACKEND_URL}/auth/refresh-token`, 
          {}, 
          { withCredentials: true }
        );

        if (response.status === 200) {
          return axiosInstance(originalRequest);
        }
      } catch (refreshError) {
        // If refresh fails, logout the user
        try {
          await axiosInstance.post('/auth/logout');
          useAuthStore.getState().logout();
        } catch (logoutError) {
          console.log('Logout failed:', logoutError);
        }
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
