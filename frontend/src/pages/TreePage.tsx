import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navbar } from '../components/Navbar';
import { apiService } from '../services/api';
import { SubAdmin } from '../types';
import { Users, User, Mail, Calendar, ChevronDown, ChevronRight, Shield } from 'lucide-react';
import toast from 'react-hot-toast';

export const TreePage: React.FC = () => {
  const [hierarchy, setHierarchy] = useState<SubAdmin[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedSubAdmins, setExpandedSubAdmins] = useState<Set<string>>(new Set());
  const { user } = useAuth();

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchHierarchy();
    } else if (user?.role === 'sub-admin') {
      fetchSubAdminUsers();
    } else {
      // For regular users, show a different view or redirect
      setIsLoading(false);
    }
  }, []);

  const fetchHierarchy = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.getHierarchy();
      
      if (response.success) {
        setHierarchy(response.data);
        // Expand all sub-admins by default
        const allSubAdminIds = new Set(response.data.map(subAdmin => subAdmin._id));
        setExpandedSubAdmins(allSubAdminIds);
      }
    } catch (error) {
      console.error('Error fetching hierarchy:', error);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Failed to fetch hierarchy');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSubAdminUsers = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.getSubAdminUsers();
      
      if (response.success) {
        setUsers(response.data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Failed to fetch users');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSubAdmin = (subAdminId: string) => {
    const newExpanded = new Set(expandedSubAdmins);
    if (newExpanded.has(subAdminId)) {
      newExpanded.delete(subAdminId);
    } else {
      newExpanded.add(subAdminId);
    }
    setExpandedSubAdmins(newExpanded);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Render different views based on user role
  const renderUserView = () => {
    if (user?.role === 'user') {
      return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <div className="text-center">
            <User className="h-16 w-16 text-blue-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome, {user.name}!</h2>
            <p className="text-gray-600 mb-4">You are logged in as a regular user.</p>
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-blue-800 font-medium">Your Account Details:</p>
              <div className="mt-2 space-y-1 text-sm text-blue-700">
                <p><strong>Name:</strong> {user.name}</p>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Role:</strong> {user.role}</p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (user?.role === 'sub-admin') {
      return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Your Users</h2>
            <p className="text-sm text-gray-600">Users assigned to you as a sub-admin</p>
          </div>
          
          <div className="p-6">
            {users.length === 0 ? (
              <div className="text-center py-12">
                <User className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Users Assigned</h3>
                <p className="text-gray-500">
                  You don't have any users assigned to you yet.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {users.map((user) => (
                  <div key={user._id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors duration-200">
                    <div className="flex items-center space-x-3">
                      <div className="bg-green-500 rounded-full p-2">
                        <User className="h-4 w-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-gray-900">{user.name}</h4>
                            <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                              <div className="flex items-center space-x-1">
                                <Mail className="h-3 w-3" />
                                <span>{user.email}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Calendar className="h-3 w-3" />
                                <span>Joined {formatDate(user.createdAt || '')}</span>
                              </div>
                            </div>
                          </div>
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                            User
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      );
    }

    // Admin view (existing hierarchy)
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Organizational Structure</h2>
        </div>
        
        <div className="p-6">
          {hierarchy.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Users Found</h3>
              <p className="text-gray-500">
                The hierarchy is empty. Start by adding some sub-admins and users.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {hierarchy.map((subAdmin) => {
                const isExpanded = expandedSubAdmins.has(subAdmin._id);
                
                return (
                  <div key={subAdmin._id} className="border border-gray-200 rounded-lg overflow-hidden">
                    {/* Sub-admin Header */}
                    <div
                      className="bg-blue-50 px-4 py-4 cursor-pointer hover:bg-blue-100 transition-colors duration-200"
                      onClick={() => toggleSubAdmin(subAdmin._id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center space-x-2">
                            {isExpanded ? (
                              <ChevronDown className="h-4 w-4 text-gray-500" />
                            ) : (
                              <ChevronRight className="h-4 w-4 text-gray-500" />
                            )}
                            <div className="bg-blue-500 rounded-full p-2">
                              <Users className="h-4 w-4 text-white" />
                            </div>
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{subAdmin.name}</h3>
                            <div className="flex items-center space-x-4 text-sm text-gray-600">
                              <div className="flex items-center space-x-1">
                                <Mail className="h-3 w-3" />
                                <span>{subAdmin.email}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Calendar className="h-3 w-3" />
                                <span>Joined {formatDate(subAdmin.createdAt || '')}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                            Sub-admin
                          </span>
                          <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs">
                            {subAdmin.users?.length || 0} users
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Users List */}
                    {isExpanded && (
                      <div className="bg-white">
                        {!subAdmin.users || subAdmin.users.length === 0 ? (
                          <div className="px-6 py-8 text-center">
                            <User className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                            <p className="text-gray-500">No users assigned to this sub-admin</p>
                          </div>
                        ) : (
                          <div className="divide-y divide-gray-100">
                            {subAdmin.users.map((user) => (
                              <div key={user._id} className="px-6 py-4 hover:bg-gray-50 transition-colors duration-200">
                                <div className="flex items-center space-x-3">
                                  <div className="bg-green-500 rounded-full p-2">
                                    <User className="h-3 w-3 text-white" />
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex items-center justify-between">
                                      <div>
                                        <h4 className="font-medium text-gray-900">{user.name}</h4>
                                        <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                                          <div className="flex items-center space-x-1">
                                            <Mail className="h-3 w-3" />
                                            <span>{user.email}</span>
                                          </div>
                                          <div className="flex items-center space-x-1">
                                            <Calendar className="h-3 w-3" />
                                            <span>Joined {formatDate(user.createdAt || '')}</span>
                                          </div>
                                        </div>
                                      </div>
                                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                                        User
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {user?.role === 'admin' ? 'User Hierarchy' : 
             user?.role === 'sub-admin' ? 'My Users' : 'Dashboard'}
          </h1>
          <p className="text-gray-600">
            {user?.role === 'admin' ? 'Manage and view the organizational structure of users' :
             user?.role === 'sub-admin' ? 'View and manage users assigned to you' :
             'Your personal dashboard'}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="bg-blue-100 rounded-lg p-3">
                {user?.role === 'admin' ? <Users className="h-6 w-6 text-blue-600" /> :
                 user?.role === 'sub-admin' ? <User className="h-6 w-6 text-blue-600" /> :
                 <User className="h-6 w-6 text-blue-600" />}
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  {user?.role === 'admin' ? 'Sub-admins' :
                   user?.role === 'sub-admin' ? 'My Users' : 'Account'}
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {user?.role === 'admin' ? hierarchy.length :
                   user?.role === 'sub-admin' ? users.length : '1'}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="bg-green-100 rounded-lg p-3">
                {user?.role === 'admin' ? <User className="h-6 w-6 text-green-600" /> :
                 <Mail className="h-6 w-6 text-green-600" />}
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  {user?.role === 'admin' ? 'Total Users' : 'Email'}
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {user?.role === 'admin' ? 
                    hierarchy.reduce((total, subAdmin) => total + (subAdmin.users?.length || 0), 0) :
                    user?.email}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="bg-purple-100 rounded-lg p-3">
                <Shield className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Your Role</p>
                <p className="text-2xl font-bold text-gray-900 capitalize">{user?.role}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Role-based Content */}
        {renderUserView()}
      </div>
    </div>
  );
};