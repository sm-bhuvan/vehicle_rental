# Vehicle Rental System - Admin Guide

## Overview
This vehicle rental system now includes a comprehensive admin panel that allows administrators to manage the vehicle fleet, including adding, editing, and deleting vehicles.

## Admin Access

### Login Credentials
- **Username**: `admin`
- **Password**: `admin123`

### Access URL
Navigate to `/admin/login` to access the admin portal.

## Admin Features

### 1. Dashboard (`/admin/dashboard`)
- **Overview Statistics**: View total vehicles, available vehicles, total revenue, and total reviews
- **Vehicle Management Table**: See all vehicles with their details
- **Quick Actions**: Add, edit, delete, and view vehicle details
- **Real-time Updates**: All changes are reflected immediately

### 2. Add Vehicle (`/admin/vehicles/add`)
- **Vehicle Information**: Name, type, price per day, rating, reviews count
- **Image Management**: Upload vehicle images via URL
- **Availability Toggle**: Set vehicles as available/unavailable
- **Feature Management**: Add custom features with icons (users, fuel, settings)

### 3. Edit Vehicle (`/admin/vehicles/edit/:id`)
- **Modify Existing Vehicles**: Update all vehicle properties
- **Feature Management**: Add/remove vehicle features
- **Real-time Preview**: See changes before saving

### 4. Vehicle Management
- **Delete Vehicles**: Remove vehicles from the fleet with confirmation
- **View Details**: Quick preview of vehicle information
- **Status Management**: Toggle vehicle availability

## Technical Implementation

### Context Providers
- **AuthContext**: Manages admin authentication state
- **VehicleContext**: Manages vehicle data globally across the application

### Protected Routes
- All admin routes are protected with authentication
- Admin-only routes require admin role verification
- Automatic redirects for unauthorized access

### State Management
- Centralized vehicle data management
- Real-time updates across all components
- Persistent authentication state

## File Structure

```
src/
├── contexts/
│   ├── AuthContext.tsx      # Authentication management
│   └── VehicleContext.tsx   # Vehicle data management
├── components/
│   ├── ProtectedRoute.tsx   # Route protection component
│   └── Header.tsx          # Updated with admin navigation
├── pages/
│   ├── AdminLogin.tsx      # Admin login page
│   ├── AdminDashboard.tsx  # Main admin dashboard
│   ├── AddVehicle.tsx      # Add vehicle form
│   └── EditVehicle.tsx     # Edit vehicle form
└── App.tsx                 # Updated routing with admin routes
```

## Usage Instructions

### For Administrators

1. **Login**: Navigate to `/admin/login` and use the provided credentials
2. **Dashboard**: Access the main admin panel at `/admin/dashboard`
3. **Add Vehicle**: Click "Add Vehicle" button to create new vehicles
4. **Edit Vehicle**: Use the edit button in the vehicle table
5. **Delete Vehicle**: Use the delete button with confirmation
6. **Logout**: Use the logout button to end your session

### For Developers

1. **Authentication**: The system uses a simple username/password system
2. **Context Usage**: Import and use `useAuth()` and `useVehicles()` hooks
3. **Route Protection**: Wrap admin components with `<ProtectedRoute requireAdmin={true}>`
4. **Vehicle Management**: Use the context methods for CRUD operations

## Security Features

- **Protected Routes**: All admin routes require authentication
- **Role-based Access**: Admin-only functionality
- **Session Management**: Persistent login state
- **Route Guards**: Automatic redirects for unauthorized access

## Future Enhancements

- **User Management**: Add/remove admin users
- **Booking Management**: View and manage rental bookings
- **Analytics Dashboard**: Advanced statistics and reporting
- **Image Upload**: Direct file upload instead of URL input
- **Audit Logs**: Track all admin actions
- **API Integration**: Connect to backend services

## Demo Credentials

**Username**: `admin`  
**Password**: `admin123`

**Note**: These are demo credentials for development purposes. In production, implement proper authentication with secure password hashing and database storage.

## Getting Started

1. Start the development server: `npm run dev`
2. Navigate to `/admin/login`
3. Use the demo credentials to log in
4. Explore the admin dashboard and features
5. Try adding, editing, and deleting vehicles

## Support

For technical support or feature requests, please refer to the main project documentation or contact the development team.

