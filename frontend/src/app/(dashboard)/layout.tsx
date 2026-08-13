'use client';

import { useAuthStore } from '@/store/auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { LayoutDashboard, BookOpen, CheckSquare, Award, FileText, Menu } from 'lucide-react';
import { useState } from 'react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuthStore();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    // For now allow access
  }, []);

  const links = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/exams', label: 'Exams', icon: FileText },
    { href: '/materials', label: 'Study Materials', icon: BookOpen },
    { href: '/quizzes', label: 'Quizzes', icon: CheckSquare },
    { href: '/my-scores', label: 'My Scores', icon: Award },
    { href: '/rankings', label: 'Rankings', icon: Award },
    { href: '/cutoff', label: 'Cutoff Predictor', icon: Award },
  ];

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark flex">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} w-64 bg-card-light dark:bg-card-dark border-r border-gray-200 dark:border-gray-800 transition-transform duration-200 ease-in-out z-30 md:relative md:translate-x-0`}>
        <div className="p-6">
          <Link href="/" className="text-2xl font-bold text-primary dark:text-white">JKExamSpark</Link>
        </div>
        <nav className="mt-6 px-4 space-y-2">
          {links.map(link => (
            <Link key={link.href} href={link.href} className="flex items-center gap-3 px-4 py-3 text-text-muted hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-primary dark:hover:text-white rounded-lg transition-colors">
              <link.icon className="w-5 h-5" />
              {link.label}
            </Link>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-card-light dark:bg-card-dark border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-6 z-20">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="md:hidden">
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex-1"></div>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium">{user?.full_name || 'Student'}</span>
            <Link href="/profile" className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-bold">
              {user?.full_name?.charAt(0) || 'S'}
            </Link>
          </div>
        </header>
        <main className="flex-1 p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
