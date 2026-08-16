"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Clock, ChevronLeft, ChevronRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { useQuizDetails, useSubmitAttempt } from '@/hooks/useQuiz';
import { toast } from 'react-hot-toast';

export default function QuizAttemptPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const quizId = Number(params.id);
  const attemptId = Number(searchParams.get('attempt_id'));
  const router = useRouter();

  const { data: quiz, isLoading: isQuizLoading } = useQuizDetails(quizId);
  const { mutateAsync: submitAttempt, isPending: isSubmitting } = useSubmitAttempt();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  // Initialize timer
  useEffect(() => {
    if (quiz && timeLeft === null) {
      // In a real app, we should calculate time left based on attempt.started_at from backend.
      // For simplicity in this UI, we just use duration_minutes locally.
      setTimeLeft(quiz.duration_minutes * 60);
    }
  }, [quiz, timeLeft]);

  // Timer countdown
  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev && prev <= 1) {
          clearInterval(timer);
          handleAutoSubmit();
          return 0;
        }
        return prev ? prev - 1 : 0;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const handleAutoSubmit = useCallback(async () => {
    toast.error("Time's up! Automatically submitting your quiz.");
    await submitQuiz();
  }, [answers, quiz, attemptId]);

  const submitQuiz = async () => {
    if (!quiz || !attemptId) return;

    const formattedAnswers = quiz.questions?.map((q: any) => ({
      question_id: q.id,
      selected_option: answers[q.id] || undefined,
    })) || [];

    try {
      const result = await submitAttempt({ attemptId, answers: formattedAnswers });
      toast.success("Quiz submitted successfully!");
      router.replace(`/quizzes/${quizId}/result?attempt_id=${result.attempt_id}`);
    } catch (error) {
      toast.error("Failed to submit quiz. Please try again.");
    }
  };

  const handleManualSubmit = () => {
    if (window.confirm("Are you sure you want to submit? You cannot change your answers after submission.")) {
      submitQuiz();
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (isQuizLoading || !quiz || !attemptId) {
    return <div className="flex justify-center items-center min-h-screen"><Spinner size="lg" /></div>;
  }

  const questions = quiz.questions || [];
  const currentQuestion = questions[currentIndex];

  if (!currentQuestion) return <div>No questions found.</div>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20 md:pb-0">
      {/* Top Navbar */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10 px-4 sm:px-6 h-16 flex items-center justify-between">
        <h1 className="font-bold text-lg hidden sm:block truncate pr-4">{quiz.title}</h1>
        <h1 className="font-bold text-lg sm:hidden truncate pr-4">Q{currentIndex + 1} of {questions.length}</h1>
        
        <div className="flex items-center space-x-4">
          <div className={`flex items-center space-x-2 font-mono text-lg font-bold px-4 py-1.5 rounded-lg border ${
            timeLeft && timeLeft < 300 
              ? 'bg-red-50 text-red-600 border-red-200 dark:bg-red-900/20 dark:border-red-900/50' 
              : 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900 dark:text-gray-200 dark:border-gray-700'
          }`}>
            <Clock className={`w-5 h-5 ${timeLeft && timeLeft < 300 ? 'animate-pulse' : ''}`} />
            <span>{timeLeft !== null ? formatTime(timeLeft) : '--:--'}</span>
          </div>
          <Button onClick={handleManualSubmit} isLoading={isSubmitting} className="hidden sm:flex">
            Submit Quiz
          </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row h-[calc(100vh-64px)] max-w-7xl mx-auto">
        
        {/* Main Question Area */}
        <div className="flex-1 p-4 sm:p-8 overflow-y-auto">
          <div className="max-w-3xl mx-auto">
            <div className="mb-6 flex justify-between items-center">
              <span className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Question {currentIndex + 1} of {questions.length}</span>
              <span className="text-sm font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 px-3 py-1 rounded-full">
                {currentQuestion.marks} Marks
              </span>
            </div>

            <h2 className="text-2xl font-medium text-gray-900 dark:text-gray-100 mb-8 leading-relaxed">
              {currentQuestion.question_text}
            </h2>

            <div className="space-y-3 mb-12">
              {['A', 'B', 'C', 'D'].map((opt) => {
                const optKey = `option_${opt.toLowerCase()}` as keyof typeof currentQuestion;
                const isSelected = answers[currentQuestion.id] === opt;
                
                return (
                  <button
                    key={opt}
                    onClick={() => setAnswers(prev => ({ ...prev, [currentQuestion.id]: opt }))}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 flex items-center group ${
                      isSelected 
                        ? 'border-primary bg-primary/5 dark:bg-primary/10' 
                        : 'border-gray-200 dark:border-gray-700 hover:border-primary/50 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mr-4 flex-shrink-0 transition-colors ${
                      isSelected 
                        ? 'border-primary bg-primary' 
                        : 'border-gray-300 dark:border-gray-600 group-hover:border-primary/50'
                    }`}>
                      {isSelected && <div className="w-2.5 h-2.5 bg-white rounded-full" />}
                    </div>
                    <span className="text-lg text-gray-800 dark:text-gray-200">{currentQuestion[optKey]}</span>
                  </button>
                );
              })}
            </div>

            <div className="flex justify-between items-center pt-6 border-t border-gray-200 dark:border-gray-800">
              <Button 
                variant="outline" 
                size="lg"
                onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
                disabled={currentIndex === 0}
              >
                <ChevronLeft className="w-5 h-5 mr-2" /> Previous
              </Button>
              
              <Button 
                variant="outline" 
                className="text-gray-500 hover:text-gray-700"
                onClick={() => {
                  const newAnswers = { ...answers };
                  delete newAnswers[currentQuestion.id];
                  setAnswers(newAnswers);
                }}
              >
                Clear Selection
              </Button>

              <Button 
                size="lg"
                onClick={() => setCurrentIndex(prev => Math.min(questions.length - 1, prev + 1))}
                disabled={currentIndex === questions.length - 1}
              >
                Next <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </div>
        </div>

        {/* Right Sidebar - Navigator */}
        <div className="w-full md:w-80 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 p-6 overflow-y-auto hidden md:block">
          <h3 className="font-bold text-gray-900 dark:text-white mb-6">Question Navigator</h3>
          
          <div className="grid grid-cols-5 gap-2 mb-8">
            {questions.map((q: any, i: number) => {
              const isAnswered = !!answers[q.id];
              const isCurrent = i === currentIndex;
              
              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentIndex(i)}
                  className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-medium transition-all ${
                    isCurrent 
                      ? 'ring-2 ring-primary ring-offset-2 dark:ring-offset-gray-800' 
                      : ''
                  } ${
                    isAnswered
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {i + 1}
                </button>
              );
            })}
          </div>

          <div className="space-y-3 text-sm">
            <div className="flex items-center">
              <div className="w-4 h-4 rounded bg-primary mr-3"></div>
              <span className="text-gray-600 dark:text-gray-400">Answered ({Object.keys(answers).length})</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 rounded bg-gray-100 dark:bg-gray-700 mr-3"></div>
              <span className="text-gray-600 dark:text-gray-400">Not Answered ({questions.length - Object.keys(answers).length})</span>
            </div>
          </div>

          <div className="mt-12 pt-6 border-t border-gray-200 dark:border-gray-700">
             <Button onClick={handleManualSubmit} isLoading={isSubmitting} variant="primary" className="w-full">
              Submit Quiz
            </Button>
          </div>
        </div>
        
        {/* Mobile Submit Button Float */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 md:hidden z-10 flex justify-between gap-4">
           <Button variant="outline" className="flex-1" onClick={() => document.getElementById('mobile-nav')?.classList.toggle('hidden')}>
             Navigator
           </Button>
           <Button onClick={handleManualSubmit} isLoading={isSubmitting} className="flex-1">
             Submit
           </Button>
        </div>
        
        {/* Mobile Navigator Overlay */}
        <div id="mobile-nav" className="hidden fixed inset-0 z-50 bg-white dark:bg-gray-900 p-6 pt-20 overflow-y-auto md:hidden">
          <Button variant="ghost" className="absolute top-6 right-6" onClick={() => document.getElementById('mobile-nav')?.classList.add('hidden')}>
            Close
          </Button>
          <h3 className="font-bold text-xl mb-6">Question Navigator</h3>
          <div className="grid grid-cols-5 gap-3">
             {questions.map((q: any, i: number) => {
              const isAnswered = !!answers[q.id];
              return (
                <button
                  key={q.id}
                  onClick={() => {
                    setCurrentIndex(i);
                    document.getElementById('mobile-nav')?.classList.add('hidden');
                  }}
                  className={`aspect-square rounded-lg flex items-center justify-center font-medium ${
                    isAnswered
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'
                  }`}
                >
                  {i + 1}
                </button>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
