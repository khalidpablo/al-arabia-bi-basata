export type Grade = '1g' | '2g' | '3g';

export type LessonType = 'video' | 'interactive';

export interface Student {
  id: string;
  name: string;
  phone: string;
  password: string;
  grade: Grade;
  points: number;
  is_online: boolean;
  created_at: string;
}

export interface Question {
  q: string;
  a: string;
  b: string;
  c: string;
  correct: 'a' | 'b' | 'c';
}

export interface Quiz {
  id: string;
  title: string;
  questions: Question[];
  created_at: string;
}

export interface Lesson {
  id: string;
  title: string;
  grade: Grade;
  type: LessonType;
  video: string;
  interactive_html: string;
  pdf: string;
  quiz_id: string;
  points: number;
  created_at: string;
}

export interface Notification {
  id: string;
  title: string;
  body: string;
  created_at: string;
}

export const GRADE_LABELS: Record<Grade, string> = {
  '1g': 'الصف الأول الإعدادي',
  '2g': 'الصف الثاني الإعدادي',
  '3g': 'الصف الثالث الإعدادي',
};

export const GRADE_SHORT: Record<Grade, string> = {
  '1g': 'الأول',
  '2g': 'الثاني',
  '3g': 'الثالث',
};
