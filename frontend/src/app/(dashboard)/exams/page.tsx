"use client";

import Link from 'next/link';
import { useExams } from '@/hooks/useExams';
import { Spinner } from '@/components/ui/Spinner';
import { Badge } from '@/components/ui/Badge';
import { Target, Search } from 'lucide-react';
import { useState } from 'react';
import { Input } from '@/components/ui/Input';

export default function ExamsPage() {
  const { data: exams, isLoading, error } = useExams();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredExams = exams?.filter(exam => 
    exam.name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold flex items-center">
          <Target className="w-8 h-8 mr-3 text-primary" />
          All Exams
        </h1>
        <div className="w-full sm:w-72 relative">
          <Input 
            placeholder="Search exams..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute right-3 top-3 text-gray-400 w-5 h-5" />
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center p-12"><Spinner /></div>
      ) : error ? (
        <div className="p-6 bg-red-50 text-red-600 rounded-lg">Failed to load exams.</div>
      ) : filteredExams.length === 0 ? (
        <div className="p-12 text-center text-gray-500 bg-white dark:bg-card-dark rounded-xl border border-gray-100 dark:border-gray-800">
          No exams found matching your search.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredExams.map(exam => (
            <div key={exam.id} className="p-6 bg-white dark:bg-card-dark rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-md transition-shadow flex flex-col h-full">
              <div className="flex justify-between items-start mb-4 gap-4">
                <h3 className="font-bold text-lg leading-tight">{exam.name}</h3>
                <Badge variant={exam.status === 'ACTIVE' ? 'green' : exam.status === 'UPCOMING' ? 'blue' : 'gray'} className="shrink-0">
                  {exam.status}
                </Badge>
              </div>
              <div className="text-sm text-gray-500 space-y-2 mb-6 flex-1">
                <div className="flex justify-between">
                  <span>Year:</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">{exam.year}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Marks:</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">{exam.total_marks}</span>
                </div>
                {exam.total_vacancies > 0 && (
                  <div className="flex justify-between">
                    <span>Vacancies:</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">{exam.total_vacancies}</span>
                  </div>
                )}
              </div>
              <Link 
                href={`/exams/${exam.id}`} 
                className="w-full text-center px-4 py-2 bg-primary/10 text-primary hover:bg-primary hover:text-white rounded-lg font-medium transition-colors mt-auto"
              >
                View Exam Details
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
