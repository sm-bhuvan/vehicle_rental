from mongoengine import Document, StringField, IntField, FloatField, BooleanField, DateTimeField, ListField, DictField
from datetime import datetime

class Vehicle(Document):
    make = StringField(required=True, max_length=50)
    model = StringField(required=True, max_length=50)
    year = IntField(required=True, min_value=1900)
    vehicle_type = StringField(required=True, choices=['car', 'suv', 'truck', 'motorcycle', 'van', 'luxury'])
    fuel_type = StringField(choices=['petrol', 'diesel', 'electric', 'hybrid'], default='petrol')
    transmission = StringField(choices=['manual', 'automatic'], default='manual')
    seating_capacity = IntField(required=True, min_value=1, max_value=20)
    
    # Pricing
    price_per_day = FloatField(required=True, min_value=0)
    price_per_hour = FloatField(min_value=0)
    
    # Vehicle details
    license_plate = StringField(required=True, unique=True, max_length=15)
    color = StringField(max_length=30)
    mileage = IntField(min_value=0)
    engine_capacity = FloatField(min_value=0)  # in liters
    
    # Features
    features = ListField(StringField(max_length=50))  # AC, GPS, Bluetooth, etc.
    
    # Images
    images = ListField(StringField())  # URLs or file paths
    
    # Location and availability
    location = DictField()  # {address, city, state, coordinates}
    is_available = BooleanField(default=True)
    is_active = BooleanField(default=True)
    
    # Maintenance
    last_service_date = DateTimeField()
    next_service_date = DateTimeField()
    
    # Ratings and reviews
    average_rating = FloatField(min_value=0, max_value=5, default=0)
    total_reviews = IntField(default=0)
    
    # Metadata
    created_at = DateTimeField(default=datetime.utcnow)
    updated_at = DateTimeField(default=datetime.utcnow)
    
    meta = {
        'collection': 'vehicles',
        'indexes': ['make', 'model', 'vehicle_type', 'license_plate', 'is_available', 'location.city']
    }
    
    def to_json(self):
        """Convert vehicle to JSON"""
        return {
            'id': str(self.id),
            'make': self.make,
            'model': self.model,
            'year': self.year,
            'vehicle_type': self.vehicle_type,
            'fuel_type': self.fuel_type,
            'transmission': self.transmission,
            'seating_capacity': self.seating_capacity,
            'price_per_day': self.price_per_day,
            'price_per_hour': self.price_per_hour,
            'license_plate': self.license_plate,
            'color': self.color,
            'mileage': self.mileage,
            'engine_capacity': self.engine_capacity,
            'features': self.features,
            'images': self.images,
            'location': self.location,
            'is_available': self.is_available,
            'is_active': self.is_active,
            'last_service_date': self.last_service_date.isoformat() if self.last_service_date else None,
            'next_service_date': self.next_service_date.isoformat() if self.next_service_date else None,
            'average_rating': self.average_rating,
            'total_reviews': self.total_reviews,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }
    
    def save(self, *args, **kwargs):
        """Override save to update timestamp"""
        self.updated_at = datetime.utcnow()
        return super().save(*args, **kwargs)
    
    def get_display_name(self):
        """Get a display-friendly name for the vehicle"""
        return f"{self.year} {self.make} {self.model}"
    
    def calculate_rental_cost(self, days=None, hours=None):
        """Calculate rental cost based on days or hours"""
        if days and days > 0:
            return self.price_per_day * days
        elif hours and hours > 0 and self.price_per_hour:
            return self.price_per_hour * hours
        return 0