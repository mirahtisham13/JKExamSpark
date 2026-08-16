import { cn } from '@/lib/utils';

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'blue' | 'green' | 'red' | 'yellow' | 'gray' | 'purple';
}

export function Badge({ className, variant = 'gray', children, ...props }: BadgeProps) {
  const variants = {
    blue: 'bg-primary/10 text-primary',
    green: 'bg-success/10 text-success',
    red: 'bg-danger/10 text-danger',
    yellow: 'bg-accent/10 text-accent',
    gray: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
    purple: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
  };

  return (
    <div className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none', variants[variant], className)} {...props}>
      {children}
    </div>
  );
}
