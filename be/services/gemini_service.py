import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

# Cấu hình Gemini API
genai.configure(api_key=os.getenv('GEMINI_API_KEY'))

def generate_group_caption(descriptions, location):
    """
    Tạo mô tả nhóm từ nhiều mô tả ảnh và địa điểm
    
    Args:
        descriptions (list): Danh sách các mô tả ảnh
        location (str): Địa điểm chung của nhóm ảnh
    
    Returns:
        str: Mô tả nhóm được tạo bởi Gemini
    """
    try:
        # Tạo prompt cho Gemini
        prompt = f"""Kết hợp các mô tả sau đây thành một câu mô tả tự nhiên và mạch lạc:
        {', '.join(descriptions)}
        Địa điểm: {location}
        Format kết quả: "Đây là [mô tả tổng hợp] tại [địa điểm]"
        """
        
        # Gọi Gemini API
        model = genai.GenerativeModel('gemini-2.0-flash')
        response = model.generate_content(prompt)
        
        return response.text
    except Exception as e:
        print(f"Lỗi khi tạo mô tả nhóm: {str(e)}")
        return None 