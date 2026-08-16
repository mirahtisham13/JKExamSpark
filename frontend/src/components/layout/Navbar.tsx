import Link from 'next/link';
import { useAuthStore } from '@/store/auth';
import { Menu, LogOut, User } from 'lucide-react';
import { useState } from 'react';

export function Navbar({ onMenuClick }: { onMenuClick: () => void }) {
  const { user, logout } = useAuthStore();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="h-16 bg-card-light dark:bg-card-dark border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-6 z-20 sticky top-0">
      <button onClick={onMenuClick} className="md:hidden">
        <Menu className="w-6 h-6" />
      </button>
      <div className="flex-1"></div>
      <div className="relative">
        <button onClick={() => setMenuOpen(!menuOpen)} className="flex items-center gap-3">
          <span className="text-sm font-medium hidden sm:block">{user?.full_name || 'User'}</span>
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-bold">
            {user?.full_name?.charAt(0) || 'U'}
          </div>
        </button>
        
        {menuOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-card-light dark:bg-card-dark rounded-md shadow-lg py-1 border border-gray-200 dark:border-gray-800 z-50">
            <Link href="/profile" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800">
              <User className="w-4 h-4" /> Profile
            </Link>
            <button onClick={logout} className="flex w-full items-center gap-2 px-4 py-2 text-sm text-danger hover:bg-gray-100 dark:hover:bg-gray-800">
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
