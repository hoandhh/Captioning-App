# models/report.py
from database.set_up import db
import datetime

class Report(db.Document):
    image = db.ReferenceField('Image', required=True)
    reported_by = db.ReferenceField('User', required=True)
    reason = db.StringField(required=True)
    status = db.StringField(default="pending", choices=["pending", "reviewed", "rejected", "approved"])
    created_at = db.DateTimeField(default=datetime.datetime.now)
    
    meta = {
        'collection': 'reports',
        'indexes': [
            {'fields': ['image']},
            {'fields': ['status']},
            {'fields': ['created_at']}
        ]
    }
