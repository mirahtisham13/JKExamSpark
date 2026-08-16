import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, BookOpen, CheckSquare, Award, FileText, Settings, Users, Bell } from 'lucide-react';
import { useAuthStore } from '@/store/auth';

export function Sidebar({ open }: { open: boolean }) {
  const pathname = usePathname();
  const { user } = useAuthStore();
  
  const isAdmin = user?.role === 'ADMIN';

  const studentLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/exams', label: 'Exams', icon: FileText },
    { href: '/materials', label: 'Study Materials', icon: BookOpen },
    { href: '/quizzes', label: 'Quizzes', icon: CheckSquare },
    { href: '/my-scores', label: 'My Scores', icon: Award },
    { href: '/rankings', label: 'Rankings', icon: Award },
    { href: '/cutoff', label: 'Cutoff Predictor', icon: Award },
  ];

  const adminLinks = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/users', label: 'Users', icon: Users },
    { href: '/admin/exams', label: 'Exams', icon: FileText },
    { href: '/admin/materials', label: 'Materials', icon: BookOpen },
    { href: '/admin/quizzes', label: 'Quizzes', icon: CheckSquare },
    { href: '/admin/scores', label: 'Score Submissions', icon: Award },
    { href: '/admin/announcements', label: 'Announcements', icon: Bell },
  ];

  const links = isAdmin ? adminLinks : studentLinks;

  return (
    <div className={`fixed inset-y-0 left-0 transform ${open ? 'translate-x-0' : '-translate-x-full'} w-64 bg-white dark:bg-card-dark border-r border-gray-200/50 dark:border-gray-800/50 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] z-30 md:relative md:translate-x-0 shadow-lg md:shadow-none`}>
      <div className="p-6">
        <Link href="/" className="text-2xl font-black bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent tracking-tight">JKExamSpark</Link>
      </div>
      <nav className="mt-6 px-4 space-y-2">
        {links.map(link => {
          const isActive = pathname === link.href || pathname.startsWith(link.href + '/');
          return (
            <Link 
              key={link.href} 
              href={link.href} 
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${isActive ? 'bg-gradient-to-r from-primary/10 to-transparent text-primary dark:from-primary/20 dark:to-transparent dark:text-primary-light font-bold shadow-[inset_4px_0_0_0_rgba(14,165,233,1)]' : 'text-text-muted hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-gray-100 hover:translate-x-1'}`}
            >
              <link.icon className="w-5 h-5" />
              {link.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
