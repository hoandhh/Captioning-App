// constants/Environment.ts
// Centralized environment configuration for the application

// Base host configuration
export const API_HOST = '192.168.0.104';
export const API_PORT = '5000';
export const API_PROTOCOL = 'http';

// Derived URLs
export const BASE_URL = `${API_PROTOCOL}://${API_HOST}:${API_PORT}`;
export const API_BASE_URL = `${BASE_URL}/api`;

// API Endpoints
export const API_ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    LOGIN: `${API_BASE_URL}/auth/login`,
    REGISTER: `${API_BASE_URL}/auth/register`,
    CHANGE_PASSWORD: `${API_BASE_URL}/auth/change-password`,
    FORGOT_PASSWORD: `${API_BASE_URL}/auth/forgot-password`,
    RESET_PASSWORD: `${API_BASE_URL}/auth/reset-password`,
  },
  
  // User endpoints
  USER: {
    PROFILE: `${API_BASE_URL}/users/profile`,
    GET_BY_ID: (id: string) => `${API_BASE_URL}/users/${id}`,
    SEARCH: `${API_BASE_URL}/users/search`,
  },
  
  // Image endpoints
  IMAGE: {
    UPLOAD: `${API_BASE_URL}/image-caption/upload`,
    UPDATE_CAPTION: (id: string) => `${API_BASE_URL}/image-caption/caption/${id}`,
    REGENERATE: (id: string) => `${API_BASE_URL}/image-caption/${id}/regenerate`,
    USER_IMAGES: `${API_BASE_URL}/images/my-images`,
    ALL_IMAGES: `${API_BASE_URL}/images`,
    GET_FILE: (id: string) => `${API_BASE_URL}/images/file/${id}`,
    DELETE: (id: string) => `${API_BASE_URL}/images/${id}`,
    REPORT: (id: string) => `${API_BASE_URL}/images/${id}/report`,
  },
  
  // Admin endpoints
  ADMIN: {
    USERS: `${API_BASE_URL}/admin/users`,
    UPDATE_USER: (id: string) => `${API_BASE_URL}/admin/users/${id}`,
    DELETE_USER: (id: string) => `${API_BASE_URL}/admin/users/${id}`,
    CHANGE_STATUS: (id: string) => `${API_BASE_URL}/admin/users/change-status/${id}`,
    CHANGE_ROLE: (id: string) => `${API_BASE_URL}/admin/users/change-role/${id}`,
    IMAGES: `${API_BASE_URL}/admin/images`,
    DELETE_IMAGE: (id: string) => `${API_BASE_URL}/admin/images/${id}`,
    REPORTS: `${API_BASE_URL}/admin/reports`,
    UPDATE_REPORT: (id: string) => `${API_BASE_URL}/admin/reports/${id}`,
    STATS: `${API_BASE_URL}/admin/stats`,
  },
};

// Helper functions
export const getImageUrl = (imageId: string): string => {
  return API_ENDPOINTS.IMAGE.GET_FILE(imageId);
};
