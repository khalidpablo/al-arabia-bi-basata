import { useState, useEffect } from 'react';
import Login from './pages/Login';
import StudentDashboard from './pages/StudentDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import { loadSession } from './lib/session';
import type { Student } from './types';

type View = 'login' | 'student' | 'teacher';

export default function App() {
  const [view, setView] = useState<View>('login');
  const [student, setStudent] = useState<Student | null>(null);

  useEffect(() => {
    const session = loadSession();
    if (!session) {
      setView('login');
      return;
    }
    if (session.role === 'teacher') {
      setView('teacher');
    } else {
      setStudent(session.student);
      setView('student');
    }
  }, []);

  const handleLoggedIn = () => {
    const session = loadSession();
    if (!session) return;
    if (session.role === 'teacher') setView('teacher');
    else {
      setStudent(session.student);
      setView('student');
    }
  };

  const handleLogout = () => {
    setStudent(null);
    setView('login');
  };

  if (view === 'login') return <Login onLoggedIn={handleLoggedIn} />;
  if (view === 'teacher') return <TeacherDashboard onLogout={handleLogout} />;
  if (view === 'student' && student) return <StudentDashboard student={student} onLogout={handleLogout} />;
  return <Login onLoggedIn={handleLoggedIn} />;
}
