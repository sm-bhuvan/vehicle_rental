from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.user import User
from app.models.vehicle import Vehicle
from app.models.booking import Booking
from datetime import datetime, timedelta
from app.utils.decorators import admin_required

bookings_bp = Blueprint('bookings', __name__)

@bookings_bp.route('', methods=['GET'])
@jwt_required()
def get_bookings():
    """Get user's bookings or all bookings (admin)"""
    try:
        current_user_id = get_jwt_identity()
        user = User.objects(id=current_user_id).first()
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Admin can see all bookings, regular users see only their own
        if user.role == 'admin':
            bookings = Booking.objects().order_by('-created_at')
        else:
            bookings = Booking.objects(user=user).order_by('-created_at')
        
        return jsonify({
            'bookings': [booking.to_json() for booking in bookings],
            'count': len(bookings)
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bookings_bp.route('/<booking_id>', methods=['GET'])
@jwt_required()
def get_booking(booking_id):
    """Get a specific booking"""
    try:
        current_user_id = get_jwt_identity()
        user = User.objects(id=current_user_id).first()
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        booking = Booking.objects(id=booking_id).first()
        
        if not booking:
            return jsonify({'error': 'Booking not found'}), 404
        
        # Check if user can access this booking
        if user.role != 'admin' and str(booking.user.id) != current_user_id:
            return jsonify({'error': 'Access denied'}), 403
        
        return jsonify({
            'booking': booking.to_json()
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bookings_bp.route('', methods=['POST'])
@jwt_required()
def create_booking():
    """Create a new booking"""
    try:
        current_user_id = get_jwt_identity()
        user = User.objects(id=current_user_id).first()
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['vehicle_id', 'start_date', 'end_date']
        for field in required_fields:
            if field not in data or not data[field]:
                return jsonify({'error': f'{field} is required'}), 400
        
        # Get vehicle
        vehicle = Vehicle.objects(id=data['vehicle_id']).first()
        if not vehicle:
            return jsonify({'error': 'Vehicle not found'}), 404
        
        if not vehicle.is_available or not vehicle.is_active:
            return jsonify({'error': 'Vehicle is not available'}), 400
        
        # Parse dates
        try:
            start_date = datetime.fromisoformat(data['start_date'].replace('Z', '+00:00'))
            end_date = datetime.fromisoformat(data['end_date'].replace('Z', '+00:00'))
        except ValueError:
            return jsonify({'error': 'Invalid date format. Use ISO format'}), 400
        
        # Validate dates
        if start_date >= end_date:
            return jsonify({'error': 'End date must be after start date'}), 400
        
        if start_date < datetime.utcnow():
            return jsonify({'error': 'Start date cannot be in the past'}), 400
        
        # Check for conflicting bookings
        conflicting_bookings = Booking.objects(
            vehicle=vehicle,
            status__in=['confirmed', 'active'],
            start_date__lt=end_date,
            end_date__gt=start_date
        )
        
        if conflicting_bookings:
            return jsonify({'error': 'Vehicle is not available for the selected dates'}), 400
        
        # Calculate pricing
        total_days = max(1, (end_date - start_date).days)
        daily_rate = vehicle.price_per_day
        subtotal = daily_rate * total_days
        tax_rate = 0.1  # 10% tax
        tax_amount = subtotal * tax_rate
        total_amount = subtotal + tax_amount
        
        # Create booking
        booking = Booking(
            user=user,
            vehicle=vehicle,
            start_date=start_date,
            end_date=end_date,
            pickup_location=data.get('pickup_location', vehicle.location),
            return_location=data.get('return_location', vehicle.location),
            total_days=total_days,
            daily_rate=daily_rate,
            subtotal=subtotal,
            tax_amount=tax_amount,
            total_amount=total_amount,
            special_requests=data.get('special_requests', ''),
            status='pending'
        )
        
        booking.save()
        
        # Mark vehicle as unavailable
        vehicle.is_available = False
        vehicle.save()
        
        return jsonify({
            'message': 'Booking created successfully',
            'booking': booking.to_json()
        }), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bookings_bp.route('/<booking_id>/confirm', methods=['PUT'])
@jwt_required()
@admin_required
def confirm_booking(booking_id):
    """Confirm a booking (Admin only)"""
    try:
        booking = Booking.objects(id=booking_id).first()
        
        if not booking:
            return jsonify({'error': 'Booking not found'}), 404
        
        if booking.status != 'pending':
            return jsonify({'error': 'Only pending bookings can be confirmed'}), 400
        
        booking.status = 'confirmed'
        booking.confirmed_at = datetime.utcnow()
        booking.save()
        
        return jsonify({
            'message': 'Booking confirmed successfully',
            'booking': booking.to_json()
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bookings_bp.route('/<booking_id>/cancel', methods=['PUT'])
@jwt_required()
def cancel_booking(booking_id):
    """Cancel a booking"""
    try:
        current_user_id = get_jwt_identity()
        user = User.objects(id=current_user_id).first()
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        booking = Booking.objects(id=booking_id).first()
        
        if not booking:
            return jsonify({'error': 'Booking not found'}), 404
        
        # Check if user can cancel this booking
        if user.role != 'admin' and str(booking.user.id) != current_user_id:
            return jsonify({'error': 'Access denied'}), 403
        
        data = request.get_json() or {}
        reason = data.get('reason', 'Cancelled by user')
        cancelled_by = 'admin' if user.role == 'admin' else 'user'
        
        if booking.cancel_booking(reason=reason, cancelled_by=cancelled_by):
            booking.save()
            return jsonify({
                'message': 'Booking cancelled successfully',
                'booking': booking.to_json()
            }), 200
        else:
            return jsonify({'error': 'Cannot cancel this booking'}), 400
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bookings_bp.route('/<booking_id>/complete', methods=['PUT'])
@jwt_required()
@admin_required
def complete_booking(booking_id):
    """Mark booking as completed (Admin only)"""
    try:
        booking = Booking.objects(id=booking_id).first()
        
        if not booking:
            return jsonify({'error': 'Booking not found'}), 404
        
        if booking.status != 'active':
            return jsonify({'error': 'Only active bookings can be completed'}), 400
        
        booking.status = 'completed'
        booking.save()
        
        # Make vehicle available again
        if booking.vehicle:
            booking.vehicle.is_available = True
            booking.vehicle.save()
        
        return jsonify({
            'message': 'Booking completed successfully',
            'booking': booking.to_json()
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bookings_bp.route('/availability', methods=['POST'])
def check_availability():
    """Check vehicle availability for given dates"""
    try:
        data = request.get_json()
        
        required_fields = ['vehicle_id', 'start_date', 'end_date']
        for field in required_fields:
            if field not in data or not data[field]:
                return jsonify({'error': f'{field} is required'}), 400
        
        vehicle = Vehicle.objects(id=data['vehicle_id']).first()
        if not vehicle:
            return jsonify({'error': 'Vehicle not found'}), 404
        
        # Parse dates
        try:
            start_date = datetime.fromisoformat(data['start_date'].replace('Z', '+00:00'))
            end_date = datetime.fromisoformat(data['end_date'].replace('Z', '+00:00'))
        except ValueError:
            return jsonify({'error': 'Invalid date format'}), 400
        
        # Check for conflicts
        conflicting_bookings = Booking.objects(
            vehicle=vehicle,
            status__in=['confirmed', 'active'],
            start_date__lt=end_date,
            end_date__gt=start_date
        )
        
        is_available = len(conflicting_bookings) == 0 and vehicle.is_available and vehicle.is_active
        
        return jsonify({
            'available': is_available,
            'vehicle_id': data['vehicle_id'],
            'start_date': data['start_date'],
            'end_date': data['end_date']
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500