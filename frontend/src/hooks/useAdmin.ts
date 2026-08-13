import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { get, put, post, del } from '../lib/api';
import { PaginatedResponse, User, Announcement, ExamScoreSubmission, OfficialCutoff } from '../types';
import toast from 'react-hot-toast';

export function useAdminAnalytics() {
  return useQuery({
    queryKey: ['admin-analytics'],
    queryFn: () => get<any>('/admin/analytics'),
  });
}

export function useAdminUsers(page: number = 1, search: string = '') {
  return useQuery({
    queryKey: ['admin-users', page, search],
    queryFn: () => get<PaginatedResponse<User>>('/admin/users', { page, size: 20, search: search || undefined }),
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string, data: any }) => put(`/admin/users/${id}`, data),
    onSuccess: () => {
      toast.success('User updated successfully');
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update user');
    }
  });
}

export function useAdminPendingScores() {
  return useQuery({
    queryKey: ['admin-pending-scores'],
    queryFn: () => get<PaginatedResponse<ExamScoreSubmission>>('/exam-scores/', { status: 'self_reported' }),
  });
}

export function useVerifyScore() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status, comment }: { id: string, status: string, comment?: string }) => 
      put(`/exam-scores/${id}/verify`, { verification_status: status, admin_comment: comment }),
    onSuccess: () => {
      toast.success('Score verification status updated');
      queryClient.invalidateQueries({ queryKey: ['admin-pending-scores'] });
      queryClient.invalidateQueries({ queryKey: ['admin-analytics'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to verify score');
    }
  });
}

export function useCreateAnnouncement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => post('/announcements/', data),
    onSuccess: () => {
      toast.success('Announcement published');
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
    },
    onError: (error: any) => toast.error('Failed to publish announcement')
  });
}

export function useDeleteAnnouncement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => del(`/announcements/${id}`),
    onSuccess: () => {
      toast.success('Announcement deleted');
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
    },
    onError: (error: any) => toast.error('Failed to delete announcement')
  });
}

export function useCreateOfficialCutoff() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => post('/cutoffs/', data),
    onSuccess: () => {
      toast.success('Official cutoff published');
      queryClient.invalidateQueries({ queryKey: ['cutoffs'] });
    },
    onError: (error: any) => toast.error('Failed to publish cutoff')
  });
}
