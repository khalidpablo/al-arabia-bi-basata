import type { Student } from '../types';

const STORAGE_KEY = 'arabis_session_v1';

export type Session =
  | { role: 'teacher' }
  | { role: 'student'; student: Student };

export function loadSession(): Session | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    return null;
  }
}

export function saveSession(session: Session) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

export function clearSession() {
  localStorage.removeItem(STORAGE_KEY);
}

// Teacher login: phone 01095300546 + password khalid26, OR username admin + password 1234
export const TEACHER_CREDENTIALS: { id: string; password: string }[] = [
  { id: '01095300546', password: 'khalid26' },
  { id: 'admin', password: '1234' },
];

export function isTeacherLogin(id: string, password: string): boolean {
  return TEACHER_CREDENTIALS.some((c) => c.id === id && c.password === password);
}
