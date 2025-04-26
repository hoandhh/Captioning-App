# controllers/image_caption_controller.py
from flask import request, jsonify
from services.image_service import ImageService
from services.image_caption_service import ImageCaptionService
from flask_jwt_extended import jwt_required, get_jwt_identity

@jwt_required()
def upload_with_caption():
    """
    API để tải lên ảnh và tự động tạo caption
    - Lưu ảnh vào MongoDB
    - Tạo caption tự động và lưu vào trường description
    """
    try:
        user_id = get_jwt_identity()
        
        # Kiểm tra xem có file được gửi lên không
        if 'image' not in request.files:
            return jsonify({"error": "Không tìm thấy file ảnh trong request"}), 400
            
        image_file = request.files['image']
        
        # Kiểm tra tên file
        if image_file.filename == '':
            return jsonify({"error": "Không có file nào được chọn"}), 400
        
        # Kiểm tra định dạng file
        if not allowed_file(image_file.filename):
            return jsonify({"error": "Định dạng file không được hỗ trợ"}), 400
        
        # 1. Upload ảnh vào MongoDB (không có mô tả ban đầu)
        image = ImageService.upload_image(
            file=image_file,
            description="",  # Mô tả trống, sẽ được cập nhật sau
            user_id=user_id
        )
        
        # 2. Tạo caption từ dữ liệu nhị phân
        caption = ImageCaptionService.generate_caption_from_binary(image.image_data, speak=True)
        
        # 3. Cập nhật mô tả của ảnh với caption vừa tạo
        ImageService.update_image(str(image.id), user_id, caption)
        
        # 4. Trả về kết quả
        return jsonify({
            "success": True,
            "id": str(image.id),
            "description": caption
        }), 200
        
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
        
    except Exception as e:
        print(f"Lỗi không mong đợi: {e}")
        return jsonify({"error": "Lỗi máy chủ nội bộ"}), 500

@jwt_required()
def update_caption(image_id):
    """
    API để cập nhật caption cho ảnh đã tải lên
    Người dùng có thể cập nhật caption (description) theo ý muốn
    """
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        if not data or 'description' not in data:
            return jsonify({"error": "Thiếu mô tả mới"}), 400
            
        # Cập nhật mô tả mới
        updated = ImageService.update_image(image_id, user_id, data['description'])
        
        if not updated:
            return jsonify({"error": "Không thể cập nhật mô tả hoặc không có quyền"}), 403
            
        # Lấy thông tin ảnh đã cập nhật
        image = ImageService.get_image_by_id(image_id)
        
        # Trả về kết quả
        return jsonify({
            "success": True,
            "image": {
                "id": str(image.id),
                "description": image.description,
                "url": f"/api/images/file/{str(image.id)}",
                "created_at": image.created_at.isoformat() if hasattr(image, 'created_at') else None
            }
        }), 200
        
    except Exception as e:
        print(f"Lỗi không mong đợi: {e}")
        return jsonify({"error": "Lỗi máy chủ nội bộ"}), 500

@jwt_required()
def regenerate_caption(image_id):
    """
    API để tạo lại caption cho ảnh đã tải lên
    Sử dụng mô hình để tạo lại caption và cập nhật vào trường description
    """
    try:
        user_id = get_jwt_identity()
        
        # Lấy thông tin ảnh
        image = ImageService.get_image_by_id(image_id)
        
        if not image:
            return jsonify({"error": "Không tìm thấy ảnh"}), 404
            
        # Kiểm tra quyền
        if str(image.uploaded_by.id) != user_id and not hasattr(image.uploaded_by, 'role') or image.uploaded_by.role != 'admin':
            return jsonify({"error": "Không có quyền truy cập ảnh này"}), 403
            
        # Tạo caption mới từ dữ liệu nhị phân trong MongoDB
        caption = ImageCaptionService.generate_caption_from_binary(image.image_data)
        
        # Cập nhật mô tả với caption mới
        ImageService.update_image(image_id, user_id, caption)
        
        # Trả về kết quả
        return jsonify({
            "success": True,
            "image": {
                "id": str(image.id),
                "description": caption,
                "url": f"/api/images/file/{str(image.id)}",
                "created_at": image.created_at.isoformat() if hasattr(image, 'created_at') else None
            }
        }), 200
        
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
        
    except Exception as e:
        print(f"Lỗi không mong đợi: {e}")
        return jsonify({"error": "Lỗi máy chủ nội bộ"}), 500

def allowed_file(filename):
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS