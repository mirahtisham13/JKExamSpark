"use client";

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { get } from '@/lib/api';
import { useCreateAnnouncement } from '@/hooks/useAdmin';
import { Plus, X, Search, Bell, Calendar, Info, AlertTriangle, CheckCircle2, Megaphone } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Announcement, AnnouncementType } from '@/types';
import toast from 'react-hot-toast';

const announcementSchema = z.object({
  title: z.string().min(3, "Title is required").max(100),
  content: z.string().min(10, "Content must be at least 10 characters"),
  type: z.enum([AnnouncementType.INFO, AnnouncementType.WARNING, AnnouncementType.SUCCESS]),
});

type AnnouncementFormValues = z.infer<typeof announcementSchema>;

export default function AdminAnnouncementsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const { data: announcements, isLoading } = useQuery({
    queryKey: ['announcements'],
    queryFn: () => get<Announcement[]>('/announcements/'),
  });

  const createAnnouncement = useCreateAnnouncement();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AnnouncementFormValues>({
    resolver: zodResolver(announcementSchema),
    defaultValues: {
      type: AnnouncementType.INFO,
    }
  });

  const onSubmit = (data: AnnouncementFormValues) => {
    createAnnouncement.mutate(data, {
      onSuccess: () => {
        setIsModalOpen(false);
        reset();
      }
    });
  };

  const filteredAnnouncements = announcements?.filter(announcement => 
    announcement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    announcement.content.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const getTypeIcon = (type: string) => {
    switch(type) {
      case AnnouncementType.INFO:
        return <Info size={16} className="text-blue-500" />;
      case AnnouncementType.WARNING:
        return <AlertTriangle size={16} className="text-amber-500" />;
      case AnnouncementType.SUCCESS:
        return <CheckCircle2 size={16} className="text-green-500" />;
      default:
        return <Bell size={16} className="text-slate-500" />;
    }
  };

  const getTypeStyle = (type: string) => {
    switch(type) {
      case AnnouncementType.INFO:
        return "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800";
      case AnnouncementType.WARNING:
        return "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800";
      case AnnouncementType.SUCCESS:
        return "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800";
      default:
        return "bg-slate-50 text-slate-700 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700";
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Announcements</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Broadcast updates, news, and official cutoffs to all students.</p>
        </div>
        
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-[#1e3a5f] hover:bg-[#2a4d7c] text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm"
        >
          <Plus size={20} />
          New Announcement
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 mb-8">
        <div className="relative max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-slate-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#f59e0b] focus:border-transparent outline-none transition-all"
            placeholder="Search announcements..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Announcements List */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1e3a5f]"></div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAnnouncements.map((announcement) => (
            <div key={announcement.id} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-5 hover:border-slate-300 dark:hover:border-slate-600 transition-colors">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-md border ${getTypeStyle(announcement.type)}`}>
                      {getTypeIcon(announcement.type)}
                      {announcement.type}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                      <Calendar size={12} />
                      {new Date(announcement.created_at).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">{announcement.title}</h3>
                  <p className="text-slate-600 dark:text-slate-300 text-sm line-clamp-2">{announcement.content}</p>
                </div>
                
                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <button className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-[#1e3a5f] dark:hover:text-blue-400 transition-colors px-3 py-1.5 rounded bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600">
                    Edit
                  </button>
                  <button className="text-sm font-medium text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors px-3 py-1.5 rounded bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40">
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
          
          {filteredAnnouncements.length === 0 && !isLoading && (
            <div className="py-16 text-center bg-white dark:bg-slate-800 rounded-xl border border-dashed border-slate-300 dark:border-slate-600">
              <div className="bg-slate-50 dark:bg-slate-900 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Megaphone size={28} className="text-slate-400 dark:text-slate-500" />
              </div>
              <h3 className="text-lg font-medium text-slate-900 dark:text-white">No announcements found</h3>
              <p className="text-slate-500 dark:text-slate-400 mt-1">Try a different search term or publish a new update.</p>
            </div>
          )}
        </div>
      )}

      {/* New Announcement Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-lg shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-slate-700">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Megaphone size={20} className="text-[#f59e0b]" />
                New Announcement
              </h2>
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
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Announcement Title
                  </label>
                  <input
                    {...register("title")}
                    type="text"
                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#f59e0b] focus:border-transparent outline-none transition-all"
                    placeholder="e.g. JKSSB Official Cutoff Released"
                  />
                  {errors.title && <p className="mt-1 text-sm text-red-500">{errors.title.message}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Type
                  </label>
                  <select
                    {...register("type")}
                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#f59e0b] focus:border-transparent outline-none transition-all"
                  >
                    <option value={AnnouncementType.INFO}>Info (General Updates)</option>
                    <option value={AnnouncementType.WARNING}>Warning (Important/Urgent)</option>
                    <option value={AnnouncementType.SUCCESS}>Success (Results/Good News)</option>
                  </select>
                  {errors.type && <p className="mt-1 text-sm text-red-500">{errors.type.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Content
                  </label>
                  <textarea
                    {...register("content")}
                    rows={4}
                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#f59e0b] focus:border-transparent outline-none transition-all resize-none"
                    placeholder="Provide details about the announcement..."
                  ></textarea>
                  {errors.content && <p className="mt-1 text-sm text-red-500">{errors.content.message}</p>}
                </div>
              </div>
              
              <div className="mt-8 flex justify-end gap-3 pt-5 border-t border-slate-100 dark:border-slate-700">
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
                  disabled={createAnnouncement.isPending}
                  className="px-4 py-2 text-sm font-medium text-white bg-[#1e3a5f] hover:bg-[#2a4d7c] rounded-lg transition-colors flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {createAnnouncement.isPending ? 'Publishing...' : 'Publish Announcement'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
