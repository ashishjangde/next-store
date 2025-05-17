import axios from "axios";
import { axiosInstance } from "@/hooks/custom-axios-interceptor";

export interface Session {
  id: string;
  user_id: string;
  created_at: string;
  expired_at: string;
  ip_address: string;
  user_agent: string;
  is_current: boolean;
}

interface SessionsResponse {
  sessions: Session[];
}

export const SessionActions = {
  getSessions: async (cookies?: string): Promise<ApiResponse<SessionsResponse>> => {
    const response = await axiosInstance.get<ApiResponse<SessionsResponse>>("/sessions", {
      headers: cookies ? { Cookie: cookies } : {}, 
    });
    return response.data;
  },

  deleteSession: async (sessionId: string, cookies?: string): Promise<ApiResponse<{ message: string }>> => {
    const response = await axios.delete<ApiResponse<{ message: string }>>(`/sessions/${sessionId}`, {
      headers: cookies ? { Cookie: cookies } : {},
    });
    return response.data;
  },

  deleteAllSessions: async (cookies?: string): Promise<ApiResponse<{ message: string }>> => {
    const response = await axiosInstance.delete<ApiResponse<{ message: string }>>("/sessions", {
      headers: cookies ? { Cookie: cookies } : {},
    });
    return response.data;
  }
};
