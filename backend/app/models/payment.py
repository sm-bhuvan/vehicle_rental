from mongoengine import Document, ReferenceField, StringField, FloatField, DateTimeField, DictField
from datetime import datetime
from app.models.user import User
from app.models.booking import Booking

class Payment(Document):
    booking = ReferenceField(Booking, required=True)
    user = ReferenceField(User, required=True)
    
    # Payment details
    amount = FloatField(required=True, min_value=0)
    payment_method = StringField(required=True, choices=['credit_card', 'debit_card', 'paypal', 'bank_transfer', 'cash'])
    transaction_id = StringField(max_length=100)
    
    # Payment status
    status = StringField(
        required=True,
        choices=['pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded'],
        default='pending'
    )
    
    # Payment gateway details
    gateway_name = StringField(max_length=50)
    gateway_transaction_id = StringField(max_length=100)
    gateway_response = StringField()
    
    # Additional payment details
    payment_details = DictField()  # Store card last 4 digits, etc.
    
    # Failure information
    failure_reason = StringField(max_length=200)
    failure_code = StringField(max_length=50)
    
    # Refund information
    refund_status = StringField(choices=['none', 'requested', 'processing', 'completed', 'rejected'], default='none')
    refund_amount = FloatField(min_value=0, default=0)
    refund_reason = StringField(max_length=200)
    refund_requested_at = DateTimeField()
    refund_processed_at = DateTimeField()
    
    # Timestamps
    created_at = DateTimeField(default=datetime.utcnow)
    updated_at = DateTimeField(default=datetime.utcnow)
    processed_at = DateTimeField()
    
    meta = {
        'collection': 'payments',
        'indexes': ['user', 'booking', 'status', 'transaction_id', 'created_at']
    }
    
    def to_json(self, include_refs=True):
        """Convert payment to JSON"""
        payment_dict = {
            'id': str(self.id),
            'amount': self.amount,
            'payment_method': self.payment_method,
            'transaction_id': self.transaction_id,
            'status': self.status,
            'gateway_name': self.gateway_name,
            'gateway_transaction_id': self.gateway_transaction_id,
            'gateway_response': self.gateway_response,
            'payment_details': self.payment_details,
            'failure_reason': self.failure_reason,
            'failure_code': self.failure_code,
            'refund_status': self.refund_status,
            'refund_amount': self.refund_amount,
            'refund_reason': self.refund_reason,
            'refund_requested_at': self.refund_requested_at.isoformat() if self.refund_requested_at else None,
            'refund_processed_at': self.refund_processed_at.isoformat() if self.refund_processed_at else None,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat(),
            'processed_at': self.processed_at.isoformat() if self.processed_at else None
        }
        
        if include_refs:
            payment_dict['user'] = self.user.to_json() if self.user else None
            payment_dict['booking'] = self.booking.to_json(include_refs=False) if self.booking else None
        else:
            payment_dict['user_id'] = str(self.user.id) if self.user else None
            payment_dict['booking_id'] = str(self.booking.id) if self.booking else None
        
        return payment_dict
    
    def save(self, *args, **kwargs):
        """Override save to update timestamp"""
        self.updated_at = datetime.utcnow()
        return super().save(*args, **kwargs)
    
    def is_refundable(self):
        """Check if payment can be refunded"""
        return (self.status == 'completed' and 
                self.refund_status in ['none', 'rejected'] and
                self.amount > 0)
    
    def process_refund(self, refund_amount=None, reason=None):
        """Process refund for the payment"""
        if not self.is_refundable():
            return False, "Payment is not refundable"
        
        if refund_amount is None:
            refund_amount = self.amount
        
        if refund_amount > self.amount:
            return False, "Refund amount cannot exceed payment amount"
        
        self.refund_status = 'completed'
        self.refund_amount = refund_amount
        self.refund_processed_at = datetime.utcnow()
        
        if reason:
            self.refund_reason = reason
        
        # If full refund, update status
        if refund_amount == self.amount:
            self.status = 'refunded'
        
        return True, "Refund processed successfully"