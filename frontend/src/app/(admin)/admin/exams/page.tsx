"use client";

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { get, post } from '@/lib/api';
import { Plus, X, Search, FileText, Calendar, GraduationCap, CheckCircle, Clock } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import toast from 'react-hot-toast';

const examSchema = z.object({
  name: z.string().min(3, "Exam name is required"),
  year: z.number().min(2000).max(2100),
  total_marks: z.number().min(1, "Total marks must be at least 1"),
});

type ExamFormValues = z.infer<typeof examSchema>;

export default function AdminExamsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const queryClient = useQueryClient();

  const { data: exams, isLoading } = useQuery({
    queryKey: ['admin-exams'],
    queryFn: () => get<any[]>('/exams/'),
  });

  const createExam = useMutation({
    mutationFn: (data: ExamFormValues) => post('/exams/', data),
    onSuccess: () => {
      toast.success('Exam created successfully');
      queryClient.invalidateQueries({ queryKey: ['admin-exams'] });
      setIsModalOpen(false);
      reset();
    },
    onError: () => {
      toast.error('Failed to create exam');
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ExamFormValues>({
    resolver: zodResolver(examSchema),
    defaultValues: {
      year: new Date().getFullYear(),
    }
  });

  const onSubmit = (data: ExamFormValues) => {
    createExam.mutate(data);
  };

  const filteredExams = exams?.filter(exam => 
    exam.name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div className="p-6 max-w-7xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Exam Management</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Manage all JKSSB exams, vacancies, and categories.</p>
        </div>
        
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-[#1e3a5f] hover:bg-[#2a4d7c] text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          <Plus size={20} />
          Create New Exam
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 mb-8">
        <div className="relative max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-slate-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#f59e0b] focus:border-transparent outline-none transition-all"
            placeholder="Search exams..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Exam List */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1e3a5f]"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredExams.map((exam) => (
            <div key={exam.id} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-5 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-lg text-slate-900 dark:text-white line-clamp-1" title={exam.name}>
                    {exam.name}
                  </h3>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                    exam.is_active 
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                      : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400'
                  }`}>
                    {exam.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1">
                    <Calendar size={14} />
                    {exam.year}
                  </span>
                  <span className="flex items-center gap-1">
                    <FileText size={14} />
                    {exam.total_marks} Marks
                  </span>
                </div>
              </div>
              <div className="p-5">
                <div className="mb-4">
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Vacancies</p>
                  {exam.categories && exam.categories.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {exam.categories.map((cat: any) => (
                        <span key={cat.id} className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300 border border-blue-100 dark:border-blue-800/50">
                          {cat.name}: {cat.vacancies}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500 dark:text-slate-400 italic">No vacancies mapped yet.</p>
                  )}
                </div>
                
                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700 flex justify-end">
                  <button className="text-sm font-medium text-[#1e3a5f] dark:text-blue-400 hover:text-[#f59e0b] dark:hover:text-[#f59e0b] transition-colors">
                    Edit Exam &rarr;
                  </button>
                </div>
              </div>
            </div>
          ))}
          
          {filteredExams.length === 0 && !isLoading && (
            <div className="col-span-full py-12 text-center bg-white dark:bg-slate-800 rounded-xl border border-dashed border-slate-300 dark:border-slate-600">
              <GraduationCap size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-4" />
              <h3 className="text-lg font-medium text-slate-900 dark:text-white">No exams found</h3>
              <p className="text-slate-500 dark:text-slate-400 mt-1">Try adjusting your search or create a new exam.</p>
            </div>
          )}
        </div>
      )}

      {/* Create Exam Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-md shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-slate-700">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Create New Exam</h2>
              <button 
                onClick={() => {
                  setIsModalOpen(false);
                  reset();
                }}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit(onSubmit)} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Exam Name
                  </label>
                  <input
                    {...register("name")}
                    type="text"
                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#f59e0b] focus:border-transparent outline-none transition-all"
                    placeholder="e.g. JKSSB VLW 2024"
                  />
                  {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>}
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Year
                    </label>
                    <input
                      {...register("year", { valueAsNumber: true })}
                      type="number"
                      className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#f59e0b] focus:border-transparent outline-none transition-all"
                    />
                    {errors.year && <p className="mt-1 text-sm text-red-500">{errors.year.message}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Total Marks
                    </label>
                    <input
                      {...register("total_marks", { valueAsNumber: true })}
                      type="number"
                      className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#f59e0b] focus:border-transparent outline-none transition-all"
                    />
                    {errors.total_marks && <p className="mt-1 text-sm text-red-500">{errors.total_marks.message}</p>}
                  </div>
                </div>
              </div>
              
              <div className="mt-8 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    reset();
                  }}
                  className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createExam.isPending}
                  className="px-4 py-2 text-sm font-medium text-white bg-[#1e3a5f] hover:bg-[#2a4d7c] rounded-lg transition-colors flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {createExam.isPending ? 'Creating...' : 'Create Exam'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
