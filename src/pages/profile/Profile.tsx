import React, { useState, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import Button from '../../components/common/Button';
import { Camera, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const Profile: React.FC = () => {
  const { user } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleProfilePictureClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);

      // Upload image to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${user?.id}-${Math.random()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from('profile-pictures')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('profile-pictures')
        .getPublicUrl(fileName);

      // Update user profile with the new image URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user?.id);

      if (updateError) throw updateError;

      toast.success('Profile picture updated successfully');
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      toast.error('Failed to update profile picture');
    } finally {
      setIsUploading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <div className="bg-white dark:bg-dark-900 rounded-lg shadow border border-light-200 dark:border-dark-800 p-6">
        <div className="flex flex-col items-center mb-8">
          <div className="relative group">
            <div 
              className="w-32 h-32 rounded-full bg-primary-500 text-white flex items-center justify-center text-4xl cursor-pointer overflow-hidden"
              onClick={handleProfilePictureClick}
            >
              {user.avatar_url ? (
                <img 
                  src={user.avatar_url} 
                  alt={user.full_name} 
                  className="w-full h-full object-cover"
                />
              ) : (
                user.full_name?.charAt(0) || 'U'
              )}
            </div>
            <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera className="w-8 h-8 text-white" />
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
          </div>
          {isUploading && (
            <div className="mt-2 flex items-center text-light-600 dark:text-dark-300">
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Uploading...
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-light-900 dark:text-white mb-4">Profile Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-light-600 dark:text-dark-300 mb-1">
                  Full Name
                </label>
                <p className="text-light-900 dark:text-white">{user.full_name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-light-600 dark:text-dark-300 mb-1">
                  Email
                </label>
                <p className="text-light-900 dark:text-white">{user.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-light-600 dark:text-dark-300 mb-1">
                  Role
                </label>
                <p className="text-light-900 dark:text-white capitalize">{user.role}</p>
              </div>
              {user.department && (
                <div>
                  <label className="block text-sm font-medium text-light-600 dark:text-dark-300 mb-1">
                    Department
                  </label>
                  <p className="text-light-900 dark:text-white">{user.department}</p>
                </div>
              )}
              {user.jurisdiction && (
                <div>
                  <label className="block text-sm font-medium text-light-600 dark:text-dark-300 mb-1">
                    Jurisdiction
                  </label>
                  <p className="text-light-900 dark:text-white">{user.jurisdiction}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile; 