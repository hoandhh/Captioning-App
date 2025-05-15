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
            full_name=data.get('full_name', ''), 
            is_active=data.get('is_active', True) 
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
        print(f"Yêu cầu quên mật khẩu nhận được: {data}")
        
        if 'email' not in data:
            print("Lỗi: Thiếu trường email trong yêu cầu")
            return jsonify({'error': 'Email là bắt buộc'}), 400
        
        email = data['email']
        print(f"Xử lý quên mật khẩu cho email: {email}")
        
        # Gọi service để xử lý yêu cầu quên mật khẩu
        result = AuthService.forgot_password(email)
        print(f"Kết quả xử lý quên mật khẩu: {result}")
        
        # Không tiết lộ liệu email có tồn tại hay không vì lý do bảo mật
        return jsonify({'message': 'Nếu email tồn tại, một liên kết đặt lại sẽ được gửi'}), 200
        
    except ValueError as e:
        # Log lỗi nhưng không tiết lộ chi tiết cho người dùng
        print(f"Lỗi quên mật khẩu (ValueError): {str(e)}")
        import traceback
        print(traceback.format_exc())
        return jsonify({'message': 'Nếu email tồn tại, một liên kết đặt lại sẽ được gửi'}), 200
    except Exception as e:
        print(f"Lỗi máy chủ khi xử lý quên mật khẩu: {str(e)}")
        import traceback
        print(traceback.format_exc())
        return jsonify({'error': f'Lỗi máy chủ nội bộ'}), 500

def reset_password():
    try:
        data = request.get_json()
        print(f"Yêu cầu đặt lại mật khẩu nhận được: {data}")
        
        # Kiểm tra các trường bắt buộc
        if 'new_password' not in data:
            return jsonify({'error': 'Thiếu mật khẩu mới'}), 400
            
        # Kiểm tra token hoặc mã đặt lại mật khẩu
        if 'token' in data:
            reset_key = data['token']
            print(f"Sử dụng token: {reset_key[:10]}...")
        elif 'code' in data:
            reset_key = data['code']
            print(f"Sử dụng mã đặt lại mật khẩu: {reset_key}")
        else:
            return jsonify({'error': 'Thiếu token hoặc mã đặt lại mật khẩu'}), 400
        
        # Gọi service để đặt lại mật khẩu
        AuthService.reset_password_with_token(
            token=reset_key,
            new_password=data['new_password']
        )
        
        return jsonify({'message': 'Đặt lại mật khẩu thành công'}), 200
        
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        print(f"Lỗi máy chủ khi đặt lại mật khẩu: {str(e)}")
        return jsonify({'error': f'Lỗi máy chủ nội bộ'}), 500
