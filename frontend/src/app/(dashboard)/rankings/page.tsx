"use client";

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Trophy, Users, Target, Activity, AlertTriangle, ArrowUpCircle } from 'lucide-react';
import { get } from '@/lib/api';
import { useLeaderboard, useMyRank, useRankingStats } from '@/hooks/useRankings';
import { Spinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { Badge } from '@/components/ui/Badge';
import { Exam } from '@/types';
import { useExams, useCategories } from '@/hooks/useTaxonomy';

export default function RankingsPage() {
  const [selectedExamId, setSelectedExamId] = useState<string | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [page, setPage] = useState(1);

  // Fetch completed exams that have results
  const { data: exams, isLoading: examsLoading } = useExams();
  const { data: categories } = useCategories(selectedExamId ? parseInt(selectedExamId) : undefined);
  
  // Auto-select first exam when loaded
  React.useEffect(() => {
    if (exams && exams.length > 0 && !selectedExamId) {
      setSelectedExamId(String(exams[0].id));
    }
  }, [exams, selectedExamId]);

  const { data: leaderboard, isLoading: boardLoading } = useLeaderboard(selectedExamId, selectedCategoryId || undefined, page);
  const { data: myRank, isLoading: myRankLoading } = useMyRank(selectedExamId);
  const { data: stats, isLoading: statsLoading } = useRankingStats(selectedExamId);

  if (examsLoading) {
    return <div className="p-12"><Spinner /></div>;
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Important Disclaimer Banner */}
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 p-4 rounded-r-lg flex items-start space-x-3">
        <AlertTriangle className="w-6 h-6 text-yellow-600 dark:text-yellow-500 flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="font-bold text-yellow-800 dark:text-yellow-300">Disclaimer: Self-Reported Data</h3>
          <p className="text-sm text-yellow-700 dark:text-yellow-400 mt-1">
            These rankings are calculated based exclusively on scores submitted by students on this platform. 
            They do not represent the complete JKSSB candidate population. Percentiles and ranks may shift as more students submit their marks.
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold">Exam Rankings</h1>
        <select 
          className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-primary focus:outline-none w-full sm:w-64"
          value={selectedExamId || ''}
          onChange={(e) => { setSelectedExamId(e.target.value); setPage(1); }}
        >
          {exams?.length === 0 && <option value="">No completed exams found</option>}
          {exams?.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
        </select>
      </div>

      {!selectedExamId ? (
        <EmptyState icon="search" title="Select an exam" description="Choose an exam from the dropdown to view its rankings." />
      ) : (
        <div className="space-y-6">
          
          {/* My Ranking Highlight Card */}
          {myRankLoading ? (
            <div className="bg-card-light dark:bg-card-dark rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-8 flex justify-center"><Spinner /></div>
          ) : myRank ? (
            <div className="bg-gradient-to-r from-primary to-blue-800 rounded-xl p-6 text-white shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Trophy className="w-32 h-32" />
              </div>
              <h2 className="text-xl font-bold mb-4 flex items-center">
                <Trophy className="w-6 h-6 mr-2 text-yellow-400" /> Your Performance Profile
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 relative z-10">
                <div>
                  <div className="text-blue-200 text-sm font-medium">Marks Obtained</div>
                  <div className="text-3xl font-bold mt-1">{myRank.marks_obtained} <span className="text-lg font-normal opacity-75">/ {myRank.total_marks_of_exam}</span></div>
                </div>
                <div>
                  <div className="text-blue-200 text-sm font-medium">Overall Rank</div>
                  <div className="text-3xl font-bold mt-1">#{myRank.overall_rank} <span className="text-lg font-normal opacity-75">/ {myRank.total_candidates}</span></div>
                </div>
                <div>
                  <div className="text-blue-200 text-sm font-medium">{myRank.category_name} Rank</div>
                  <div className="text-3xl font-bold mt-1">#{myRank.category_rank} <span className="text-lg font-normal opacity-75">/ {myRank.category_candidates}</span></div>
                </div>
                <div>
                  <div className="text-blue-200 text-sm font-medium">Percentile</div>
                  <div className="text-3xl font-bold mt-1">{myRank.percentile}%</div>
                </div>
              </div>
              {myRank.verification_status === 'verified' && (
                <div className="mt-4 pt-4 border-t border-blue-700/50 flex items-center text-sm font-medium text-green-300">
                  <ArrowUpCircle className="w-4 h-4 mr-1.5" /> Your score has been verified by administrators.
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-100 dark:border-gray-800 text-center">
              <h3 className="font-semibold text-lg mb-2">You haven't submitted a score for this exam</h3>
              <p className="text-gray-500 mb-4">Submit your actual exam score to see your ranking and percentile.</p>
              <a href="/my-scores" className="text-primary hover:underline font-medium">Go to My Scores &rarr;</a>
            </div>
          )}

          {/* Stats Overview */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white dark:bg-gray-900 p-5 rounded-xl border border-gray-100 dark:border-gray-800 flex items-center space-x-4">
                <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg"><Users className="w-6 h-6 text-blue-600 dark:text-blue-400" /></div>
                <div>
                  <div className="text-sm text-gray-500">Total Submissions</div>
                  <div className="text-2xl font-bold">{stats.total_submitted}</div>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-900 p-5 rounded-xl border border-gray-100 dark:border-gray-800 flex items-center space-x-4">
                <div className="p-3 bg-purple-50 dark:bg-purple-900/30 rounded-lg"><Activity className="w-6 h-6 text-purple-600 dark:text-purple-400" /></div>
                <div>
                  <div className="text-sm text-gray-500">Average Score</div>
                  <div className="text-2xl font-bold">{stats.mean_score}</div>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-900 p-5 rounded-xl border border-gray-100 dark:border-gray-800 flex items-center space-x-4">
                <div className="p-3 bg-green-50 dark:bg-green-900/30 rounded-lg"><Target className="w-6 h-6 text-green-600 dark:text-green-400" /></div>
                <div>
                  <div className="text-sm text-gray-500">Highest Score</div>
                  <div className="text-2xl font-bold">{stats.highest_score}</div>
                </div>
              </div>
            </div>
          )}

          {/* Leaderboard Section */}
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
            <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row justify-between items-center gap-4">
              <h3 className="font-bold text-lg">Global Leaderboard</h3>
              
              {/* Category Filter Tabs */}
              <div className="flex space-x-1 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 hide-scrollbar">
                <button
                  onClick={() => { setSelectedCategoryId(''); setPage(1); }}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                    selectedCategoryId === '' 
                      ? 'bg-primary text-white' 
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  All Categories
                </button>
                {categories?.map((cat: any) => (
                  <button
                    key={cat.id}
                    onClick={() => { setSelectedCategoryId(String(cat.id)); setPage(1); }}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                      selectedCategoryId === String(cat.id)
                        ? 'bg-primary text-white' 
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>
            {boardLoading ? (
              <div className="p-12 text-center flex justify-center"><Spinner /></div>
            ) : !leaderboard || leaderboard.data.length === 0 ? (
              <EmptyState icon="search" title="No scores found" description="No students have submitted scores for this filter yet." />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-gray-500 uppercase bg-gray-50 dark:bg-gray-800/50 dark:text-gray-400">
                    <tr>
                      <th className="px-6 py-4">Rank</th>
                      <th className="px-6 py-4">Student</th>
                      <th className="px-6 py-4 text-center">Score</th>
                      <th className="px-6 py-4">Category</th>
                      <th className="px-6 py-4 text-right">Percentile</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaderboard.data.map((entry: any, idx: number) => (
                      <tr key={idx} className="border-b dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                        <td className="px-6 py-4">
                          {selectedCategoryId ? (
                            <div className="flex items-center space-x-2">
                              <span className="font-bold text-gray-900 dark:text-white text-lg">#{entry.category_rank}</span>
                            </div>
                          ) : (
                            <div className="flex items-center space-x-2">
                              <span className="font-bold text-gray-900 dark:text-white text-lg">#{entry.overall_rank}</span>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 font-mono text-gray-600 dark:text-gray-300">
                          {entry.masked_username}
                          {entry.verification_status === 'verified' && (
                            <Badge variant="green" className="ml-2 scale-75 origin-left">Verified</Badge>
                          )}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="font-bold text-lg text-primary">{entry.marks_obtained}</span>
                        </td>
                        <td className="px-6 py-4 text-gray-500">{entry.category_name}</td>
                        <td className="px-6 py-4 text-right font-medium text-gray-700 dark:text-gray-200">
                          {entry.percentile}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            
            {/* Simple Pagination Controls */}
            {leaderboard && leaderboard.total > 50 && (
              <div className="p-4 border-t dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-800/30">
                <span className="text-sm text-gray-500">
                  Showing {(page - 1) * 50 + 1} to {Math.min(page * 50, leaderboard.total)} of {leaderboard.total} entries
                </span>
                <div className="space-x-2">
                  <button 
                    disabled={page === 1}
                    onClick={() => setPage(p => p - 1)}
                    className="px-3 py-1.5 border rounded-md disabled:opacity-50 text-sm"
                  >
                    Previous
                  </button>
                  <button 
                    disabled={page * 50 >= leaderboard.total}
                    onClick={() => setPage(p => p + 1)}
                    className="px-3 py-1.5 border rounded-md disabled:opacity-50 text-sm"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
}
