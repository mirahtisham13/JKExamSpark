import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { get, post } from '../lib/api';
import { Quiz, QuizAttempt, QuizAttemptResult } from '../types';

export function useStudentQuizzes(filters?: { exam_id?: string, subject_id?: string, difficulty?: string }) {
  return useQuery({
    queryKey: ['student-quizzes', filters],
    queryFn: () => get<Quiz[]>('/quizzes/', filters),
  });
}

export function useQuizDetails(id: string) {
  return useQuery({
    queryKey: ['student-quizzes', id],
    queryFn: () => get<Quiz>(`/quizzes/${id}`),
    enabled: !!id,
  });
}

export function useStartAttempt() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (quizId: string) => post<QuizAttempt>(`/quiz-attempts/start?quiz_id=${quizId}`, {}),
    onSuccess: (_, quizId) => {
      queryClient.invalidateQueries({ queryKey: ['quiz-attempts', quizId] });
    },
  });
}

export function useSubmitAttempt() {
  return useMutation({
    mutationFn: ({ attemptId, answers }: { attemptId: string, answers: { question_id: string, selected_option?: string }[] }) => 
      post<QuizAttemptResult>(`/quiz-attempts/${attemptId}/submit`, { answers }),
  });
}

export function useAttemptDetails(attemptId: string) {
  return useQuery({
    queryKey: ['attempt', attemptId],
    queryFn: () => get<QuizAttemptResult>(`/quiz-attempts/${attemptId}/result`),
    enabled: !!attemptId,
  });
}
