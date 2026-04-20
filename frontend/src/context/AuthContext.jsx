import { createContext, useContext, useEffect, useState } from 'react';
import { AuthAPI } from '../api/endpoints';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return setLoading(false);
    AuthAPI.me()
      .then(({ user }) => setUser(user))
      .catch(() => localStorage.removeItem('token'))
      .finally(() => setLoading(false));
  }, []);

  const login = async (creds) => {
    const { user, token } = await AuthAPI.login(creds);
    localStorage.setItem('token', token);
    setUser(user);
  };
  const register = async (data) => {
    const { user, token } = await AuthAPI.register(data);
    localStorage.setItem('token', token);
    setUser(user);
  };
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
