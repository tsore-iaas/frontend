"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService, User, LoginCredentials, RegisterData } from '../services/auth';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Vérifier le token et charger l'utilisateur au démarrage
  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = authService.getCurrentUser();
    if (token && savedUser) {
      setUser(savedUser);
    }
    setIsLoading(false);
  }, []);

  // Connexion
  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    setError(null);
    try {
      const { token, user } = await authService.login(credentials);
      localStorage.setItem('token', token);
      setUser(user);
    } catch (error) {
      console.error('Erreur de connexion:', error);
      setError(error instanceof Error ? error.message : 'Erreur de connexion');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Inscription
  const register = async (data: RegisterData) => {
    setIsLoading(true);
    setError(null);
    try {
      await authService.register(data);
      // Connexion automatique après l'inscription
      await login({
        username: data.username,
        password: data.password
      });
    } catch (error) {
      console.error('Erreur d\'inscription:', error);
      setError(error instanceof Error ? error.message : 'Erreur lors de l\'inscription');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Déconnexion
  const logout = () => {
    authService.logout();
    setUser(null);
    setError(null);
  };

  const value = {
    user,
    isLoading,
    error,
    login,
    register,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook personnalisé pour utiliser le contexte d'authentification
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth doit être utilisé à l\'intérieur d\'un AuthProvider');
  }
  return context;
}
