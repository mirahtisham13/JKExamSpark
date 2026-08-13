import { useQuery } from '@tanstack/react-query';
import { get } from '../lib/api';
import { Exam, Subject, Topic } from '../types';

export function useExams() {
  return useQuery({
    queryKey: ['exams'],
    queryFn: () => get<Exam[]>('/exams/'),
  });
}

export function useSubjects(examId?: string) {
  return useQuery({
    queryKey: ['subjects', examId],
    queryFn: () => get<Subject[]>('/subjects/', { exam_id: examId }),
  });
}

export function useTopics(subjectId?: string) {
  return useQuery({
    queryKey: ['topics', subjectId],
    queryFn: () => get<Topic[]>('/topics/', { subject_id: subjectId }),
  });
}

export function useCategories(examId?: string) {
  return useQuery({
    queryKey: ['categories', examId],
    queryFn: () => get<any[]>('/categories/', { exam_id: examId }),
  });
}
