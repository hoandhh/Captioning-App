# controllers/auth_controller.py
from flask import request, jsonify
from services.auth_service import AuthService
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from models.user import User

def register():
    try:
        data = request.get_json()
        
        # Xác thực đầu vào
        if not all(k in data for k in ('username', 'password', 'email')):
            return jsonify({'error': 'Thiếu các trường bắt buộc'}), 400
        
        # Tạo người dùng mới (validate sẽ được thực hiện trong service)
        user = AuthService.register_user(
            username=data['username'],
            password=data['password'],
            email=data['email'],
            full_name=data.get('full_name', ''),  # Thêm full_name, mặc định là chuỗi rỗng
            is_active=data.get('is_active', True)  # Thêm is_active, mặc định là True
        )
        
        return jsonify({'message': 'Đăng ký người dùng thành công'}), 201
        
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        return jsonify({'error': f'Lỗi máy chủ nội bộ: {str(e)}'}), 500

def login():
    try:
        data = request.get_json()
        
        # Xác thực đầu vào
        if not (('email' in data or 'username' in data) and 'password' in data):
            return jsonify({'error': 'Thiếu thông tin đăng nhập hoặc mật khẩu'}), 400
        
        # Xác thực người dùng
        user = None
        if 'email' in data:
            user = AuthService.authenticate_by_email(data['email'], data['password'])
        elif 'username' in data:
            user = AuthService.authenticate(data['username'], data['password'])
            
        if not user:
            return jsonify({'error': 'Thông tin đăng nhập không hợp lệ'}), 401
        
        # Kiểm tra trạng thái hoạt động của tài khoản
        if not user.is_active:
            return jsonify({'error': 'Tài khoản đã bị vô hiệu hóa'}), 403
        
        # Tạo token truy cập
        access_token = create_access_token(identity=str(user.id))
        return jsonify({
            'access_token': access_token,
            # 'user': {
            #     'id': str(user.id),
            #     'username': user.username,
            #     'email': user.email,
            #     'role': user.role
            # }
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Lỗi máy chủ nội bộ: {str(e)}'}), 500

@jwt_required()
def change_password():
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        if not all(k in data for k in ('current_password', 'new_password')):
            return jsonify({'error': 'Thiếu các trường bắt buộc'}), 400
        
        # Thay đổi mật khẩu (validate sẽ được thực hiện trong service)
        AuthService.change_password(
            user_id, 
            data['current_password'], 
            data['new_password']
        )
        
        return jsonify({'message': 'Thay đổi mật khẩu thành công'}), 200
        
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        return jsonify({'error': f'Lỗi máy chủ nội bộ: {str(e)}'}), 500

def forgot_password():
    try:
        data = request.get_json()
        
        if 'email' not in data:
            return jsonify({'error': 'Email là bắt buộc'}), 400
        
        # Reset mật khẩu (validate sẽ được thực hiện trong service)
        AuthService.reset_password(data['email'])
        
        # Không tiết lộ liệu email có tồn tại hay không vì lý do bảo mật
        return jsonify({'message': 'Nếu email tồn tại, một liên kết đặt lại sẽ được gửi'}), 200
        
    except ValueError as e:
        # Không tiết lộ lỗi cụ thể để bảo mật
        return jsonify({'message': 'Nếu email tồn tại, một liên kết đặt lại sẽ được gửi'}), 200
    except Exception as e:
        return jsonify({'error': f'Lỗi máy chủ nội bộ: {str(e)}'}), 500

def reset_password():
    try:
        data = request.get_json()
        
        if not all(k in data for k in ('token', 'new_password')):
            return jsonify({'error': 'Thiếu các trường bắt buộc'}), 400
        
        # Trong triển khai thực tế, bạn sẽ xác thực token và đặt lại mật khẩu
        # Hiện tại, đây chỉ là một hàm giả
        
        return jsonify({'message': 'Đặt lại mật khẩu thành công'}), 200
        
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        return jsonify({'error': f'Lỗi máy chủ nội bộ: {str(e)}'}), 500
