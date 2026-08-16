'use client';

import { useAuthStore } from '@/store/auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function Layout({ children }: { children: React.ReactNode }) {
  const { accessToken } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    // Basic auth check
    if (!accessToken && typeof window !== 'undefined') {
      // Mocking check, you'd usually redirect here
      // router.push('/login');
    }
  }, [accessToken, router]);

  return <DashboardLayout>{children}</DashboardLayout>;
}
