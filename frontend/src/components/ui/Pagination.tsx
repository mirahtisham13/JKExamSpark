import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  return (
    <div className="flex items-center justify-center space-x-2 py-4">
      <button 
        disabled={currentPage <= 1} 
        onClick={() => onPageChange(currentPage - 1)}
        className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50 dark:hover:bg-gray-800"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <span className="text-sm">Page {currentPage} of {totalPages}</span>
      <button 
        disabled={currentPage >= totalPages} 
        onClick={() => onPageChange(currentPage + 1)}
        className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50 dark:hover:bg-gray-800"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
}
