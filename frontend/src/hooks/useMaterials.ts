import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { get, post, put, del, postForm } from '../lib/api';
import { StudyMaterial, MaterialType } from '../types';

export function useMaterials(filters?: { exam_id?: string, subject_id?: string, topic_id?: string, material_type?: string, search?: string }) {
  return useQuery({
    queryKey: ['materials', filters],
    queryFn: () => get<StudyMaterial[]>('/materials/', filters),
  });
}

export function useMaterial(id: string) {
  return useQuery({
    queryKey: ['materials', id],
    queryFn: () => get<StudyMaterial>(`/materials/${id}`),
    enabled: !!id,
  });
}

export function useUploadMaterial() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (formData: FormData) => postForm<StudyMaterial>('/materials/', formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['materials'] });
    },
  });
}

export function useDeleteMaterial() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => del<{message: string}>(`/materials/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['materials'] });
    },
  });
}

export function useDownloadMaterial() {
  return useMutation({
    mutationFn: (id: string) => get<{url: string, type: string}>(`/materials/${id}/download`),
  });
}
