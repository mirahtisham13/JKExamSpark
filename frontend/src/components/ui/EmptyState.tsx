import React from 'react';
import { FileQuestion, SearchX, Inbox } from 'lucide-react';
import { Button } from './Button';

interface EmptyStateProps {
  icon?: 'search' | 'inbox' | 'file';
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ icon = 'inbox', title, description, actionLabel, onAction }: EmptyStateProps) {
  const icons = {
    search: <SearchX className="mx-auto h-12 w-12 text-gray-400" />,
    inbox: <Inbox className="mx-auto h-12 w-12 text-gray-400" />,
    file: <FileQuestion className="mx-auto h-12 w-12 text-gray-400" />,
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center min-h-[300px] border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-xl bg-card-light dark:bg-card-dark">
      {icons[icon]}
      <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
        {description}
      </p>
      {actionLabel && onAction && (
        <div className="mt-6">
          <Button onClick={onAction}>{actionLabel}</Button>
        </div>
      )}
    </div>
  );
}
