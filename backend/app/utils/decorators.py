from functools import wraps
from flask import jsonify
from flask_jwt_extended import get_jwt_identity
from app.models.user import User

def admin_required(f):
    """Decorator to require admin role"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        try:
            current_user_id = get_jwt_identity()
            user = User.objects(id=current_user_id).first()
            
            if not user:
                return jsonify({'error': 'User not found'}), 404
            
            if user.role != 'admin':
                return jsonify({'error': 'Admin access required'}), 403
            
            return f(*args, **kwargs)
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    
    return decorated_function

def active_user_required(f):
    """Decorator to require active user"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        try:
            current_user_id = get_jwt_identity()
            user = User.objects(id=current_user_id).first()
            
            if not user:
                return jsonify({'error': 'User not found'}), 404
            
            if not user.is_active:
                return jsonify({'error': 'Account is deactivated'}), 403
            
            return f(*args, **kwargs)
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    
    return decorated_function