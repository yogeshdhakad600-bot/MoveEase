import { createContext, useContext, useEffect, useState } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('moveease_token');
    if (!token) { setLoading(false); return; }
    api.get('/auth/me')
      .then((res) => setUser(res.data.user))
      .catch(() => localStorage.removeItem('moveease_token'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const clearUser = () => setUser(null);
    window.addEventListener('moveease:unauthorized', clearUser);
    return () => window.removeEventListener('moveease:unauthorized', clearUser);
  }, []);

  async function login(email, password, role) {
    const { data } = await api.post('/auth/login', { email, password, role });
    localStorage.setItem('moveease_token', data.token);
    setUser(data.user);
    return data.user;
  }

  async function register(payload) {
    const { data } = await api.post('/auth/register', payload);
    localStorage.setItem('moveease_token', data.token);
    setUser(data.user);
    return data.user;
  }

  async function updateProfile(payload) {
    const { data } = await api.patch('/auth/me', payload);
    setUser(data.user);
    return data.user;
  }

  function logout() {
    localStorage.removeItem('moveease_token');
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, updateProfile, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
