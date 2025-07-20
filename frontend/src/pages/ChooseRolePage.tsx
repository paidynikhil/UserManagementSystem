import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Shield, Users, User, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { apiService } from '../services/api';

interface LocationState {
  formData: {
    name: string;
    email: string;
    password: string;
  };
}

export const ChooseRolePage: React.FC = () => {
  const [selectedRole, setSelectedRole] = useState<'admin' | 'sub-admin' | 'user' | ''>('');
  const [selectedParent, setSelectedParent] = useState('');
  const [parents, setParents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingParents, setLoadingParents] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const { signup } = useAuth();

  const state = location.state as LocationState;

  useEffect(() => {
    if (!state?.formData) {
      navigate('/');
      return;
    }
  }, [state, navigate]);

  useEffect(() => {
    if (selectedRole === 'sub-admin' || selectedRole === 'user') {
      fetchParents();
    }
  }, [selectedRole]);

  const fetchParents = async () => {
    setLoadingParents(true);
    try {
      const response = await apiService.getParents(selectedRole as 'sub-admin' | 'user');
      if (response.success) {
        setParents(response.data);
      }
    } catch (error) {
      console.error('Error fetching parents:', error);
      toast.error('Failed to fetch available parents');
      setParents([]);
    } finally {
      setLoadingParents(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedRole) {
      toast.error('Please select a role');
      return;
    }

    if ((selectedRole === 'sub-admin' || selectedRole === 'user') && !selectedParent) {
      toast.error(`Please select a ${selectedRole === 'sub-admin' ? 'Admin' : 'Sub-admin'}`);
      return;
    }

    setIsLoading(true);

    try {
      const signupData = {
        ...state.formData,
        role: selectedRole,
        ...(selectedParent && { parent: selectedParent }),
      };

      await signup(signupData);
      navigate('/tree');
    } catch (error) {
      console.error('Signup error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const roles = [
    {
      value: 'admin',
      title: 'Admin',
      description: 'Full system access and user management',
      icon: Shield,
      color: 'bg-red-500',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
    },
    {
      value: 'sub-admin',
      title: 'Sub-admin',
      description: 'Manage users within your scope',
      icon: Users,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
    },
    {
      value: 'user',
      title: 'User',
      description: 'Standard user access',
      icon: User,
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
    },
  ];

  if (!state?.formData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <button
            onClick={() => navigate('/')}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors duration-200"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Login</span>
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6 text-center">
            <h1 className="text-2xl font-bold text-white mb-2">Choose Your Role</h1>
            <p className="text-blue-100 text-sm">
              Select the role that best describes your access level
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-8">
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              {roles.map((role) => {
                const Icon = role.icon;
                const isSelected = selectedRole === role.value;
                
                return (
                  <div
                    key={role.value}
                    className={`relative cursor-pointer transition-all duration-200 ${
                      isSelected
                        ? `${role.bgColor} ${role.borderColor} border-2 transform scale-105`
                        : 'bg-gray-50 border-2 border-gray-200 hover:border-gray-300'
                    } rounded-xl p-6`}
                    onClick={() => {
                      setSelectedRole(role.value as any);
                      setSelectedParent(''); // Reset parent selection when role changes
                    }}
                  >
                    <div className="text-center">
                      <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full ${role.color} mb-4`}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{role.title}</h3>
                      <p className="text-sm text-gray-600">{role.description}</p>
                    </div>
                    
                    {isSelected && (
                      <div className="absolute top-3 right-3">
                        <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {(selectedRole === 'sub-admin' || selectedRole === 'user') && (
              <div className="mb-8">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Select {selectedRole === 'sub-admin' ? 'Admin' : 'Sub-admin'} *
                </label>
                
                {loadingParents ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-3 text-gray-600">Loading available {selectedRole === 'sub-admin' ? 'admins' : 'sub-admins'}...</span>
                  </div>
                ) : parents.length > 0 ? (
                  <div className="grid md:grid-cols-2 gap-4">
                    {parents.map((parent) => (
                      <div
                        key={parent._id}
                        className={`cursor-pointer transition-all duration-200 ${
                          selectedParent === parent._id
                            ? 'bg-blue-50 border-blue-200 border-2 transform scale-105'
                            : 'bg-gray-50 border-2 border-gray-200 hover:border-gray-300 hover:shadow-md'
                        } rounded-lg p-4`}
                        onClick={() => setSelectedParent(parent._id)}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              parent.role === 'admin' ? 'bg-red-100' : 'bg-blue-100'
                            }`}>
                              {parent.role === 'admin' ? (
                                <Shield className="h-5 w-5 text-red-600" />
                              ) : (
                                <Users className="h-5 w-5 text-blue-600" />
                              )}
                            </div>
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">{parent.name}</h4>
                            <p className="text-sm text-gray-500">{parent.email}</p>
                            <span className={`inline-block mt-1 px-2 py-1 text-xs rounded-full capitalize ${
                              parent.role === 'admin' 
                                ? 'bg-red-100 text-red-700' 
                                : 'bg-blue-100 text-blue-700'
                            }`}>
                              {parent.role}
                            </span>
                          </div>
                          {selectedParent === parent._id && (
                            <div className="ml-auto">
                              <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                                <div className="w-2 h-2 bg-white rounded-full"></div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">
                      No {selectedRole === 'sub-admin' ? 'admins' : 'sub-admins'} available
                    </p>
                    <p className="text-sm text-gray-400 mt-2">
                      Please contact your system administrator to create the required {selectedRole === 'sub-admin' ? 'admin' : 'sub-admin'} accounts first.
                    </p>
                  </div>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || !selectedRole || ((selectedRole === 'sub-admin' || selectedRole === 'user') && !selectedParent && parents.length > 0)}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  <Users className="h-5 w-5" />
                  <span>Create Account</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};