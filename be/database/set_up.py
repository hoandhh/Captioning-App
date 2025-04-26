# database/setup.py
from flask_mongoengine import MongoEngine
from pymongo import MongoClient
from datetime import datetime, timedelta
import bcrypt
import logging
from faker import Faker
import random

db = MongoEngine()
fake = Faker()

def initialize_db(app):
    db.init_app(app)
    # Thiết lập tự động migration
    setup_migrations(app)
    # Seed dữ liệu nếu cần
    # seed_data(app)

def setup_migrations(app):
    """
    Thiết lập tự động migration cho MongoDB.
    Vì MongoDB không có schema cứng, chúng ta sẽ triển khai một hệ thống kiểm soát phiên bản đơn giản
    để theo dõi và áp dụng các thay đổi đối với cấu trúc tài liệu.
    """
    mongo_uri = app.config['MONGODB_SETTINGS']['host']
    client = MongoClient(mongo_uri)
    
    # Xác định tên cơ sở dữ liệu từ URI
    db_name = 'airc'  # Tên mặc định nếu không được chỉ định trong URI
    if '/' in mongo_uri.split('@')[-1]:
        parts = mongo_uri.split('/')
        if len(parts) > 3 and parts[3]:
            db_name = parts[3]
    
    database = client[db_name]
    
    # Kiểm tra xem collection migrations có tồn tại không
    if 'migrations' not in database.list_collection_names():
        database.create_collection('migrations')
        database.migrations.insert_one({'version': 0, 'applied_at': datetime.now()})
    
    # Áp dụng migrations nếu cần
    apply_migrations(database)

def apply_migrations(database):
    """Áp dụng bất kỳ migrations nào đang chờ xử lý"""
    current_version = database.migrations.find_one({}, sort=[('version', -1)])['version']
    # Logic migration sẽ được đặt ở đây
    # Ví dụ: Nếu current_version < 1, áp dụng migration 1, v.v.

def seed_data(app):
    """
    Tạo dữ liệu giả cho ứng dụng nếu cần.
    Chỉ tạo dữ liệu nếu collection users trống.
    """
    from models.user import User
    
    # Kiểm tra xem đã có dữ liệu người dùng chưa
    if User.objects.count() == 0:
        logging.info("Seeding user data...")
        
        # Tạo một admin user
        create_admin_user()
        
        # Tạo 50 người dùng thông thường
        create_regular_users(50)
        
        logging.info(f"Seeded {User.objects.count()} users successfully.")

def create_admin_user():
    """Tạo tài khoản admin mặc định"""
    from models.user import User
    
    # Mã hóa mật khẩu
    hashed_password = bcrypt.hashpw("Admin@123".encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    
    admin = User(
        username="admin",
        email="admin@vippro.com",
        password=hashed_password,
        full_name="Doan Huu Hoan",
        is_active=True,
        role="admin",
        last_login=datetime.now()
    )
    admin.save()
    return admin

def create_regular_users(count):
    """Tạo số lượng người dùng thông thường theo yêu cầu sử dụng Faker"""
    from models.user import User
    
    # Tạo danh sách để theo dõi username và email đã được sử dụng
    used_usernames = set()
    used_emails = set()
    
    # Thiết lập Faker để tạo dữ liệu nhất quán
    Faker.seed(42)
    
    for i in range(count):
        # Tạo thông tin cá nhân
        profile = fake.profile()
        name_parts = profile['name'].split()
        
        # Đảm bảo có đủ phần tên
        if len(name_parts) >= 2:
            first_name = name_parts[0]
            last_name = name_parts[-1]
        else:
            first_name = profile['name']
            last_name = fake.last_name()
        
        full_name = f"{first_name} {last_name}"
        
        # Tạo username độc nhất
        base_username = f"{first_name.lower()}{random.randint(1, 9999)}"
        username = base_username
        
        # Đảm bảo username là độc nhất
        attempt = 1
        while username in used_usernames:
            username = f"{base_username}{attempt}"
            attempt += 1
        
        used_usernames.add(username)
        
        # Tạo email độc nhất
        email = profile['mail']
        
        # Đảm bảo email là độc nhất
        while email in used_emails:
            email = fake.email()
        
        used_emails.add(email)
        
        # Tạo mật khẩu và mã hóa
        password = fake.password(length=12, special_chars=True, digits=True, upper_case=True, lower_case=True)
        hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        
        # Tạo thời gian đăng nhập cuối cùng ngẫu nhiên
        last_login = fake.date_time_between(start_date='-60d', end_date='now')
        
        # Xác định trạng thái hoạt động (90% người dùng sẽ active)
        is_active = random.random() > 0.1
        
        try:
            user = User(
                username=username,
                email=email,
                password=hashed_password,
                full_name=full_name,
                is_active=is_active,
                role="user",
                last_login=last_login
            )
            user.save()
            
            if i % 10 == 0:
                logging.info(f"Created {i+1} users so far...")
                
        except Exception as e:
            logging.error(f"Error creating user {username}: {str(e)}")
