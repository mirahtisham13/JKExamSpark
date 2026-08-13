"use client";

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'react-hot-toast';
import { useParams, useRouter } from 'next/navigation';
import { Plus, Trash2, ArrowLeft, Settings } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Spinner } from '@/components/ui/Spinner';
import { Badge } from '@/components/ui/Badge';
import { useAdminQuiz, useAdminQuestions, useCreateQuestion, useDeleteQuestion, useUpdateQuiz } from '@/hooks/useQuizAdmin';

const questionSchema = z.object({
  question_text: z.string().min(5, "Question must be at least 5 characters"),
  option_a: z.string().min(1, "Option A is required"),
  option_b: z.string().min(1, "Option B is required"),
  option_c: z.string().min(1, "Option C is required"),
  option_d: z.string().min(1, "Option D is required"),
  correct_option: z.enum(["A", "B", "C", "D"]),
  marks: z.coerce.number().min(0.1, "Marks must be > 0"),
  explanation: z.string().optional(),
});

type QuestionFormValues = z.infer<typeof questionSchema>;

export default function QuizBuilderPage() {
  const params = useParams();
  const quizId = params.id as string;
  const router = useRouter();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const { data: quiz, isLoading: quizLoading } = useAdminQuiz(quizId);
  const { data: questions, isLoading: questionsLoading } = useAdminQuestions(quizId);
  
  const { mutateAsync: createQuestion, isPending: isCreatingQuestion } = useCreateQuestion();
  const { mutateAsync: deleteQuestion, isPending: isDeletingQuestion } = useDeleteQuestion();
  const { mutateAsync: updateQuiz, isPending: isUpdatingQuiz } = useUpdateQuiz();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<QuestionFormValues>({
    resolver: zodResolver(questionSchema),
    defaultValues: {
      correct_option: "A",
      marks: 1,
    },
  });

  const onQuestionSubmit = async (data: QuestionFormValues) => {
    try {
      await createQuestion({ quizId, data });
      toast.success("Question added successfully");
      setIsModalOpen(false);
      reset();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to add question");
    }
  };

  const handleDeleteQuestion = async (questionId: string) => {
    if (window.confirm("Are you sure you want to delete this question?")) {
      try {
        await deleteQuestion({ quizId, questionId });
        toast.success("Question deleted");
      } catch (error) {
        toast.error("Failed to delete question");
      }
    }
  };

  const handlePublishToggle = async () => {
    if (!quiz) return;
    const newStatus = quiz.status === 'published' ? 'draft' : 'published';
    if (newStatus === 'published' && (!questions || questions.length === 0)) {
        toast.error("Cannot publish a quiz with no questions");
        return;
    }
    
    try {
      await updateQuiz({ id: quizId, data: { status: newStatus } });
      toast.success(`Quiz ${newStatus === 'published' ? 'published' : 'moved to draft'}`);
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  if (quizLoading || questionsLoading) {
    return <div className="p-20"><Spinner size="lg" /></div>;
  }

  if (!quiz) {
    return <div className="p-20 text-center">Quiz not found</div>;
  }

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      {/* Header Area */}
      <div className="flex items-center space-x-4 mb-2">
        <Link href="/admin/quizzes">
          <Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4 mr-2" /> Back</Button>
        </Link>
      </div>

      <div className="bg-card-light dark:bg-card-dark p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <h1 className="text-2xl font-bold">{quiz.title}</h1>
            <Badge variant={quiz.status === 'published' ? 'green' : 'gray'}>
              {quiz.status.toUpperCase()}
            </Badge>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {quiz.duration_minutes} min • {quiz.total_marks} Marks • {questions?.length || 0} Questions • 
            {quiz.has_negative_marking ? ` Negative Marking (-${quiz.negative_marks_per_wrong})` : " No Negative Marking"}
          </p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={handlePublishToggle} isLoading={isUpdatingQuiz}>
            {quiz.status === 'published' ? 'Unpublish' : 'Publish'}
          </Button>
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Question
          </Button>
        </div>
      </div>

      {/* Questions List */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Questions ({questions?.length || 0})</h2>
        
        {questions?.length === 0 ? (
          <div className="text-center p-12 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-xl text-gray-500">
            No questions added yet. Click "Add Question" to build this quiz.
          </div>
        ) : (
          questions?.map((q, index) => (
            <div key={q.id} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5 shadow-sm relative group">
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => handleDeleteQuestion(q.id)}
                  disabled={isDeletingQuestion}
                  className="text-gray-400 hover:text-red-500 transition-colors p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>

              <div className="flex items-start mb-4">
                <span className="font-bold text-gray-400 mr-3 mt-1">Q{index + 1}.</span>
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">{q.question_text}</h3>
                  <Badge variant="blue" className="mt-2">{q.marks} Marks</Badge>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-8">
                {['A', 'B', 'C', 'D'].map((opt) => {
                  const val = q[`option_${opt.toLowerCase()}` as keyof typeof q];
                  const isCorrect = q.correct_option === opt;
                  return (
                    <div 
                      key={opt}
                      className={`p-3 rounded-lg border ${
                        isCorrect 
                          ? 'border-green-500 bg-green-50 dark:bg-green-900/10 text-green-700 dark:text-green-300' 
                          : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      <span className="font-semibold mr-2">{opt})</span> {val as string}
                      {isCorrect && <span className="ml-2 text-xs font-bold uppercase tracking-wider">(Correct)</span>}
                    </div>
                  );
                })}
              </div>

              {q.explanation && (
                <div className="mt-4 pl-8">
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/10 rounded-lg text-sm text-blue-800 dark:text-blue-300">
                    <span className="font-semibold">Explanation:</span> {q.explanation}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New Question" maxWidth="xl">
        <form onSubmit={handleSubmit(onQuestionSubmit)} className="space-y-4 max-h-[80vh] overflow-y-auto p-1">
          <Textarea 
            label="Question Text" 
            placeholder="Type your question here..." 
            rows={3}
            {...register("question_text")}
            error={errors.question_text?.message}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Option A" {...register("option_a")} error={errors.option_a?.message} />
            <Input label="Option B" {...register("option_b")} error={errors.option_b?.message} />
            <Input label="Option C" {...register("option_c")} error={errors.option_c?.message} />
            <Input label="Option D" {...register("option_d")} error={errors.option_d?.message} />
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <Select 
              label="Correct Option" 
              {...register("correct_option")}
              options={[
                { label: "Option A", value: "A" },
                { label: "Option B", value: "B" },
                { label: "Option C", value: "C" },
                { label: "Option D", value: "D" },
              ]}
            />
            
            <Input 
              type="number"
              step="0.1"
              label="Marks for this question" 
              {...register("marks")}
              error={errors.marks?.message}
            />
          </div>

          <Textarea 
            label="Explanation (Optional)" 
            placeholder="Why is this answer correct? Shown in results." 
            rows={2}
            {...register("explanation")}
          />

          <div className="flex justify-end space-x-3 pt-4 border-t dark:border-gray-800 sticky bottom-0 bg-white dark:bg-gray-900 pb-2">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit" isLoading={isCreatingQuestion}>Save Question</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
