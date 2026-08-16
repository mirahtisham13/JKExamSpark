import { useState, useEffect } from 'react';

export const useQuiz = (totalQuestions: number, durationMinutes: number) => {
  const [currentQ, setCurrentQ] = useState(1);
  const [timeLeft, setTimeLeft] = useState(durationMinutes * 60);
  const [answers, setAnswers] = useState<Record<number, string>>({});

  useEffect(() => {
    const timer = setInterval(() => setTimeLeft((t) => (t > 0 ? t - 1 : 0)), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleAnswer = (qIndex: number, answer: string) => {
    setAnswers((prev) => ({ ...prev, [qIndex]: answer }));
  };

  const nextQuestion = () => setCurrentQ((q) => Math.min(q + 1, totalQuestions));
  const prevQuestion = () => setCurrentQ((q) => Math.max(q - 1, 1));

  return {
    currentQ,
    setCurrentQ,
    timeLeft,
    answers,
    handleAnswer,
    nextQuestion,
    prevQuestion,
  };
};

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

export const useStudentQuizzes = (params?: { exam_id?: number; subject_id?: number; difficulty?: string }) => {
  return useQuery({
    queryKey: ['student-quizzes', params],
    queryFn: async () => {
      const res = await api.get('/quizzes/available', { params });
      return res.data;
    }
  });
};

export const useQuizDetails = (id: number) => {
  return useQuery({
    queryKey: ['quiz', id],
    queryFn: async () => {
      const res = await api.get(`/quizzes/${id}`);
      return res.data;
    }
  });
};

export const useStartAttempt = () => {
  return useMutation({
    mutationFn: async (quizId: number) => {
      const res = await api.post(`/quiz-attempts/start?quiz_id=${quizId}`);
      return res.data;
    }
  });
};

export const useSubmitAttempt = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ attemptId, answers }: { attemptId: number; answers: any[] }) => {
      const res = await api.post(`/quiz-attempts/${attemptId}/submit`, { answers });
      return res.data;
    },
    onSuccess: (_, { attemptId }) => {
      queryClient.invalidateQueries({ queryKey: ['attempt', attemptId] });
    }
  });
};

export const useAttemptDetails = (attemptId: number) => {
  return useQuery({
    queryKey: ['attempt', attemptId],
    queryFn: async () => {
      const res = await api.get(`/quiz-attempts/${attemptId}`);
      return res.data;
    }
  });
};
