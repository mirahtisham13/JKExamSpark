"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { 
  FileQuestion, Plus, ClipboardList, 
  Trash2, Edit, Loader2, Clock, Target
} from "lucide-react";
import toast from "react-hot-toast";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import Link from "next/link";

// Define Types
interface Quiz {
  id: string;
  title: string;
  subject: string;
  durationMinutes: number;
  totalMarks: number;
  questionCount: number;
  status: "draft" | "published";
  createdAt: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

// Mock fetching function (Replace with actual API call)
const fetchQuizzes = async (): Promise<Quiz[]> => {
  try {
    const response = await axios.get(`${API_URL}/admin/quizzes`);
    return response.data;
  } catch (error) {
    // Return mock data for development if API fails
    return [
      {
        id: "1",
        title: "JKSSB VLW Mock Test 1",
        subject: "General Knowledge",
        durationMinutes: 120,
        totalMarks: 100,
        questionCount: 100,
        status: "published",
        createdAt: "2026-08-10T10:00:00Z"
      },
      {
        id: "2",
        title: "Accounts Assistant Full Length",
        subject: "Accountancy",
        durationMinutes: 120,
        totalMarks: 120,
        questionCount: 120,
        status: "draft",
        createdAt: "2026-08-12T14:30:00Z"
      }
    ];
  }
};

const quizSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  subject: z.string().min(2, "Subject is required"),
  durationMinutes: z.number().min(5, "Duration must be at least 5 minutes"),
  totalMarks: z.number().min(1, "Total marks must be greater than 0"),
  status: z.enum(["draft", "published"])
});

type QuizFormValues = z.infer<typeof quizSchema>;

export default function AdminQuizzesPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: quizzes, isLoading, error } = useQuery({
    queryKey: ["admin-quizzes"],
    queryFn: fetchQuizzes,
  });

  const createMutation = useMutation({
    mutationFn: async (newQuiz: QuizFormValues) => {
      // return axios.post(`${API_URL}/admin/quizzes`, newQuiz);
      // Simulate API call
      return new Promise((resolve) => setTimeout(resolve, 1000));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-quizzes"] });
      toast.success("Quiz created successfully");
      setIsModalOpen(false);
      reset();
    },
    onError: () => {
      toast.error("Failed to create quiz");
    }
  });

  const { register, handleSubmit, formState: { errors }, reset } = useForm<QuizFormValues>({
    resolver: zodResolver(quizSchema),
    defaultValues: {
      status: "draft",
      durationMinutes: 60,
      totalMarks: 100,
    }
  });

  const onSubmit = (data: QuizFormValues) => {
    createMutation.mutate(data);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Quizzes & Tests</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Create and manage mock tests for students.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          <Plus className="w-5 h-5" />
          Create Quiz
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      ) : error ? (
        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 p-4 rounded-lg text-center">
          Failed to load quizzes. Please try again.
        </div>
      ) : quizzes?.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-12 text-center">
          <FileQuestion className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-slate-900 dark:text-white mb-2">No quizzes found</h3>
          <p className="text-slate-500 dark:text-slate-400 mb-6">Get started by creating your first mock test.</p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Create Quiz
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {quizzes?.map((quiz) => (
            <div 
              key={quiz.id} 
              className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="p-5 border-b border-slate-100 dark:border-slate-700/50 flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-2 py-0.5 rounded text-xs font-semibold uppercase tracking-wider ${
                      quiz.status === 'published' 
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' 
                        : 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                    }`}>
                      {quiz.status}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {new Date(quiz.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-1">{quiz.title}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{quiz.subject}</p>
                </div>
                
                <div className="flex items-center gap-1">
                  <button className="p-1.5 text-slate-400 hover:text-blue-600 transition-colors" title="Edit Quiz">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button className="p-1.5 text-slate-400 hover:text-red-600 transition-colors" title="Delete Quiz">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div className="p-5 bg-slate-50/50 dark:bg-slate-900/20">
                <div className="grid grid-cols-3 gap-4 mb-5">
                  <div className="flex flex-col">
                    <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> Duration
                    </span>
                    <span className="font-semibold text-slate-700 dark:text-slate-200">{quiz.durationMinutes} min</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                      <Target className="w-3.5 h-3.5" /> Total Marks
                    </span>
                    <span className="font-semibold text-slate-700 dark:text-slate-200">{quiz.totalMarks}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                      <FileQuestion className="w-3.5 h-3.5" /> Questions
                    </span>
                    <span className="font-semibold text-slate-700 dark:text-slate-200">{quiz.questionCount}</span>
                  </div>
                </div>
                
                <button
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-lg font-medium transition-colors border border-slate-200 dark:border-slate-600"
                >
                  <ClipboardList className="w-4 h-4" />
                  Manage Questions
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Quiz Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-xl w-full max-w-lg shadow-xl overflow-hidden">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Create New Quiz</h2>
            </div>
            
            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Quiz Title</label>
                <input 
                  {...register("title")}
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="e.g. Accounts Assistant Mock 1"
                />
                {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Subject / Category</label>
                <input 
                  {...register("subject")}
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="e.g. General Knowledge"
                />
                {errors.subject && <p className="text-red-500 text-xs mt-1">{errors.subject.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Duration (minutes)</label>
                  <input 
                    type="number"
                    {...register("durationMinutes", { valueAsNumber: true })}
                    className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                  {errors.durationMinutes && <p className="text-red-500 text-xs mt-1">{errors.durationMinutes.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Total Marks</label>
                  <input 
                    type="number"
                    {...register("totalMarks", { valueAsNumber: true })}
                    className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                  {errors.totalMarks && <p className="text-red-500 text-xs mt-1">{errors.totalMarks.message}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Status</label>
                <select 
                  {...register("status")}
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="draft">Draft (Not visible to students)</option>
                  <option value="published">Published (Visible)</option>
                </select>
                {errors.status && <p className="text-red-500 text-xs mt-1">{errors.status.message}</p>}
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium flex items-center gap-2 disabled:opacity-70"
                >
                  {createMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                  {createMutation.isPending ? "Creating..." : "Create Quiz"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
