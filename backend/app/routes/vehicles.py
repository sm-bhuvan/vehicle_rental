from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.user import User
from app.models.vehicle import Vehicle
from app.utils.decorators import admin_required
from werkzeug.utils import secure_filename
import os
from datetime import datetime

vehicles_bp = Blueprint('vehicles', __name__)

@vehicles_bp.route('', methods=['GET'])
def get_vehicles():
    """Get all available vehicles with optional filtering"""
    try:
        # Get query parameters
        vehicle_type = request.args.get('type')
        city = request.args.get('city')
        min_price = request.args.get('min_price', type=float)
        max_price = request.args.get('max_price', type=float)
        seating_capacity = request.args.get('seating_capacity', type=int)
        available_only = request.args.get('available_only', 'true').lower() == 'true'
        
        # Build query
        query = {}
        if available_only:
            query['is_available'] = True
            query['is_active'] = True
        
        if vehicle_type:
            query['vehicle_type'] = vehicle_type
            
        if city:
            query['location.city'] = {'$regex': city, '$options': 'i'}
            
        if min_price is not None:
            query['price_per_day'] = {'$gte': min_price}
            
        if max_price is not None:
            if 'price_per_day' in query:
                query['price_per_day']['$lte'] = max_price
            else:
                query['price_per_day'] = {'$lte': max_price}
                
        if seating_capacity:
            query['seating_capacity'] = {'$gte': seating_capacity}
        
        # Get vehicles
        vehicles = Vehicle.objects(__raw__=query).order_by('-created_at')
        
        return jsonify({
            'vehicles': [vehicle.to_json() for vehicle in vehicles],
            'count': len(vehicles)
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@vehicles_bp.route('/<vehicle_id>', methods=['GET'])
def get_vehicle(vehicle_id):
    """Get a specific vehicle by ID"""
    try:
        vehicle = Vehicle.objects(id=vehicle_id).first()
        
        if not vehicle:
            return jsonify({'error': 'Vehicle not found'}), 404
        
        return jsonify({
            'vehicle': vehicle.to_json()
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@vehicles_bp.route('/search', methods=['GET'])
def search_vehicles():
    """Search vehicles by make, model, or other criteria"""
    try:
        search_query = request.args.get('q', '')
        
        if not search_query:
            return jsonify({'error': 'Search query is required'}), 400
        
        # Create search filter
        search_filter = {
            '$or': [
                {'make': {'$regex': search_query, '$options': 'i'}},
                {'model': {'$regex': search_query, '$options': 'i'}},
                {'color': {'$regex': search_query, '$options': 'i'}},
                {'features': {'$in': [{'$regex': search_query, '$options': 'i'}]}}
            ],
            'is_active': True
        }
        
        vehicles = Vehicle.objects(__raw__=search_filter).order_by('-created_at')
        
        return jsonify({
            'vehicles': [vehicle.to_json() for vehicle in vehicles],
            'count': len(vehicles),
            'query': search_query
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@vehicles_bp.route('', methods=['POST'])
@jwt_required()
@admin_required
def create_vehicle():
    """Create a new vehicle (Admin only)"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['make', 'model', 'year', 'vehicle_type', 'seating_capacity', 'price_per_day', 'license_plate']
        for field in required_fields:
            if field not in data or data[field] is None:
                return jsonify({'error': f'{field} is required'}), 400
        
        # Check if license plate already exists
        if Vehicle.objects(license_plate=data['license_plate']).first():
            return jsonify({'error': 'License plate already exists'}), 409
        
        # Create vehicle
        vehicle = Vehicle(
            make=data['make'],
            model=data['model'],
            year=data['year'],
            vehicle_type=data['vehicle_type'],
            fuel_type=data.get('fuel_type', 'petrol'),
            transmission=data.get('transmission', 'manual'),
            seating_capacity=data['seating_capacity'],
            price_per_day=data['price_per_day'],
            price_per_hour=data.get('price_per_hour'),
            license_plate=data['license_plate'],
            color=data.get('color'),
            mileage=data.get('mileage', 0),
            engine_capacity=data.get('engine_capacity'),
            features=data.get('features', []),
            location=data.get('location', {}),
            is_available=data.get('is_available', True)
        )
        
        vehicle.save()
        
        return jsonify({
            'message': 'Vehicle created successfully',
            'vehicle': vehicle.to_json()
        }), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@vehicles_bp.route('/<vehicle_id>', methods=['PUT'])
@jwt_required()
@admin_required
def update_vehicle(vehicle_id):
    """Update a vehicle (Admin only)"""
    try:
        vehicle = Vehicle.objects(id=vehicle_id).first()
        
        if not vehicle:
            return jsonify({'error': 'Vehicle not found'}), 404
        
        data = request.get_json()
        
        # Update fields
        updateable_fields = [
            'make', 'model', 'year', 'vehicle_type', 'fuel_type', 'transmission',
            'seating_capacity', 'price_per_day', 'price_per_hour', 'color',
            'mileage', 'engine_capacity', 'features', 'location', 'is_available',
            'is_active', 'last_service_date', 'next_service_date'
        ]
        
        for field in updateable_fields:
            if field in data:
                if field in ['last_service_date', 'next_service_date'] and data[field]:
                    setattr(vehicle, field, datetime.fromisoformat(data[field]))
                else:
                    setattr(vehicle, field, data[field])
        
        vehicle.save()
        
        return jsonify({
            'message': 'Vehicle updated successfully',
            'vehicle': vehicle.to_json()
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@vehicles_bp.route('/<vehicle_id>', methods=['DELETE'])
@jwt_required()
@admin_required
def delete_vehicle(vehicle_id):
    """Delete a vehicle (Admin only)"""
    try:
        vehicle = Vehicle.objects(id=vehicle_id).first()
        
        if not vehicle:
            return jsonify({'error': 'Vehicle not found'}), 404
        
        # Soft delete - just mark as inactive
        vehicle.is_active = False
        vehicle.is_available = False
        vehicle.save()
        
        return jsonify({
            'message': 'Vehicle deleted successfully'
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@vehicles_bp.route('/<vehicle_id>/upload-image', methods=['POST'])
@jwt_required()
@admin_required
def upload_vehicle_image(vehicle_id):
    """Upload vehicle image (Admin only)"""
    try:
        vehicle = Vehicle.objects(id=vehicle_id).first()
        
        if not vehicle:
            return jsonify({'error': 'Vehicle not found'}), 404
        
        if 'image' not in request.files:
            return jsonify({'error': 'No image file provided'}), 400
        
        file = request.files['image']
        
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        if file and allowed_file(file.filename):
            filename = secure_filename(f"{vehicle_id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{file.filename}")
            file_path = os.path.join(current_app.config['UPLOAD_FOLDER'], filename)
            file.save(file_path)
            
            # Add image path to vehicle
            if not vehicle.images:
                vehicle.images = []
            vehicle.images.append(f"/static/uploads/{filename}")
            vehicle.save()
            
            return jsonify({
                'message': 'Image uploaded successfully',
                'image_url': f"/static/uploads/{filename}"
            }), 200
        else:
            return jsonify({'error': 'Invalid file type'}), 400
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

def allowed_file(filename):
    """Check if file extension is allowed"""
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS