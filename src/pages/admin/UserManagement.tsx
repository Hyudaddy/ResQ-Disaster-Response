import React, { useState } from 'react';
import { Users, Search, Filter, Edit, Trash, Shield, UserPlus, X } from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import { users } from '../../data/mockData';
import { UserRole } from '../../types/auth.types';
import toast from 'react-hot-toast';

const UserManagement: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole | 'all'>('all');
  const [showAddUser, setShowAddUser] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: 'public' as UserRole,
    department: '',
    jurisdiction: '',
  });
  
  // Filter users based on search and role
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      searchQuery === '' || 
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRole = selectedRole === 'all' || user.role === selectedRole;
    
    return matchesSearch && matchesRole;
  });
  
  // Role colors
  const getRoleBadgeClass = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return 'bg-primary-500/20 text-primary-500';
      case 'responder':
        return 'bg-warning-500/20 text-warning-500';
      case 'public':
        return 'bg-info-500/20 text-info-500';
      default:
        return 'bg-dark-700 text-dark-300';
    }
  };
  
  // Handle search input
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };
  
  // Handle role filter
  const handleRoleFilter = (role: UserRole | 'all') => {
    setSelectedRole(role);
  };
  
  // Handle new user input change
  const handleNewUserChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewUser(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle add user
  const handleAddUser = () => {
    if (!newUser.name || !newUser.email) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    // In a real app, this would make an API call
    const user = {
      id: (users.length + 1).toString(),
      ...newUser,
      createdAt: new Date().toISOString(),
    };
    
    users.push(user);
    toast.success('User added successfully');
    setShowAddUser(false);
    setNewUser({
      name: '',
      email: '',
      role: 'public',
      department: '',
      jurisdiction: '',
    });
  };
  
  // Handle edit user
  const handleEditUser = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      setNewUser({
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department || '',
        jurisdiction: user.jurisdiction || '',
      });
      setShowAddUser(true);
    }
  };
  
  // Handle delete user
  const handleDeleteUser = (userId: string) => {
    const index = users.findIndex(u => u.id === userId);
    if (index !== -1) {
      users.splice(index, 1);
      toast.success('User deleted successfully');
    }
  };

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center mb-2">
          <Users size={24} className="text-primary-500 mr-2" />
          <h1 className="text-2xl font-bold text-white">User Management</h1>
        </div>
        <p className="text-dark-300">
          Manage user accounts, roles, and permissions
        </p>
      </div>
      
      <Card className="mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search users..."
              value={searchQuery}
              onChange={handleSearch}
              leftIcon={<Search size={18} />}
              className="mb-0"
            />
          </div>
          
          <div className="flex space-x-2">
            <Button
              variant={selectedRole === 'all' ? 'primary' : 'secondary'}
              onClick={() => handleRoleFilter('all')}
            >
              All
            </Button>
            <Button
              variant={selectedRole === 'admin' ? 'primary' : 'secondary'}
              onClick={() => handleRoleFilter('admin')}
            >
              Admins
            </Button>
            <Button
              variant={selectedRole === 'responder' ? 'primary' : 'secondary'}
              onClick={() => handleRoleFilter('responder')}
            >
              Responders
            </Button>
            <Button
              variant={selectedRole === 'public' ? 'primary' : 'secondary'}
              onClick={() => handleRoleFilter('public')}
            >
              Public
            </Button>
          </div>
        </div>
      </Card>
      
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-white">Users</h2>
        <Button
          leftIcon={<UserPlus size={16} />}
          onClick={() => setShowAddUser(true)}
        >
          Add User
        </Button>
      </div>
      
      {/* Add/Edit User Modal */}
      {showAddUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-white">
                {newUser.email ? 'Edit User' : 'Add New User'}
              </h3>
              <button
                className="text-dark-400 hover:text-white transition-colors"
                onClick={() => setShowAddUser(false)}
              >
                <X size={20} />
              </button>
            </div>
            
            <Input
              label="Full Name"
              name="name"
              value={newUser.name}
              onChange={handleNewUserChange}
              placeholder="Enter user's full name"
            />
            
            <Input
              label="Email"
              name="email"
              type="email"
              value={newUser.email}
              onChange={handleNewUserChange}
              placeholder="Enter user's email"
            />
            
            <Select
              label="Role"
              name="role"
              value={newUser.role}
              onChange={handleNewUserChange}
              options={[
                { value: 'public', label: 'Public User' },
                { value: 'responder', label: 'Responder' },
                { value: 'admin', label: 'Administrator' },
              ]}
            />
            
            {(newUser.role === 'responder' || newUser.role === 'admin') && (
              <>
                <Input
                  label="Department"
                  name="department"
                  value={newUser.department}
                  onChange={handleNewUserChange}
                  placeholder="Enter department"
                />
                
                <Input
                  label="Jurisdiction"
                  name="jurisdiction"
                  value={newUser.jurisdiction}
                  onChange={handleNewUserChange}
                  placeholder="Enter jurisdiction"
                />
              </>
            )}
            
            <div className="flex justify-end gap-3 mt-6">
              <Button
                variant="ghost"
                onClick={() => setShowAddUser(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddUser}
              >
                {newUser.email ? 'Update User' : 'Add User'}
              </Button>
            </div>
          </Card>
        </div>
      )}
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-dark-800 text-left">
              <th className="px-4 py-3 text-dark-300 font-medium text-sm">Name</th>
              <th className="px-4 py-3 text-dark-300 font-medium text-sm">Email</th>
              <th className="px-4 py-3 text-dark-300 font-medium text-sm">Role</th>
              <th className="px-4 py-3 text-dark-300 font-medium text-sm">Department</th>
              <th className="px-4 py-3 text-dark-300 font-medium text-sm">Last Login</th>
              <th className="px-4 py-3 text-dark-300 font-medium text-sm">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-dark-800">
            {filteredUsers.map((user) => (
              <tr key={user.id} className="bg-dark-900 hover:bg-dark-800 transition">
                <td className="px-4 py-3 text-white">
                  <div className="flex items-center">
                    {user.avatarUrl ? (
                      <img 
                        src={user.avatarUrl} 
                        alt={user.name} 
                        className="w-8 h-8 rounded-full mr-3"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-dark-700 flex items-center justify-center mr-3">
                        <span className="text-dark-300 text-sm">
                          {user.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    {user.name}
                  </div>
                </td>
                <td className="px-4 py-3 text-dark-200">{user.email}</td>
                <td className="px-4 py-3">
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeClass(user.role)}`}>
                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                  </span>
                </td>
                <td className="px-4 py-3 text-dark-300">
                  {user.department || '-'}
                </td>
                <td className="px-4 py-3 text-dark-300">
                  {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                </td>
                <td className="px-4 py-3">
                  <div className="flex space-x-2">
                    <button
                      className="p-1 text-dark-300 hover:text-primary-500 transition"
                      onClick={() => handleEditUser(user.id)}
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      className="p-1 text-dark-300 hover:text-danger-500 transition"
                      onClick={() => handleDeleteUser(user.id)}
                    >
                      <Trash size={16} />
                    </button>
                    {user.role !== 'admin' && (
                      <button
                        className="p-1 text-dark-300 hover:text-warning-500 transition"
                        onClick={() => toast(`Assign role for ${user.name}`, { icon: '🔑' })}
                      >
                        <Shield size={16} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {filteredUsers.length === 0 && (
        <div className="bg-dark-800 rounded-lg p-8 text-center mt-4">
          <Users size={48} className="mx-auto mb-4 text-dark-500" />
          <h3 className="text-xl font-semibold text-white mb-2">No Users Found</h3>
          <p className="text-dark-300 mb-6">There are no users matching your current filters.</p>
          <Button onClick={() => {
            setSearchQuery('');
            setSelectedRole('all');
          }}>
            Reset Filters
          </Button>
        </div>
      )}
    </div>
  );
};

export default UserManagement;