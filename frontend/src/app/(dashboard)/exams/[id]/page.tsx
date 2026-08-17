"use client";

import React from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useExam } from '@/hooks/useExam';
import { Spinner } from '@/components/ui/Spinner';
import { Badge } from '@/components/ui/Badge';
import { Target, BookOpen, CheckSquare, ChevronLeft, Calendar, FileText, Users, AlertCircle } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export default function ExamDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const examId = params.id as string;
  
  const { data: exam, isLoading, error } = useExam(examId);

  if (isLoading) {
    return <div className="flex h-[60vh] items-center justify-center"><Spinner /></div>;
  }

  if (error || !exam) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <button onClick={() => router.back()} className="text-gray-500 hover:text-gray-900 mb-6 flex items-center">
          <ChevronLeft className="w-4 h-4 mr-1" /> Back
        </button>
        <div className="bg-red-50 text-red-600 p-6 rounded-xl flex items-center">
          <AlertCircle className="w-6 h-6 mr-3" /> 
          <div>
            <h3 className="font-bold">Exam Not Found</h3>
            <p>The exam you are looking for does not exist or failed to load.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6 mb-12">
      <button onClick={() => router.push('/')} className="text-gray-500 hover:text-gray-900 mb-2 flex items-center text-sm font-medium transition-colors">
        <ChevronLeft className="w-4 h-4 mr-1" /> Back to Dashboard
      </button>

      {/* Header Section */}
      <div className="bg-gradient-to-r from-primary to-blue-800 rounded-2xl p-6 md:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10 hidden md:block">
          <Target className="w-48 h-48 -mr-12 -mt-12" />
        </div>
        <div className="relative z-10">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <Badge variant={exam.status === 'ACTIVE' ? 'green' : exam.status === 'UPCOMING' ? 'blue' : 'gray'} className="bg-white/20 text-white border-0 hover:bg-white/30">
              {exam.status}
            </Badge>
            <Badge variant="gray" className="bg-white/10 text-white border-0">{exam.year}</Badge>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold mb-2 leading-tight">{exam.name}</h1>
          <p className="text-blue-100 text-lg">{exam.notification_number || 'JKSSB Official Notification'}</p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-8 border-t border-white/20 pt-6">
            <div>
              <div className="text-blue-200 text-sm mb-1 flex items-center"><FileText className="w-4 h-4 mr-1.5" /> Total Marks</div>
              <div className="text-2xl font-bold">{exam.total_marks}</div>
            </div>
            {exam.total_vacancies > 0 && (
              <div>
                <div className="text-blue-200 text-sm mb-1 flex items-center"><Users className="w-4 h-4 mr-1.5" /> Vacancies</div>
                <div className="text-2xl font-bold">{exam.total_vacancies}</div>
              </div>
            )}
            {exam.exam_date && (
              <div>
                <div className="text-blue-200 text-sm mb-1 flex items-center"><Calendar className="w-4 h-4 mr-1.5" /> Exam Date</div>
                <div className="text-lg font-bold mt-1">{formatDate(exam.exam_date)}</div>
              </div>
            )}
            {exam.official_difficulty && (
              <div>
                <div className="text-blue-200 text-sm mb-1 flex items-center"><Target className="w-4 h-4 mr-1.5" /> Difficulty</div>
                <div className="text-lg font-bold mt-1">{exam.official_difficulty}</div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Main Details (Left 2 cols) */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white dark:bg-card-dark rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-6">
            <h2 className="text-xl font-bold mb-4">Categories & Vacancies</h2>
            {exam.exam_categories && exam.exam_categories.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-100 dark:border-gray-800 text-sm text-gray-500">
                      <th className="pb-3 font-medium">Category</th>
                      <th className="pb-3 font-medium text-right">Vacancies</th>
                      <th className="pb-3 font-medium text-right">Official Cutoff</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                    {exam.exam_categories.map((ec) => (
                      <tr key={ec.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                        <td className="py-3 font-medium">{ec.category.name}</td>
                        <td className="py-3 text-right">{ec.vacancies || '-'}</td>
                        <td className="py-3 text-right font-semibold text-primary">{ec.official_cutoff || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-gray-500 text-center py-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                No category details available for this exam.
              </div>
            )}
          </div>
        </div>

        {/* Action Sidebar (Right 1 col) */}
        <div className="space-y-4">
          <div className="bg-white dark:bg-card-dark rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-6">
            <h2 className="text-lg font-bold mb-4">Prepare for this Exam</h2>
            <div className="space-y-3">
              <Link href={`/materials?exam=${exam.id}`} className="flex items-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-primary hover:bg-primary/5 transition-colors group">
                <div className="p-3 bg-purple-50 text-purple-600 dark:bg-purple-900/30 rounded-lg mr-4 group-hover:bg-purple-100 transition-colors">
                  <BookOpen className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold group-hover:text-primary transition-colors">Study Materials</h3>
                  <p className="text-xs text-gray-500 mt-0.5">Notes, PDFs & Guides</p>
                </div>
              </Link>

              <Link href={`/quizzes?exam=${exam.id}`} className="flex items-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-primary hover:bg-primary/5 transition-colors group">
                <div className="p-3 bg-blue-50 text-blue-600 dark:bg-blue-900/30 rounded-lg mr-4 group-hover:bg-blue-100 transition-colors">
                  <CheckSquare className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold group-hover:text-primary transition-colors">Mock Quizzes</h3>
                  <p className="text-xs text-gray-500 mt-0.5">Practice & test yourself</p>
                </div>
              </Link>
              
              <Link href={`/cutoff?exam=${exam.id}`} className="flex items-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-primary hover:bg-primary/5 transition-colors group">
                <div className="p-3 bg-red-50 text-red-600 dark:bg-red-900/30 rounded-lg mr-4 group-hover:bg-red-100 transition-colors">
                  <Target className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold group-hover:text-primary transition-colors">Cutoff Predictor</h3>
                  <p className="text-xs text-gray-500 mt-0.5">Check estimated cutoffs</p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
