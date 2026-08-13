"use client";

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'react-hot-toast';
import { Plus, Edit2, History, AlertTriangle, Info } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Spinner } from '@/components/ui/Spinner';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { useMySubmissions, useSubmitScore, useEditScore, useScoreHistory } from '@/hooks/useScores';
import { useExams, useCategories } from '@/hooks/useTaxonomy';
import { VerificationStatus, ExamScoreSubmission } from '@/types';
import { formatDate } from '@/lib/utils';

// We need an exams hook too, assuming it exists in useTaxonomy or similar.
// For now, we'll mock the hook fetch since we don't have useExams implemented yet.
import { useQuery } from '@tanstack/react-query';
import { get } from '@/lib/api';

const scoreSchema = z.object({
  exam_id: z.string().min(1, "Exam is required"),
  category_id: z.string().min(1, "Category is required"),
  marks_obtained: z.coerce.number().min(0, "Marks cannot be negative"),
  notes: z.string().optional(),
  change_reason: z.string().optional(),
});

type ScoreFormValues = z.infer<typeof scoreSchema>;

export default function MyScoresPage() {
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [editingScore, setEditingScore] = useState<ExamScoreSubmission | null>(null);
  const [historyScoreId, setHistoryScoreId] = useState<string | null>(null);

  const { data: submissions, isLoading } = useMySubmissions();
  const { data: exams } = useExams();

  
  const { mutateAsync: submitScore, isPending: isSubmitting } = useSubmitScore();
  const { mutateAsync: editScore, isPending: isEditing } = useEditScore();
  const { data: history, isLoading: isHistoryLoading } = useScoreHistory(historyScoreId || "");

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ScoreFormValues>({
    resolver: zodResolver(scoreSchema),
  });

  const selectedExamId = watch('exam_id');
  const { data: categories } = useCategories(selectedExamId);

  const openEditModal = (score: ExamScoreSubmission) => {
    setEditingScore(score);
    setValue("exam_id", score.exam_id);
    setValue("category_id", score.category_id);
    setValue("marks_obtained", score.marks_obtained);
    setValue("notes", score.notes || "");
  };

  const onSubmit = async (data: ScoreFormValues) => {
    try {
      if (editingScore) {
        if (!data.change_reason) {
          toast.error("You must provide a reason for editing your score.");
          return;
        }
        await editScore({
          submissionId: editingScore.id,
          data: {
            marks_obtained: data.marks_obtained,
            category_id: data.category_id,
            notes: data.notes,
            change_reason: data.change_reason,
          }
        });
        toast.success("Score updated successfully");
        setEditingScore(null);
      } else {
        await submitScore(data);
        toast.success("Score submitted successfully");
        setIsSubmitModalOpen(false);
      }
      reset();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "An error occurred");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'verified': return <Badge variant="green">VERIFIED</Badge>;
      case 'rejected': return <Badge variant="red">REJECTED</Badge>;
      default: return <Badge variant="yellow">SELF REPORTED</Badge>;
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      {/* Important Disclaimer Banner */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-4 rounded-r-lg flex items-start space-x-3">
        <Info className="w-6 h-6 text-blue-500 flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="font-bold text-blue-800 dark:text-blue-300">Actual JKSSB Exam Scores</h3>
          <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">
            Submit your official marks obtained in real JKSSB examinations here. These scores are used to calculate accurate rankings and predict cutoffs. <strong>Do not enter scores from mock quizzes on this page.</strong>
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold">My Score Submissions</h1>
        <Button onClick={() => { reset(); setIsSubmitModalOpen(true); }}>
          <Plus className="w-4 h-4 mr-2" />
          Submit New Score
        </Button>
      </div>

      <div className="bg-card-light dark:bg-card-dark rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
        {isLoading ? (
          <div className="p-12"><Spinner /></div>
        ) : !submissions || submissions.length === 0 ? (
          <EmptyState 
            icon="file" 
            title="No scores submitted yet" 
            description="Submit your JKSSB exam scores to see where you stand in the rankings."
            actionLabel="Submit Score"
            onAction={() => { reset(); setIsSubmitModalOpen(true); }}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-500 uppercase bg-gray-50 dark:bg-gray-800 dark:text-gray-400">
                <tr>
                  <th className="px-6 py-4">Exam ID</th>
                  <th className="px-6 py-4">Marks Obtained</th>
                  <th className="px-6 py-4">Category ID</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Submitted Date</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map((sub) => (
                  <tr key={sub.id} className="border-b dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="px-6 py-4 font-medium">{sub.exam_id}</td>
                    <td className="px-6 py-4 font-bold text-lg">
                      {sub.marks_obtained} <span className="text-sm font-normal text-gray-400">/ {sub.total_marks_of_exam}</span>
                    </td>
                    <td className="px-6 py-4">{sub.category_id}</td>
                    <td className="px-6 py-4">{getStatusBadge(sub.verification_status)}</td>
                    <td className="px-6 py-4">{formatDate(sub.submitted_at)}</td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <Button variant="ghost" size="sm" onClick={() => setHistoryScoreId(sub.id)}>
                        <History className="w-4 h-4 mr-1.5" /> History
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => openEditModal(sub)}
                        disabled={sub.verification_status === 'VERIFIED'}
                        title={sub.verification_status === 'VERIFIED' ? "Verified scores cannot be edited" : ""}
                      >
                        <Edit2 className="w-4 h-4 mr-1.5" /> Edit
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Submit / Edit Modal */}
      <Modal 
        isOpen={isSubmitModalOpen || !!editingScore} 
        onClose={() => { setIsSubmitModalOpen(false); setEditingScore(null); reset(); }} 
        title={editingScore ? "Edit Score Submission" : "Submit Actual Exam Score"}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {!editingScore && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg flex items-start space-x-2 mb-4">
              <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-500 flex-shrink-0" />
              <p className="text-xs text-yellow-800 dark:text-yellow-400">
                Please enter your exact marks as per the official answer key or result. False submissions will result in account bans and skewed cutoff predictions for everyone.
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select 
              label="Select Exam" 
              {...register("exam_id")}
              disabled={!!editingScore} // Cannot change exam once submitted
              options={exams?.map(e => ({ label: e.name, value: e.id })) || [{label: 'Loading exams...', value: ''}]}
            />
            
            <Select 
              label="Select Category" 
              {...register("category_id")}
              options={categories?.map(c => ({ label: c.category_name, value: c.id })) || [{label: 'Select Exam First', value: ''}]}
            />
          </div>

          <Input 
            type="number"
            step="0.25"
            label="Marks Obtained" 
            placeholder="e.g. 85.5"
            {...register("marks_obtained")}
            error={errors.marks_obtained?.message}
          />

          <Textarea 
            label="Additional Notes (Optional)" 
            placeholder="Any details about normalization, shifts, etc." 
            rows={2}
            {...register("notes")}
          />

          {editingScore && (
            <div className="pt-4 border-t dark:border-gray-800">
              <Textarea 
                label="Reason for Change (Required)" 
                placeholder="e.g. Revised answer key released, typing error in previous submission" 
                rows={2}
                {...register("change_reason")}
                error={errors.change_reason?.message}
                required
              />
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="ghost" onClick={() => { setIsSubmitModalOpen(false); setEditingScore(null); }}>Cancel</Button>
            <Button type="submit" isLoading={isSubmitting || isEditing}>
              {editingScore ? "Save Changes" : "Submit Score"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* History Modal */}
      <Modal isOpen={!!historyScoreId} onClose={() => setHistoryScoreId(null)} title="Score Audit History">
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
          {isHistoryLoading ? (
            <div className="p-8 flex justify-center"><Spinner /></div>
          ) : !history || history.length === 0 ? (
            <div className="text-center p-8 text-gray-500">No edit history found for this submission.</div>
          ) : (
            <div className="relative border-l border-gray-200 dark:border-gray-700 ml-3 space-y-6">
              {history.map((record, index) => (
                <div key={record.id} className="mb-8 ml-6">
                  <span className="absolute flex items-center justify-center w-6 h-6 bg-blue-100 rounded-full -left-3 ring-8 ring-white dark:ring-gray-900 dark:bg-blue-900">
                    <History className="w-3 h-3 text-blue-800 dark:text-blue-300" />
                  </span>
                  <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
                    <h3 className="mb-1 text-sm font-semibold text-gray-900 dark:text-white">Edited on {formatDate(record.changed_at)}</h3>
                    <p className="text-sm font-normal text-gray-500 mb-2">
                      Marks changed from <strong className="text-red-500">{record.old_marks}</strong> to <strong className="text-green-500">{record.new_marks}</strong>
                    </p>
                    <div className="text-sm bg-white dark:bg-gray-900 p-2 rounded border border-gray-100 dark:border-gray-700 text-gray-600 dark:text-gray-300">
                      <span className="font-semibold">Reason:</span> {record.reason}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Modal>

    </div>
  );
}
