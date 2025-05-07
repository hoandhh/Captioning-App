# models/image.py
from database.set_up import db
import datetime

class Image(db.Document):
    description = db.StringField()
    file_name = db.StringField(required=True)  # Giữ tên file gốc
    content_type = db.StringField(required=True)  # Loại MIME của file
    image_data = db.BinaryField(required=True)  # Dữ liệu nhị phân của ảnh
    uploaded_by = db.ReferenceField('User')
    created_at = db.DateTimeField(default=datetime.datetime.now)
    location = db.StringField()  # Lưu tên địa điểm
    
    meta = {
        'collection': 'images',
        'indexes': [
            {'fields': ['uploaded_by']},
            {'fields': ['created_at']}
        ]
    }