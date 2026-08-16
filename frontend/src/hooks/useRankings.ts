import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

export const useRankings = (examId: string, category?: string, page: number = 1) => {
  return useQuery({
    queryKey: ['rankings', examId, category],
    queryFn: async () => {
      const { data } = await api.get(`/rankings/${examId}`, {
        params: { category, page }
      });
      return data;
    },
    enabled: !!examId
  });
};

export const useLeaderboard = (examId: string, category?: string, page: number = 1) => {
  return useQuery({
    queryKey: ['leaderboard', examId, category, page],
    queryFn: async () => {
      const { data } = await api.get(`/rankings/${examId}/leaderboard`, {
        params: { category, page }
      });
      return data;
    },
    enabled: !!examId
  });
};

export const useMyRank = (examId: string) => {
  return useQuery({
    queryKey: ['my-rank', examId],
    queryFn: async () => {
      const { data } = await api.get(`/rankings/${examId}/my-rank`);
      return data;
    },
    enabled: !!examId
  });
};

export const useRankingStats = (examId: string) => {
  return useQuery({
    queryKey: ['ranking-stats', examId],
    queryFn: async () => {
      const { data } = await api.get(`/rankings/${examId}/stats`);
      return data;
    },
    enabled: !!examId
  });
};
