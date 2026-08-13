import { useQuery } from '@tanstack/react-query';
import { get } from '../lib/api';
import { StudentDashboardResponse } from '../types';

export function useStudentDashboard() {
  return useQuery({
    queryKey: ['student-dashboard'],
    queryFn: () => get<StudentDashboardResponse>('/dashboard/student'),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
