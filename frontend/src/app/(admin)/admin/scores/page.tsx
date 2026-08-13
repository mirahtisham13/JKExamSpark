"use client";

import { useAdminPendingScores, useVerifyScore } from "@/hooks/useAdmin";
import { Loader2, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";

export default function ScoresVerificationPage() {
  const { data: scoresData, isLoading, error } = useAdminPendingScores();
  const { mutate: verifyScore, isPending: isVerifying } = useVerifyScore();

  const handleVerify = (scoreId: string, status: "verified" | "rejected") => {
    verifyScore(
      { id: scoreId, status },
      {
        onSuccess: () => {
          toast.success(`Score ${status} successfully`);
        },
        onError: () => {
          toast.error(`Failed to ${status} score`);
        },
      }
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Score Verifications</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Review and approve submitted user scores.</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-500 dark:text-gray-400 font-medium border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Exam</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Claimed Marks</th>
                <th className="px-6 py-4">Submitted On</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <Loader2 className="w-8 h-8 text-amber-500 animate-spin mx-auto" />
                    <p className="mt-2 text-gray-500 dark:text-gray-400">Loading pending scores...</p>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-red-500 flex flex-col items-center">
                    <AlertCircle className="w-8 h-8 mb-2" />
                    Failed to load pending scores. Please try again.
                  </td>
                </tr>
              ) : scoresData?.scores?.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                    <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-500 opacity-50" />
                    No pending score verifications. All caught up!
                  </td>
                </tr>
              ) : (
                scoresData?.scores?.map((score: any) => (
                  <tr key={score.id} className="hover:bg-gray-50 dark:hover:bg-gray-750/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900 dark:text-white">{score.user?.fullName || 'Unknown User'}</div>
                      <div className="text-gray-500 dark:text-gray-400 text-xs">@{score.user?.username || 'unknown'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900 dark:text-white">{score.exam?.title || 'Unknown Exam'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                        {score.categoryId || 'General'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-lg font-semibold text-amber-600 dark:text-amber-500">
                        {score.marks}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                      {new Date(score.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleVerify(score.id, "verified")}
                          disabled={isVerifying}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-full transition-colors dark:text-green-400 dark:hover:bg-green-900/30 disabled:opacity-50"
                          title="Approve Score"
                        >
                          <CheckCircle className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleVerify(score.id, "rejected")}
                          disabled={isVerifying}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors dark:text-red-400 dark:hover:bg-red-900/30 disabled:opacity-50"
                          title="Reject Score"
                        >
                          <XCircle className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
