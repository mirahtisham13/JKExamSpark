"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { 
  FileText, Link as LinkIcon, Plus, MoreVertical, 
  Trash2, Edit, Eye, EyeOff, Loader2 
} from "lucide-react";
import toast from "react-hot-toast";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

// Define Types
type MaterialType = "pdf" | "link";

interface Material {
  id: string;
  title: string;
  type: MaterialType;
  subject: string;
  topic: string;
  url: string;
  visibility: "public" | "private";
  uploadDate: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

// Mock fetching function (Replace with actual API call)
const fetchMaterials = async (): Promise<Material[]> => {
  try {
    const response = await axios.get(`${API_URL}/admin/materials`);
    return response.data;
  } catch (error) {
    // Return mock data for development if API fails
    return [
      {
        id: "1",
        title: "Accounts Assistant Syllabus",
        type: "pdf",
        subject: "General",
        topic: "Syllabus",
        url: "https://example.com/syllabus.pdf",
        visibility: "public",
        uploadDate: "2026-08-10T10:00:00Z"
      },
      {
        id: "2",
        title: "JKSSB GK Important Questions",
        type: "link",
        subject: "General Knowledge",
        topic: "History",
        url: "https://example.com/gk",
        visibility: "private",
        uploadDate: "2026-08-12T14:30:00Z"
      }
    ];
  }
};

const materialSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  type: z.enum(["pdf", "link"]),
  subject: z.string().min(2, "Subject is required"),
  topic: z.string().min(2, "Topic is required"),
  url: z.string().url("Must be a valid URL"),
  visibility: z.enum(["public", "private"])
});

type MaterialFormValues = z.infer<typeof materialSchema>;

export default function AdminMaterialsPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: materials, isLoading, error } = useQuery({
    queryKey: ["admin-materials"],
    queryFn: fetchMaterials,
  });

  const uploadMutation = useMutation({
    mutationFn: async (newMaterial: MaterialFormValues) => {
      // return axios.post(`${API_URL}/admin/materials`, newMaterial);
      // Simulate API call
      return new Promise((resolve) => setTimeout(resolve, 1000));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-materials"] });
      toast.success("Material uploaded successfully");
      setIsModalOpen(false);
      reset();
    },
    onError: () => {
      toast.error("Failed to upload material");
    }
  });

  const { register, handleSubmit, formState: { errors }, reset } = useForm<MaterialFormValues>({
    resolver: zodResolver(materialSchema),
    defaultValues: {
      type: "pdf",
      visibility: "public"
    }
  });

  const onSubmit = (data: MaterialFormValues) => {
    uploadMutation.mutate(data);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Study Materials</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Manage PDFs and links for students.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          <Plus className="w-5 h-5" />
          Upload Material
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      ) : error ? (
        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 p-4 rounded-lg text-center">
          Failed to load materials. Please try again.
        </div>
      ) : materials?.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-12 text-center">
          <FileText className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-slate-900 dark:text-white mb-2">No materials found</h3>
          <p className="text-slate-500 dark:text-slate-400 mb-6">Get started by uploading your first study material.</p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Upload Material
          </button>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-500 dark:text-slate-400">
                  <th className="p-4">Title</th>
                  <th className="p-4">Subject & Topic</th>
                  <th className="p-4">Type</th>
                  <th className="p-4">Visibility</th>
                  <th className="p-4">Date</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {materials?.map((material) => (
                  <tr key={material.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="p-4">
                      <div className="font-medium text-slate-900 dark:text-white truncate max-w-[200px]" title={material.title}>
                        {material.title}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm text-slate-900 dark:text-white">{material.subject}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">{material.topic}</div>
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                        {material.type === "pdf" ? <FileText className="w-3.5 h-3.5" /> : <LinkIcon className="w-3.5 h-3.5" />}
                        {material.type.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                        material.visibility === "public" 
                          ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                          : "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400"
                      }`}>
                        {material.visibility === "public" ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                        {material.visibility === "public" ? "Public" : "Private"}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-slate-500 dark:text-slate-400">
                      {new Date(material.uploadDate).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-right">
                      <button className="p-2 text-slate-400 hover:text-blue-600 transition-colors" title="Edit">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-slate-400 hover:text-red-600 transition-colors" title="Delete">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-xl w-full max-w-lg shadow-xl overflow-hidden">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Upload Material</h2>
            </div>
            
            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Title</label>
                <input 
                  {...register("title")}
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="e.g. JKSSB Syllabus 2026"
                />
                {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Subject</label>
                  <input 
                    {...register("subject")}
                    className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="e.g. History"
                  />
                  {errors.subject && <p className="text-red-500 text-xs mt-1">{errors.subject.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Topic</label>
                  <input 
                    {...register("topic")}
                    className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="e.g. Modern India"
                  />
                  {errors.topic && <p className="text-red-500 text-xs mt-1">{errors.topic.message}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Type</label>
                <select 
                  {...register("type")}
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="pdf">PDF Document</option>
                  <option value="link">External Link</option>
                </select>
                {errors.type && <p className="text-red-500 text-xs mt-1">{errors.type.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">URL / File Link</label>
                <input 
                  {...register("url")}
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="https://..."
                />
                {errors.url && <p className="text-red-500 text-xs mt-1">{errors.url.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Visibility</label>
                <select 
                  {...register("visibility")}
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="public">Public (Visible to all students)</option>
                  <option value="private">Private (Hidden)</option>
                </select>
                {errors.visibility && <p className="text-red-500 text-xs mt-1">{errors.visibility.message}</p>}
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
                  disabled={uploadMutation.isPending}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium flex items-center gap-2 disabled:opacity-70"
                >
                  {uploadMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                  {uploadMutation.isPending ? "Uploading..." : "Upload Material"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
