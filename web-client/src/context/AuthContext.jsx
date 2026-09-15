import React, { createContext, useState, useEffect, useContext } from 'react';
import { authAPI } from '../services/api';
import socketService from '../services/socket';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    checkAuth();

    const handleUnauthorized = () => {
      localStorage.removeItem('clientToken');
      setUser(null);
      setIsLoggedIn(false);
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => {
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
    };
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      const token = localStorage.getItem('clientToken');
      socketService.connect(token);

      const handleProfileUpdate = (data) => {
        console.log('🔄 User profile updated via socket:', data.user);
        setUser(data.user);
      };

      const socket = socketService.socket;
      if (socket) {
        socket.on('userProfileUpdated', handleProfileUpdate);
      }

      return () => {
        if (socket) {
          socket.off('userProfileUpdated', handleProfileUpdate);
        }
      };
    } else {
      socketService.disconnect();
    }
  }, [isLoggedIn]);

  const checkAuth = async () => {
    const token = localStorage.getItem('clientToken');
    if (token) {
      try {
        const response = await authAPI.getProfile();
        if (response.success) {
          setUser(response.user);
          setIsLoggedIn(true);
        }
      } catch (error) {
        console.error('Erreur auth:', error);
        localStorage.removeItem('clientToken');
        setUser(null);
        setIsLoggedIn(false);
      }
    }
    setLoading(false);
  };

  const login = async (email, password) => {
    try {
      const response = await authAPI.login(email, password);
      if (response.success) {
        setUser(response.user);
        setIsLoggedIn(true);
        return { success: true };
      }
      return { success: false, message: response.message };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Erreur de connexion' };
    }
  };

  const register = async (userData) => {
    try {
      const response = await authAPI.register({
        ...userData,
        role: 'client',
      });
      if (response.success) {
        setUser(response.user);
        setIsLoggedIn(true);
        return { success: true };
      }
      return { success: false, message: response.message };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Erreur d\'inscription' };
    }
  };

  const logout = () => {
    authAPI.logout();
    setUser(null);
    setIsLoggedIn(false);
  };

  const googleLogin = async () => {
    return new Promise((resolve, reject) => {
      try {
        const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

        if (!clientId || clientId === 'YOUR_GOOGLE_CLIENT_ID') {
          reject(new Error('Google Client ID non configuré'));
          return;
        }

        // Load Google OAuth script if not loaded
        if (!window.google) {
          const script = document.createElement('script');
          script.src = 'https://accounts.google.com/gsi/client';
          script.async = true;
          script.defer = true;
          document.head.appendChild(script);

          script.onload = () => initGoogleAuth(clientId, resolve, reject);
          script.onerror = () => reject(new Error('Erreur chargement script Google'));
        } else {
          initGoogleAuth(clientId, resolve, reject);
        }
      } catch (error) {
        reject(error);
      }
    });
  };

  const initGoogleAuth = (clientId, resolve, reject) => {
    try {
      const tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: 'email profile',
        callback: async (tokenResponse) => {
          try {
            if (tokenResponse.error) {
              reject(new Error(tokenResponse.error));
              return;
            }

            const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
              headers: {
                Authorization: `Bearer ${tokenResponse.access_token}`,
              },
            });

            if (!userInfoResponse.ok) {
              throw new Error('Erreur récupération infos utilisateur');
            }

            const userInfo = await userInfoResponse.json();

            const result = await authAPI.googleAuth({
              googleId: userInfo.id,
              email: userInfo.email,
              name: userInfo.name,
              picture: userInfo.picture,
            });

            if (result.success) {
              setUser(result.user);
              setIsLoggedIn(true);
              resolve({ success: true, user: result.user });
            } else {
              reject(new Error(result.message || 'Erreur connexion Google'));
            }
          } catch (error) {
            reject(error);
          }
        },
      });

      tokenClient.requestAccessToken({ prompt: 'consent' });
    } catch (error) {
      reject(error);
    }
  };

  const updateUserProfile = async (data) => {
    try {
      setLoading(true);
      const response = await authAPI.updateProfile(data);
      if (response.success) {
        setUser(response.user);
        return { success: true };
      }
      return { success: false, message: response.message };
    } catch (error) {
      console.error('Update Profile Error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Erreur lors de la mise à jour du profil';
      return {
        success: false,
        message: errorMessage
      };
    } finally {
      setLoading(false);
    }
  };

  const addAddress = async (addressData) => {
    try {
      setLoading(true);
      const response = await authAPI.addAddress(addressData);
      if (response.success) {
        setUser(response.user);
        return { success: true };
      }
      return { success: false, message: response.message };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Erreur ajout adresse' };
    } finally {
      setLoading(false);
    }
  };

  const removeAddress = async (id) => {
    try {
      setLoading(true);
      const response = await authAPI.removeAddress(id);
      if (response.success) {
        setUser(response.user);
        return { success: true };
      }
      return { success: false, message: response.message };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Erreur suppression adresse' };
    } finally {
      setLoading(false);
    }
  };

  const setDefaultAddress = async (id) => {
    try {
      const data = await authAPI.setDefaultAddress(id);
      if (data.success) {
        setUser(data.user);
        return { success: true };
      }
      return { success: false, message: data.message };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Erreur lors de la mise à jour' };
    }
  };

  const updateAddress = async (id, addressData) => {
    try {
      const data = await authAPI.updateAddress(id, addressData);
      if (data.success) {
        setUser(data.user);
        return { success: true };
      }
      return { success: false, message: data.message };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Erreur lors de la mise à jour' };
    }
  };

  const value = {
    user,
    loading,
    isLoggedIn: !!user,
    login,
    register,
    logout,
    googleLogin,
    updateUserProfile,
    addAddress,
    removeAddress,
    setDefaultAddress,
    updateAddress,
    checkAuth
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
