import { ReactNode } from 'react';

interface TableProps {
  headers: string[];
  children: ReactNode;
  emptyState?: ReactNode;
  isEmpty?: boolean;
}

export function Table({ headers, children, emptyState, isEmpty }: TableProps) {
  if (isEmpty) return <>{emptyState}</>;
  
  return (
    <div className="w-full overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-800">
      <table className="w-full text-left text-sm">
        <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
          <tr>
            {headers.map((h, i) => (
              <th key={i} className="px-6 py-4 font-medium text-gray-900 dark:text-gray-100">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-800 bg-card-light dark:bg-card-dark">
          {children}
        </tbody>
      </table>
    </div>
  );
}
