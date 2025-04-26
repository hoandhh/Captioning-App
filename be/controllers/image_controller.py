# controllers/image_controller.py
from flask import request, jsonify, Response
from services.image_service import ImageService
from models.user import User
from models.report import Report
from flask_jwt_extended import jwt_required, get_jwt_identity
import io

@jwt_required()
def upload_image():
    user_id = get_jwt_identity()
    
    if 'file' not in request.files:
        return jsonify({'error': 'Không có phần tệp'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'Không có tệp được chọn'}), 400
    
    if file and allowed_file(file.filename):
        try:
            image = ImageService.upload_image(
                file=file,
                description=request.form.get('description', ''),
                user_id=user_id
            )
            return jsonify({
                'id': str(image.id),
                'description': image.description,
                'url': f"/api/images/file/{str(image.id)}"
            }), 201
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    
    return jsonify({'error': 'Loại tệp không được phép'}), 400

def get_image(image_id):
    """Trả về dữ liệu nhị phân của ảnh từ MongoDB"""
    return ImageService.get_image_data(image_id)

def get_all_images():
    page = int(request.args.get('page', 1))
    per_page = int(request.args.get('per_page', 20))
    
    images = ImageService.get_all_images(page, per_page)
    
    return jsonify({
        'images': [
            {
                'id': str(img.id),
                'description': img.description,
                'url': f"/api/images/file/{str(img.id)}",
                'created_at': img.created_at.isoformat() if hasattr(img, 'created_at') else None
            } for img in images.items
        ],
        'total': images.total,
        'pages': images.pages,
        'page': images.page
    }), 200

@jwt_required()
def get_user_images():
    user_id = get_jwt_identity()
    page = int(request.args.get('page', 1))
    per_page = int(request.args.get('per_page', 20))
    
    images = ImageService.get_user_images(user_id, page, per_page)
    
    return jsonify({
        'images': [
            {
                'id': str(img.id),
                'description': img.description,
                'url': f"/api/images/file/{str(img.id)}",
                'created_at': img.created_at.isoformat() if hasattr(img, 'created_at') else None
            } for img in images.items
        ],
        'total': images.total,
        'pages': images.pages,
        'page': images.page
    }), 200

@jwt_required()
def update_image_description(image_id):
    user_id = get_jwt_identity()
    data = request.get_json()
    
    if 'description' not in data:
        return jsonify({'error': 'Mô tả là bắt buộc'}), 400
    
    updated = ImageService.update_image(image_id, user_id, data['description'])
    if not updated:
        return jsonify({'error': 'Không thể cập nhật hình ảnh hoặc không được phép'}), 403
    
    return jsonify({'message': 'Cập nhật mô tả hình ảnh thành công'}), 200

@jwt_required()
def delete_image(image_id):
    user_id = get_jwt_identity()
    
    success = ImageService.delete_image(image_id, user_id)
    if not success:
        return jsonify({'error': 'Không thể xóa hình ảnh hoặc không được phép'}), 403
    
    return jsonify({'message': 'Xóa hình ảnh thành công'}), 200

def allowed_file(filename):
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS
           
@jwt_required()
def report_image(image_id):
    """
    Báo cáo hình ảnh không phù hợp
    """
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        if not data or 'reason' not in data:
            return jsonify({"error": "Thiếu lý do báo cáo"}), 400
            
        success = ImageService.report_image(image_id, user_id, data['reason'])
        
        if not success:
            return jsonify({"error": "Không thể báo cáo ảnh"}), 400
            
        return jsonify({"message": "Báo cáo ảnh thành công"}), 200
        
    except Exception as e:
        print(f"Lỗi không mong đợi: {e}")
        return jsonify({"error": "Lỗi máy chủ nội bộ"}), 500

@jwt_required()
def get_reports():
    """
    Lấy danh sách báo cáo (chỉ admin)
    """
    try:
        user_id = get_jwt_identity()
        user = User.objects(id=user_id).first()
        
        # Kiểm tra quyền admin
        if not user or user.role != 'admin':
            return jsonify({"error": "Không có quyền truy cập"}), 403
            
        page = int(request.args.get('page', 1))
        per_page = int(request.args.get('per_page', 20))
        status = request.args.get('status')
        
        reports = ImageService.get_reports(page, per_page, status)
        
        return jsonify({
            'reports': [
                {
                    'id': str(report.id),
                    'image_id': str(report.image.id),
                    'image_url': f"/api/images/file/{str(report.image.id)}",
                    'reported_by': str(report.reported_by.id),
                    'reporter_name': f"{report.reported_by.first_name} {report.reported_by.last_name}" if hasattr(report.reported_by, 'first_name') else report.reported_by.username,
                    'reason': report.reason,
                    'status': report.status,
                    'created_at': report.created_at.isoformat()
                } for report in reports.items
            ],
            'total': reports.total,
            'pages': reports.pages,
            'page': reports.page
        }), 200
        
    except Exception as e:
        print(f"Lỗi không mong đợi: {e}")
        return jsonify({"error": "Lỗi máy chủ nội bộ"}), 500

@jwt_required()
def update_report_status(report_id):
    """
    Cập nhật trạng thái báo cáo (chỉ admin)
    """
    try:
        user_id = get_jwt_identity()
        user = User.objects(id=user_id).first()
        
        # Kiểm tra quyền admin
        if not user or user.role != 'admin':
            return jsonify({"error": "Không có quyền truy cập"}), 403
            
        data = request.get_json()
        
        if not data or 'status' not in data:
            return jsonify({"error": "Thiếu trạng thái mới"}), 400
            
        status = data['status']
        valid_statuses = ["pending", "reviewed", "rejected", "approved"]
        if status not in valid_statuses:
            return jsonify({"error": f"Trạng thái không hợp lệ. Chỉ chấp nhận: {', '.join(valid_statuses)}"}), 400
            
        success = ImageService.update_report_status(report_id, status)
        
        if not success:
            return jsonify({"error": "Không thể cập nhật trạng thái báo cáo"}), 400
            
        return jsonify({"message": "Cập nhật trạng thái báo cáo thành công"}), 200
        
    except Exception as e:
        print(f"Lỗi không mong đợi: {e}")
        return jsonify({"error": "Lỗi máy chủ nội bộ"}), 500