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
    <div className={`fixed inset-y-0 left-0 transform ${open ? 'translate-x-0' : '-translate-x-full'} w-64 bg-card-light dark:bg-card-dark border-r border-gray-200 dark:border-gray-800 transition-transform duration-200 ease-in-out z-30 md:relative md:translate-x-0`}>
      <div className="p-6">
        <Link href="/" className="text-2xl font-bold text-primary dark:text-white">JKExamSpark</Link>
      </div>
      <nav className="mt-6 px-4 space-y-2">
        {links.map(link => {
          const isActive = pathname === link.href || pathname.startsWith(link.href + '/');
          return (
            <Link 
              key={link.href} 
              href={link.href} 
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive ? 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-white font-medium' : 'text-text-muted hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-primary dark:hover:text-white'}`}
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
