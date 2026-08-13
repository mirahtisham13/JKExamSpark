"use client";

import React from 'react';
import Link from 'next/link';
import { Users, FileText, Target, BookOpen, Clock, AlertCircle, ShieldAlert, CheckCircle, ChevronRight } from 'lucide-react';
import { useAdminAnalytics, useAdminPendingScores, useVerifyScore } from '@/hooks/useAdmin';
import { Spinner } from '@/components/ui/Spinner';
import { Badge } from '@/components/ui/Badge';
import { formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/Button';

export default function AdminDashboardPage() {
  const { data: analytics, isLoading: analyticsLoading } = useAdminAnalytics();
  const { data: pendingScores, isLoading: scoresLoading } = useAdminPendingScores();
  const verifyScore = useVerifyScore();

  if (analyticsLoading) {
    return <div className="flex justify-center p-12"><Spinner /></div>;
  }

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>

      {/* Analytics Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div className="p-6 bg-white dark:bg-card-dark rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-sm font-medium">Total Students</span>
            <Users className="w-5 h-5 text-blue-500" />
          </div>
          <div className="text-3xl font-bold">{analytics?.total_students}</div>
          <div className="text-xs text-green-600 mt-2 font-medium">{analytics?.active_students_30d} active this month</div>
        </div>
        
        <div className="p-6 bg-white dark:bg-card-dark rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-sm font-medium">Total Submissions</span>
            <FileText className="w-5 h-5 text-green-500" />
          </div>
          <div className="text-3xl font-bold">{analytics?.total_score_submissions}</div>
          <div className="text-xs text-red-500 mt-2 font-medium">{analytics?.pending_review_submissions} pending review</div>
        </div>

        <div className="p-6 bg-white dark:bg-card-dark rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-sm font-medium">Total Exams</span>
            <Target className="w-5 h-5 text-purple-500" />
          </div>
          <div className="text-3xl font-bold">{analytics?.total_exams}</div>
        </div>

        <div className="p-6 bg-white dark:bg-card-dark rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-sm font-medium">Quiz Attempts</span>
            <Clock className="w-5 h-5 text-yellow-500" />
          </div>
          <div className="text-3xl font-bold">{analytics?.total_quiz_attempts}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Pending Action Queue */}
        <div className="lg:col-span-2 bg-white dark:bg-card-dark rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
          <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-red-50/50 dark:bg-red-900/10">
            <h2 className="text-lg font-bold flex items-center text-red-900 dark:text-red-100">
              <ShieldAlert className="w-5 h-5 mr-2 text-red-600" /> Pending Score Verifications
            </h2>
            <Link href="/admin/scores" className="text-sm text-primary hover:underline">
              Manage all &rarr;
            </Link>
          </div>
          
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {scoresLoading ? (
              <div className="p-8 flex justify-center"><Spinner /></div>
            ) : pendingScores?.data?.length === 0 ? (
              <div className="p-8 text-center text-gray-500 flex flex-col items-center">
                <CheckCircle className="w-10 h-10 text-green-500 mb-3" />
                <p>All caught up! No pending score submissions.</p>
              </div>
            ) : (
              pendingScores?.data?.slice(0, 5).map(score => (
                <div key={score.id} className="p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold">{score.user?.full_name}</span>
                      <span className="text-gray-400 text-sm">(@{score.user?.username})</span>
                    </div>
                    <div className="text-sm mt-1 text-gray-600 dark:text-gray-400">
                      <strong>{score.exam?.name}</strong> • {score.category as string}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">Submitted on {formatDate(score.submitted_at)}</div>
                  </div>
                  <div className="flex items-center space-x-6 w-full sm:w-auto">
                    <div className="text-right">
                      <div className="text-xs text-gray-500 mb-0.5">Claimed Marks</div>
                      <div className="text-2xl font-black text-primary">{score.marks_obtained}</div>
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline" className="text-green-600 border-green-200 hover:bg-green-50"
                        onClick={() => verifyScore.mutate({ id: score.id, status: 'verified' })}
                        disabled={verifyScore.isPending}
                      >
                        Approve
                      </Button>
                      <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50"
                        onClick={() => verifyScore.mutate({ id: score.id, status: 'rejected', comment: 'Rejected by admin' })}
                        disabled={verifyScore.isPending}
                      >
                        Reject
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Links */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold">Management Areas</h2>
          
          <Link href="/admin/users" className="flex items-center p-4 bg-white dark:bg-card-dark border border-gray-100 dark:border-gray-800 rounded-xl hover:border-primary transition-colors group">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg mr-4 group-hover:bg-blue-100 transition-colors"><Users className="w-6 h-6" /></div>
            <div className="flex-1">
              <div className="font-bold text-gray-900 dark:text-gray-100">Students</div>
              <div className="text-sm text-gray-500">Manage user accounts</div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-primary transition-colors" />
          </Link>
          
          <Link href="/admin/exams" className="flex items-center p-4 bg-white dark:bg-card-dark border border-gray-100 dark:border-gray-800 rounded-xl hover:border-primary transition-colors group">
            <div className="p-3 bg-purple-50 text-purple-600 rounded-lg mr-4 group-hover:bg-purple-100 transition-colors"><Target className="w-6 h-6" /></div>
            <div className="flex-1">
              <div className="font-bold text-gray-900 dark:text-gray-100">Exams & Categories</div>
              <div className="text-sm text-gray-500">Configure exams and vacancies</div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-primary transition-colors" />
          </Link>

          <Link href="/admin/quizzes" className="flex items-center p-4 bg-white dark:bg-card-dark border border-gray-100 dark:border-gray-800 rounded-xl hover:border-primary transition-colors group">
            <div className="p-3 bg-yellow-50 text-yellow-600 rounded-lg mr-4 group-hover:bg-yellow-100 transition-colors"><Clock className="w-6 h-6" /></div>
            <div className="flex-1">
              <div className="font-bold text-gray-900 dark:text-gray-100">Mock Quizzes</div>
              <div className="text-sm text-gray-500">Create and manage tests</div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-primary transition-colors" />
          </Link>

          <Link href="/admin/announcements" className="flex items-center p-4 bg-white dark:bg-card-dark border border-gray-100 dark:border-gray-800 rounded-xl hover:border-primary transition-colors group">
            <div className="p-3 bg-red-50 text-red-600 rounded-lg mr-4 group-hover:bg-red-100 transition-colors"><AlertCircle className="w-6 h-6" /></div>
            <div className="flex-1">
              <div className="font-bold text-gray-900 dark:text-gray-100">Announcements</div>
              <div className="text-sm text-gray-500">Post updates & cutoffs</div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-primary transition-colors" />
          </Link>
        </div>
      </div>
    </div>
  );
}
