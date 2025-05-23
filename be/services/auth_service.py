# services/auth_service.py
from werkzeug.security import generate_password_hash, check_password_hash
from models.user import User
import datetime
import re

class AuthService:
    @staticmethod
    def validate_email(email):
        """Kiểm tra email hợp lệ"""
        email_regex = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        if not re.match(email_regex, email):
            return False, "Email không hợp lệ"
        return True, ""
    
    @staticmethod
    def validate_password(password):
        """Kiểm tra mật khẩu mạnh"""
        # Kiểm tra độ dài tối thiểu
        if len(password) < 6:
            return False, "Mật khẩu phải có ít nhất 6 ký tự"
        
        # Kiểm tra có ít nhất 1 chữ hoa
        if not any(char.isupper() for char in password):
            return False, "Mật khẩu phải có ít nhất 1 chữ in hoa"
        
        # Kiểm tra có ít nhất 1 ký tự đặc biệt
        special_chars = "!@#$%^&*()-_=+[]{}|;:'\",.<>/?"
        if not any(char in special_chars for char in password):
            return False, "Mật khẩu phải có ít nhất 1 ký tự đặc biệt"
        
        return True, ""
    
    @staticmethod
    def register_user(username, password, email, full_name='', is_active=True):
        """Đăng ký người dùng mới"""
        # Kiểm tra email hợp lệ
        is_valid_email, email_error = AuthService.validate_email(email)
        if not is_valid_email:
            raise ValueError(email_error)
        
        # Kiểm tra mật khẩu mạnh
        is_valid_password, password_error = AuthService.validate_password(password)
        if not is_valid_password:
            raise ValueError(password_error)
        
        # Kiểm tra email đã tồn tại chưa
        if User.objects(email=email.lower()).first():
            raise ValueError("Email đã được sử dụng")
        
        # Kiểm tra username đã tồn tại chưa
        if User.objects(username=username).first():
            raise ValueError("Tên người dùng đã tồn tại")
        
        # Tạo người dùng mới
        hashed_password = generate_password_hash(password)
        user = User(
            username=username,
            password=hashed_password,
            email=email.lower(),  # Lưu email dưới dạng chữ thường để tránh trùng lặp
            full_name=full_name,  # Thêm full_name
            is_active=is_active   # Thêm is_active
        )
        user.save()
        return user
    
    @staticmethod
    def authenticate(username, password):
        """Xác thực người dùng bằng tên người dùng"""
        user = User.objects(username=username).first()
        if user and check_password_hash(user.password, password):
            # Kiểm tra trạng thái hoạt động
            if not user.is_active:
                return None
                
            user.last_login = datetime.datetime.now()
            user.save()
            return user
        return None
    
    @staticmethod
    def authenticate_by_email(email, password):
        """Xác thực người dùng bằng email"""
        # Kiểm tra email hợp lệ
        is_valid, error = AuthService.validate_email(email)
        if not is_valid:
            return None
        
        user = User.objects(email=email.lower()).first()
        if user and check_password_hash(user.password, password):
            # Kiểm tra trạng thái hoạt động
            if not user.is_active:
                return None
                
            user.last_login = datetime.datetime.now()
            user.save()
            return user
        return None
    
    @staticmethod
    def change_password(user_id, current_password, new_password):
        """Thay đổi mật khẩu người dùng"""
        user = User.objects(id=user_id).first()
        if not user:
            raise ValueError("Không tìm thấy người dùng")
            
        if not check_password_hash(user.password, current_password):
            raise ValueError("Mật khẩu hiện tại không chính xác")
        
        # Kiểm tra mật khẩu mới có đủ mạnh không
        is_valid, error = AuthService.validate_password(new_password)
        if not is_valid:
            raise ValueError("Mật khẩu mới không đủ mạnh")
            
        user.password = generate_password_hash(new_password)
        user.save()
        return True
    
    @staticmethod
    def forgot_password(email):
        """Tạo token đặt lại mật khẩu và gửi email"""
        print(f"Bắt đầu xử lý quên mật khẩu cho email: {email}")
        
        # Kiểm tra email hợp lệ
        is_valid, error = AuthService.validate_email(email)
        if not is_valid:
            print(f"Email không hợp lệ: {error}")
            raise ValueError(error)
            
        # Tìm người dùng bằng email
        user = User.objects(email=email.lower()).first()
        if not user:
            print(f"Không tìm thấy người dùng với email: {email}")
            return False
            
        # Kiểm tra trạng thái hoạt động
        if not user.is_active:
            print(f"Tài khoản không hoạt động: {email}")
            return False
            
        print(f"Tìm thấy người dùng: {user.username}, ID: {user.id}")
            
        # Import các module cần thiết
        from flask_jwt_extended import create_access_token
        import datetime
        from services.email_service import EmailService
        
        try:
            # Tạo mã đặt lại mật khẩu đơn giản (6 chữ số)
            import random
            import string
            reset_code = ''.join(random.choices(string.digits, k=6))
            
            # Tạo token JWT như trước
            expires = datetime.datetime.now() + datetime.timedelta(minutes=30)
            reset_token = create_access_token(
                identity=str(user.id),
                expires_delta=datetime.timedelta(minutes=30),
                additional_claims={"purpose": "password_reset", "code": reset_code}
            )
            
            print(f"Mã đặt lại mật khẩu: {reset_code}")
            print(f"Token đã được tạo: {reset_token[:20]}...")
            
            # Lưu cả token và mã đơn giản vào database
            user.reset_password_token = reset_token
            user.reset_password_expires = expires
            user.reset_code = reset_code
            user.save()
            
            print("Token đã được lưu vào database")
            
            # Gửi email với link đặt lại mật khẩu
            print("Bắt đầu gửi email đặt lại mật khẩu...")
            success, message = EmailService.send_password_reset_email(
                to_email=user.email,
                reset_token=reset_token,
                username=user.username
            )
            
            if not success:
                print(f"Lỗi khi gửi email: {message}")
                raise ValueError(f"Không thể gửi email: {message}")
            
            print("Email đặt lại mật khẩu đã được gửi thành công")
            return True
            
        except Exception as e:
            print(f"Lỗi trong quá trình xử lý quên mật khẩu: {str(e)}")
            import traceback
            print(traceback.format_exc())
            raise ValueError(f"Lỗi xử lý quên mật khẩu: {str(e)}")
        
        
    @staticmethod
    def reset_password_with_token(token, new_password):
        """Đặt lại mật khẩu bằng token hoặc mã đặt lại mật khẩu"""
        # Kiểm tra token hoặc mã
        if not token:
            raise ValueError("Mã đặt lại mật khẩu là bắt buộc")
        
        print(f"Mã đặt lại mật khẩu nhận được: {token}")
        
        # Xử lý mã đặt lại mật khẩu
        try:
            # Loại bỏ khoảng trắng và ký tự không mong muốn
            code = token.strip().replace('\r', '').replace('\n', '')
            print(f"Mã đặt lại mật khẩu sau khi xử lý: {code}")
            
            # Kiểm tra độ dài của mã
            if len(code) != 6:
                print(f"Mã đặt lại mật khẩu không hợp lệ: độ dài {len(code)} (cần 6 ký tự)")
                # Thử tìm kiếm bằng token JWT nếu mã không đúng định dạng
                user = User.objects(reset_password_token=token).first()
            else:
                # Tìm kiếm người dùng bằng mã đặt lại mật khẩu
                user = User.objects(reset_code=code).first()
                print(f"Tìm kiếm người dùng với mã: {code}")
        except Exception as e:
            print(f"Lỗi khi xử lý mã đặt lại mật khẩu: {str(e)}")
            # Thử tìm kiếm bằng token gốc
            user = User.objects(reset_password_token=token).first()
        
        # Kiểm tra mật khẩu mới có đủ mạnh không
        is_valid, error = AuthService.validate_password(new_password)
        if not is_valid:
            raise ValueError(error)
            
        # Kiểm tra user đã tìm thấy chưa (user đã được tìm ở trên)
        if not user:
            print("Không tìm thấy người dùng với token này")
            raise ValueError("Token không hợp lệ hoặc đã hết hạn")
        else:
            print(f"Tìm thấy người dùng: {user.username}, ID: {user.id}")
            
        # Kiểm tra token còn hiệu lực không
        if not user.reset_password_expires or user.reset_password_expires < datetime.datetime.now():
            # Xóa token hết hạn
            print(f"Token đã hết hạn: {user.reset_password_expires}")
            user.reset_password_token = None
            user.reset_password_expires = None
            user.save()
            raise ValueError("Token đã hết hạn, vui lòng yêu cầu đặt lại mật khẩu mới")
        else:
            print(f"Token còn hiệu lực, hết hạn vào: {user.reset_password_expires}")
            
        # Đặt mật khẩu mới
        user.password = generate_password_hash(new_password)
        
        # Xóa token đặt lại mật khẩu
        user.reset_password_token = None
        user.reset_password_expires = None
        
        user.save()
        return True
    
    @staticmethod
    def hash_password(password):
        """Mã hóa mật khẩu"""
        return generate_password_hash(password)
    
    @staticmethod
    def verify_password(hashed_password, password):
        """Xác minh mật khẩu"""
        return check_password_hash(hashed_password, password)
