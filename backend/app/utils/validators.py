import re
from email_validator import validate_email as email_validate, EmailNotValidError

def validate_email(email):
    """Validate email format"""
    try:
        email_validate(email)
        return True
    except EmailNotValidError:
        return False

def validate_password(password):
    """Validate password strength"""
    if len(password) < 8:
        return False
    
    # Check for at least one letter and one number
    if not re.search(r'[A-Za-z]', password) or not re.search(r'[0-9]', password):
        return False
    
    return True

def validate_phone(phone):
    """Validate phone number format"""
    if not phone:
        return True  # Phone is optional
    
    # Remove all non-digit characters
    phone_digits = re.sub(r'\D', '', phone)
    
    # Check if it's a valid length (10-15 digits)
    return 10 <= len(phone_digits) <= 15

def validate_license_plate(license_plate):
    """Validate license plate format"""
    if not license_plate:
        return False
    
    # Remove spaces and convert to uppercase
    license_plate = license_plate.replace(' ', '').upper()
    
    # Check length (typically 3-10 characters)
    if not 3 <= len(license_plate) <= 10:
        return False
    
    # Check for valid characters (letters and numbers only)
    return re.match(r'^[A-Z0-9]+$', license_plate) is not None

def validate_date_range(start_date, end_date):
    """Validate date range"""
    if not start_date or not end_date:
        return False, "Start date and end date are required"
    
    if start_date >= end_date:
        return False, "End date must be after start date"
    
    return True, "Valid date range"