import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../services/api';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      registrationUserId: null,

      setTokens: (accessToken, refreshToken) => {
        set({ accessToken, refreshToken });
        if (accessToken) {
          api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
        }
      },

      setUser: (user) => set({ user, isAuthenticated: !!user }),

      login: (user, accessToken, refreshToken) => {
        api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
        set({ user, accessToken, refreshToken, isAuthenticated: true });
      },

      logout: async () => {
        const { refreshToken } = get();
        try { await api.post('/auth/logout', { refreshToken }); } catch (_) {}
        delete api.defaults.headers.common['Authorization'];
        set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false });
      },

      updateUser: (updates) => set((state) => ({ user: { ...state.user, ...updates } })),

      setRegistrationUserId: (id) => set({ registrationUserId: id }),

      refreshAccessToken: async () => {
        const { refreshToken } = get();
        if (!refreshToken) return false;
        try {
          const res = await api.post('/auth/refresh', { refreshToken });
          const { accessToken: newAccess, refreshToken: newRefresh } = res.data.data;
          api.defaults.headers.common['Authorization'] = `Bearer ${newAccess}`;
          set({ accessToken: newAccess, refreshToken: newRefresh });
          return true;
        } catch {
          set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false });
          return false;
        }
      },
    }),
    {
      name: 'gymmix-auth',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export default useAuthStore;
