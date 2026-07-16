import { useState } from 'react';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  ClipboardList,
  Megaphone,
  LogOut,
  Plus,
  Pencil,
  Trash2,
  Video,
  Wand2,
  Coins,
  X,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useStudents, useLessons, useQuizzes, useNotifications } from '../lib/hooks';
import { clearSession } from '../lib/session';
import {
  GRADE_LABELS,
  type Grade,
  type Student,
  type Lesson,
  type LessonType,
  type Quiz,
  type Notification,
  type Question,
} from '../types';
import { Modal, Toast, EmptyState, ConfirmDialog } from '../components/ui';

type Tab = 'dashboard' | 'students' | 'lessons' | 'quizzes' | 'noticeboard';

interface TeacherDashboardProps {
  onLogout: () => void;
}

export default function TeacherDashboard({ onLogout }: TeacherDashboardProps) {
  const [tab, setTab] = useState<Tab>('dashboard');
  const { students, refetch: refetchStudents } = useStudents();
  const { lessons, refetch: refetchLessons } = useLessons();
  const { quizzes, refetch: refetchQuizzes } = useQuizzes();
  const { notifications, refetch: refetchNotis } = useNotifications();
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [confirm, setConfirm] = useState<{ fn: () => Promise<void> } | null>(null);

  const showToast = (msg: string, type: 'success' | 'error' | 'info' = 'success') =>
    setToast({ msg, type });

  const logout = () => {
    clearSession();
    onLogout();
  };

  const requestDelete = async (table: string, id: string, label: string) => {
    setConfirm({
      fn: async () => {
        const { error } = await supabase.from(table).delete().eq('id', id);
        if (error) showToast(`فشل حذف ${label}.`, 'error');
        else showToast(`تم حذف ${label} بنجاح.`, 'success');
      },
    });
  };

  const navItems: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'لوحة الإحصائيات', icon: <LayoutDashboard size={16} className="text-logoGold" /> },
    { id: 'students', label: 'إدارة الأبطال', icon: <Users size={16} className="text-logoGold" /> },
    { id: 'lessons', label: 'إدارة الدروس', icon: <BookOpen size={16} className="text-logoGold" /> },
    { id: 'quizzes', label: 'إدارة الاختبارات', icon: <ClipboardList size={16} className="text-logoGold" /> },
    { id: 'noticeboard', label: 'لوحة التنبيهات والأخبار', icon: <Megaphone size={16} className="text-logoGold" /> },
  ];

  return (
    <div className="flex min-h-screen bg-logoDark text-slate-100">
      {/* Sidebar */}
      <aside className="hidden w-64 flex-col justify-between border-l border-logoGold/20 bg-logoNavy p-6 md:flex">
        <div>
          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-logoGold bg-gradient-to-br from-logoGold/20 to-logoNavy text-sm font-black text-logoGold">
              خ
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-white">الأستاذ خالد وحيد</h2>
              <span className="text-[10px] font-bold text-logoGold">المعلم القائد 👑</span>
            </div>
          </div>
          <nav className="space-y-2">
            {navItems.map((n) => (
              <button
                key={n.id}
                onClick={() => setTab(n.id)}
                className={`flex w-full items-center gap-2 rounded-xl p-3 text-right text-xs font-bold transition ${
                  tab === n.id ? 'bg-logoGold/15 text-logoGold' : 'text-slate-300 hover:bg-logoDark/40'
                }`}
              >
                {n.icon} {n.label}
              </button>
            ))}
          </nav>
        </div>
        <button
          onClick={logout}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-rose-600/10 p-3 text-xs font-bold text-rose-400 transition hover:bg-rose-600 hover:text-white"
        >
          <LogOut size={14} /> تسجيل الخروج
        </button>
      </aside>

      {/* Main */}
      <main className="max-h-screen flex-1 overflow-y-auto p-6 md:p-8">
        <header className="mb-8 flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h1 className="bg-gradient-to-r from-white to-logoGold bg-clip-text text-lg font-black text-transparent md:text-2xl">
              إمبراطورية المعلم خالد 🪄
            </h1>
            <p className="mt-1 text-xs text-slate-400">تحكّم بالمنصة السحابية بالكامل بكل سهولة وسلاسة</p>
          </div>
          <div className="flex items-center gap-3">
            {/* mobile tab select */}
            <select
              value={tab}
              onChange={(e) => setTab(e.target.value as Tab)}
              className="rounded-xl border border-slate-700 bg-logoNavy p-2 text-xs font-bold text-white md:hidden"
            >
              {navItems.map((n) => (
                <option key={n.id} value={n.id}>
                  {n.label}
                </option>
              ))}
            </select>
            <button
              onClick={logout}
              className="rounded-xl bg-rose-600/10 p-2 text-rose-400 md:hidden"
            >
              <LogOut size={16} />
            </button>
          </div>
        </header>

        {tab === 'dashboard' && <DashboardTab counts={{ students: students.length, lessons: lessons.length, quizzes: quizzes.length, notis: notifications.length }} />}

        {tab === 'students' && (
          <StudentsTab
            students={students}
            showToast={showToast}
            refetch={refetchStudents}
            requestDelete={requestDelete}
          />
        )}

        {tab === 'lessons' && (
          <LessonsTab
            lessons={lessons}
            quizzes={quizzes}
            showToast={showToast}
            refetch={refetchLessons}
            requestDelete={requestDelete}
          />
        )}

        {tab === 'quizzes' && (
          <QuizzesTab
            quizzes={quizzes}
            showToast={showToast}
            refetch={refetchQuizzes}
            requestDelete={requestDelete}
          />
        )}

        {tab === 'noticeboard' && (
          <NoticeboardTab
            notifications={notifications}
            showToast={showToast}
            refetch={refetchNotis}
            requestDelete={requestDelete}
          />
        )}
      </main>

      {confirm && (
        <ConfirmDialog
          open
          title="تأكيد الحذف"
          message="هل أنت متأكد تماماً من حذف هذا العنصر بشكل نهائي من قاعدة البيانات؟ لا يمكن التراجع!"
          confirmLabel="حذف نهائي"
          danger
          onCancel={() => setConfirm(null)}
          onConfirm={async () => {
            await confirm.fn();
            setConfirm(null);
          }}
        />
      )}
      {toast && <Toast message={toast.msg} type={toast.type} onDone={() => setToast(null)} />}
    </div>
  );
}

/* ============ Dashboard tab ============ */
function DashboardTab({
  counts,
}: {
  counts: { students: number; lessons: number; quizzes: number; notis: number };
}) {
  const cards = [
    { label: 'إجمالي الأبطال المسجلين', value: counts.students, icon: <Users size={24} className="text-logoGold" /> },
    { label: 'الدروس السحابية', value: counts.lessons, icon: <BookOpen size={24} className="text-sky-400" /> },
    { label: 'الاختبارات الإلكترونية', value: counts.quizzes, icon: <ClipboardList size={24} className="text-emerald-400" /> },
    { label: 'تنبيهات نشطة حالياً', value: counts.notis, icon: <Megaphone size={24} className="text-rose-400" /> },
  ];
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
      {cards.map((c) => (
        <div key={c.label} className="rounded-2xl border border-slate-800 bg-logoNavy p-5">
          <span className="mb-1 block text-xs font-bold text-slate-400">{c.label}</span>
          <div className="flex items-center justify-between">
            <span className="text-3xl font-black text-white">{c.value}</span>
            {c.icon}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ============ Students tab ============ */
function StudentsTab({
  students,
  showToast,
  refetch,
  requestDelete,
}: {
  students: Student[];
  showToast: (m: string, t?: 'success' | 'error' | 'info') => void;
  refetch: () => void;
  requestDelete: (t: string, id: string, label: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Student | null>(null);
  const [form, setForm] = useState({ name: '', grade: '1g' as Grade, phone: '', password: '', points: 0 });

  const openNew = () => {
    setEditing(null);
    setForm({ name: '', grade: '1g', phone: '', password: '', points: 0 });
    setOpen(true);
  };
  const openEdit = (s: Student) => {
    setEditing(s);
    setForm({ name: s.name, grade: s.grade, phone: s.phone, password: s.password, points: s.points });
    setOpen(true);
  };

  const save = async () => {
    if (!form.name.trim() || !form.phone.trim() || !form.password.trim()) {
      showToast('يرجى ملء كافة الحقول الإجبارية المميزة بنجمة!', 'error');
      return;
    }
    const payload = {
      name: form.name.trim(),
      grade: form.grade,
      phone: form.phone.trim(),
      password: form.password.trim(),
      points: Number(form.points) || 0,
      is_online: false,
    };
    if (editing) {
      const { error } = await supabase.from('students').update(payload).eq('id', editing.id);
      if (error) showToast('فشل تحديث البطل.', 'error');
      else showToast('تم تحديث بيانات البطل بنجاح!', 'success');
    } else {
      const { error } = await supabase.from('students').insert(payload);
      if (error) {
        showToast(error.code === '23505' ? 'رقم الهاتف مسجل مسبقاً.' : 'فشل حفظ البطل.', 'error');
        return;
      }
      showToast('تم تسجيل البطل الجديد بنجاح!', 'success');
    }
    setOpen(false);
    refetch();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-black text-logoGold">👥 قائمة الأبطال الحالية</h3>
        <button
          onClick={openNew}
          className="flex items-center gap-1 rounded-xl bg-logoGold px-4 py-2 text-xs font-black text-logoDark shadow-md transition hover:bg-logoGoldHover"
        >
          <Plus size={14} /> إضافة بطل جديد
        </button>
      </div>

      <div className="overflow-hidden rounded-3xl border border-slate-800 bg-logoNavy shadow-2xl">
        {students.length === 0 ? (
          <EmptyState icon={<Users size={32} />} title="لا يوجد أبطال مسجلون بعد." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="border-b border-slate-800 bg-logoDark font-bold uppercase text-slate-400">
                <tr>
                  <th className="p-4">اسم البطل</th>
                  <th className="p-4">الصف الدراسي</th>
                  <th className="p-4">الهاتف</th>
                  <th className="p-4">كلمة المرور</th>
                  <th className="p-4">النقاط</th>
                  <th className="p-4">الحالة</th>
                  <th className="p-4 text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s) => (
                  <tr key={s.id} className="border-b border-slate-800/60 transition hover:bg-logoNavy/30">
                    <td className="p-4 font-bold text-white">{s.name}</td>
                    <td className="p-4 text-slate-400">{GRADE_LABELS[s.grade]}</td>
                    <td className="p-4 font-mono text-slate-400" dir="ltr">{s.phone}</td>
                    <td className="p-4 font-mono text-slate-400" dir="ltr">{s.password}</td>
                    <td className="p-4 font-black text-logoGold">{s.points}</td>
                    <td className="p-4">
                      {s.is_online ? (
                        <span className="animate-pulse rounded-full border border-green-500/20 bg-green-500/10 px-2 py-0.5 text-[9px] font-bold text-green-400">
                          ● متصل الآن
                        </span>
                      ) : (
                        <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[9px] font-bold text-slate-500">
                          غير متصل
                        </span>
                      )}
                    </td>
                    <td className="flex justify-center gap-2 p-4 text-center">
                      <button
                        onClick={() => openEdit(s)}
                        className="rounded-lg bg-slate-800 p-1.5 text-slate-300 transition hover:bg-slate-700"
                      >
                        <Pencil size={12} />
                      </button>
                      <button
                        onClick={() => requestDelete('students', s.id, 'البطل')}
                        className="rounded-lg bg-rose-600/10 p-1.5 text-rose-400 transition hover:bg-rose-600 hover:text-white"
                      >
                        <Trash2 size={12} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? '📝 تعديل بيانات البطل' : '👤 إضافة بطل جديد'}>
        <div className="space-y-4">
          <Field label="اسم البطل الكامل *">
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="مثال: أحمد محمد علي"
              className="form-input"
            />
          </Field>
          <Field label="الصف الدراسي *">
            <select
              value={form.grade}
              onChange={(e) => setForm({ ...form, grade: e.target.value as Grade })}
              className="form-input"
            >
              <option value="1g">الصف الأول الإعدادي</option>
              <option value="2g">الصف الثاني الإعدادي</option>
              <option value="3g">الصف الثالث الإعدادي</option>
            </select>
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="رقم الهاتف (اسم المستخدم) *">
              <input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="01xxxxxxxxx"
                className="form-input"
                dir="ltr"
              />
            </Field>
            <Field label="كلمة المرور *">
              <input
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="أرقام أو حروف"
                className="form-input"
                dir="ltr"
              />
            </Field>
          </div>
          <Field label="رصيد النقاط الأولي (اختياري):">
            <input
              type="number"
              value={form.points}
              onChange={(e) => setForm({ ...form, points: Number(e.target.value) })}
              className="form-input"
            />
          </Field>
          <button
            onClick={save}
            className="w-full rounded-xl bg-logoGold py-3 font-black text-logoDark shadow-lg transition hover:bg-logoGoldHover"
          >
            💾 حفظ بيانات البطل
          </button>
        </div>
      </Modal>
    </div>
  );
}

/* ============ Lessons tab ============ */
function LessonsTab({
  lessons,
  quizzes,
  showToast,
  refetch,
  requestDelete,
}: {
  lessons: Lesson[];
  quizzes: Quiz[];
  showToast: (m: string, t?: 'success' | 'error' | 'info') => void;
  refetch: () => void;
  requestDelete: (t: string, id: string, label: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Lesson | null>(null);
  const [form, setForm] = useState({
    title: '',
    grade: '1g' as Grade,
    type: 'video' as LessonType,
    video: '',
    interactive_html: '',
    pdf: '',
    quiz_id: '',
    points: 10,
  });

  const openNew = () => {
    setEditing(null);
    setForm({ title: '', grade: '1g', type: 'video', video: '', interactive_html: '', pdf: '', quiz_id: '', points: 10 });
    setOpen(true);
  };
  const openEdit = (l: Lesson) => {
    setEditing(l);
    setForm({
      title: l.title,
      grade: l.grade,
      type: l.type,
      video: l.video,
      interactive_html: l.interactive_html,
      pdf: l.pdf,
      quiz_id: l.quiz_id,
      points: l.points,
    });
    setOpen(true);
  };

  const save = async () => {
    if (!form.title.trim()) {
      showToast('يرجى كتابة عنوان الدرس!', 'error');
      return;
    }
    const payload = {
      title: form.title.trim(),
      grade: form.grade,
      type: form.type,
      video: form.type === 'video' ? form.video.trim() : '',
      interactive_html: form.type === 'interactive' ? form.interactive_html : '',
      pdf: form.pdf.trim(),
      quiz_id: form.quiz_id,
      points: Number(form.points) || 10,
    };
    if (editing) {
      const { error } = await supabase.from('lessons').update(payload).eq('id', editing.id);
      if (error) showToast('حدث خطأ أثناء حفظ الدرس.', 'error');
      else showToast('تم تعديل الدرس بنجاح!', 'success');
    } else {
      const { error } = await supabase.from('lessons').insert(payload);
      if (error) showToast('حدث خطأ أثناء حفظ الدرس.', 'error');
      else showToast('تم إضافة الدرس الجديد بنجاح!', 'success');
    }
    setOpen(false);
    refetch();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-black text-logoGold">📚 مستودع الدروس التفاعلية والفيديو</h3>
        <button
          onClick={openNew}
          className="flex items-center gap-1 rounded-xl bg-logoGold px-4 py-2 text-xs font-black text-logoDark shadow-md transition hover:bg-logoGoldHover"
        >
          <Plus size={14} /> إضافة درس جديد
        </button>
      </div>

      {lessons.length === 0 ? (
        <EmptyState icon={<BookOpen size={32} />} title="لا توجد دروس مضافة بعد." />
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {lessons.map((les) => (
            <div
              key={les.id}
              className="flex flex-col justify-between rounded-2xl border border-slate-700/50 bg-logoNavy p-4"
            >
              <div>
                <div className="mb-2 flex items-start justify-between">
                  <div className="flex gap-1.5">
                    <span className="rounded-lg border border-logoGold/20 bg-logoGold/10 px-2 py-1 text-[10px] font-bold text-logoGold">
                      {GRADE_LABELS[les.grade]}
                    </span>
                    {les.type === 'interactive' ? (
                      <span className="flex items-center gap-1 rounded-lg border border-amber-500/20 bg-amber-500/10 px-2 py-1 text-[10px] font-bold text-amber-400">
                        <Wand2 size={10} /> تفاعلي
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 rounded-lg border border-sky-500/20 bg-sky-500/10 px-2 py-1 text-[10px] font-bold text-sky-400">
                        <Video size={10} /> فيديو
                      </span>
                    )}
                  </div>
                  <span className="flex items-center text-xs font-semibold text-slate-400">
                    <Coins size={12} className="ml-1 text-logoGold" />
                    {les.points} نقطة
                  </span>
                </div>
                <h4 className="mb-2 line-clamp-1 text-sm font-bold text-white">{les.title}</h4>
                <div className="space-y-1 text-[11px] text-slate-400">
                  {les.type === 'interactive' ? (
                    <p className="text-amber-400">يحتوي على كود تفاعلي</p>
                  ) : les.video ? (
                    <p className="truncate">{les.video}</p>
                  ) : null}
                  {les.pdf && <p className="truncate">{les.pdf}</p>}
                  {les.quiz_id && <p>مرتبط باختبار</p>}
                </div>
              </div>
              <div className="mt-4 flex gap-2 border-t border-slate-700/30 pt-3">
                <button
                  onClick={() => openEdit(les)}
                  className="flex-1 rounded-lg bg-slate-800 py-1.5 text-xs font-bold text-slate-300 transition hover:bg-slate-700"
                >
                  <Pencil size={12} className="ml-1 inline" /> تعديل
                </button>
                <button
                  onClick={() => requestDelete('lessons', les.id, 'الدرس')}
                  className="rounded-lg bg-rose-600/10 px-3 py-1.5 text-xs font-bold text-rose-400 transition hover:bg-rose-600 hover:text-white"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? '📝 تعديل درس موجود' : '📚 إضافة درس جديد'}>
        <div className="space-y-4">
          <Field label="عنوان الدرس *">
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="مثال: علامات إعراب الأسماء"
              className="form-input"
            />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="الصف الدراسي *">
              <select
                value={form.grade}
                onChange={(e) => setForm({ ...form, grade: e.target.value as Grade })}
                className="form-input"
              >
                <option value="1g">الصف الأول الإعدادي</option>
                <option value="2g">الصف الثاني الإعدادي</option>
                <option value="3g">الصف الثالث الإعدادي</option>
              </select>
            </Field>
            <Field label="نوع المحتوى *">
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value as LessonType })}
                className="form-input"
              >
                <option value="video">🎥 درس فيديو</option>
                <option value="interactive">🪄 درس تفاعلي (كود HTML)</option>
              </select>
            </Field>
          </div>

          {form.type === 'video' ? (
            <Field label="رابط الفيديو (YouTube / Drive):">
              <input
                value={form.video}
                onChange={(e) => setForm({ ...form, video: e.target.value })}
                placeholder="https://..."
                className="form-input"
                dir="ltr"
              />
            </Field>
          ) : (
            <Field label="كود الـ HTML التفاعلي الكامل:">
              <textarea
                rows={8}
                value={form.interactive_html}
                onChange={(e) => setForm({ ...form, interactive_html: e.target.value })}
                placeholder="قم بنسخ كود HTML التفاعلي ولصقه هنا بالكامل..."
                className="form-input font-mono text-xs"
                dir="ltr"
              />
            </Field>
          )}

          <div className="grid grid-cols-2 gap-4">
            <Field label="رابط ملزمة PDF (اختياري):">
              <input
                value={form.pdf}
                onChange={(e) => setForm({ ...form, pdf: e.target.value })}
                placeholder="https://..."
                className="form-input"
                dir="ltr"
              />
            </Field>
            <Field label="اربطه باختبار (اختياري):">
              <select
                value={form.quiz_id}
                onChange={(e) => setForm({ ...form, quiz_id: e.target.value })}
                className="form-input"
              >
                <option value="">-- بدون اختبار --</option>
                {quizzes.map((q) => (
                  <option key={q.id} value={q.id}>
                    {q.title}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <Field label="النقاط الممنوحة عند إتمام الدرس والاختبار:">
            <input
              type="number"
              value={form.points}
              onChange={(e) => setForm({ ...form, points: Number(e.target.value) })}
              className="form-input"
            />
          </Field>

          <button
            onClick={save}
            className="w-full rounded-xl bg-logoGold py-3 font-black text-logoDark shadow-lg transition hover:bg-logoGoldHover"
          >
            💾 حفظ الدرس على السيرفر
          </button>
        </div>
      </Modal>
    </div>
  );
}

/* ============ Quizzes tab ============ */
function QuizzesTab({
  quizzes,
  showToast,
  refetch,
  requestDelete,
}: {
  quizzes: Quiz[];
  showToast: (m: string, t?: 'success' | 'error' | 'info') => void;
  refetch: () => void;
  requestDelete: (t: string, id: string, label: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Quiz | null>(null);
  const [title, setTitle] = useState('');
  const [questions, setQuestions] = useState<Question[]>([{ q: '', a: '', b: '', c: '', correct: 'a' }]);

  const openNew = () => {
    setEditing(null);
    setTitle('');
    setQuestions([{ q: '', a: '', b: '', c: '', correct: 'a' }]);
    setOpen(true);
  };
  const openEdit = (qz: Quiz) => {
    setEditing(qz);
    setTitle(qz.title);
    setQuestions(qz.questions.length ? qz.questions : [{ q: '', a: '', b: '', c: '', correct: 'a' }]);
    setOpen(true);
  };

  const addQuestion = () => {
    if (questions.length >= 5) {
      showToast('الحد الأقصى هو 5 أسئلة!', 'error');
      return;
    }
    setQuestions([...questions, { q: '', a: '', b: '', c: '', correct: 'a' }]);
  };

  const updateQ = (idx: number, field: keyof Question, val: string) => {
    setQuestions((qs) => qs.map((q, i) => (i === idx ? { ...q, [field]: val } : q)));
  };

  const save = async () => {
    if (!title.trim() || questions.length === 0) {
      showToast('يرجى ملء عنوان الاختبار وإعداد الأسئلة!', 'error');
      return;
    }
    const payload = { title: title.trim(), questions };
    if (editing) {
      const { error } = await supabase.from('quizzes').update(payload).eq('id', editing.id);
      if (error) showToast('حدث خطأ في الشبكة.', 'error');
      else showToast('تم تعديل الاختبار بنجاح!', 'success');
    } else {
      const { error } = await supabase.from('quizzes').insert(payload);
      if (error) showToast('حدث خطأ في الشبكة.', 'error');
      else showToast('تم إنشاء الاختبار بنجاح!', 'success');
    }
    setOpen(false);
    refetch();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-black text-logoGold">📝 بنك الاختبارات الذكية</h3>
        <button
          onClick={openNew}
          className="flex items-center gap-1 rounded-xl bg-logoGold px-4 py-2 text-xs font-black text-logoDark shadow-md transition hover:bg-logoGoldHover"
        >
          <Plus size={14} /> إنشاء اختبار جديد
        </button>
      </div>

      {quizzes.length === 0 ? (
        <EmptyState icon={<ClipboardList size={32} />} title="لا توجد اختبارات بعد." />
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {quizzes.map((qz) => (
            <div
              key={qz.id}
              className="flex flex-col justify-between rounded-2xl border border-slate-700/50 bg-logoNavy p-4"
            >
              <div>
                <h4 className="mb-2 line-clamp-1 text-sm font-bold text-white">{qz.title}</h4>
                <p className="text-xs text-slate-400">
                  يحتوي على {qz.questions.length} أسئلة للتقييم التلقائي.
                </p>
              </div>
              <div className="mt-4 flex gap-2 border-t border-slate-700/30 pt-3">
                <button
                  onClick={() => openEdit(qz)}
                  className="flex-1 rounded-lg bg-slate-800 py-1.5 text-xs font-bold text-slate-300 transition hover:bg-slate-700"
                >
                  <Pencil size={12} className="ml-1 inline" /> تعديل الأسئلة
                </button>
                <button
                  onClick={() => requestDelete('quizzes', qz.id, 'الاختبار')}
                  className="rounded-lg bg-rose-600/10 px-3 py-1.5 text-xs font-bold text-rose-400 transition hover:bg-rose-600 hover:text-white"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? '📝 تعديل اختبار سحابي' : '📝 إنشاء اختبار إلكتروني جديد'} maxWidth="max-w-2xl">
        <div className="space-y-4">
          <Field label="عنوان الاختبار:">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="مثال: اختبار الفاعل وعلامات إعرابه"
              className="form-input"
            />
          </Field>

          <div className="border-t border-slate-700/50 pt-4">
            <h4 className="mb-3 text-xs font-bold text-logoGold">🛠️ تحرير الأسئلة (أقصى حد 5):</h4>
            <div className="space-y-4">
              {questions.map((q, idx) => (
                <div key={idx} className="relative space-y-3 rounded-xl border border-slate-800 bg-logoDark/40 p-4">
                  <button
                    onClick={() => setQuestions((qs) => qs.filter((_, i) => i !== idx))}
                    className="absolute left-2 top-2 text-rose-500 transition hover:text-rose-400"
                  >
                    <X size={14} />
                  </button>
                  <span className="rounded border border-logoGold/10 bg-logoGold/5 px-2 py-0.5 text-[10px] font-bold text-logoGold">
                    سؤال رقم {idx + 1}
                  </span>
                  <Field label="نص السؤال:">
                    <input
                      value={q.q}
                      onChange={(e) => updateQ(idx, 'q', e.target.value)}
                      className="form-input"
                    />
                  </Field>
                  <div className="grid grid-cols-3 gap-2">
                    {(['a', 'b', 'c'] as const).map((opt) => (
                      <div key={opt}>
                        <label className="mb-0.5 block text-[9px] text-slate-400">خيار ({opt === 'a' ? 'أ' : opt === 'b' ? 'ب' : 'ج'})</label>
                        <input
                          value={q[opt]}
                          onChange={(e) => updateQ(idx, opt, e.target.value)}
                          className="form-input"
                        />
                      </div>
                    ))}
                  </div>
                  <Field label="الخيار الصحيح:">
                    <select
                      value={q.correct}
                      onChange={(e) => updateQ(idx, 'correct', e.target.value)}
                      className="form-input"
                    >
                      <option value="a">الخيار (أ)</option>
                      <option value="b">الخيار (ب)</option>
                      <option value="c">الخيار (ج)</option>
                    </select>
                  </Field>
                </div>
              ))}
            </div>
            <button
              onClick={addQuestion}
              className="mt-3 rounded-lg bg-slate-800 px-3 py-1.5 text-[10px] font-bold text-slate-300 transition hover:bg-slate-700"
            >
              <Plus size={12} className="ml-1 inline" /> إضافة سؤال آخر
            </button>
          </div>

          <button
            onClick={save}
            className="w-full rounded-xl bg-logoGold py-3 font-black text-logoDark shadow-lg transition hover:bg-logoGoldHover"
          >
            💾 حفظ ونشر الاختبار
          </button>
        </div>
      </Modal>
    </div>
  );
}

/* ============ Noticeboard tab ============ */
function NoticeboardTab({
  notifications,
  showToast,
  refetch,
  requestDelete,
}: {
  notifications: Notification[];
  showToast: (m: string, t?: 'success' | 'error' | 'info') => void;
  refetch: () => void;
  requestDelete: (t: string, id: string, label: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Notification | null>(null);
  const [form, setForm] = useState({ title: '', body: '' });

  const openNew = () => {
    setEditing(null);
    setForm({ title: '', body: '' });
    setOpen(true);
  };
  const openEdit = (n: Notification) => {
    setEditing(n);
    setForm({ title: n.title, body: n.body });
    setOpen(true);
  };

  const save = async () => {
    if (!form.title.trim() || !form.body.trim()) {
      showToast('يرجى تعبئة كافة حقول الإعلان!', 'error');
      return;
    }
    const payload = { title: form.title.trim(), body: form.body.trim() };
    if (editing) {
      const { error } = await supabase.from('notifications').update(payload).eq('id', editing.id);
      if (error) showToast('خطأ في الشبكة.', 'error');
      else showToast('تم تعديل الإعلان بنجاح!', 'success');
    } else {
      const { error } = await supabase.from('notifications').insert(payload);
      if (error) showToast('خطأ في الشبكة.', 'error');
      else showToast('تم نشر الإعلان للأبطال!', 'success');
    }
    setOpen(false);
    refetch();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-black text-logoGold">📢 لوحة تنبيهات الطلاب</h3>
        <button
          onClick={openNew}
          className="flex items-center gap-1 rounded-xl bg-logoGold px-4 py-2 text-xs font-black text-logoDark shadow-md transition hover:bg-logoGoldHover"
        >
          <Plus size={14} /> نشر إعلان جديد
        </button>
      </div>

      {notifications.length === 0 ? (
        <EmptyState icon={<Megaphone size={32} />} title="لا توجد إعلانات منشورة." />
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {notifications.map((n) => (
            <div
              key={n.id}
              className="flex flex-col justify-between rounded-2xl border border-slate-700/50 bg-logoNavy p-4"
            >
              <div>
                <h4 className="mb-2 text-sm font-bold text-logoGold">
                  <Megaphone size={14} className="ml-1.5 inline text-rose-400" /> {n.title}
                </h4>
                <p className="line-clamp-3 text-xs text-slate-400">{n.body}</p>
              </div>
              <div className="mt-4 flex gap-2 border-t border-slate-700/30 pt-3">
                <button
                  onClick={() => openEdit(n)}
                  className="flex-1 rounded-lg bg-slate-800 py-1.5 text-xs font-bold text-slate-300 transition hover:bg-slate-700"
                >
                  <Pencil size={12} className="ml-1 inline" /> تعديل
                </button>
                <button
                  onClick={() => requestDelete('notifications', n.id, 'الإعلان')}
                  className="rounded-lg bg-rose-600/10 px-3 py-1.5 text-xs font-bold text-rose-400 transition hover:bg-rose-600 hover:text-white"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? '📝 تعديل إعلان منشور' : '📢 نشر إعلان جديد'}>
        <div className="space-y-4">
          <Field label="عنوان الإعلان *">
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="مثال: تنبيه هام بخصوص موعد الاختبار"
              className="form-input"
            />
          </Field>
          <Field label="تفاصيل الإعلان أو الرسالة *">
            <textarea
              rows={4}
              value={form.body}
              onChange={(e) => setForm({ ...form, body: e.target.value })}
              placeholder="اكتب تفاصيل إعلانك هنا..."
              className="form-input"
            />
          </Field>
          <button
            onClick={save}
            className="w-full rounded-xl bg-logoGold py-3 font-black text-logoDark shadow-lg transition hover:bg-logoGoldHover"
          >
            📢 نشر الإعلان فوراً للطلاب
          </button>
        </div>
      </Modal>
    </div>
  );
}

/* ============ shared field helpers ============ */
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-bold text-slate-400">{label}</label>
      {children}
    </div>
  );
}
