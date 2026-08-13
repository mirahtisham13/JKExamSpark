import { useQuery } from '@tanstack/react-query';
import { get } from '../lib/api';
import { PaginatedResponse, RankingEntry, UserRankingResult, RankingStats } from '../types';

export function useLeaderboard(examId: string | null, categoryId?: string, page: number = 1) {
  return useQuery({
    queryKey: ['leaderboard', examId, categoryId, page],
    queryFn: () => get<PaginatedResponse<RankingEntry>>(`/rankings/${examId}`, { category_id: categoryId, page, size: 50 }),
    enabled: !!examId,
  });
}

export function useMyRank(examId: string | null) {
  return useQuery({
    queryKey: ['my-rank', examId],
    queryFn: () => get<UserRankingResult>(`/rankings/${examId}/my-rank`),
    enabled: !!examId,
  });
}

export function useRankingStats(examId: string | null) {
  return useQuery({
    queryKey: ['ranking-stats', examId],
    queryFn: () => get<RankingStats>(`/rankings/${examId}/stats`),
    enabled: !!examId,
  });
}
