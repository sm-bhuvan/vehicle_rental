import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useVehicles } from '../contexts/VehicleContext';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { 
  Plus, 
  LogOut, 
  Car, 
  Users, 
  DollarSign, 
  TrendingUp,
  Edit,
  Trash2,
  Eye
} from 'lucide-react';
import { Vehicle } from '../types/vehicle';

const AdminDashboard = () => {
  const { logout, user } = useAuth();
  const { vehicles, deleteVehicle } = useVehicles();
  const navigate = useNavigate();
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleAddVehicle = () => {
    navigate('/admin/vehicles/add');
  };

  const handleEditVehicle = (vehicle: Vehicle) => {
    navigate(`/admin/vehicles/edit/${vehicle.id}`);
  };

  const handleDeleteVehicle = (vehicle: Vehicle) => {
    if (window.confirm(`Are you sure you want to delete ${vehicle.name}?`)) {
      deleteVehicle(vehicle.id);
    }
  };

  const handleViewVehicle = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
  };

  const totalRevenue = vehicles.reduce((sum, vehicle) => sum + vehicle.pricePerDay, 0);
  const availableVehicles = vehicles.filter(v => v.available).length;
  const totalReviews = vehicles.reduce((sum, vehicle) => sum + vehicle.reviews, 0);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="glass-card border-b border-border/20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-2 rounded-lg">
                <Car className="h-6 w-6 text-white" />
              </div>
                              <div>
                  <h1 className="text-xl font-bold text-foreground">Admin Dashboard</h1>
                  <p className="text-sm text-muted-foreground">Welcome back, {user?.username}</p>
                </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                onClick={handleAddVehicle}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Vehicle
              </Button>
                                         <Button
                             onClick={handleLogout}
                             variant="outline"
                             className="border-border text-foreground hover:bg-muted"
                           >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="glass-card border-0">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="bg-blue-500/20 p-3 rounded-lg">
                  <Car className="h-6 w-6 text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Total Vehicles</p>
                  <p className="text-2xl font-bold text-white">{vehicles.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-0">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="bg-green-500/20 p-3 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Available</p>
                  <p className="text-2xl font-bold text-white">{availableVehicles}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-0">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="bg-purple-500/20 p-3 rounded-lg">
                  <DollarSign className="h-6 w-6 text-purple-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Total Revenue</p>
                  <p className="text-2xl font-bold text-white">${totalRevenue}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-0">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="bg-orange-500/20 p-3 rounded-lg">
                  <Users className="h-6 w-6 text-orange-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Total Reviews</p>
                  <p className="text-2xl font-bold text-white">{totalReviews}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Vehicles Table */}
        <Card className="glass-card border-0">
          <CardHeader>
                      <CardTitle className="text-foreground">Vehicle Management</CardTitle>
          <CardDescription>
            Manage your fleet of vehicles - add, edit, or remove vehicles as needed
          </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-3 px-4 text-muted-foreground font-medium">Vehicle</th>
                    <th className="text-left py-3 px-4 text-muted-foreground font-medium">Type</th>
                    <th className="text-left py-3 px-4 text-muted-foreground font-medium">Price/Day</th>
                    <th className="text-left py-3 px-4 text-muted-foreground font-medium">Status</th>
                    <th className="text-left py-3 px-4 text-muted-foreground font-medium">Rating</th>
                    <th className="text-left py-3 px-4 text-muted-foreground font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {vehicles.map((vehicle) => (
                    <tr key={vehicle.id} className="border-b border-white/5 hover:bg-white/5">
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-3">
                          <img
                            src={vehicle.image}
                            alt={vehicle.name}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                                                     <div>
                             <p className="font-medium text-foreground">{vehicle.name}</p>
                             <p className="text-sm text-muted-foreground">{vehicle.reviews} reviews</p>
                           </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-muted-foreground">{vehicle.type}</td>
                      <td className="py-4 px-4 text-muted-foreground">${vehicle.pricePerDay}</td>
                      <td className="py-4 px-4">
                        <Badge 
                          variant={vehicle.available ? "default" : "secondary"}
                          className={vehicle.available ? "bg-green-500" : "bg-gray-500"}
                        >
                          {vehicle.available ? 'Available' : 'Unavailable'}
                        </Badge>
                      </td>
                      <td className="py-4 px-4 text-muted-foreground">{vehicle.rating} ⭐</td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-2">
                                                     <Button
                             size="sm"
                             variant="outline"
                             onClick={() => handleViewVehicle(vehicle)}
                             className="border-border text-foreground hover:bg-muted"
                           >
                            <Eye className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditVehicle(vehicle)}
                            className="border-blue-500/20 text-blue-400 hover:bg-blue-500/10"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteVehicle(vehicle)}
                            className="border-red-500/20 text-red-400 hover:bg-red-500/10"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Vehicle Details Modal */}
      {selectedVehicle && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <Card className="glass-card border-0 max-w-md w-full">
            <CardHeader>
              <CardTitle className="text-foreground">Vehicle Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <img
                src={selectedVehicle.image}
                alt={selectedVehicle.name}
                className="w-full h-48 object-cover rounded-lg"
              />
              <div className="space-y-2">
                <p className="text-foreground font-medium">{selectedVehicle.name}</p>
                <p className="text-muted-foreground">{selectedVehicle.type}</p>
                <p className="text-muted-foreground">${selectedVehicle.pricePerDay}/day</p>
                <p className="text-muted-foreground">{selectedVehicle.rating} ⭐ ({selectedVehicle.reviews} reviews)</p>
                <div className="flex flex-wrap gap-2">
                  {selectedVehicle.features.map((feature, index) => (
                    <Badge key={index} variant="outline" className="border-border text-foreground">
                      {feature.label}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="flex space-x-2">
                <Button
                  onClick={() => handleEditVehicle(selectedVehicle)}
                  className="flex-1 bg-blue-500 hover:bg-blue-600"
                >
                  Edit Vehicle
                </Button>
                                  <Button
                    onClick={() => setSelectedVehicle(null)}
                    variant="outline"
                    className="flex-1 border-border text-foreground hover:bg-muted"
                  >
                    Close
                  </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
