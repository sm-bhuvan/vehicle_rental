from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.user import User
from app.models.booking import Booking
from app.models.payment import Payment
from datetime import datetime

payments_bp = Blueprint('payments', __name__)

@payments_bp.route('/process', methods=['POST'])
@jwt_required()
def process_payment():
    """Process payment for a booking"""
    try:
        current_user_id = get_jwt_identity()
        user = User.objects(id=current_user_id).first()
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['booking_id', 'payment_method', 'amount']
        for field in required_fields:
            if field not in data or data[field] is None:
                return jsonify({'error': f'{field} is required'}), 400
        
        # Get booking
        booking = Booking.objects(id=data['booking_id']).first()
        if not booking:
            return jsonify({'error': 'Booking not found'}), 404
        
        # Check if user owns this booking
        if str(booking.user.id) != current_user_id:
            return jsonify({'error': 'Access denied'}), 403
        
        # Validate payment amount
        amount = float(data['amount'])
        if amount <= 0:
            return jsonify({'error': 'Invalid payment amount'}), 400
        
        # Check if booking can be paid
        if booking.status not in ['pending', 'confirmed']:
            return jsonify({'error': 'Cannot process payment for this booking'}), 400
        
        # Create payment record
        payment = Payment(
            booking=booking,
            user=user,
            amount=amount,
            payment_method=data['payment_method'],
            transaction_id=data.get('transaction_id', ''),
            payment_details=data.get('payment_details', {}),
            status='pending'
        )
        
        # Simulate payment processing
        # In a real application, you would integrate with a payment gateway
        try:
            # Simulate payment gateway call
            payment_result = simulate_payment_gateway(data)
            
            if payment_result['success']:
                payment.status = 'completed'
                payment.transaction_id = payment_result['transaction_id']
                payment.processed_at = datetime.utcnow()
                
                # Update booking payment status
                if amount >= booking.total_amount:
                    booking.payment_status = 'paid'
                    booking.status = 'confirmed'
                    booking.confirmed_at = datetime.utcnow()
                else:
                    booking.payment_status = 'partial'
                    booking.advance_payment += amount
                
                booking.save()
                
            else:
                payment.status = 'failed'
                payment.failure_reason = payment_result.get('error', 'Payment failed')
            
            payment.save()
            
            return jsonify({
                'message': 'Payment processed successfully' if payment.status == 'completed' else 'Payment failed',
                'payment': payment.to_json(),
                'booking': booking.to_json()
            }), 200 if payment.status == 'completed' else 400
            
        except Exception as e:
            payment.status = 'failed'
            payment.failure_reason = str(e)
            payment.save()
            
            return jsonify({
                'error': 'Payment processing failed',
                'details': str(e)
            }), 500
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@payments_bp.route('/history', methods=['GET'])
@jwt_required()
def get_payment_history():
    """Get user's payment history"""
    try:
        current_user_id = get_jwt_identity()
        user = User.objects(id=current_user_id).first()
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        payments = Payment.objects(user=user).order_by('-created_at')
        
        return jsonify({
            'payments': [payment.to_json() for payment in payments],
            'count': len(payments)
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@payments_bp.route('/<payment_id>', methods=['GET'])
@jwt_required()
def get_payment(payment_id):
    """Get a specific payment"""
    try:
        current_user_id = get_jwt_identity()
        user = User.objects(id=current_user_id).first()
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        payment = Payment.objects(id=payment_id).first()
        
        if not payment:
            return jsonify({'error': 'Payment not found'}), 404
        
        # Check if user can access this payment
        if user.role != 'admin' and str(payment.user.id) != current_user_id:
            return jsonify({'error': 'Access denied'}), 403
        
        return jsonify({
            'payment': payment.to_json()
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@payments_bp.route('/<payment_id>/refund', methods=['POST'])
@jwt_required()
def request_refund(payment_id):
    """Request refund for a payment"""
    try:
        current_user_id = get_jwt_identity()
        user = User.objects(id=current_user_id).first()
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        payment = Payment.objects(id=payment_id).first()
        
        if not payment:
            return jsonify({'error': 'Payment not found'}), 404
        
        # Check if user can request refund for this payment
        if str(payment.user.id) != current_user_id:
            return jsonify({'error': 'Access denied'}), 403
        
        if payment.status != 'completed':
            return jsonify({'error': 'Only completed payments can be refunded'}), 400
        
        data = request.get_json() or {}
        refund_reason = data.get('reason', 'Refund requested by user')
        
        # Create refund record
        payment.refund_status = 'requested'
        payment.refund_requested_at = datetime.utcnow()
        payment.refund_reason = refund_reason
        payment.save()
        
        return jsonify({
            'message': 'Refund request submitted successfully',
            'payment': payment.to_json()
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

def simulate_payment_gateway(payment_data):
    """Simulate payment gateway processing"""
    import random
    import string
    
    # Simulate random success/failure (90% success rate)
    success = random.random() > 0.1
    
    if success:
        # Generate random transaction ID
        transaction_id = ''.join(random.choices(string.ascii_uppercase + string.digits, k=12))
        return {
            'success': True,
            'transaction_id': f'TXN_{transaction_id}',
            'gateway_response': 'Payment processed successfully'
        }
    else:
        return {
            'success': False,
            'error': 'Payment declined by gateway',
            'error_code': 'DECLINED'
        }