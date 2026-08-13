import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { get, put } from '../lib/api';
import { ExamScoreSubmission, VerificationStatus } from '../types';

export function useAdminSubmissions(filters?: { exam_id?: string; category_id?: string; status?: VerificationStatus }) {
  return useQuery({
    queryKey: ['admin-scores', filters],
    queryFn: () => get<ExamScoreSubmission[]>('/exam-scores/', filters),
  });
}

export function useReviewSubmission() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ submissionId, data }: { submissionId: string; data: { verification_status: VerificationStatus; reviewer_notes?: string } }) => 
      put<ExamScoreSubmission>(`/exam-scores/${submissionId}/review`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-scores'] });
    },
  });
}
