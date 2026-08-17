import { useQuery } from '@tanstack/react-query';
import { get } from '../lib/api';
import { ExamDetail } from '../types';

export function useExam(id: string) {
  return useQuery({
    queryKey: ['exam', id],
    queryFn: () => get<ExamDetail>(`/exams/${id}`),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}
