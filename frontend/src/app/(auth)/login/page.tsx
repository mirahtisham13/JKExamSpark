'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();
  const login = useAuthStore(s => s.login);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // mock login
    login('mock-token', {
      id: '1',
      email,
      username: 'student',
      full_name: 'Student Name',
      role: 'STUDENT' as any,
      is_active: true,
      created_at: new Date().toISOString()
    });
    router.push('/dashboard');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Email</label>
        <input 
          type="email" 
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          className="w-full p-2 border rounded-md dark:bg-gray-800 dark:border-gray-700" 
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Password</label>
        <input 
          type="password" 
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          className="w-full p-2 border rounded-md dark:bg-gray-800 dark:border-gray-700" 
        />
      </div>
      <button type="submit" className="w-full py-2 px-4 bg-primary text-white rounded-md hover:bg-primary-light">
        Sign In
      </button>
      <div className="text-center text-sm mt-4">
        Don't have an account? <Link href="/register" className="text-accent hover:underline">Register</Link>
      </div>
    </form>
  );
}
