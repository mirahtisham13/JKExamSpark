"use client";

import React from 'react';
import Link from 'next/link';
import { Trophy, FileText, Target, BookOpen, Clock, ChevronRight, Bell, AlertCircle, ArrowUpRight } from 'lucide-react';
import { useStudentDashboard } from '@/hooks/useDashboard';
import { useAuthStore } from '@/store/auth';
import { useExams } from '@/hooks/useExams';
import { Spinner } from '@/components/ui/Spinner';
import { Badge } from '@/components/ui/Badge';
import { formatScore, formatDate } from '@/lib/utils';

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { data: dashboard, isLoading, error } = useStudentDashboard(!!user);
  const { data: exams, isLoading: isLoadingExams } = useExams();

  return (
    <div className="p-4 sm:p-6 space-y-8 max-w-7xl mx-auto">
      
      {/* Welcome Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary to-accent p-8 text-white shadow-xl">
        <div className="relative z-10">
          <h1 className="text-3xl font-extrabold mb-2">
            {user ? `Welcome back, ${user.full_name}!` : "Welcome to JKExamSpark"}
          </h1>
          <p className="text-white/80 max-w-2xl text-lg">
            {user 
              ? "Track your progress, take timed quizzes, and compare your ranks."
              : "The premier platform for JKSSB exam preparation. Take quizzes, download materials, and view rankings for free!"}
          </p>
          {!user && (
            <div className="mt-6 flex gap-4">
              <Link href="/login" className="px-6 py-2 bg-white text-primary rounded-lg font-bold hover:bg-gray-100 transition-colors">
                Log In
              </Link>
              <Link href="/register" className="px-6 py-2 bg-black/20 text-white rounded-lg font-bold hover:bg-black/30 transition-colors">
                Register Free
              </Link>
            </div>
          )}
        </div>
        <div className="absolute right-0 top-0 -mt-8 -mr-8 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl pointer-events-none"></div>
      </div>

      {/* Conditional Stats Cards (Logged In Only) */}
      {user && isLoading ? (
        <div className="flex h-32 items-center justify-center"><Spinner /></div>
      ) : user && dashboard ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="p-5 bg-white dark:bg-card-dark rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col hover:-translate-y-1 hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-500">Quizzes Taken</span>
              <div className="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 rounded-lg"><Clock className="w-4 h-4" /></div>
            </div>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">{dashboard.stats.quizzes_taken}</div>
          </div>

          <div className="p-5 bg-white dark:bg-card-dark rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col hover:-translate-y-1 hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-500">Materials Downloaded</span>
              <div className="p-2 bg-purple-50 dark:bg-purple-900/30 text-purple-600 rounded-lg"><BookOpen className="w-4 h-4" /></div>
            </div>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">{dashboard.stats.materials_downloaded}</div>
          </div>

          <div className="p-5 bg-white dark:bg-card-dark rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col hover:-translate-y-1 hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-500">Exams Submitted</span>
              <div className="p-2 bg-green-50 dark:bg-green-900/30 text-green-600 rounded-lg"><FileText className="w-4 h-4" /></div>
            </div>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">{dashboard.stats.exams_submitted}</div>
          </div>

        <div className="p-5 bg-white dark:bg-card-dark rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col hover:-translate-y-1 hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-500">Best Rank</span>
            <div className="p-2 bg-yellow-50 dark:bg-yellow-900/30 text-yellow-600 rounded-lg"><Trophy className="w-4 h-4" /></div>
          </div>
          <div className="text-3xl font-bold text-primary">{dashboard.stats.best_rank_text}</div>
        </div>
      </div>
      ) : null}

      {/* Best Ranking Highlight (if any) - Logged in only */}
      {user && dashboard?.best_ranking && (
        <div className="bg-gradient-to-r from-primary to-blue-800 rounded-xl p-6 text-white shadow-lg relative overflow-hidden flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="absolute top-0 right-0 p-4 opacity-10 hidden md:block">
            <Target className="w-32 h-32" />
          </div>
          <div className="relative z-10 w-full">
            <div className="flex items-center space-x-2 text-blue-200 text-sm font-medium mb-1">
              <Trophy className="w-4 h-4 text-yellow-400" /> 
              <span>Highest Percentile Submission</span>
            </div>
            <h2 className="text-2xl font-bold">{dashboard.best_ranking.exam_name}</h2>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mt-6">
              <div>
                <div className="text-blue-200 text-sm mb-1">Overall Rank</div>
                <div className="text-3xl font-bold">#{dashboard.best_ranking.overall_rank}</div>
              </div>
              <div>
                <div className="text-blue-200 text-sm mb-1">Category Rank</div>
                <div className="text-3xl font-bold">#{dashboard.best_ranking.category_rank}</div>
              </div>
              <div>
                <div className="text-blue-200 text-sm mb-1">Percentile</div>
                <div className="text-3xl font-bold">{dashboard.best_ranking.percentile}%</div>
              </div>
              <div>
                <div className="text-blue-200 text-sm mb-1">Est. Cutoff</div>
                <div className="text-xl font-bold mt-1.5">
                  {dashboard.best_ranking.estimated_cutoff_min ? 
                    `${dashboard.best_ranking.estimated_cutoff_min.toFixed(1)} - ${dashboard.best_ranking.estimated_cutoff_max?.toFixed(1)}` 
                    : 'N/A'
                  }
                </div>
              </div>
            </div>
          </div>
          <Link href="/rankings" className="shrink-0 bg-white/20 hover:bg-white/30 transition-colors rounded-lg px-4 py-2 text-sm font-medium z-10 whitespace-nowrap">
            View Rankings &rarr;
          </Link>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (Spans 2) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Exams Listing (Public to all) */}
          <div className="bg-white dark:bg-card-dark rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
            <div className="p-5 border-b border-gray-50 dark:border-gray-800 flex justify-between items-center">
              <h2 className="text-lg font-bold flex items-center">
                <Target className="w-5 h-5 mr-2 text-primary" /> Available Exams
              </h2>
              <Link href="/exams" className="text-sm text-primary hover:underline flex items-center">
                View all <ChevronRight className="w-4 h-4 ml-0.5" />
              </Link>
            </div>
            <div className="divide-y divide-gray-50 dark:divide-gray-800">
              {isLoadingExams ? (
                <div className="p-10 flex justify-center"><Spinner /></div>
              ) : !exams || exams.length === 0 ? (
                <div className="p-6 text-center text-gray-500">No exams available right now.</div>
              ) : (
                exams.slice(0, 5).map(exam => (
                  <div key={exam.id} className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <div>
                      <div className="font-semibold text-gray-900 dark:text-gray-100">{exam.name}</div>
                      <div className="flex items-center space-x-2 text-sm text-gray-500 mt-1">
                        <span>{exam.year}</span>
                        <span>•</span>
                        <span>{exam.total_marks} Marks</span>
                        <span>•</span>
                        <Badge variant={exam.status === 'UPCOMING' ? 'blue' : exam.status === 'ACTIVE' ? 'green' : 'gray'} className="text-[10px]">
                          {exam.status}
                        </Badge>
                      </div>
                    </div>
                    <Link href={`/exams/${exam.id}`} className="px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50 rounded-md text-sm font-medium transition-colors">
                      View Details
                    </Link>
                  </div>
                ))
              )}
            </div>
          </div>
          
          {/* Recent Submissions (Logged in only) */}
          {user && dashboard && (
            <div className="bg-white dark:bg-card-dark rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
              <div className="p-5 border-b border-gray-50 dark:border-gray-800 flex justify-between items-center">
                <h2 className="text-lg font-bold flex items-center">
                  <FileText className="w-5 h-5 mr-2 text-primary" /> Recent Score Submissions
                </h2>
                <Link href="/my-scores" className="text-sm text-primary hover:underline flex items-center">
                  View all <ChevronRight className="w-4 h-4 ml-0.5" />
                </Link>
              </div>
              <div className="divide-y divide-gray-50 dark:divide-gray-800">
                {dashboard.recent_submissions.length === 0 ? (
                  <div className="p-6 text-center text-gray-500">No scores submitted yet.</div>
                ) : (
                  dashboard.recent_submissions.map(sub => (
                    <div key={sub.id} className="p-4 flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900 dark:text-gray-100">{sub.exam_name}</div>
                        <div className="flex items-center mt-1 space-x-2 text-sm text-gray-500">
                          <span>{sub.category_name}</span>
                          <span>•</span>
                          <span>{formatDate(sub.submitted_at)}</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="font-bold text-lg">{sub.marks_obtained}</span>
                        <Badge variant={sub.verification_status === 'VERIFIED' ? 'green' : sub.verification_status === 'REJECTED' ? 'red' : 'yellow'} className="mt-1 scale-90 origin-right">
                          {sub.verification_status}
                        </Badge>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

        </div>

        {/* Right Column (Spans 1) */}
        <div className="space-y-6">
          
          {/* Quick Links (Public) */}
          <div className="bg-white dark:bg-card-dark rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-5">
            <h2 className="text-lg font-bold mb-4">Quick Links</h2>
            <div className="space-y-3">
              <Link href="/materials" className="flex items-center p-3 rounded-lg bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors group">
                <div className="p-2 bg-white dark:bg-gray-900 rounded shadow-sm mr-3 text-purple-600"><BookOpen className="w-5 h-5" /></div>
                <div className="font-medium flex-1">Study Materials</div>
                <ArrowUpRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
              </Link>
              <Link href="/my-scores" className="flex items-center p-3 rounded-lg bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors group">
                <div className="p-2 bg-white dark:bg-gray-900 rounded shadow-sm mr-3 text-green-600"><FileText className="w-5 h-5" /></div>
                <div className="font-medium flex-1">Submit Score</div>
                <ArrowUpRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
              </Link>
              <Link href="/cutoff" className="flex items-center p-3 rounded-lg bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors group">
                <div className="p-2 bg-white dark:bg-gray-900 rounded shadow-sm mr-3 text-red-600"><Target className="w-5 h-5" /></div>
                <div className="font-medium flex-1">Cutoff Predictor</div>
                <ArrowUpRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
              </Link>
            </div>
          </div>

          {/* Announcements (Logged in only) */}
          {user && dashboard && (
            <div className="bg-white dark:bg-card-dark rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
              <div className="p-5 border-b border-gray-50 dark:border-gray-800 flex items-center bg-blue-50/50 dark:bg-blue-900/10">
                <Bell className="w-5 h-5 mr-2 text-blue-600" />
                <h2 className="text-lg font-bold text-blue-900 dark:text-blue-100">Announcements</h2>
              </div>
              <div className="divide-y divide-gray-50 dark:divide-gray-800">
                {dashboard.announcements.length === 0 ? (
                  <div className="p-6 text-center text-gray-500">No new announcements.</div>
                ) : (
                  dashboard.announcements.map(ann => (
                    <div key={ann.id} className="p-5 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant={ann.type === 'WARNING' ? 'red' : ann.type === 'SUCCESS' ? 'green' : 'blue'} className="text-[10px]">
                          {ann.type}
                        </Badge>
                        <span className="text-xs text-gray-400">{formatDate(ann.created_at)}</span>
                      </div>
                      <h3 className="font-bold text-gray-900 dark:text-gray-100 text-sm leading-tight mb-1">{ann.title}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{ann.content}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
