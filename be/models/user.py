# models/user.py
from database.set_up import db
import datetime

class User(db.Document):
    username = db.StringField(required=True, unique=True)
    password = db.StringField(required=True)
    email = db.EmailField(required=True, unique=True)
    full_name = db.StringField(required=False)  
    is_active = db.BooleanField(default=True)   
    role = db.StringField(default="user", choices=["user", "admin"])
    created_at = db.DateTimeField(default=datetime.datetime.now)
    last_login = db.DateTimeField()
    
    meta = {
        'collection': 'users',
        'indexes': [
            {'fields': ['username'], 'unique': True},
            {'fields': ['email'], 'unique': True}
        ]
    }
