import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { auth as authApi, getToken, setToken, removeToken } from '../services/api';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const urlToken = params.get('token');

    if (urlToken) {
      setToken(urlToken);
      window.history.replaceState({}, '', location.pathname);
    }

    const token = urlToken || getToken();
    if (token) {
      authApi.getMe()
        .then(user => setCurrentUser(user))
        .catch(() => { removeToken(); setCurrentUser(null); })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loginWithGoogle = () => { authApi.googleLogin(); };
  const logout = () => { removeToken(); setCurrentUser(null); };
  const isAdmin = currentUser?.role === 'admin';

  return (
    <AuthContext.Provider value={{ currentUser, loading, loginWithGoogle, logout, isAdmin }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}