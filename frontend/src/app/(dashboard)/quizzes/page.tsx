"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Search, Clock, FileQuestion, Filter, Target } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { Badge } from '@/components/ui/Badge';
import { useStudentQuizzes } from '@/hooks/useQuiz';

export default function StudentQuizzesPage() {
  const [search, setSearch] = useState("");
  const { data: quizzes, isLoading } = useStudentQuizzes();

  const filteredQuizzes = quizzes?.filter(q => q.title.toLowerCase().includes(search.toLowerCase())) || [];

  return (
    <div className="flex flex-col md:flex-row gap-6 p-6 min-h-screen">
      
      {/* Sidebar Filters */}
      <div className="w-full md:w-64 space-y-6 flex-shrink-0 hidden md:block">
        <div className="bg-card-light dark:bg-card-dark p-5 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm sticky top-6">
          <div className="flex items-center space-x-2 mb-4 text-lg font-bold">
            <Filter className="w-5 h-5 text-primary" />
            <h2>Filters</h2>
          </div>
          <p className="text-sm text-gray-500">More filters coming soon...</p>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Mock Quizzes</h1>
            <p className="text-gray-500 mt-1">Test your knowledge with these practice quizzes. Scores are completely separate from actual exams.</p>
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Search quizzes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none transition-shadow"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-20"><Spinner size="lg" /></div>
        ) : filteredQuizzes.length === 0 ? (
          <EmptyState 
            icon="search" 
            title="No quizzes found" 
            description="Try adjusting your search query or check back later." 
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredQuizzes.map((quiz) => (
              <div 
                key={quiz.id} 
                className="group flex flex-col bg-card-light dark:bg-card-dark rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden"
              >
                <div className="p-6 flex-1">
                  <div className="flex justify-between items-start mb-3">
                    <Badge variant={
                      quiz.difficulty === 'hard' ? 'red' : 
                      quiz.difficulty === 'medium' ? 'yellow' : 'green'
                    } className="capitalize">
                      {quiz.difficulty}
                    </Badge>
                  </div>
                  <h3 className="font-bold text-xl leading-tight mb-4 text-gray-900 dark:text-gray-100 group-hover:text-primary transition-colors">
                    {quiz.title}
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-sm text-gray-600 dark:text-gray-400 mb-6">
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-2 text-gray-400" />
                      {quiz.duration_minutes} min
                    </div>
                    <div className="flex items-center">
                      <Target className="w-4 h-4 mr-2 text-gray-400" />
                      {quiz.total_marks} Marks
                    </div>
                    <div className="flex items-center">
                      <FileQuestion className="w-4 h-4 mr-2 text-gray-400" />
                      {quiz.questions_count || 0} Qs
                    </div>
                  </div>
                </div>
                
                <div className="p-4 bg-gray-50 dark:bg-gray-800/50">
                  <Link href={`/quizzes/${quiz.id}`} className="block">
                    <Button className="w-full">
                      View Details
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
