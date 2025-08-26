from mongoengine import Document, StringField, EmailField, DateTimeField, BooleanField
from datetime import datetime
import bcrypt

class User(Document):
    email = EmailField(required=True, unique=True)
    password_hash = StringField(required=True, max_length=128)
    first_name = StringField(required=True, max_length=50)
    last_name = StringField(required=True, max_length=50)
    phone = StringField(max_length=15)
    address = StringField(max_length=200)
    city = StringField(max_length=50)
    state = StringField(max_length=50)
    zip_code = StringField(max_length=10)
    license_number = StringField(max_length=20)
    date_of_birth = DateTimeField()
    role = StringField(default='customer', choices=['customer', 'admin'])
    is_verified = BooleanField(default=False)
    is_active = BooleanField(default=True)
    created_at = DateTimeField(default=datetime.utcnow)
    updated_at = DateTimeField(default=datetime.utcnow)
    
    meta = {
        'collection': 'users',
        'indexes': ['email', 'phone', 'license_number']
    }
    
    def set_password(self, password):
        """Hash and set password"""
        self.password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    
    def check_password(self, password):
        """Check if provided password matches hash"""
        return bcrypt.checkpw(password.encode('utf-8'), self.password_hash.encode('utf-8'))
    
    def to_json(self, include_sensitive=False):
        """Convert user to JSON, excluding sensitive data by default"""
        user_dict = {
            'id': str(self.id),
            'email': self.email,
            'first_name': self.first_name,
            'last_name': self.last_name,
            'phone': self.phone,
            'address': self.address,
            'city': self.city,
            'state': self.state,
            'zip_code': self.zip_code,
            'license_number': self.license_number,
            'date_of_birth': self.date_of_birth.isoformat() if self.date_of_birth else None,
            'role': self.role,
            'is_verified': self.is_verified,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }
        
        if include_sensitive:
            user_dict['password_hash'] = self.password_hash
        
        return user_dict
    
    def save(self, *args, **kwargs):
        """Override save to update timestamp"""
        self.updated_at = datetime.utcnow()
        return super().save(*args, **kwargs)