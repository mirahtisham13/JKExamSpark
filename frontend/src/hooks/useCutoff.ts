import { useQuery } from '@tanstack/react-query';
import { get } from '../lib/api';
import { CutoffResponse } from '../types';

export function useCutoffs(examId: string | null) {
  return useQuery({
    queryKey: ['cutoffs', examId],
    queryFn: () => get<CutoffResponse>(`/cutoffs/${examId}`),
    enabled: !!examId,
  });
}
