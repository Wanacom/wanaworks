import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import authApi from '../api/authApi';
import { User } from '../types';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  const checkAuth = async (): Promise<boolean> => {
    try {
      if (authApi.isAuthenticated()) {
        const storedUser = authApi.getStoredUser();
        
        if (storedUser) {
          try {
            // Verify token validity by fetching current user
            const user = await authApi.getCurrentUser();
            setUser(user);
            setIsAuthenticated(true);
            return true;
          } catch (error) {
            // Token might be invalid, remove credentials
            await authApi.logout();
            setUser(null);
            setIsAuthenticated(false);
            return false;
          }
        }
      }
      
      setUser(null);
      setIsAuthenticated(false);
      return false;
    } catch (error) {
      console.error("Authentication check failed:", error);
      setUser(null);
      setIsAuthenticated(false);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    try {
      setIsLoading(true);
      const response = await authApi.login({ email, password });
      setUser(response.user);
      setIsAuthenticated(true);
      navigate('/');
      toast.success(`Welcome, ${response.user.name}!`);
    } catch (error: any) {
      console.error("Login failed:", error);
      const errorMessage = error.response?.data?.message || 'Invalid credentials';
      toast.error(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      setIsLoading(true);
      await authApi.logout();
      setUser(null);
      setIsAuthenticated(false);
      navigate('/login');
      toast.success('Logged out successfully');
    } catch (error) {
      console.error("Logout failed:", error);
      toast.error('Logout failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        login,
        logout,
        checkAuth
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};