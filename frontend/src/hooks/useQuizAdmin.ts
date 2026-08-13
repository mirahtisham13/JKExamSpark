import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { get, post, put, del } from '../lib/api';
import { Quiz, QuizQuestion } from '../types';

export function useAdminQuizzes() {
  return useQuery({
    queryKey: ['admin-quizzes'],
    queryFn: () => get<Quiz[]>('/quizzes/admin'),
  });
}

export function useAdminQuiz(id: string) {
  return useQuery({
    queryKey: ['admin-quizzes', id],
    queryFn: () => get<Quiz>(`/quizzes/${id}`),
    enabled: !!id,
  });
}

export function useCreateQuiz() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Quiz>) => post<Quiz>('/quizzes/', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-quizzes'] });
    },
  });
}

export function useUpdateQuiz() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Quiz> }) => 
      put<Quiz>(`/quizzes/${id}`, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin-quizzes'] });
      queryClient.invalidateQueries({ queryKey: ['admin-quizzes', variables.id] });
    },
  });
}

export function useDeleteQuiz() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => del(`/quizzes/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-quizzes'] });
    },
  });
}

export function useAdminQuestions(quizId: string) {
  return useQuery({
    queryKey: ['admin-questions', quizId],
    queryFn: () => get<QuizQuestion[]>(`/quizzes/${quizId}/questions`),
    enabled: !!quizId,
  });
}

export function useCreateQuestion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ quizId, data }: { quizId: string; data: Partial<QuizQuestion> }) => 
      post<QuizQuestion>(`/quizzes/${quizId}/questions`, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin-questions', variables.quizId] });
      queryClient.invalidateQueries({ queryKey: ['admin-quizzes', variables.quizId] });
    },
  });
}

export function useDeleteQuestion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ quizId, questionId }: { quizId: string; questionId: string }) => 
      del(`/quizzes/${quizId}/questions/${questionId}`),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin-questions', variables.quizId] });
      queryClient.invalidateQueries({ queryKey: ['admin-quizzes', variables.quizId] });
    },
  });
}
