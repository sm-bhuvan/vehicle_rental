from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.user import User
from app.utils.validators import validate_email, validate_phone
from datetime import datetime

users_bp = Blueprint('users', __name__)

@users_bp.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
    """Get current user profile"""
    try:
        current_user_id = get_jwt_identity()
        user = User.objects(id=current_user_id).first()
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        return jsonify({
            'user': user.to_json()
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@users_bp.route('/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    """Update user profile"""
    try:
        current_user_id = get_jwt_identity()
        user = User.objects(id=current_user_id).first()
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        data = request.get_json()
        
        # Fields that can be updated
        updateable_fields = [
            'first_name', 'last_name', 'phone', 'address', 'city', 
            'state', 'zip_code', 'license_number', 'date_of_birth'
        ]
        
        # Validate email if provided
        if 'email' in data and data['email'] != user.email:
            if not validate_email(data['email']):
                return jsonify({'error': 'Invalid email format'}), 400
            
            # Check if email is already taken
            existing_user = User.objects(email=data['email']).first()
            if existing_user and str(existing_user.id) != current_user_id:
                return jsonify({'error': 'Email already in use'}), 409
            
            user.email = data['email']
        
        # Validate phone if provided
        if 'phone' in data and not validate_phone(data['phone']):
            return jsonify({'error': 'Invalid phone number format'}), 400
        
        # Update other fields
        for field in updateable_fields:
            if field in data:
                if field == 'date_of_birth' and data[field]:
                    try:
                        user.date_of_birth = datetime.fromisoformat(data[field])
                    except ValueError:
                        return jsonify({'error': 'Invalid date format for date_of_birth'}), 400
                else:
                    setattr(user, field, data[field])
        
        user.save()
        
        return jsonify({
            'message': 'Profile updated successfully',
            'user': user.to_json()
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@users_bp.route('/profile', methods=['DELETE'])
@jwt_required()
def delete_account():
    """Delete user account (soft delete)"""
    try:
        current_user_id = get_jwt_identity()
        user = User.objects(id=current_user_id).first()
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        data = request.get_json() or {}
        
        # Check password confirmation for security
        if not data.get('password'):
            return jsonify({'error': 'Password confirmation required'}), 400
        
        if not user.check_password(data['password']):
            return jsonify({'error': 'Invalid password'}), 401
        
        # Check for active bookings
        from app.models.booking import Booking
        active_bookings = Booking.objects(
            user=user, 
            status__in=['pending', 'confirmed', 'active']
        )
        
        if active_bookings:
            return jsonify({
                'error': 'Cannot delete account with active bookings. Please cancel or complete your bookings first.'
            }), 400
        
        # Soft delete - deactivate account
        user.is_active = False
        user.email = f"deleted_{user.email}_{datetime.utcnow().timestamp()}"
        user.save()
        
        return jsonify({
            'message': 'Account deleted successfully'
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@users_bp.route('/bookings-summary', methods=['GET'])
@jwt_required()
def get_bookings_summary():
    """Get user's booking summary/statistics"""
    try:
        current_user_id = get_jwt_identity()
        user = User.objects(id=current_user_id).first()
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        from app.models.booking import Booking
        
        # Get booking statistics
        total_bookings = Booking.objects(user=user).count()
        completed_bookings = Booking.objects(user=user, status='completed').count()
        active_bookings = Booking.objects(user=user, status__in=['pending', 'confirmed', 'active']).count()
        cancelled_bookings = Booking.objects(user=user, status='cancelled').count()
        
        # Calculate total spent
        completed_booking_objects = Booking.objects(user=user, status='completed')
        total_spent = sum([booking.total_amount for booking in completed_booking_objects])
        
        # Get recent bookings
        recent_bookings = Booking.objects(user=user).order_by('-created_at').limit(5)
        
        return jsonify({
            'summary': {
                'total_bookings': total_bookings,
                'completed_bookings': completed_bookings,
                'active_bookings': active_bookings,
                'cancelled_bookings': cancelled_bookings,
                'total_spent': total_spent
            },
            'recent_bookings': [booking.to_json(include_refs=False) for booking in recent_bookings]
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@users_bp.route('/verify-license', methods=['POST'])
@jwt_required()
def verify_license():
    """Verify user's driving license"""
    try:
        current_user_id = get_jwt_identity()
        user = User.objects(id=current_user_id).first()
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        data = request.get_json()
        
        if not data.get('license_number'):
            return jsonify({'error': 'License number is required'}), 400
        
        # In a real application, you would integrate with a license verification service
        # For now, we'll just update the license number and mark as verified
        user.license_number = data['license_number']
        user.is_verified = True
        user.save()
        
        return jsonify({
            'message': 'License verified successfully',
            'user': user.to_json()
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500