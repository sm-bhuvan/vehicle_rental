from mongoengine import Document, ReferenceField, StringField, DateTimeField, FloatField, IntField, BooleanField, DictField
from datetime import datetime
from app.models.user import User
from app.models.vehicle import Vehicle

class Booking(Document):
    user = ReferenceField(User, required=True)
    vehicle = ReferenceField(Vehicle, required=True)
    
    # Booking details
    start_date = DateTimeField(required=True)
    end_date = DateTimeField(required=True)
    pickup_location = DictField()  # {address, city, state, coordinates}
    return_location = DictField()  # {address, city, state, coordinates}
    
    # Pricing
    total_days = IntField(required=True, min_value=1)
    daily_rate = FloatField(required=True, min_value=0)
    subtotal = FloatField(required=True, min_value=0)
    tax_amount = FloatField(default=0, min_value=0)
    discount_amount = FloatField(default=0, min_value=0)
    total_amount = FloatField(required=True, min_value=0)
    
    # Status
    status = StringField(
        required=True,
        choices=['pending', 'confirmed', 'active', 'completed', 'cancelled', 'no_show'],
        default='pending'
    )
    
    # Payment
    payment_status = StringField(
        choices=['pending', 'paid', 'partial', 'refunded', 'failed'],
        default='pending'
    )
    advance_payment = FloatField(default=0, min_value=0)
    
    # Additional information
    special_requests = StringField(max_length=500)
    driver_license_verified = BooleanField(default=False)
    
    # Timestamps
    created_at = DateTimeField(default=datetime.utcnow)
    updated_at = DateTimeField(default=datetime.utcnow)
    confirmed_at = DateTimeField()
    cancelled_at = DateTimeField()
    
    # Cancellation
    cancellation_reason = StringField(max_length=200)
    cancelled_by = StringField(choices=['user', 'admin', 'system'])
    
    meta = {
        'collection': 'bookings',
        'indexes': ['user', 'vehicle', 'status', 'start_date', 'end_date']
    }
    
    def to_json(self, include_refs=True):
        """Convert booking to JSON"""
        booking_dict = {
            'id': str(self.id),
            'start_date': self.start_date.isoformat(),
            'end_date': self.end_date.isoformat(),
            'pickup_location': self.pickup_location,
            'return_location': self.return_location,
            'total_days': self.total_days,
            'daily_rate': self.daily_rate,
            'subtotal': self.subtotal,
            'tax_amount': self.tax_amount,
            'discount_amount': self.discount_amount,
            'total_amount': self.total_amount,
            'status': self.status,
            'payment_status': self.payment_status,
            'advance_payment': self.advance_payment,
            'special_requests': self.special_requests,
            'driver_license_verified': self.driver_license_verified,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat(),
            'confirmed_at': self.confirmed_at.isoformat() if self.confirmed_at else None,
            'cancelled_at': self.cancelled_at.isoformat() if self.cancelled_at else None,
            'cancellation_reason': self.cancellation_reason,
            'cancelled_by': self.cancelled_by
        }
        
        if include_refs:
            booking_dict['user'] = self.user.to_json() if self.user else None
            booking_dict['vehicle'] = self.vehicle.to_json() if self.vehicle else None
        else:
            booking_dict['user_id'] = str(self.user.id) if self.user else None
            booking_dict['vehicle_id'] = str(self.vehicle.id) if self.vehicle else None
        
        return booking_dict
    
    def save(self, *args, **kwargs):
        """Override save to update timestamp"""
        self.updated_at = datetime.utcnow()
        return super().save(*args, **kwargs)
    
    def calculate_total_days(self):
        """Calculate total days between start and end date"""
        delta = self.end_date - self.start_date
        return max(1, delta.days)
    
    def calculate_total_amount(self):
        """Calculate total booking amount"""
        self.total_days = self.calculate_total_days()
        self.subtotal = self.daily_rate * self.total_days
        self.total_amount = self.subtotal + self.tax_amount - self.discount_amount
        return self.total_amount
    
    def can_be_cancelled(self):
        """Check if booking can be cancelled"""
        return self.status in ['pending', 'confirmed'] and self.start_date > datetime.utcnow()
    
    def cancel_booking(self, reason=None, cancelled_by='user'):
        """Cancel the booking"""
        if self.can_be_cancelled():
            self.status = 'cancelled'
            self.cancelled_at = datetime.utcnow()
            self.cancellation_reason = reason
            self.cancelled_by = cancelled_by
            
            # Make vehicle available again
            if self.vehicle:
                self.vehicle.is_available = True
                self.vehicle.save()
            
            return True
        return False