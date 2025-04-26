# services/user_service.py
from models.user import User
import datetime

class UserService:
    @staticmethod
    def update_profile(user_id, data):
        """Cập nhật thông tin hồ sơ người dùng"""
        from services.auth_service import AuthService
        
        user = User.objects(id=user_id).first()
        if not user:
            raise ValueError("Không tìm thấy người dùng")
        
        # Kiểm tra email nếu được cập nhật
        if 'email' in data:
            # Kiểm tra email hợp lệ
            is_valid, error = AuthService.validate_email(data['email'])
            if not is_valid:
                raise ValueError(error)
                
            # Kiểm tra email không trùng lặp
            if data['email'].lower() != user.email:
                existing_email = User.objects(email=data['email'].lower()).first()
                if existing_email:
                    raise ValueError("Email đã được sử dụng bởi tài khoản khác")
                data['email'] = data['email'].lower()
        
        # Cập nhật các trường
        for key, value in data.items():
            if key != 'password' and key != 'role':  # Bảo vệ các trường nhạy cảm
                setattr(user, key, value)
        
        user.save()
        return user
    
    @staticmethod
    def get_user_by_id(user_id):
        """Lấy người dùng theo ID"""
        user = User.objects(id=user_id).first()
        if not user:
            raise ValueError("Không tìm thấy người dùng")
        return user
    
    @staticmethod
    def get_user_by_username(username):
        """Lấy người dùng theo username"""
        user = User.objects(username=username).first()
        if not user:
            raise ValueError("Không tìm thấy người dùng")
        return user
    
    @staticmethod
    def get_user_by_email(email):
        """Lấy người dùng theo email"""
        user = User.objects(email=email.lower()).first()
        if not user:
            raise ValueError("Không tìm thấy người dùng")
        return user
    
    @staticmethod
    def get_all_users(page=1, per_page=20, is_active=None, role=None):
        """Lấy danh sách người dùng với phân trang, cho phép lọc theo is_active và role (chỉ admin)"""
        query = {}
        
        # Nếu is_active không phải None, chuyển về boolean và đưa vào query
        if is_active is not None:
            if isinstance(is_active, str):
                if is_active.lower() == "true":
                    query['is_active'] = True
                elif is_active.lower() == "false":
                    query['is_active'] = False
            elif isinstance(is_active, bool):
                query['is_active'] = is_active

        # Nếu role không phải None, thêm vào query
        if role is not None:
            query['role'] = role
            
        # Lọc và phân trang
        # User.objects(**query) tương đương với User.objects.filter(**query) trong Django ORM
        # Ví dụ: User.objects(is_active=True, role="admin")
        return User.objects(**query).paginate(page=page, per_page=per_page)
    
    @staticmethod
    def delete_user(user_id):
        """Xóa người dùng (chỉ admin)"""
        user = User.objects(id=user_id).first()
        if not user:
            raise ValueError("Không tìm thấy người dùng")
            
        user.delete()
        return True
        
    @staticmethod
    def toggle_user_status(user_id, is_active):
        """Bật/tắt trạng thái hoạt động của người dùng (chỉ admin)"""
        user = User.objects(id=user_id).first()
        if not user:
            raise ValueError("Không tìm thấy người dùng")
            
        user.is_active = is_active
        user.save()
        return user
    
    @staticmethod
    def change_user_role(user_id, role):
        """Thay đổi vai trò của người dùng (chỉ admin)"""
        user = User.objects(id=user_id).first()
        if not user:
            raise ValueError("Không tìm thấy người dùng")
        
        if role not in ["user", "admin"]:
            raise ValueError("Vai trò không hợp lệ. Các vai trò hợp lệ: user, admin")
            
        user.role = role
        user.save()
        return user
    
    @staticmethod
    def search_users(query, page=1, per_page=20):
        """Tìm kiếm người dùng theo tên hoặc email"""
        users = User.objects(
            __raw__={
                "$or": [
                    {"username": {"$regex": query, "$options": "i"}},
                    {"email": {"$regex": query, "$options": "i"}},
                    {"full_name": {"$regex": query, "$options": "i"}}
                ]
            }
        ).paginate(page=page, per_page=per_page)
        
        return users
    
    @staticmethod
    def get_user_stats():
        """Lấy thống kê người dùng"""
        total_users = User.objects.count()
        active_users = User.objects(is_active=True).count()
        inactive_users = User.objects(is_active=False).count()
        admin_users = User.objects(role="admin").count()
        
        return {
            "total_users": total_users,
            "active_users": active_users,
            "inactive_users": inactive_users,
            "admin_users": admin_users
        }
