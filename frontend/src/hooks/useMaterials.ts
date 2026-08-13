import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { get, post, put, del, postForm } from '../lib/api';
import { StudyMaterial, MaterialType } from '../types';

export function useMaterials(filters?: { exam_id?: number, subject_id?: number, topic_id?: number, material_type?: string, search?: string }) {
  return useQuery({
    queryKey: ['materials', filters],
    queryFn: () => get<StudyMaterial[]>('/materials/', filters),
  });
}

export function useMaterial(id: number) {
  return useQuery({
    queryKey: ['materials', id],
    queryFn: () => get<MaterialPublic>(`/materials/${id}`),
    enabled: !!id,
  });
}

export function useUploadMaterial() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (formData: FormData) => postForm<MaterialPublic>('/materials/', formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['materials'] });
    },
  });
}

export function useDeleteMaterial() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => del<{message: string}>(`/materials/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['materials'] });
    },
  });
}

export function useDownloadMaterial() {
  return useMutation({
    mutationFn: (id: number) => get<{url: string, type: string}>(`/materials/${id}/download`),
  });
}
