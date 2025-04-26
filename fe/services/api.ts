import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL, API_ENDPOINTS } from "../constants/Environment";

// Base URL for API requests now comes from Environment.ts
const API_URL = API_BASE_URL;

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add interceptor to add auth token to requests
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add interceptor to handle response errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error(
      "API Error:",
      error.response?.status,
      error.response?.data || error.message
    );

    // Thêm debug info
    if (error.response?.status === 404) {
      console.error(
        "404 Not Found - Endpoint không tồn tại:",
        error.config?.url
      );
    } else if (error.response?.status === 401) {
      console.error("401 Unauthorized - Token không hợp lệ hoặc đã hết hạn");
    } else if (error.response?.status === 403) {
      console.error("403 Forbidden - Không có quyền truy cập");
    } else if (error.response?.status === 500) {
      console.error("500 Server Error - Lỗi server");
    } else if (!error.response) {
      console.error(
        "Network Error - Không thể kết nối đến server, kiểm tra URL:",
        API_URL
      );
    }

    return Promise.reject(error);
  }
);

// Authentication services
export const authService = {
  login: async (credentials: {
    email?: string;
    username?: string;
    password: string;
  }) => {
    const response = await api.post("/auth/login", credentials);
    return response.data;
  },

  register: async (userData: {
    username: string;
    password: string;
    email: string;
    full_name?: string;
  }) => {
    const response = await api.post("/auth/register", userData);
    return response.data;
  },

  changePassword: async (passwordData: {
    current_password: string;
    new_password: string;
  }) => {
    const response = await api.post("/auth/change-password", passwordData);
    return response.data;
  },

  forgotPassword: async (email: string) => {
    const response = await api.post("/auth/forgot-password", { email });
    return response.data;
  },

  resetPassword: async (resetData: { token: string; new_password: string }) => {
    const response = await api.post("/auth/reset-password", resetData);
    return response.data;
  },
};

// User services
export const userService = {
  getProfile: async () => {
    const response = await api.get("/users/profile");
    return response.data;
  },

  updateProfile: async (profileData: any) => {
    const response = await api.put("/users/profile", profileData);
    return response.data;
  },

  getUserById: async (userId: string) => {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  },

  searchUsers: async (query: string) => {
    const response = await api.get("/admin/users", { params: { query } });
    return response.data;
  },

  changePassword: async (passwordData: {
    current_password: string;
    new_password: string;
  }) => {
    const response = await api.post("/auth/change-password", passwordData);
    return response.data;
  },
};

// Image services
export const imageService = {
  uploadImage: async (formData: FormData) => {
    const response = await api.post("/image-caption/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  updateCaption: async (imageId: string, description: string) => {
    const response = await api.put(`/image-caption/caption/${imageId}`, {
      description,
    });
    return response.data;
  },

  regenerateCaption: async (imageId: string) => {
    const response = await api.post(`/image-caption/${imageId}/regenerate`);
    return response.data;
  },

  getUserImages: async (page = 1, perPage = 20) => {
    const response = await api.get("/images/my-images", {
      params: { page, per_page: perPage },
    });
    return response.data;
  },

  getAllImages: async (page = 1, perPage = 20) => {
    const response = await api.get("/images", {
      params: { page, per_page: perPage },
    });
    return response.data;
  },

  deleteImage: async (imageId: string) => {
    const response = await api.delete(`/images/${imageId}`);
    return response.data;
  },

  reportImage: async (imageId: string, reason: string) => {
    const response = await api.post(`/images/${imageId}/report`, { reason });
    return response.data;
  },
  
  // Helper method to get the full image URL
  getImageUrl: (imageId: string) => {
    return API_ENDPOINTS.IMAGE.GET_FILE(imageId);
  },
};

// Admin services
export const adminService = {
  getAllUsers: async (params: any = {}) => {
    const response = await api.get("/admin/users", { params });
    return response.data;
  },

  updateUser: async (userId: string, userData: any) => {
    const response = await api.put(`/admin/users/${userId}`, userData);
    return response.data;
  },

  deleteUser: async (userId: string) => {
    const response = await api.delete(`/admin/users/${userId}`);
    return response.data;
  },

  changeUserStatus: async (userId: string, isActive: boolean) => {
    const response = await api.put(`/admin/users/change-status/${userId}`, {
      is_active: isActive,
    });
    return response.data;
  },

  changeUserRole: async (userId: string, role: string) => {
    const response = await api.put(`/admin/users/change-role/${userId}`, {
      role,
    });
    return response.data;
  },

  getAllImages: async (page = 1, perPage = 20) => {
    const response = await api.get("/admin/images", {
      params: { page, per_page: perPage },
    });
    return response.data;
  },

  adminDeleteImage: async (imageId: string) => {
    const response = await api.delete(`/admin/images/${imageId}`);
    return response.data;
  },

  getReports: async (params: any = {}) => {
    const response = await api.get("/admin/reports", { params });
    return response.data;
  },

  updateReport: async (reportId: string, status: string) => {
    const response = await api.put(`/admin/reports/${reportId}`, { status });
    return response.data;
  },

  getStats: async () => {
    const response = await api.get("/admin/stats");
    return response.data;
  },
};

export default api;
