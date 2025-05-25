import React, { useState } from 'react';
import { Settings as SettingsIcon, Bell, MapPin, Shield, Mail, Save, RefreshCw } from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import toast from 'react-hot-toast';

const Settings: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  
  // General settings
  const [generalSettings, setGeneralSettings] = useState({
    systemName: 'ResQ Disaster Response',
    contactEmail: 'support@resq-system.example',
    maxIncidentImages: '5',
    defaultLanguage: 'en',
  });
  
  // Notification settings
  const [notificationSettings, setNotificationSettings] = useState({
    enableEmailNotifications: true,
    enableSmsNotifications: false,
    alertCriticalOnly: false,
    alertDelayMinutes: '0',
  });
  
  // Map settings
  const [mapSettings, setMapSettings] = useState({
    defaultLatitude: '40.7128',
    defaultLongitude: '-74.0060',
    defaultZoom: '13',
    mapProvider: 'google',
  });
  
  // Security settings
  const [securitySettings, setSecuritySettings] = useState({
    sessionTimeout: '60',
    passwordMinLength: '8',
    requireVerification: true,
    twoFactorAuth: false,
  });
  
  // Handle general settings change
  const handleGeneralChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setGeneralSettings(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle notification settings change
  const handleNotificationChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    setNotificationSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  // Handle map settings change
  const handleMapChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setMapSettings(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle security settings change
  const handleSecurityChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    setSecuritySettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  // Save settings
  const saveSettings = () => {
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      toast.success('Settings saved successfully');
      setIsLoading(false);
    }, 1000);
  };
  
  // Reset settings
  const resetSettings = () => {
    // Here you would reset to default values
    toast('Settings reset to default values', { icon: '⚙️' });
  };

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center mb-2">
          <SettingsIcon size={24} className="text-primary-500 mr-2" />
          <h1 className="text-2xl font-bold text-white">System Settings</h1>
        </div>
        <p className="text-dark-300">
          Configure system-wide settings and preferences
        </p>
      </div>
      
      <div className="grid grid-cols-1 gap-6">
        {/* General Settings */}
        <Card title="General Settings" headerAction={<Bell size={18} className="text-primary-500" />}>
          <div className="space-y-4">
            <Input
              label="System Name"
              name="systemName"
              value={generalSettings.systemName}
              onChange={handleGeneralChange}
            />
            
            <Input
              label="Contact Email"
              name="contactEmail"
              type="email"
              value={generalSettings.contactEmail}
              onChange={handleGeneralChange}
            />
            
            <Input
              label="Maximum Images Per Incident"
              name="maxIncidentImages"
              type="number"
              min="0"
              max="10"
              value={generalSettings.maxIncidentImages}
              onChange={handleGeneralChange}
            />
            
            <Select
              label="Default Language"
              name="defaultLanguage"
              value={generalSettings.defaultLanguage}
              onChange={handleGeneralChange}
              options={[
                { value: 'en', label: 'English' },
                { value: 'es', label: 'Spanish' },
                { value: 'fr', label: 'French' },
              ]}
            />
          </div>
        </Card>
        
        {/* Notification Settings */}
        <Card title="Notification Settings" headerAction={<Mail size={18} className="text-primary-500" />}>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-dark-200">
                Enable Email Notifications
              </label>
              <div className="relative inline-block w-12 align-middle select-none">
                <input
                  type="checkbox"
                  name="enableEmailNotifications"
                  id="enableEmailNotifications"
                  checked={notificationSettings.enableEmailNotifications}
                  onChange={handleNotificationChange}
                  className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                />
                <label
                  htmlFor="enableEmailNotifications"
                  className="toggle-label block overflow-hidden h-6 rounded-full bg-dark-700 cursor-pointer"
                ></label>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-dark-200">
                Enable SMS Notifications
              </label>
              <div className="relative inline-block w-12 align-middle select-none">
                <input
                  type="checkbox"
                  name="enableSmsNotifications"
                  id="enableSmsNotifications"
                  checked={notificationSettings.enableSmsNotifications}
                  onChange={handleNotificationChange}
                  className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                />
                <label
                  htmlFor="enableSmsNotifications"
                  className="toggle-label block overflow-hidden h-6 rounded-full bg-dark-700 cursor-pointer"
                ></label>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-dark-200">
                Alert Only Critical Incidents
              </label>
              <div className="relative inline-block w-12 align-middle select-none">
                <input
                  type="checkbox"
                  name="alertCriticalOnly"
                  id="alertCriticalOnly"
                  checked={notificationSettings.alertCriticalOnly}
                  onChange={handleNotificationChange}
                  className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                />
                <label
                  htmlFor="alertCriticalOnly"
                  className="toggle-label block overflow-hidden h-6 rounded-full bg-dark-700 cursor-pointer"
                ></label>
              </div>
            </div>
            
            <Input
              label="Alert Delay (minutes)"
              name="alertDelayMinutes"
              type="number"
              min="0"
              value={notificationSettings.alertDelayMinutes}
              onChange={handleNotificationChange}
            />
          </div>
        </Card>
        
        {/* Map Settings */}
        <Card title="Map Settings" headerAction={<MapPin size={18} className="text-primary-500" />}>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Default Latitude"
                name="defaultLatitude"
                value={mapSettings.defaultLatitude}
                onChange={handleMapChange}
              />
              
              <Input
                label="Default Longitude"
                name="defaultLongitude"
                value={mapSettings.defaultLongitude}
                onChange={handleMapChange}
              />
            </div>
            
            <Input
              label="Default Zoom Level"
              name="defaultZoom"
              type="number"
              min="1"
              max="20"
              value={mapSettings.defaultZoom}
              onChange={handleMapChange}
            />
            
            <Select
              label="Map Provider"
              name="mapProvider"
              value={mapSettings.mapProvider}
              onChange={handleMapChange}
              options={[
                { value: 'google', label: 'Google Maps' },
                { value: 'mapbox', label: 'Mapbox' },
                { value: 'openstreet', label: 'OpenStreetMap' },
              ]}
            />
          </div>
        </Card>
        
        {/* Security Settings */}
        <Card title="Security Settings" headerAction={<Shield size={18} className="text-primary-500" />}>
          <div className="space-y-4">
            <Input
              label="Session Timeout (minutes)"
              name="sessionTimeout"
              type="number"
              min="5"
              value={securitySettings.sessionTimeout}
              onChange={handleSecurityChange}
            />
            
            <Input
              label="Minimum Password Length"
              name="passwordMinLength"
              type="number"
              min="6"
              value={securitySettings.passwordMinLength}
              onChange={handleSecurityChange}
            />
            
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-dark-200">
                Require Email Verification
              </label>
              <div className="relative inline-block w-12 align-middle select-none">
                <input
                  type="checkbox"
                  name="requireVerification"
                  id="requireVerification"
                  checked={securitySettings.requireVerification}
                  onChange={handleSecurityChange}
                  className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                />
                <label
                  htmlFor="requireVerification"
                  className="toggle-label block overflow-hidden h-6 rounded-full bg-dark-700 cursor-pointer"
                ></label>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-dark-200">
                Enable Two-Factor Authentication
              </label>
              <div className="relative inline-block w-12 align-middle select-none">
                <input
                  type="checkbox"
                  name="twoFactorAuth"
                  id="twoFactorAuth"
                  checked={securitySettings.twoFactorAuth}
                  onChange={handleSecurityChange}
                  className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                />
                <label
                  htmlFor="twoFactorAuth"
                  className="toggle-label block overflow-hidden h-6 rounded-full bg-dark-700 cursor-pointer"
                ></label>
              </div>
            </div>
          </div>
        </Card>
        
        {/* Action Buttons */}
        <div className="flex justify-end space-x-4">
          <Button
            variant="ghost"
            leftIcon={<RefreshCw size={16} />}
            onClick={resetSettings}
          >
            Reset to Defaults
          </Button>
          <Button
            leftIcon={<Save size={16} />}
            isLoading={isLoading}
            onClick={saveSettings}
          >
            Save Settings
          </Button>
        </div>
      </div>
      
      {/* Custom CSS for toggle switches */}
      <style jsx global>{`
        .toggle-checkbox:checked {
          right: 0;
          border-color: #ff5722;
        }
        .toggle-checkbox:checked + .toggle-label {
          background-color: #ff5722;
        }
        .toggle-checkbox {
          right: 0;
          z-index: 1;
          transition: all 0.3s;
        }
        .toggle-label {
          transition: all 0.3s;
        }
      `}</style>
    </div>
  );
};

export default Settings;