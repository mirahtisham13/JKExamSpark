export enum UserRole {
  STUDENT = 'STUDENT',
  ADMIN = 'ADMIN'
}

export interface User {
  id: string;
  email: string;
  username: string;
  full_name: string;
  role: UserRole;
  phone?: string;
  is_active: boolean;
  created_at: string;
}

export enum ExamStatus {
  UPCOMING = 'UPCOMING',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED'
}

export interface Exam {
  id: string;
  name: string;
  year: number;
  notification_number?: string;
  exam_date?: string;
  total_marks: number;
  status: ExamStatus;
  created_at: string;
}

export interface ExamCategory {
  id: string;
  exam_id: string;
  category_name: string;
  vacancies: number;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
}

export interface Subject {
  id: string;
  name: string;
}

export interface Topic {
  id: string;
  subject_id: string;
  name: string;
}

export enum MaterialType {
  PDF = 'PDF',
  VIDEO = 'VIDEO',
  LINK = 'LINK'
}

export interface StudyMaterial {
  id: string;
  title: string;
  description?: string;
  exam_id?: string;
  subject_id?: string;
  topic_id?: string;
  material_type: MaterialType;
  file_url: string;
  download_count: number;
  created_at: string;
}

export interface Quiz {
  id: string;
  title: string;
  exam_id?: string;
  subject_id?: string;
  difficulty: string;
  duration_minutes: number;
  total_marks: number;
  pass_marks?: number;
  has_negative_marking: boolean;
  negative_marks_per_wrong: number;
  show_explanations: boolean;
  status: 'draft' | 'published' | 'archived';
  questions_count?: number;
  questions?: QuizQuestion[];
}

export interface QuizQuestion {
  id: string;
  quiz_id: string;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option?: string; // Hidden for students
  marks: number;
  explanation?: string;
}

export interface QuizAttempt {
  id: string;
  quiz_id: string;
  user_id: string;
  started_at: string;
  submitted_at?: string;
  status: 'in_progress' | 'submitted' | 'abandoned';
  time_taken_seconds?: number;
  raw_score?: number;
  final_score?: number;
}

export interface QuizAnswer {
  id: string;
  attempt_id: string;
  question_id: string;
  selected_option?: string;
  is_correct?: boolean;
  marks_awarded?: number;
}

export interface QuizAttemptResult {
  attempt_id: string;
  quiz_id: string;
  quiz_title: string;
  final_score: number;
  total_marks: number;
  percentage: number;
  correct_count: number;
  wrong_count: number;
  unattempted_count: number;
  time_taken_seconds: number;
  pass_marks?: number;
  passed?: boolean;
  questions: any[]; // Full breakdown
}

export enum VerificationStatus {
  PENDING = 'PENDING',
  VERIFIED = 'VERIFIED',
  REJECTED = 'REJECTED'
}

export interface ExamScoreSubmission {
  id: string;
  user_id: string;
  exam_id: string;
  marks_obtained: number;
  category_id: string;
  category_name?: string;
  category: string;
  verification_status: VerificationStatus;
  total_marks_of_exam?: number;
  exam_name?: string;
  notes?: string;
  submitted_at: string;
  user?: { full_name: string; username: string };
  exam?: { name: string };
}

export interface ScoreEditHistory {
  id: string;
  submission_id: string;
  old_marks: number;
  new_marks: number;
  reason: string;
  changed_at: string;
}

export interface RankingEntry {
  rank: number;
  user_id: string;
  username: string;
  marks: number;
  category: string;
  percentile: number;
}

export interface UserRankingResult {
  overall_rank: number;
  category_rank: number;
  total_candidates: number;
  category_candidates: number;
  percentile: number;
  marks_obtained: number;
  total_marks_of_exam: number;
  category_name: string;
  verification_status: VerificationStatus;
}

export interface RankingStats {
  total_submitted: number;
  mean_score: number;
  highest_score: number;
  category_breakdown: Record<string, number>;
}

export interface OfficialCutoff {
  category: string;
  cutoff_marks: number;
}

export interface CutoffEstimate {
  category: string;
  estimated_min: number;
  estimated_max: number;
  confidence: 'LOW' | 'MEDIUM' | 'HIGH';
  sample_size: number;
}

export interface CutoffResponse {
  exam_id: string;
  is_official: boolean;
  estimates?: CutoffEstimate[];
  official?: OfficialCutoff[];
  insufficient_data_categories?: string[];
}

export enum AnnouncementType {
  INFO = 'INFO',
  WARNING = 'WARNING',
  SUCCESS = 'SUCCESS'
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  type: AnnouncementType;
  is_pinned: boolean;
  target_exam_id?: string;
  created_at: string;
  expires_at?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  user: User;
}

export interface StudentDashboardStats {
  quizzes_taken: number;
  materials_downloaded: number;
  exams_submitted: number;
  best_rank_text: string;
}

export interface RecentQuizAttempt {
  id: number;
  quiz_title: string;
  final_score: number;
  total_marks: number;
  percentage: number;
  submitted_at: string;
}

export interface RecentScoreSubmission {
  id: number;
  exam_name: string;
  marks_obtained: number;
  category_name: string;
  verification_status: VerificationStatus;
  submitted_at: string;
}

export interface BestRankingHighlight {
  exam_id: number;
  exam_name: string;
  overall_rank: number;
  category_rank: number;
  percentile: number;
  estimated_cutoff_min: number | null;
  estimated_cutoff_max: number | null;
  estimated_confidence: string | null;
}

export interface ActiveExamItem {
  id: number;
  name: string;
  year: number;
  total_marks: number;
}

export interface StudentDashboardResponse {
  stats: StudentDashboardStats;
  recent_quizzes: RecentQuizAttempt[];
  recent_submissions: RecentScoreSubmission[];
  best_ranking: BestRankingHighlight | null;
  active_exams: ActiveExamItem[];
  announcements: Announcement[];
}
