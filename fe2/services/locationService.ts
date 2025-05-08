import { API_URL } from '../constants/config';

export interface Location {
  id: string;
  name: string;
}

export const getLocations = async (): Promise<Location[]> => {
  try {
    const response = await fetch(`${API_URL}/api/locations`);
    
    if (!response.ok) {
      throw new Error('Không thể lấy danh sách địa điểm');
    }

    const data = await response.json();
    return data.locations;
  } catch (error) {
    console.error('Lỗi khi lấy danh sách địa điểm:', error);
    throw error;
  }
}; 