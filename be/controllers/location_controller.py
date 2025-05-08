from flask import Blueprint, jsonify
from models.image import Image
from mongoengine.queryset.visitor import Q

location_bp = Blueprint('location', __name__)

@location_bp.route('/api/locations', methods=['GET'])
def get_locations():
    try:
        # Lấy tất cả địa điểm duy nhất từ cơ sở dữ liệu
        locations = Image.objects.distinct('location')
        
        # Lọc bỏ các giá trị None hoặc rỗng
        locations = [loc for loc in locations if loc]
        
        # Tạo danh sách địa điểm với ID và tên
        location_list = [
            {
                'id': str(i),
                'name': location
            }
            for i, location in enumerate(locations)
        ]
        
        return jsonify({
            'locations': location_list
        })
        
    except Exception as e:
        return jsonify({
            'error': str(e)
        }), 500

@location_bp.route('/api/images/location/<location_id>', methods=['GET'])
def get_images_by_location(location_id):
    try:
        # Lấy danh sách địa điểm
        locations = Image.objects.distinct('location')
        locations = [loc for loc in locations if loc]
        
        if not locations or int(location_id) >= len(locations):
            return jsonify({
                'error': 'Không tìm thấy địa điểm'
            }), 404
            
        selected_location = locations[int(location_id)]
        
        # Lấy tất cả ảnh có địa điểm tương ứng
        images = Image.objects(location=selected_location)
        
        # Chuyển đổi kết quả thành danh sách
        image_list = [
            {
                'id': str(img.id),
                'url': img.url,
                'caption': img.caption,
                'location': img.location,
                'created_at': img.created_at.isoformat()
            }
            for img in images
        ]
        
        return jsonify({
            'images': image_list
        })
        
    except Exception as e:
        return jsonify({
            'error': str(e)
        }), 500 