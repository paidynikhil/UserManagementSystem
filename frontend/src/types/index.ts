export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'sub-admin' | 'user';
  parent?: string;
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
}

export interface SubAdmin extends User {
  users: User[];
}

export interface AuthData {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'sub-admin' | 'user';
  token: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'sub-admin' | 'user';
  parent?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}