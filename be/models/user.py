# models/user.py
from mongoengine import Document, StringField, EmailField, DateTimeField, BooleanField
import datetime

class User(Document):
    username = StringField(required=True, unique=True)
    password = StringField(required=True)
    email = EmailField(required=True, unique=True)
    full_name = StringField(default="")
    role = StringField(default="user", choices=["user", "admin"])
    created_at = DateTimeField(default=datetime.datetime.now)
    last_login = DateTimeField(default=datetime.datetime.now)
    is_active = BooleanField(default=True)
    reset_password_token = StringField()
    reset_password_expires = DateTimeField()
    # Thêm trường mới để lưu mã đơn giản cho đặt lại mật khẩu
    reset_code = StringField()
    
    meta = {
        'collection': 'users',
        'indexes': [
            {'fields': ['username'], 'unique': True},
            {'fields': ['email'], 'unique': True},
            {'fields': ['reset_password_token']}
        ]
    }
