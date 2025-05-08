from flask import Blueprint, request, jsonify
from services.gemini_service import generate_group_caption
from models.image import Image
from collections import Counter

group_caption_bp = Blueprint('group_caption', __name__)

@group_caption_bp.route('/api/group-caption', methods=['POST'])
def create_group_caption():
    try:
        data = request.get_json()
        image_ids = data.get('image_ids', [])
        
        if not image_ids or len(image_ids) < 2 or len(image_ids) > 4:
            return jsonify({
                'error': 'Vui lòng chọn từ 2 đến 4 ảnh'
            }), 400
            
        # Lấy thông tin ảnh từ database
        images = Image.objects(id__in=image_ids)
        if not images:
            return jsonify({
                'error': 'Không tìm thấy ảnh'
            }), 404
            
        # Lấy mô tả và địa điểm của các ảnh
        descriptions = [img.description for img in images if img.description]
        locations = [img.location for img in images if img.location]
        
        # Xác định địa điểm phổ biến nhất
        if locations:
            most_common_location = Counter(locations).most_common(1)[0][0]
        else:
            most_common_location = "Không xác định"
            
        # Tạo mô tả nhóm
        group_caption = generate_group_caption(descriptions, most_common_location)
        
        if not group_caption:
            return jsonify({
                'error': 'Không thể tạo mô tả nhóm'
            }), 500
            
        return jsonify({
            'group_caption': group_caption,
            'location': most_common_location
        })
        
    except Exception as e:
        return jsonify({
            'error': str(e)
        }), 500 