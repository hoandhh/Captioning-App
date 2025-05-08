import { API_URL } from '../constants/config';

export interface GroupCaptionResponse {
  group_caption: string;
  location: string;
}

export const createGroupCaption = async (imageIds: string[]): Promise<GroupCaptionResponse> => {
  try {
    const response = await fetch(`${API_URL}/api/group-caption`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ image_ids: imageIds }),
    });

    if (!response.ok) {
      throw new Error('Không thể tạo mô tả nhóm');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Lỗi khi tạo mô tả nhóm:', error);
    throw error;
  }
}; 