import { create } from 'zustand';
import { User } from '@/types';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setAccessToken: (token: string | null) => void;
  login: (token: string, user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  isLoading: true,
  setUser: (user) => set({ user }),
  setAccessToken: (token) => {
    if (token) localStorage.setItem('access_token', token);
    else localStorage.removeItem('access_token');
    set({ accessToken: token });
  },
  login: (token, user) => {
    localStorage.setItem('access_token', token);
    set({ accessToken: token, user, isLoading: false });
  },
  logout: () => {
    localStorage.removeItem('access_token');
    set({ accessToken: null, user: null });
  },
}));
