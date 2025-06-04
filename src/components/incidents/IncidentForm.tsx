// Updated IncidentForm.tsx with new location fields and map integration
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Camera, X, AlertTriangle, Image } from 'lucide-react';
import Input from '../common/Input';
import Select from '../common/Select';
import Textarea from '../common/Textarea';
import Button from '../common/Button';
import Card from '../common/Card';
import Map from '../common/Map';
import TermsModal from '../common/TermsModal';
import { useAuth } from '../../contexts/AuthContext';
import { useIncidents } from '../../contexts/IncidentContext';
import { Incident, IncidentType, IncidentSeverity } from '../../types/incident.types';
import { locationData } from '../../data/locationData';
import toast from 'react-hot-toast';
import { supabase } from '../../lib/supabase';

interface IncidentFormProps {
  editMode?: boolean;
  incident?: Incident;
  onSuccess?: () => void;
}

const IncidentForm: React.FC<IncidentFormProps> = ({ 
  editMode = false, 
  incident,
  onSuccess
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { reportIncident, updateIncident } = useIncidents();
  const [isLoading, setIsLoading] = useState(false);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locating, setLocating] = useState(false);
  const [images, setImages] = useState<string[]>(incident?.images?.map(img => img.url) || []);
  const [showTerms, setShowTerms] = useState(!editMode);
  const [selectedMunicipality, setSelectedMunicipality] = useState(incident?.location?.municipality || '');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    title: incident?.title || '',
    description: incident?.description || '',
    type: incident?.type?.name || 'fire' as IncidentType,
    severity: incident?.severity || 'medium' as IncidentSeverity,
    purok: incident?.location?.purok || '',
    barangay: incident?.location?.barangay || '',
    municipality: incident?.location?.municipality || '',
    locationLatitude: incident?.location?.latitude || 0,
    locationLongitude: incident?.location?.longitude || 0,
  });

  // Get user's location
  const getGeolocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }
    setLocating(true);
    const options = {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 0
    };
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        // Validate if coordinates are within reasonable bounds for Agusan del Sur
        const isWithinBounds = 
          latitude >= 7.0 && latitude <= 10.0 &&
          longitude >= 124.5 && longitude <= 127.0;
        if (!isWithinBounds) {
          toast.error('Detected location seems to be outside Agusan del Sur. Please verify the location.');
        }
        setUserLocation({ latitude, longitude });
        setFormData(prev => ({
          ...prev,
          locationLatitude: latitude,
          locationLongitude: longitude
        }));
        setLocating(false);
        if (accuracy > 100) {
          toast.error(`Location detected with low accuracy (${Math.round(accuracy)}m). Please verify the location on the map.`);
        } else {
          toast.success('Location detected successfully');
        }
      },
      (error: GeolocationPositionError) => {
        console.error('Error getting location:', error);
        let errorMessage = 'Failed to get your location. ';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage += 'Please enable location services in your browser settings.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage += 'Location information is unavailable.';
            break;
          case error.TIMEOUT:
            errorMessage += 'Location request timed out.';
            break;
          default:
            errorMessage += 'Please enter location manually.';
        }
        toast.error(errorMessage);
        setLocating(false);
      },
      options
    );
  };

  // Handle municipality change
  const handleMunicipalityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const municipality = e.target.value;
    setSelectedMunicipality(municipality);
    setFormData(prev => ({
      ...prev,
      municipality,
      barangay: '' // Reset barangay when municipality changes
    }));
  };

  // Get barangays for selected municipality
  const getBarangays = () => {
    return selectedMunicipality ? locationData.barangays[selectedMunicipality as keyof typeof locationData.barangays] || [] : [];
  };

  // Get incident type ID
  const getIncidentTypeId = async (typeName: IncidentType) => {
    const { data, error } = await supabase
      .from('incident_types')
      .select('id')
      .eq('name', typeName)
      .single();

    if (error) throw error;
    return data.id;
  };

  // Form validation
  const validateForm = () => {
    const errors: Record<string, string> = {};
    let isValid = true;
    
    if (!formData.title.trim()) {
      errors.title = 'Title is required';
      isValid = false;
    }
    
    if (!formData.description.trim()) {
      errors.description = 'Description is required';
      isValid = false;
    }
    
    if (!formData.purok.trim()) {
      errors.purok = 'Purok is required';
      isValid = false;
    }
    
    if (!formData.municipality) {
      errors.municipality = 'Municipality is required';
      isValid = false;
    }
    
    if (!formData.barangay) {
      errors.barangay = 'Barangay is required';
      isValid = false;
    }
    
    if (formData.locationLatitude === 0 && formData.locationLongitude === 0) {
      errors.location = 'Location coordinates are required';
      isValid = false;
    }
    
    setFormErrors(errors);
    return isValid;
  };

  // Form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      const weatherInfo = {
        temperature: 28,
        condition: 'Partly Cloudy',
        humidity: 75,
        windSpeed: 12
      };

      if (editMode && incident) {
        await updateIncident(incident.id, {
          title: formData.title,
          description: formData.description,
          type_id: incident.type?.id || '',
          severity: formData.severity as IncidentSeverity,
          location: {
            id: incident.location?.id || '',
            purok: formData.purok,
            barangay: formData.barangay,
            municipality: formData.municipality,
            latitude: formData.locationLatitude,
            longitude: formData.locationLongitude,
            created_at: incident.location?.created_at || new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          weather_info: weatherInfo
        });
        
        if (onSuccess) {
          onSuccess();
        } else {
          navigate(`/incidents/${incident.id}`);
        }
      } else {
        if (!user) {
          toast.error('You must be logged in to report an incident');
          return;
        }

        // Get the type_id for the selected incident type
        const type_id = await getIncidentTypeId(formData.type);
        
        const newIncident = await reportIncident({
          title: formData.title,
          description: formData.description,
          type_id,
          type: { 
            id: type_id, 
            name: formData.type,
            description: '',
            icon: 'alert-circle'
          },
          severity: formData.severity as IncidentSeverity,
          status: 'reported',
          location: {
            id: '',  // Will be generated by the database
            purok: formData.purok,
            barangay: formData.barangay,
            municipality: formData.municipality,
            latitude: formData.locationLatitude,
            longitude: formData.locationLongitude,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          location_id: '', // Will be set after location creation
          reporter_id: user.id,
          reporter: { 
            id: user.id, 
            full_name: user.full_name,
            role: user.role || 'user'
          },
          weather_info: weatherInfo
        });

        // Upload images if any
        if (images.length > 0) {
          const uploadPromises = images.map(async (imageData) => {
            // Convert base64 to blob
            const base64Data = imageData.split(',')[1];
            const byteCharacters = atob(base64Data);
            const byteArrays = [];
            for (let offset = 0; offset < byteCharacters.length; offset += 512) {
              const slice = byteCharacters.slice(offset, offset + 512);
              const byteNumbers = new Array(slice.length);
              for (let i = 0; i < slice.length; i++) {
                byteNumbers[i] = slice.charCodeAt(i);
              }
              const byteArray = new Uint8Array(byteNumbers);
              byteArrays.push(byteArray);
            }
            const blob = new Blob(byteArrays, { type: 'image/jpeg' });

            // Upload to Supabase Storage
            const fileName = `${newIncident.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`;
            const { data: uploadData, error: uploadError } = await supabase.storage
              .from('incident-images')
              .upload(fileName, blob);

            if (uploadError) throw uploadError;

            // Get public URL
            const { data: { publicUrl } } = supabase.storage
              .from('incident-images')
              .getPublicUrl(fileName);

            // Save to incident_images table
            const { error: dbError } = await supabase
              .from('incident_images')
              .insert({
                incident_id: newIncident.id,
                url: publicUrl,
                uploaded_by: user.id
              });

            if (dbError) throw dbError;
          });

          await Promise.all(uploadPromises);
        }
        
        navigate(`/incidents/${newIncident.id}`);
      }
    } catch (error) {
      console.error('Error submitting incident:', error);
      toast.error('Failed to submit incident');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle terms acceptance
  const handleAcceptTerms = () => {
    setShowTerms(false);
  };

  return (
    <>
      <Card>
        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-white mb-4">
                {editMode ? 'Edit Incident Details' : 'Report New Incident'}
              </h3>
              <p className="text-dark-300 text-sm mb-6">
                {editMode 
                  ? 'Update the incident information below' 
                  : 'Please provide accurate information about the incident'}
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Input
                  label="Incident Title"
                  name="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Brief description of the incident"
                  error={formErrors.title}
                />
                
                <Select
                  label="Incident Type"
                  name="type"
                  value={formData.type}
                  onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as IncidentType }))}
                  options={[
                    { value: 'fire', label: 'Fire' },
                    { value: 'flood', label: 'Flood' },
                    { value: 'earthquake', label: 'Earthquake' },
                    { value: 'storm', label: 'Storm' },
                    { value: 'medical', label: 'Medical Emergency' },
                    { value: 'infrastructure', label: 'Infrastructure Damage' },
                    { value: 'other', label: 'Other' }
                  ]}
                />
                
                <Select
                  label="Severity Level"
                  name="severity"
                  value={formData.severity}
                  onChange={(e) => setFormData(prev => ({ ...prev, severity: e.target.value as IncidentSeverity }))}
                  options={[
                    { value: 'low', label: 'Low - Minor incident' },
                    { value: 'medium', label: 'Medium - Moderate concern' },
                    { value: 'high', label: 'High - Significant threat' },
                    { value: 'critical', label: 'Critical - Immediate danger' }
                  ]}
                />
                
                <div className="mb-4">
                  <label className="block mb-2 text-sm font-medium text-dark-200">
                    Location Details
                  </label>
                  <div className="space-y-4">
                    <Select
                      name="municipality"
                      value={formData.municipality}
                      onChange={handleMunicipalityChange}
                      options={[
                        { value: '', label: 'Select Municipality' },
                        ...locationData.municipalities.map(m => ({ value: m, label: m }))
                      ]}
                      error={formErrors.municipality}
                    />
                    
                    <Select
                      name="barangay"
                      value={formData.barangay}
                      onChange={(e) => setFormData(prev => ({ ...prev, barangay: e.target.value }))}
                      options={[
                        { value: '', label: 'Select Barangay' },
                        ...getBarangays().map(b => ({ value: b, label: b }))
                      ]}
                      disabled={!selectedMunicipality}
                      error={formErrors.barangay}
                    />

                    <Input
                      name="purok"
                      value={formData.purok}
                      onChange={(e) => setFormData(prev => ({ ...prev, purok: e.target.value }))}
                      placeholder="Enter Purok"
                      error={formErrors.purok}
                    />
                    
                    <div className="flex gap-3">
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={getGeolocation}
                        leftIcon={<MapPin size={16} />}
                        isLoading={locating}
                      >
                        {locating ? 'Detecting...' : 'Detect Location'}
                      </Button>
                      
                      {userLocation && (
                        <p className="text-xs text-dark-300 my-auto">
                          Lat: {userLocation.latitude.toFixed(6)}, Lng: {userLocation.longitude.toFixed(6)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <Textarea
                  label="Detailed Description"
                  name="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Provide as much detail as possible about the incident"
                  rows={5}
                  error={formErrors.description}
                />
                
                {userLocation && (
                  <div className="mb-4">
                    <label className="block mb-2 text-sm font-medium text-dark-200">
                      Location Map
                    </label>
                    <Map
                      latitude={userLocation.latitude}
                      longitude={userLocation.longitude}
                    />
                  </div>
                )}
                
                <div className="mb-4">
                  <label className="block mb-2 text-sm font-medium text-dark-200">
                    Add Images (Optional)
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setImages(prev => [...prev, reader.result as string]);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="hidden"
                      id="camera-input"
                    />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setImages(prev => [...prev, reader.result as string]);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="hidden"
                      id="gallery-input"
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => document.getElementById('camera-input')?.click()}
                      leftIcon={<Camera size={16} />}
                    >
                      Take Photo
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => document.getElementById('gallery-input')?.click()}
                      leftIcon={<Image size={16} />}
                    >
                      Choose from Gallery
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 mt-3">
                    {images.map((url, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={url}
                          alt={`Incident ${index + 1}`}
                          className="w-full h-24 object-cover rounded-md"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=Error';
                          }}
                        />
                        <button
                          type="button"
                          className="absolute top-1 right-1 bg-dark-900/80 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => setImages(prev => prev.filter((_, i) => i !== index))}
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-4 pt-4 border-t border-dark-700">
              <Button
                type="button"
                variant="ghost"
                onClick={() => navigate(-1)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                leftIcon={<AlertTriangle size={18} />}
                isLoading={isLoading}
              >
                {editMode ? 'Update Incident' : 'Submit Report'}
              </Button>
            </div>
          </div>
        </form>
      </Card>

      <TermsModal
        isOpen={showTerms}
        onClose={() => navigate(-1)}
        onAccept={handleAcceptTerms}
      />
    </>
  );
};

export default IncidentForm;