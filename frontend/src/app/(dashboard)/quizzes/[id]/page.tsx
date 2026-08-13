"use client";

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Clock, Target, AlertTriangle, CheckCircle, Brain, Play } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { Badge } from '@/components/ui/Badge';
import { useQuizDetails, useStartAttempt } from '@/hooks/useQuiz';

export default function QuizDetailsPage() {
  const params = useParams();
  const quizId = params.id as string;
  const router = useRouter();

  const { data: quiz, isLoading } = useQuizDetails(quizId);
  const { mutateAsync: startAttempt, isPending: isStarting } = useStartAttempt();

  const handleStart = async () => {
    try {
      const attempt = await startAttempt(quizId);
      router.push(`/quizzes/${quizId}/attempt?attempt_id=${attempt.id}`);
    } catch (error) {
      console.error(error);
    }
  };

  if (isLoading) return <div className="flex justify-center items-center min-h-screen"><Spinner size="lg" /></div>;
  if (!quiz) return <div className="text-center py-20 text-xl font-bold">Quiz not found</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8 min-h-screen">
      <Link href="/quizzes">
        <Button variant="ghost" className="mb-4"><ArrowLeft className="w-4 h-4 mr-2" /> Back to Quizzes</Button>
      </Link>

      <div className="bg-card-light dark:bg-card-dark rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
        <div className="bg-gradient-to-r from-primary to-primary-light p-8 text-white">
          <Badge variant="blue" className="bg-white/20 text-white border-none mb-4">{quiz.difficulty.toUpperCase()}</Badge>
          <h1 className="text-4xl font-bold mb-2">{quiz.title}</h1>
          <p className="opacity-90">Read the instructions carefully before starting.</p>
        </div>
        
        <div className="p-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
            <div className="flex items-start space-x-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50">
              <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-lg text-blue-600 dark:text-blue-400">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Duration</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{quiz.duration_minutes} Mins</p>
              </div>
            </div>

            <div className="flex items-start space-x-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50">
              <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-lg text-green-600 dark:text-green-400">
                <Target className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Total Marks</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{quiz.total_marks}</p>
              </div>
            </div>

            <div className="flex items-start space-x-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50">
              <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-lg text-purple-600 dark:text-purple-400">
                <Brain className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Questions</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{quiz.questions_count || 0}</p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-xl font-bold">Instructions</h3>
            <ul className="space-y-3 text-gray-700 dark:text-gray-300 list-disc pl-5">
              <li>You will have exactly <strong>{quiz.duration_minutes} minutes</strong> to complete this quiz.</li>
              <li>The timer will start as soon as you click the start button.</li>
              <li>Do not refresh the page during the quiz, or you may lose your progress.</li>
              {quiz.has_negative_marking ? (
                <li className="text-red-600 dark:text-red-400 font-medium flex items-center mt-2">
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Warning: Negative marking is ENABLED. You will lose {quiz.negative_marks_per_wrong} marks for every wrong answer.
                </li>
              ) : (
                <li className="text-green-600 dark:text-green-400 font-medium flex items-center mt-2">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Good news: No negative marking. Feel free to guess if you don't know the answer!
                </li>
              )}
            </ul>
          </div>

          <div className="mt-10 pt-6 border-t border-gray-100 dark:border-gray-800 flex justify-end">
            <Button size="lg" onClick={handleStart} isLoading={isStarting} className="w-full sm:w-auto text-lg px-10 py-6 h-auto shadow-lg shadow-primary/25">
              <Play className="w-5 h-5 mr-2" fill="currentColor" />
              Start Quiz Now
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
