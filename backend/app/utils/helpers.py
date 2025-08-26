import os
import uuid
from datetime import datetime, timedelta
from werkzeug.utils import secure_filename
from PIL import Image
import re

def generate_unique_filename(original_filename, prefix=""):
    """Generate a unique filename to prevent conflicts"""
    ext = original_filename.rsplit('.', 1)[1].lower() if '.' in original_filename else ''
    unique_name = f"{prefix}_{uuid.uuid4().hex}_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
    return f"{unique_name}.{ext}" if ext else unique_name

def allowed_file(filename, allowed_extensions=None):
    """Check if the file extension is allowed"""
    if allowed_extensions is None:
        allowed_extensions = {'png', 'jpg', 'jpeg', 'gif', 'webp'}
    
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in allowed_extensions

def resize_image(image_path, max_width=800, max_height=600, quality=85):
    """Resize image to optimize storage and loading"""
    try:
        with Image.open(image_path) as img:
            # Convert RGBA to RGB if necessary
            if img.mode == 'RGBA':
                img = img.convert('RGB')
            
            # Calculate new dimensions maintaining aspect ratio
            img.thumbnail((max_width, max_height), Image.Resampling.LANCZOS)
            
            # Save optimized image
            img.save(image_path, optimize=True, quality=quality)
            return True
    except Exception as e:
        print(f"Error resizing image: {e}")
        return False

def calculate_age(birth_date):
    """Calculate age from birth date"""
    if not birth_date:
        return None
    
    today = datetime.now().date()
    if isinstance(birth_date, datetime):
        birth_date = birth_date.date()
    
    return today.year - birth_date.year - ((today.month, today.day) < (birth_date.month, birth_date.day))

def format_currency(amount, currency_symbol="$"):
    """Format amount as currency"""
    return f"{currency_symbol}{amount:.2f}"

def calculate_rental_duration(start_date, end_date):
    """Calculate rental duration in days and hours"""
    if isinstance(start_date, str):
        start_date = datetime.fromisoformat(start_date.replace('Z', '+00:00'))
    if isinstance(end_date, str):
        end_date = datetime.fromisoformat(end_date.replace('Z', '+00:00'))
    
    duration = end_date - start_date
    days = duration.days
    hours = duration.seconds // 3600
    
    return {
        'total_days': max(1, days),
        'total_hours': duration.total_seconds() / 3600,
        'days': days,
        'hours': hours
    }

def calculate_rental_cost(vehicle, start_date, end_date, discount_percent=0):
    """Calculate total rental cost with optional discount"""
    duration = calculate_rental_duration(start_date, end_date)
    
    # Use daily rate for rentals longer than 24 hours
    if duration['total_hours'] > 24:
        base_cost = vehicle.price_per_day * duration['total_days']
    else:
        # Use hourly rate if available, otherwise use daily rate
        if vehicle.price_per_hour:
            base_cost = vehicle.price_per_hour * max(1, duration['total_hours'])
        else:
            base_cost = vehicle.price_per_day
    
    # Apply discount
    discount_amount = base_cost * (discount_percent / 100)
    subtotal = base_cost - discount_amount
    
    # Calculate tax (10%)
    tax_rate = 0.1
    tax_amount = subtotal * tax_rate
    total_amount = subtotal + tax_amount
    
    return {
        'base_cost': base_cost,
        'discount_percent': discount_percent,
        'discount_amount': discount_amount,
        'subtotal': subtotal,
        'tax_rate': tax_rate,
        'tax_amount': tax_amount,
        'total_amount': total_amount,
        'duration': duration
    }

def mask_sensitive_data(data, field, visible_chars=4):
    """Mask sensitive data like credit card numbers"""
    if field not in data or not data[field]:
        return data
    
    value = str(data[field])
    if len(value) <= visible_chars:
        data[field] = '*' * len(value)
    else:
        data[field] = '*' * (len(value) - visible_chars) + value[-visible_chars:]
    
    return data

def generate_booking_reference():
    """Generate a unique booking reference number"""
    timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
    random_part = uuid.uuid4().hex[:6].upper()
    return f"VR{timestamp}{random_part}"

def parse_search_query(query):
    """Parse search query and extract filters"""
    filters = {
        'text': query,
        'make': None,
        'model': None,
        'year': None,
        'type': None,
        'min_price': None,
        'max_price': None
    }
    
    # Extract year if present (4 digits)
    year_match = re.search(r'\b(19|20)\d{2}\b', query)
    if year_match:
        filters['year'] = int(year_match.group())
        query = query.replace(year_match.group(), '').strip()
    
    # Extract price range if present
    price_match = re.search(r'\$(\d+)-\$(\d+)', query)
    if price_match:
        filters['min_price'] = float(price_match.group(1))
        filters['max_price'] = float(price_match.group(2))
        query = query.replace(price_match.group(), '').strip()
    
    # Clean up remaining text
    filters['text'] = ' '.join(query.split())
    
    return filters

def format_datetime_for_display(dt, format_type='full'):
    """Format datetime for display in different formats"""
    if not dt:
        return ''
    
    if isinstance(dt, str):
        try:
            dt = datetime.fromisoformat(dt.replace('Z', '+00:00'))
        except:
            return dt
    
    formats = {
        'full': '%B %d, %Y at %I:%M %p',
        'date_only': '%B %d, %Y',
        'time_only': '%I:%M %p',
        'short': '%m/%d/%Y %I:%M %p',
        'iso': '%Y-%m-%dT%H:%M:%S'
    }
    
    return dt.strftime(formats.get(format_type, formats['full']))

def get_vehicle_availability_status(vehicle, start_date=None, end_date=None):
    """Get detailed availability status for a vehicle"""
    from app.models.booking import Booking
    
    status = {
        'is_available': vehicle.is_available and vehicle.is_active,
        'reasons': []
    }
    
    if not vehicle.is_active:
        status['reasons'].append('Vehicle is inactive')
    
    if not vehicle.is_available:
        status['reasons'].append('Vehicle is currently unavailable')
    
    # Check for maintenance schedule
    if vehicle.next_service_date and vehicle.next_service_date <= datetime.utcnow():
        status['is_available'] = False
        status['reasons'].append('Vehicle is due for maintenance')
    
    # Check for conflicting bookings if dates provided
    if start_date and end_date and vehicle.is_available:
        if isinstance(start_date, str):
            start_date = datetime.fromisoformat(start_date.replace('Z', '+00:00'))
        if isinstance(end_date, str):
            end_date = datetime.fromisoformat(end_date.replace('Z', '+00:00'))
        
        conflicting_bookings = Booking.objects(
            vehicle=vehicle,
            status__in=['confirmed', 'active'],
            start_date__lt=end_date,
            end_date__gt=start_date
        )
        
        if conflicting_bookings:
            status['is_available'] = False
            status['reasons'].append(f'Vehicle is booked from {conflicting_bookings[0].start_date.strftime("%m/%d/%Y")} to {conflicting_bookings[0].end_date.strftime("%m/%d/%Y")}')
    
    return status

def paginate_results(query_set, page=1, per_page=20):
    """Paginate query results"""
    total = query_set.count()
    offset = (page - 1) * per_page
    items = query_set.skip(offset).limit(per_page)
    
    return {
        'items': list(items),
        'total': total,
        'page': page,
        'per_page': per_page,
        'total_pages': (total + per_page - 1) // per_page,
        'has_next': page * per_page < total,
        'has_prev': page > 1
    }

def sanitize_filename(filename):
    """Sanitize filename for safe storage"""
    # Remove or replace dangerous characters
    filename = secure_filename(filename)
    
    # Additional sanitization
    filename = re.sub(r'[^\w\s-.]', '', filename)
    filename = re.sub(r'[-\s]+', '-', filename)
    
    return filename.strip('-')

def validate_date_range(start_date, end_date, min_rental_hours=1):
    """Validate rental date range"""
    errors = []
    
    try:
        if isinstance(start_date, str):
            start_date = datetime.fromisoformat(start_date.replace('Z', '+00:00'))
        if isinstance(end_date, str):
            end_date = datetime.fromisoformat(end_date.replace('Z', '+00:00'))
    except ValueError:
        errors.append('Invalid date format')
        return False, errors
    
    # Check if start date is in the past
    if start_date < datetime.utcnow():
        errors.append('Start date cannot be in the past')
    
    # Check if end date is after start date
    if end_date <= start_date:
        errors.append('End date must be after start date')
    
    # Check minimum rental duration
    duration = end_date - start_date
    if duration.total_seconds() / 3600 < min_rental_hours:
        errors.append(f'Minimum rental duration is {min_rental_hours} hour(s)')
    
    return len(errors) == 0, errors

def create_response(data=None, message=None, status='success', status_code=200):
    """Create standardized API response"""
    response = {
        'status': status,
        'timestamp': datetime.utcnow().isoformat()
    }
    
    if message:
        response['message'] = message
    
    if data is not None:
        response['data'] = data
    
    return response, status_code