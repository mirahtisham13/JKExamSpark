import { useQuery } from '@tanstack/react-query';
import { get } from '../lib/api';
import { Exam } from '../types';

export function useExams(status?: string) {
  return useQuery({
    queryKey: ['exams', status],
    queryFn: () => get<Exam[]>(status ? `/exams/?status=${status}` : '/exams/'),
    staleTime: 5 * 60 * 1000,
  });
}
