import apiClient from './client';
import Cookies from 'js-cookie';
import { User } from '../types';

interface LoginCredentials {
  email: string;
  password: string;
}

interface AuthResponse {
  token: string;
  refresh_token: string;
  user: User;
}

const AUTH_TOKEN_KEY = 'token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const USER_KEY = 'user';

export const authApi = {
  login: async (credentials: LoginCredentials) => {
    const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
    const { token, refresh_token, user } = response.data;
    
    // Store auth data
    Cookies.set(AUTH_TOKEN_KEY, token);
    Cookies.set(REFRESH_TOKEN_KEY, refresh_token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    
    return response.data;
  },
  
  logout: async () => {
    try {
      await apiClient.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Always clear credentials even if the API call fails
      Cookies.remove(AUTH_TOKEN_KEY);
      Cookies.remove(REFRESH_TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    }
  },
  
  getCurrentUser: async () => {
    const response = await apiClient.get<User>('/auth/me');
    const user = response.data;
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    return user;
  },
  
  getStoredUser: (): User | null => {
    const userJson = localStorage.getItem(USER_KEY);
    if (userJson) {
      try {
        return JSON.parse(userJson) as User;
      } catch (error) {
        console.error('Failed to parse stored user', error);
        return null;
      }
    }
    return null;
  },
  
  isAuthenticated: (): boolean => {
    return !!Cookies.get(AUTH_TOKEN_KEY) && !!localStorage.getItem(USER_KEY);
  },
  
  refreshToken: async () => {
    const refreshToken = Cookies.get(REFRESH_TOKEN_KEY);
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }
    
    const response = await apiClient.post<AuthResponse>('/auth/refresh', {
      refresh_token: refreshToken
    });
    
    const { token, refresh_token, user } = response.data;
    
    // Update stored auth data
    Cookies.set(AUTH_TOKEN_KEY, token);
    Cookies.set(REFRESH_TOKEN_KEY, refresh_token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    
    return response.data;
  }
};

export default authApi;