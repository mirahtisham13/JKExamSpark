import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { get, post, put } from '../lib/api';
import { ExamScoreSubmission, ScoreEditHistory, VerificationStatus } from '../types';

export function useMySubmissions() {
  return useQuery({
    queryKey: ['my-scores'],
    queryFn: () => get<ExamScoreSubmission[]>('/exam-scores/my'),
  });
}

export function useSubmitScore() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { exam_id: string; category_id: string; marks_obtained: number; notes?: string }) => 
      post<ExamScoreSubmission>('/exam-scores/', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-scores'] });
    },
  });
}

export function useEditScore() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ submissionId, data }: { submissionId: string; data: { marks_obtained?: number; category_id?: string; notes?: string; change_reason: string } }) => 
      put<ExamScoreSubmission>(`/exam-scores/${submissionId}`, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['my-scores'] });
      queryClient.invalidateQueries({ queryKey: ['score-history', variables.submissionId] });
    },
  });
}

export function useScoreHistory(submissionId: string) {
  return useQuery({
    queryKey: ['score-history', submissionId],
    queryFn: () => get<ScoreEditHistory[]>(`/exam-scores/${submissionId}/history`),
    enabled: !!submissionId,
  });
}
