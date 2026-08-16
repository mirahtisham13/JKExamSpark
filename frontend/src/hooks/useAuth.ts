import { useAuthStore } from '@/store/auth';

export const useAuth = () => {
  const store = useAuthStore();

  const isAuthenticated = !!store.accessToken && !!store.user;

  return {
    ...store,
    isAuthenticated,
  };
};
