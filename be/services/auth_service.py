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
    def reset_password(email):
        """Tạo token đặt lại mật khẩu và gửi email"""
        # Kiểm tra email hợp lệ
        is_valid, error = AuthService.validate_email(email)
        if not is_valid:
            raise ValueError(error)
            
        # Tìm người dùng bằng email
        user = User.objects(email=email.lower()).first()
        if not user:
            return False
            
        # Kiểm tra trạng thái hoạt động
        if not user.is_active:
            return False
            
        # Trong triển khai thực tế:
        # 1. Tạo token đặt lại mật khẩu
        # 2. Lưu token vào database với thời gian hết hạn
        # 3. Gửi email với link đặt lại mật khẩu
        
        return True
    
    @staticmethod
    def hash_password(password):
        """Mã hóa mật khẩu"""
        return generate_password_hash(password)
    
    @staticmethod
    def verify_password(hashed_password, password):
        """Xác minh mật khẩu"""
        return check_password_hash(hashed_password, password)
