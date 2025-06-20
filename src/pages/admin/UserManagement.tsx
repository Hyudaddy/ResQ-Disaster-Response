import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { User } from '../../types/auth.types';
import Button from '../../components/common/Button';
import { Trash2, UserPlus } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import UserForm from '../../components/auth/UserForm';
import Modal from '../../components/common/Modal';

const UserManagement: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (user?.role !== 'admin') {
      navigate('/dashboard');
      return;
    }

    fetchUsers();
  }, [isAuthenticated, user, navigate]);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get current user's email from the session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;

      // Add email to the current user's profile
      const usersWithEmail = data.map(profile => ({
        ...profile,
        email: session?.user && profile.id === session.user.id ? session.user.email : 'N/A'
      }));

      setUsers(usersWithEmail);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm(
      'Are you sure you want to delete this user? This will also delete all incidents and related data created by this user. This action cannot be undone.'
    )) {
      return;
    }

    try {
      // Call our database function to delete the user
      const { error } = await supabase
        .rpc('delete_user', { user_id: userId });

      if (error) throw error;

      toast.success('User and all related data deleted successfully');
      fetchUsers(); // Refresh the list
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user. Please try again.');
    }
  };

  const handleAddUserSuccess = () => {
    setIsAddUserModalOpen(false);
    fetchUsers();
    toast.success('User added successfully');
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="p-4">
        <p className="text-red-500">You do not have permission to access this page.</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-light-900 dark:text-white">User Management</h1>
        <Button
          variant="primary"
          leftIcon={<UserPlus size={16} />}
          onClick={() => setIsAddUserModalOpen(true)}
        >
          Add User
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-8">
          <p className="text-light-600 dark:text-dark-300">Loading users...</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-dark-900 rounded-lg shadow border border-light-200 dark:border-dark-800">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-light-200 dark:border-dark-800">
                  <th className="px-6 py-3 text-left text-xs font-medium text-light-500 dark:text-dark-400 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-light-500 dark:text-dark-400 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-light-500 dark:text-dark-400 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-light-500 dark:text-dark-400 uppercase tracking-wider">
                    Department
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-light-500 dark:text-dark-400 uppercase tracking-wider">
                    Jurisdiction
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-light-500 dark:text-dark-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-light-50 dark:hover:bg-dark-800">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-primary-500 text-white flex items-center justify-center">
                          {user.full_name.charAt(0)}
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-light-900 dark:text-white">
                            {user.full_name}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm text-light-600 dark:text-dark-300">{user.email}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${user.role === 'admin' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' :
                          user.role === 'responder' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                          'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm text-light-600 dark:text-dark-300">
                        {user.department || 'N/A'}
                      </p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm text-light-600 dark:text-dark-300">
                        {user.jurisdiction || 'N/A'}
                      </p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                        onClick={() => handleDeleteUser(user.id)}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal
        isOpen={isAddUserModalOpen}
        onClose={() => setIsAddUserModalOpen(false)}
        title="Add New User"
      >
        <UserForm
          isModal={true}
          onSuccess={handleAddUserSuccess}
          onCancel={() => setIsAddUserModalOpen(false)}
        />
      </Modal>
    </div>
  );
};

export default UserManagement;