import { LoginRequest, SignupRequest, ApiResponse, AuthData, SubAdmin } from '../types';

const API_BASE_URL = 'http://localhost:6003/api';

class ApiService {
  private getHeaders(includeAuth = false) {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (includeAuth) {
      const token = localStorage.getItem('token');
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
    }

    return headers;
  }

  async login(credentials: LoginRequest): Promise<ApiResponse<AuthData>> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      throw new Error('Login failed');
    }

    return response.json();
  }

  async signup(userData: SignupRequest): Promise<ApiResponse<AuthData>> {
    const response = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      throw new Error('Signup failed');
    }

    return response.json();
  }

  async getHierarchy(): Promise<ApiResponse<SubAdmin[]>> {
    try {
      const response = await fetch(`${API_BASE_URL}/tree`, {
        method: 'GET',
        headers: this.getHeaders(true),
      });

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('Access denied. You do not have permission to view the hierarchy.');
        }
        throw new Error(`HTTP ${response.status}: Failed to fetch hierarchy`);
      }

      return response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error occurred while fetching hierarchy');
    }
  }

  async getSubAdminUsers(): Promise<ApiResponse<any[]>> {
    const response = await fetch(`${API_BASE_URL}/tree`, {
      method: 'GET',
      headers: this.getHeaders(true),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch users');
    }

    return response.json();
  }

  async getParents(role: 'sub-admin' | 'user'): Promise<ApiResponse<any[]>> {
    const response = await fetch(`${API_BASE_URL}/auth/parents?role=${role}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch parents');
    }

    return response.json();
  }
}

export const apiService = new ApiService();