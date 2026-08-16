"use client";

import React from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, XCircle, MinusCircle, Trophy, Target, Clock, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { Badge } from '@/components/ui/Badge';
import { useAttemptDetails } from '@/hooks/useQuiz';

export default function QuizResultPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const attemptId = searchParams.get('attempt_id');

  const { data: result, isLoading } = useAttemptDetails(Number(attemptId));

  if (isLoading) return <div className="flex justify-center items-center min-h-screen"><Spinner size="lg" /></div>;
  if (!result) return <div className="text-center py-20 text-xl font-bold">Result not found</div>;

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <Link href="/quizzes">
          <Button variant="ghost"><ArrowLeft className="w-4 h-4 mr-2" /> Back to Quizzes</Button>
        </Link>
        <Link href={`/quizzes/${result.quiz_id}`}>
          <Button variant="outline"><RefreshCw className="w-4 h-4 mr-2" /> Try Again</Button>
        </Link>
      </div>

      <div className="bg-card-light dark:bg-card-dark rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
        
        {/* Score Header */}
        <div className={`p-8 text-center text-white ${
          result.percentage >= 70 ? 'bg-gradient-to-r from-green-500 to-emerald-600' :
          result.percentage >= 40 ? 'bg-gradient-to-r from-yellow-500 to-amber-600' :
          'bg-gradient-to-r from-red-500 to-rose-600'
        }`}>
          <Trophy className="w-16 h-16 mx-auto mb-4 opacity-90" />
          <h1 className="text-3xl font-bold mb-2">Quiz Completed!</h1>
          <p className="text-lg opacity-90 mb-8">{result.quiz_title}</p>
          
          <div className="inline-block bg-white/20 rounded-2xl p-6 backdrop-blur-sm border border-white/30">
            <p className="text-sm font-medium uppercase tracking-wider mb-2 opacity-90">Your Score</p>
            <div className="flex items-baseline justify-center space-x-2">
              <span className="text-6xl font-black">{result.final_score}</span>
              <span className="text-2xl opacity-80">/ {result.total_marks}</span>
            </div>
            <p className="text-xl font-bold mt-2">{result.percentage}%</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-gray-100 dark:divide-gray-800 border-b border-gray-100 dark:border-gray-800">
          <div className="p-6 text-center">
            <CheckCircle2 className="w-8 h-8 mx-auto text-green-500 mb-2" />
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{result.correct_count}</p>
            <p className="text-sm text-gray-500 font-medium mt-1">Correct</p>
          </div>
          <div className="p-6 text-center">
            <XCircle className="w-8 h-8 mx-auto text-red-500 mb-2" />
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{result.wrong_count}</p>
            <p className="text-sm text-gray-500 font-medium mt-1">Incorrect</p>
          </div>
          <div className="p-6 text-center">
            <MinusCircle className="w-8 h-8 mx-auto text-gray-400 mb-2" />
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{result.unattempted_count}</p>
            <p className="text-sm text-gray-500 font-medium mt-1">Unattempted</p>
          </div>
          <div className="p-6 text-center">
            <Clock className="w-8 h-8 mx-auto text-blue-500 mb-2" />
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{formatTime(result.time_taken_seconds)}</p>
            <p className="text-sm text-gray-500 font-medium mt-1">Time Taken</p>
          </div>
        </div>

        {/* Breakdown List */}
        <div className="p-4 sm:p-8">
          <h3 className="text-xl font-bold mb-6 flex items-center">
            <Target className="w-5 h-5 mr-2 text-primary" />
            Detailed Review
          </h3>

          <div className="space-y-6">
            {result.questions.map((q: any, i: number) => {
              const isCorrect = q.is_correct;
              const isUnattempted = !q.selected_option;
              
              return (
                <div key={q.question_id} className={`p-5 rounded-xl border ${
                  isCorrect ? 'border-green-200 bg-green-50/50 dark:border-green-900/30 dark:bg-green-900/10' :
                  isUnattempted ? 'border-gray-200 bg-gray-50/50 dark:border-gray-700 dark:bg-gray-800/30' :
                  'border-red-200 bg-red-50/50 dark:border-red-900/30 dark:bg-red-900/10'
                }`}>
                  <div className="flex justify-between items-start mb-4">
                    <span className="font-bold text-gray-500 dark:text-gray-400">Question {i + 1}</span>
                    <Badge variant={isCorrect ? 'green' : isUnattempted ? 'gray' : 'red'}>
                      {isCorrect ? `+${q.marks_awarded} Marks` : isUnattempted ? '0 Marks' : `${q.marks_awarded} Marks`}
                    </Badge>
                  </div>
                  
                  <p className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-6">
                    {q.question_text}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                    {['A', 'B', 'C', 'D'].map(opt => {
                      const optKey = `option_${opt.toLowerCase()}`;
                      const isUsersPick = q.selected_option === opt;
                      const isActuallyCorrect = q.correct_option === opt;

                      let ringClass = "border-gray-200 dark:border-gray-700";
                      let icon = null;

                      if (isActuallyCorrect) {
                        ringClass = "border-green-500 bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300 ring-2 ring-green-500/20";
                        icon = <CheckCircle2 className="w-5 h-5 text-green-500 ml-auto" />;
                      } else if (isUsersPick && !isActuallyCorrect) {
                        ringClass = "border-red-500 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300";
                        icon = <XCircle className="w-5 h-5 text-red-500 ml-auto" />;
                      }

                      return (
                        <div key={opt} className={`p-3 rounded-lg border flex items-center ${ringClass}`}>
                          <span className="font-bold mr-3 opacity-60">{opt})</span>
                          <span>{q[optKey]}</span>
                          {icon}
                        </div>
                      );
                    })}
                  </div>

                  {q.explanation && (
                    <div className="p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-100 dark:border-gray-800 shadow-sm">
                      <span className="font-bold text-sm text-blue-600 dark:text-blue-400 uppercase tracking-wider block mb-1">
                        Explanation
                      </span>
                      <p className="text-gray-700 dark:text-gray-300 text-sm">
                        {q.explanation}
                      </p>
                    </div>
                  )}

                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
