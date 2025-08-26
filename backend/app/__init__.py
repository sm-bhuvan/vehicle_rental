from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from mongoengine import connect
import os
from dotenv import load_dotenv

load_dotenv()

def create_app():
    app = Flask(__name__)
    
    # Configuration
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-secret-key')
    app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'jwt-secret-key')
    app.config['UPLOAD_FOLDER'] = os.getenv('UPLOAD_FOLDER', 'app/static/uploads')
    app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size
    
    # Initialize extensions
    CORS(app, origins=["http://localhost:3000"])  # React development server
    jwt = JWTManager(app)
    
    # MongoDB connection
    mongodb_uri = os.getenv('MONGODB_URI', 'mongodb://localhost:27017/vehicle_rental')
    connect(db='vehicle_rental', host=mongodb_uri)
    
    # Create upload directory if it doesn't exist
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
    
    # Register blueprints
    from app.routes.auth import auth_bp
    from app.routes.users import users_bp
    from app.routes.vehicles import vehicles_bp
    from app.routes.bookings import bookings_bp
    from app.routes.payments import payments_bp
    
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(users_bp, url_prefix='/api/users')
    app.register_blueprint(vehicles_bp, url_prefix='/api/vehicles')
    app.register_blueprint(bookings_bp, url_prefix='/api/bookings')
    app.register_blueprint(payments_bp, url_prefix='/api/payments')
    
    # Error handlers
    @app.errorhandler(404)
    def not_found(error):
        return {'error': 'Not found'}, 404
    
    @app.errorhandler(500)
    def internal_error(error):
        return {'error': 'Internal server error'}, 500
    
    # Health check endpoint
    @app.route('/api/health')
    def health_check():
        return {'status': 'healthy', 'message': 'Vehicle Rental API is running'}
    
    return app