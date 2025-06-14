import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface AuthContextValue {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (e: string, p: string) => Promise<Result>;
  logout: () => void;
  register: (...args: any[]) => Promise<Result>;
}
const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (token) {
      // In a real app, you'd verify this token with the backend.
      // For now, we'll assume a valid token means a logged-in user.
      // Optionally, fetch user details here if needed from backend /api/auth/me
      // For demonstration, we'll just set a dummy user if token exists
      try {
        const payload = JSON.parse(atob(token.split('.')[1])); // Decode JWT payload
        setUser({ 
          id: payload.id, 
          email: payload.email, 
          name: payload.name, 
          role: payload.role || 'recruiter' // Default to recruiter if role is not in token
        });
      } catch (e) {
        console.error("Invalid token format", e);
        logout();
      }
    }
    setLoading(false);
  }, [token]);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        setToken(data.token);
        setUser(data.user);
        navigate('/dashboard'); // Navigate to dashboard on successful login
        return { success: true };
      } else {
        return { success: false, message: data.message || 'Login failed' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'Network error occurred' };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    navigate('/login'); // Redirect to login page on logout
  };

  const register = async (email, password, name, role) => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3001/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name, role }),
      });
      const data = await response.json();
      if (response.ok) {
        return { success: true, message: data.message };
      } else {
        return { success: false, message: data.message || 'Registration failed' };
      }
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, message: 'Network error occurred' };
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext); 