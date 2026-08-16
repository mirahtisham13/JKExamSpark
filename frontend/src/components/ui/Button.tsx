import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, children, disabled, ...props }, ref) => {
    const variants = {
      primary: 'bg-gradient-to-r from-primary to-primary-dark text-white hover:shadow-lg hover:shadow-primary/30 hover:-translate-y-0.5 active:translate-y-0 active:scale-95',
      secondary: 'bg-white text-gray-900 border border-gray-200 hover:border-gray-300 hover:bg-gray-50 hover:shadow-sm dark:bg-card-dark dark:text-white dark:border-gray-700 dark:hover:border-gray-600 dark:hover:bg-gray-800 active:scale-95',
      danger: 'bg-gradient-to-r from-danger to-red-600 text-white hover:shadow-lg hover:shadow-danger/30 hover:-translate-y-0.5 active:translate-y-0 active:scale-95',
      ghost: 'bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800/50 text-gray-700 dark:text-gray-300 active:scale-95',
      outline: 'border-2 border-primary/20 text-primary hover:border-primary hover:bg-primary/5 dark:border-primary/30 dark:text-primary-light dark:hover:border-primary-light dark:hover:bg-primary-light/10 active:scale-95',
    };
    
    const sizes = {
      sm: 'h-8 px-3 text-xs',
      md: 'h-10 px-4 py-2 text-sm',
      lg: 'h-12 px-6 text-base',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          'inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';
