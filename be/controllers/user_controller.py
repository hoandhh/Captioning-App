# controllers/user_controller.py
from flask import request, jsonify
from services.user_service import UserService
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.user import User
from models.image import Image
from datetime import datetime, timedelta

@jwt_required()
def get_profile():
    try:
        user_id = get_jwt_identity()
        user = UserService.get_user_by_id(user_id)
        
        return jsonify({
            'id': str(user.id),
            'username': user.username,
            'email': user.email,
            'full_name': user.full_name,
            'is_active': user.is_active,
            'role': user.role,
            'created_at': user.created_at.isoformat() if hasattr(user, 'created_at') and user.created_at else None,
            'last_login': user.last_login.isoformat() if hasattr(user, 'last_login') and user.last_login else None
        }), 200
        
    except ValueError as e:
        return jsonify({'error': str(e)}), 404
    except Exception as e:
        return jsonify({'error': f'Lỗi máy chủ nội bộ: {str(e)}'}), 500

@jwt_required()
def update_profile():
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        # Cập nhật hồ sơ (validate sẽ được thực hiện trong service)
        updated_user = UserService.update_profile(user_id, data)
        
        return jsonify({
            'message': 'Cập nhật hồ sơ thành công',
            'user': {
                'id': str(updated_user.id),
                'username': updated_user.username,
                'email': updated_user.email,
                'full_name': updated_user.full_name,
                'is_active': updated_user.is_active,
                'role': updated_user.role
            }
        }), 200
        
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        return jsonify({'error': f'Lỗi máy chủ nội bộ: {str(e)}'}), 500

@jwt_required()
def get_user_by_id(user_id):
    try:
        # Lấy người dùng hiện tại để kiểm tra quyền
        current_user_id = get_jwt_identity()
        current_user = UserService.get_user_by_id(current_user_id)
        
        # Chỉ admin hoặc chính người dùng đó mới có thể xem thông tin chi tiết
        if str(current_user.id) != user_id and current_user.role != 'admin':
            return jsonify({'error': 'Không có quyền truy cập'}), 403
        
        user = UserService.get_user_by_id(user_id)
        
        return jsonify({
            'id': str(user.id),
            'username': user.username,
            'email': user.email,
            'full_name': user.full_name,
            'is_active': user.is_active,
            'role': user.role,
            'created_at': user.created_at.isoformat() if hasattr(user, 'created_at') and user.created_at else None,
            'last_login': user.last_login.isoformat() if hasattr(user, 'last_login') and user.last_login else None
        }), 200
        
    except ValueError as e:
        return jsonify({'error': str(e)}), 404
    except Exception as e:
        return jsonify({'error': f'Lỗi máy chủ nội bộ: {str(e)}'}), 500

@jwt_required()
def get_user_activity_stats():
    """Lấy thống kê hoạt động của người dùng hiện tại"""
    try:
        user_id = get_jwt_identity()
        user = UserService.get_user_by_id(user_id)
        
        # Tổng số hình ảnh của người dùng
        total_images = Image.objects(uploaded_by=user).count()
        
        # Số hình ảnh tải lên hôm nay
        today = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
        images_today = Image.objects(uploaded_by=user, created_at__gte=today).count()
        
        # Không còn cần tính độ chính xác
        
        # Thống kê theo thời gian (7 ngày gần đây)
        days = 7
        daily_stats = []
        
        for i in range(days-1, -1, -1):  # Đảo ngược vòng lặp để hiển thị từ ngày xa nhất đến gần nhất
            day = today - timedelta(days=i)
            next_day = day + timedelta(days=1)
            count = Image.objects(uploaded_by=user, created_at__gte=day, created_at__lt=next_day).count()
            daily_stats.append({
                'date': day.strftime('%d/%m'),
                'count': count
            })
        
        return jsonify({
            'total_images': total_images,
            'images_today': images_today,
            'daily_stats': daily_stats
        }), 200
        
    except ValueError as e:
        return jsonify({'error': str(e)}), 404
    except Exception as e:
        return jsonify({'error': f'Lỗi máy chủ nội bộ: {str(e)}'}), 500