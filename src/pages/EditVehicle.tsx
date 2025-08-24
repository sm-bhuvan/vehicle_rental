import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useVehicles } from '../contexts/VehicleContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Switch } from '../components/ui/switch';
import { Badge } from '../components/ui/badge';
import { X, Plus, ArrowLeft, Save } from 'lucide-react';
import { VehicleFeature } from '../types/vehicle';

const EditVehicle = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { getVehicleById, updateVehicle } = useVehicles();
  const [isLoading, setIsLoading] = useState(false);
  const [vehicle, setVehicle] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    pricePerDay: '',
    rating: '5.0',
    reviews: '0',
    available: true,
    image: '',
    features: [] as VehicleFeature[]
  });

  const [newFeature, setNewFeature] = useState({
    icon: 'users' as const,
    label: ''
  });

  const iconOptions = [
    { value: 'users', label: 'Users' },
    { value: 'fuel', label: 'Fuel' },
    { value: 'settings', label: 'Settings' }
  ];

  useEffect(() => {
    if (id) {
      const vehicleData = getVehicleById(parseInt(id));
      if (vehicleData) {
        setVehicle(vehicleData);
        setFormData({
          name: vehicleData.name,
          type: vehicleData.type,
          pricePerDay: vehicleData.pricePerDay.toString(),
          rating: vehicleData.rating.toString(),
          reviews: vehicleData.reviews.toString(),
          available: vehicleData.available,
          image: vehicleData.image,
          features: [...vehicleData.features]
        });
      } else {
        navigate('/admin/dashboard');
      }
    }
  }, [id, getVehicleById, navigate]);

  const handleInputChange = (field: string, value: string | number | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddFeature = () => {
    if (newFeature.label.trim()) {
      setFormData(prev => ({
        ...prev,
        features: [...prev.features, { ...newFeature }]
      }));
      setNewFeature({ icon: 'users', label: '' });
    }
  };

  const handleRemoveFeature = (index: number) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehicle || !id) return;
    
    setIsLoading(true);

    try {
      const updatedVehicle = {
        name: formData.name,
        type: formData.type,
        pricePerDay: parseFloat(formData.pricePerDay),
        rating: parseFloat(formData.rating),
        reviews: parseInt(formData.reviews),
        available: formData.available,
        image: formData.image || '/placeholder.svg',
        features: formData.features
      };

      updateVehicle(parseInt(id), updatedVehicle);
      navigate('/admin/dashboard');
    } catch (error) {
      console.error('Error updating vehicle:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!vehicle) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="glass-card border-b border-border/20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
                             <Button
                 onClick={() => navigate('/admin/dashboard')}
                 variant="outline"
                 className="border-border text-foreground hover:bg-muted"
               >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </div>
                         <div>
               <h1 className="text-xl font-bold text-foreground">Edit Vehicle</h1>
               <p className="text-sm text-muted-foreground">{vehicle.name}</p>
             </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card className="glass-card border-0">
                         <CardHeader>
               <CardTitle className="text-foreground">Edit Vehicle Information</CardTitle>
               <CardDescription>
                 Update the details for {vehicle.name}
               </CardDescription>
             </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                     <div className="space-y-2">
                     <Label htmlFor="name" className="text-foreground">Vehicle Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="e.g., BMW M3 Competition"
                      className="bg-input border-border focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  
                                     <div className="space-y-2">
                     <Label htmlFor="type" className="text-foreground">Vehicle Type</Label>
                    <Input
                      id="type"
                      value={formData.type}
                      onChange={(e) => handleInputChange('type', e.target.value)}
                      placeholder="e.g., Luxury Sedan"
                      className="bg-input border-border focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                     <div className="space-y-2">
                     <Label htmlFor="pricePerDay" className="text-foreground">Price per Day ($)</Label>
                    <Input
                      id="pricePerDay"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.pricePerDay}
                      onChange={(e) => handleInputChange('pricePerDay', e.target.value)}
                      placeholder="189"
                      className="bg-input border-border focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  
                                     <div className="space-y-2">
                     <Label htmlFor="rating" className="text-foreground">Rating</Label>
                    <Input
                      id="rating"
                      type="number"
                      min="0"
                      max="5"
                      step="0.1"
                      value={formData.rating}
                      onChange={(e) => handleInputChange('rating', e.target.value)}
                      placeholder="4.8"
                      className="bg-input border-border focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  
                                     <div className="space-y-2">
                     <Label htmlFor="reviews" className="text-foreground">Reviews Count</Label>
                    <Input
                      id="reviews"
                      type="number"
                      min="0"
                      value={formData.reviews}
                      onChange={(e) => handleInputChange('reviews', e.target.value)}
                      placeholder="124"
                      className="bg-input border-border focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                                 <div className="space-y-2">
                   <Label htmlFor="image" className="text-foreground">Image URL</Label>
                  <Input
                    id="image"
                    value={formData.image}
                    onChange={(e) => handleInputChange('image', e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    className="bg-input border-border focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-sm text-gray-400">Leave empty to use placeholder image</p>
                </div>

                {/* Availability */}
                                 <div className="flex items-center space-x-2">
                   <Switch
                     id="available"
                     checked={formData.available}
                     onCheckedChange={(checked) => handleInputChange('available', checked)}
                   />
                   <Label htmlFor="available" className="text-foreground">Available for rent</Label>
                 </div>

                {/* Features */}
                                 <div className="space-y-4">
                   <Label className="text-foreground">Vehicle Features</Label>
                  
                  {/* Add Feature Form */}
                  <div className="flex space-x-2">
                                         <select
                       value={newFeature.icon}
                       onChange={(e) => setNewFeature(prev => ({ ...prev, icon: e.target.value as any }))}
                       className="bg-input border border-border rounded px-3 py-2 text-foreground"
                     >
                      {iconOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <Input
                      value={newFeature.label}
                      onChange={(e) => setNewFeature(prev => ({ ...prev, label: e.target.value }))}
                      placeholder="e.g., 4 Seats"
                      className="flex-1 bg-input border-border focus:ring-2 focus:ring-blue-500"
                    />
                    <Button
                      type="button"
                      onClick={handleAddFeature}
                      size="sm"
                      className="bg-blue-500 hover:bg-blue-600"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Features List */}
                  <div className="flex flex-wrap gap-2">
                    {formData.features.map((feature, index) => (
                                             <Badge
                         key={index}
                         variant="outline"
                         className="border-border text-foreground flex items-center space-x-1"
                       >
                        <span>{feature.label}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveFeature(index)}
                          className="ml-1 hover:text-red-400"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex space-x-4 pt-4">
                  <Button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Updating Vehicle...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Update Vehicle
                      </>
                    )}
                  </Button>
                  
                                     <Button
                     type="button"
                     onClick={() => navigate('/admin/dashboard')}
                     variant="outline"
                     className="flex-1 border-border text-foreground hover:bg-muted"
                   >
                     Cancel
                   </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default EditVehicle;
