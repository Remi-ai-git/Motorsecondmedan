// =========================================================================
// AuthContext — menyimpan user & token di localStorage supaya sesi login
// bertahan setelah refresh halaman. Saat app pertama kali dimuat, kalau
// ada token tersimpan, di-verifikasi ulang lewat GET /auth/me (token
// kedaluwarsa/rusak akan otomatis di-logout oleh interceptor axios).
// =========================================================================

import { createContext, useContext, useEffect, useState } from 'react';
import * as authApi from '../api/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('artamotor_user');
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('artamotor_token');
    if (!token) {
      setLoading(false);
      return;
    }
    authApi
      .me()
      .then((profile) => {
        setUser(profile);
        localStorage.setItem('artamotor_user', JSON.stringify(profile));
      })
      .catch(() => {
        localStorage.removeItem('artamotor_token');
        localStorage.removeItem('artamotor_user');
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  async function login(email, password) {
    const { user: loggedInUser, token } = await authApi.login({ email, password });
    localStorage.setItem('artamotor_token', token);
    localStorage.setItem('artamotor_user', JSON.stringify(loggedInUser));
    setUser(loggedInUser);
    return loggedInUser;
  }

  function logout() {
    localStorage.removeItem('artamotor_token');
    localStorage.removeItem('artamotor_user');
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth harus dipakai di dalam AuthProvider');
  return ctx;
}
