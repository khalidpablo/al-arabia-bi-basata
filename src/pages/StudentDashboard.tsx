import { useState, useEffect, useMemo } from 'react';
import {
  GraduationCap,
  Crown,
  Trophy,
  BookOpen,
  Play,
  Wand2,
  FileText,
  Feather,
  LogOut,
  Megaphone,
  MessageCircle,
  Award,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useLessons, useStudents, useNotifications } from '../lib/hooks';
import { fireConfetti } from '../lib/confetti';
import { clearSession } from '../lib/session';
import { GRADE_LABELS, type Student, type Lesson, type Quiz, type Question } from '../types';
import { Modal, Toast, EmptyState } from '../components/ui';

interface StudentDashboardProps {
  student: Student;
  onLogout: () => void;
}

export default function StudentDashboard({ student, onLogout }: StudentDashboardProps) {
  const { lessons } = useLessons();
  const { students } = useStudents();
  const { notifications } = useNotifications();
  const [points, setPoints] = useState(student.points);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [activeQuiz, setActiveQuiz] = useState<{ quiz: Quiz; points: number } | null>(null);
  const [answers, setAnswers] = useState<Record<number, 'a' | 'b' | 'c'>>({});
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [quizResult, setQuizResult] = useState<{ correct: number; total: number } | null>(null);

  // Live student record (points + presence)
  useEffect(() => {
    let channel: ReturnType<typeof supabase.channel> | null = null;
    (async () => {
      await supabase.from('students').update({ is_online: true }).eq('id', student.id);
      const { data } = await supabase
        .from('students')
        .select('points')
        .eq('id', student.id)
        .maybeSingle();
      if (data) setPoints(data.points);
      channel = supabase
        .channel('student-self')
        .on(
          'postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'students', filter: `id=eq.${student.id}` },
          (payload) => setPoints((payload.new as Student).points),
        )
        .subscribe();
    })();
    const onUnload = () => {
      supabase.from('students').update({ is_online: false }).eq('id', student.id);
    };
    window.addEventListener('beforeunload', onUnload);
    return () => {
      window.removeEventListener('beforeunload', onUnload);
      onUnload();
      if (channel) supabase.removeChannel(channel);
    };
  }, [student.id]);

  const gradeLessons = useMemo(
    () => lessons.filter((l) => l.grade === student.grade),
    [lessons, student.grade],
  );

  const leaderboard = useMemo(
    () =>
      students
        .filter((s) => s.grade === student.grade)
        .sort((a, b) => b.points - a.points)
        .slice(0, 5),
    [students, student.grade],
  );

  const latestNoti = notifications[0] ?? null;

  const openQuizForLesson = async (lesson: Lesson) => {
    if (!lesson.quiz_id) return;
    const { data, error } = await supabase
      .from('quizzes')
      .select('*')
      .eq('id', lesson.quiz_id)
      .maybeSingle();
    if (error || !data) {
      setToast({ msg: 'تعذر تحميل أسئلة الاختبار.', type: 'error' });
      return;
    }
    setAnswers({});
    setQuizResult(null);
    setActiveQuiz({ quiz: data as Quiz, points: lesson.points });
  };

  const submitQuiz = async () => {
    if (!activeQuiz) return;
    const total = activeQuiz.quiz.questions.length;
    let correct = 0;
    let answered = 0;
    activeQuiz.quiz.questions.forEach((q, i) => {
      if (answers[i]) {
        answered++;
        if (answers[i] === q.correct) correct++;
      }
    });
    if (answered < total) {
      setToast({ msg: 'يرجى حل جميع الأسئلة المطروحة أولاً!', type: 'error' });
      return;
    }
    if (correct === total) {
      fireConfetti();
      const newPoints = points + activeQuiz.points;
      setPoints(newPoints);
      await supabase.from('students').update({ points: newPoints }).eq('id', student.id);
      setToast({
        msg: `مبروك يا بطل! إجابة كاملة 100% — تمت إضافة +${activeQuiz.points} نقطة إلى رصيدك!`,
        type: 'success',
      });
      setActiveQuiz(null);
      setActiveLesson(null);
    } else {
      setQuizResult({ correct, total });
    }
  };

  const logout = async () => {
    await supabase.from('students').update({ is_online: false }).eq('id', student.id);
    clearSession();
    onLogout();
  };

  const videoEmbedUrl = (url: string) => {
    if (!url) return '';
    if (url.includes('watch?v=')) return url.replace('watch?v=', 'embed/');
    if (url.includes('youtu.be/')) return url.replace('youtu.be/', 'youtube.com/embed/');
    if (url.includes('drive.google.com'))
      return url.replace('/view?usp=sharing', '/preview').replace('/view', '/preview');
    return url;
  };

  return (
    <div className="min-h-screen bg-logoDark text-slate-100">
      {latestNoti && (
        <div className="relative z-50 bg-gradient-to-r from-logoGold to-amber-500 px-4 py-2 text-center text-xs font-black text-logoDark">
          <Megaphone size={14} className="ml-2 inline" />
          <strong>{latestNoti.title}: </strong>
          {latestNoti.body}
        </div>
      )}

      <div className="mx-auto max-w-6xl space-y-6 p-4 md:p-6">
        {/* Header */}
        <header className="flex flex-col items-center justify-between gap-4 rounded-3xl border border-logoGold/20 bg-logoNavy/60 p-6 shadow-xl md:flex-row">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-logoGold bg-gradient-to-br from-logoGold/20 to-logoNavy text-xl font-black text-logoGold">
              {student.name.charAt(0)}
            </div>
            <div>
              <h1 className="flex items-center gap-1.5 text-lg font-black text-white md:text-xl">
                أهلاً بك يا بطل الضاد 👋 <span>{student.name}</span>
              </h1>
              <p className="mt-1 text-[10px] font-bold text-slate-400 md:text-xs">
                <GraduationCap size={12} className="ml-1 inline text-logoGold" />
                الصف الدراسي: {GRADE_LABELS[student.grade]}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-logoGold/30 bg-logoDark/80 px-5 py-3 shadow-inner">
            <div className="text-right">
              <span className="block text-[10px] font-bold text-slate-400">رصيد أوسمتك ونقاطك:</span>
              <span className="text-xl font-black text-logoGold">{points}</span>{' '}
              <span className="text-xs font-bold text-logoGold">نقطة 🏆</span>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-logoGold/20 bg-logoGold/10">
              <Crown size={20} className="animate-bounce text-logoGold" />
            </div>
          </div>
        </header>

        {/* Leaderboard */}
        <section className="space-y-4 rounded-3xl border border-slate-800 bg-logoNavy/30 p-6">
          <h3 className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-logoGold">
            <Trophy size={14} className="text-amber-500" /> لوحة الشرف للأبطال المتصدرين
          </h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
            {leaderboard.length === 0 ? (
              <div className="col-span-full py-4 text-center text-xs font-bold text-slate-500">
                لا يوجد أبطال في صفك بعد.
              </div>
            ) : (
              leaderboard.map((s, i) => (
                <div
                  key={s.id}
                  className={`relative rounded-2xl bg-logoDark/80 p-3 text-center ${
                    i === 0 ? 'border-2 border-logoGold' : 'border-2 border-transparent'
                  }`}
                >
                  {i === 0 && (
                    <span className="absolute -top-3.5 right-1/2 translate-x-1/2 text-base">👑</span>
                  )}
                  <span className="block text-[10px] font-bold text-slate-400">البطل {i + 1}</span>
                  <p className="mt-1 truncate text-xs font-bold text-white">{s.name}</p>
                  <p className="mt-1 text-[11px] font-black text-logoGold">{s.points} نقطة</p>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Lessons */}
        <section className="space-y-4">
          <h2 className="flex items-center gap-2 text-sm font-extrabold text-white md:text-base">
            <BookOpen size={16} className="text-logoGold" /> دروسك التعليمية المتاحة الآن
          </h2>
          {gradeLessons.length === 0 ? (
            <EmptyState
              icon={<BookOpen size={32} />}
              title="لا توجد دروس مضافة لهذا الصف حالياً."
            />
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {gradeLessons.map((les) => {
                const interactive = les.type === 'interactive';
                return (
                  <div
                    key={les.id}
                    className="flex flex-col justify-between rounded-2xl border border-slate-700/50 bg-logoNavy p-4 transition duration-300 hover:border-logoGold"
                  >
                    <div>
                      <div className="mb-2 flex items-center justify-between">
                        <span
                          className={`rounded-lg border px-2 py-0.5 text-[10px] font-bold ${
                            interactive
                              ? 'border-amber-500/20 bg-amber-500/10 text-amber-400'
                              : 'border-sky-500/20 bg-sky-500/10 text-sky-400'
                          }`}
                        >
                          {interactive ? '🪄 درس تفاعلي' : '🎥 درس فيديو'}
                        </span>
                        <span className="rounded-lg border border-logoGold/20 bg-logoGold/10 px-2 py-0.5 text-[10px] font-bold text-logoGold">
                          {les.points} نقطة
                        </span>
                      </div>
                      <h4 className="mb-2 line-clamp-1 text-sm font-bold text-white">{les.title}</h4>
                      <p className="mb-4 line-clamp-2 text-xs text-slate-400">
                        درجة إتمام الدرس تمنحك{' '}
                        <span className="font-bold text-logoGold">{les.points} نقطة</span> لتنافس في
                        لوحة الشرف.
                      </p>
                    </div>
                    <button
                      onClick={() => setActiveLesson(les)}
                      className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-logoGold py-2 text-xs font-black text-logoDark shadow-md transition hover:bg-logoGoldHover"
                    >
                      {interactive ? <Wand2 size={14} /> : <Play size={14} />} ابدأ الدرس الآن
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Footer actions */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
          <a
            href={`https://wa.me/201095300546?text=${encodeURIComponent(
              `أهلاً أستاذي خالد، أنا البطل: ${student.name}، لدي سؤال بخصوص المنصة...`,
            )}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-xl border border-logoGold/20 bg-logoDark/80 px-4 py-2 text-xs font-bold text-logoGold transition hover:border-logoGold"
          >
            <MessageCircle size={14} /> تواصل مع الأستاذ
          </a>
          <button
            onClick={logout}
            className="inline-flex items-center gap-2 rounded-xl bg-rose-600/10 px-4 py-2 text-xs font-bold text-rose-400 transition hover:bg-rose-600 hover:text-white"
          >
            <LogOut size={14} /> تسجيل الخروج
          </button>
        </div>
      </div>

      {/* Lesson viewer modal */}
      <Modal
        open={!!activeLesson}
        onClose={() => setActiveLesson(null)}
        title={activeLesson?.title ?? ''}
        maxWidth="max-w-4xl"
      >
        {activeLesson && (
          <div>
            {activeLesson.type === 'interactive' && activeLesson.interactive_html ? (
              <iframe
                title="interactive-lesson"
                srcDoc={activeLesson.interactive_html}
                className="h-[650px] w-full rounded-2xl border border-slate-700 bg-logoDark"
                sandbox="allow-scripts allow-same-origin"
              />
            ) : (
              <div className="mb-6 aspect-video w-full overflow-hidden rounded-2xl border border-slate-700 bg-black">
                {activeLesson.video ? (
                  <iframe
                    title="lesson-video"
                    src={videoEmbedUrl(activeLesson.video)}
                    className="h-full w-full border-none"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-slate-500">
                    لا يوجد فيديو متاح لهذا الدرس.
                  </div>
                )}
              </div>
            )}

            <div className="flex flex-wrap justify-center gap-3">
              {activeLesson.pdf && (
                <a
                  href={activeLesson.pdf}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 rounded-xl border border-rose-500/20 bg-rose-600/10 px-5 py-2.5 text-xs font-bold text-rose-400 transition hover:bg-rose-600 hover:text-white"
                >
                  <FileText size={14} /> تحميل ملزمة الـ PDF
                </a>
              )}
              {activeLesson.quiz_id && (
                <button
                  onClick={() => openQuizForLesson(activeLesson)}
                  className="flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-2.5 text-xs font-black text-white shadow-lg transition hover:scale-105 hover:bg-emerald-500"
                >
                  <Feather size={14} /> ابدأ الاختبار الآن وتحدَّ نفسك
                </button>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Quiz modal */}
      <Modal
        open={!!activeQuiz}
        onClose={() => {
          setActiveQuiz(null);
          setQuizResult(null);
        }}
        title={activeQuiz?.quiz.title ?? ''}
        maxWidth="max-w-xl"
      >
        {activeQuiz && (
          <div className="space-y-6">
            {quizResult && (
              <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-center text-sm font-bold text-amber-300">
                للأسف، إجاباتك ليست كاملة بالكامل (أصبت في {quizResult.correct} من أصل{' '}
                {quizResult.total}). راجع وحاول مجدداً للحصول على النقاط والدرع الذهبي!
              </div>
            )}
            <div className="space-y-6">
              {activeQuiz.quiz.questions.map((q: Question, idx: number) => (
                <div
                  key={idx}
                  className="space-y-3 rounded-xl border border-slate-700/50 bg-logoDark/40 p-4"
                >
                  <p className="text-xs font-bold text-white md:text-sm">
                    <span className="text-logoGold">س{idx + 1}:</span> {q.q}
                  </p>
                  <div className="space-y-2">
                    {(['a', 'b', 'c'] as const).map((opt) => (
                      <label
                        key={opt}
                        className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-800 bg-logoNavy/80 p-2.5 text-xs text-slate-300 transition hover:border-logoGold/30"
                      >
                        <input
                          type="radio"
                          name={`q_${idx}`}
                          checked={answers[idx] === opt}
                          onChange={() => setAnswers((a) => ({ ...a, [idx]: opt }))}
                          className="accent-logoGold"
                        />
                        <span>
                          {opt === 'a' ? 'أ' : opt === 'b' ? 'ب' : 'ج'}) {q[opt]}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={submitQuiz}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-logoGold py-3 font-black text-logoDark shadow-lg transition hover:bg-logoGoldHover"
            >
              <Award size={16} /> إرسال الإجابات وتقييم النتيجة فورا
            </button>
          </div>
        )}
      </Modal>

      {toast && <Toast message={toast.msg} type={toast.type} onDone={() => setToast(null)} />}
    </div>
  );
}
