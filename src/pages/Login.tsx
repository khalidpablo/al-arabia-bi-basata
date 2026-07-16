import { useState, useRef, useEffect } from 'react';
import { Phone, Lock, Eye, EyeOff, Send, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { isTeacherLogin, saveSession } from '../lib/session';
import type { Student } from '../types';

interface LoginProps {
  onLoggedIn: () => void;
}

export default function Login({ onLoggedIn }: LoginProps) {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');
  const [error, setError] = useState('');
  const logoRef = useRef<HTMLDivElement>(null);

  // 3D logo parallax on desktop
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!logoRef.current || window.innerWidth <= 768) return;
      const rx = -((e.clientY / window.innerHeight) - 0.5) * 25;
      const ry = ((e.clientX / window.innerWidth) - 0.5) * 25;
      logoRef.current.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg) scale(1.08)`;
    };
    const onLeave = () => {
      if (logoRef.current)
        logoRef.current.style.transform = 'rotateX(0deg) rotateY(0deg) scale(1)';
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseleave', onLeave);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseleave', onLeave);
    };
  }, []);

  const handleLogin = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const id = phone.trim();
    const pass = password.trim();
    setError('');

    if (!id || !pass) {
      setError('برجاء إدخال رقم الهاتف وكلمة المرور أولاً.');
      return;
    }

    setStatus('loading');

    // Teacher fast path
    if (isTeacherLogin(id, pass)) {
      saveSession({ role: 'teacher' });
      setStatus('success');
      setTimeout(onLoggedIn, 700);
      return;
    }

    // Student path
    try {
      const { data, error: qErr } = await supabase
        .from('students')
        .select('*')
        .eq('phone', id)
        .maybeSingle();

      if (qErr) throw qErr;

      if (!data) {
        setError('عذراً، هذا الحساب غير مسجل حالياً بالمنصة.');
        setStatus('idle');
        return;
      }

      const student = data as Student;
      if (student.password !== pass) {
        setError('كلمة المرور غير صحيحة، تأكد منها وحاول مجدداً.');
        setStatus('idle');
        return;
      }

      await supabase.from('students').update({ is_online: true }).eq('id', student.id);

      saveSession({ role: 'student', student });
      setStatus('success');
      setTimeout(onLoggedIn, 700);
    } catch (err) {
      setError(`خطأ في الاتصال بالسيرفر: ${(err as Error).message}`);
      setStatus('idle');
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-stretch justify-center md:flex-row-reverse">
      {/* Promo side */}
      <div className="relative hidden items-center justify-center overflow-hidden border-l border-logoGold/15 bg-gradient-to-br from-logoNavy via-logoDark to-[#172b54] p-12 md:flex md:w-1/2">
        <div className="absolute right-1/4 top-1/4 h-96 w-96 animate-pulse-slow rounded-full bg-logoGold/10 blur-[100px]" />
        <div
          className="absolute bottom-1/4 left-1/4 h-96 w-96 animate-pulse-slow rounded-full bg-blue-500/10 blur-[100px]"
          style={{ animationDelay: '5s' }}
        />
        <div className="z-10 max-w-lg space-y-6 text-center">
          <div className="mb-2 inline-block rounded-full border border-logoGold/30 bg-logoGold/10 px-4 py-1.5 text-xs font-bold tracking-wide text-logoGold">
            ✨ مستقبل تعليم اللغة العربية بين يديك
          </div>
          <h2 className="text-4xl font-black leading-tight text-white lg:text-5xl">
            منصة{' '}
            <span className="bg-gradient-to-r from-logoGold to-yellow-400 bg-clip-text text-transparent">
              العربية ببساطة
            </span>{' '}
            التعليمية
          </h2>
          <p className="text-sm font-semibold leading-relaxed text-slate-300">
            رحلتك نحو الدرجة النهائية تبدأ من هنا. شروحات تفاعلية، اختبارات ذكية، ومتابعة دورية لحظة بلحظة مع فرسان الأستاذ خالد وحيد.
          </p>
          <div className="grid grid-cols-3 gap-4 border-t border-slate-700/40 pt-8 text-right">
            {[
              ['٠١', 'شرح مبسط وذكي'],
              ['٠٢', 'اختبارات دورية'],
              ['٠٣', 'دعم فني متواصل'],
            ].map(([n, label]) => (
              <div
                key={n}
                className="rounded-xl border border-slate-700/30 bg-logoDark/40 p-3"
              >
                <h4 className="text-lg font-black text-logoGold">{n}</h4>
                <p className="mt-1 text-[11px] font-bold text-slate-300">{label}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="absolute bottom-4 text-center text-[10px] font-bold tracking-wider text-slate-500">
          جميع الحقوق محفوظة © ٢٠٢٦ لمنصة العربية ببساطة
        </div>
      </div>

      {/* Form side */}
      <div className="relative flex w-full items-center justify-center bg-gradient-to-b from-logoDark via-[#0f1f3d] to-logoDark p-4 sm:p-8 lg:p-12 md:w-1/2">
        <div className="absolute left-10 top-10 h-64 w-64 rounded-full bg-logoGold/5 blur-[80px] md:hidden" />

        <form
          onSubmit={handleLogin}
          className="z-10 w-full max-w-md rounded-3xl border border-logoGold/20 bg-logoNavy/60 p-6 shadow-2xl shadow-black/80 backdrop-blur-xl transition-all duration-500 hover:border-logoGold/35 sm:p-8"
        >
          <div className="relative mb-6 text-center">
            <div
              ref={logoRef}
              style={{ transformStyle: 'preserve-3d', perspective: '800px' }}
              className="mx-auto flex h-24 w-24 cursor-pointer items-center justify-center overflow-hidden rounded-full border-2 border-logoGold bg-logoDark p-0.5 shadow-xl shadow-logoGold/20"
            >
              <div className="flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-logoGold/20 to-logoNavy text-3xl font-black text-logoGold">
                ض
              </div>
            </div>
            <h1 className="mt-4 bg-gradient-to-r from-white via-logoGold to-white bg-clip-text text-2xl font-black tracking-wide text-transparent md:hidden">
              العَرَبِيَّةُ بِبَسَاطَة
            </h1>
            <p className="mt-4 text-sm font-bold text-slate-100">مرحباً بك في منصة العربية ببساطة ✨</p>
            <p className="mt-1 text-xs text-slate-400">سجل دخولك الآن للوصول إلى اختباراتك وحصصك الممتعة</p>
          </div>

          <hr className="my-5 border-logoGold/15" />

          <div className="space-y-4 text-right">
            <div>
              <label className="mb-1.5 mr-1 block text-xs font-bold text-logoGold">
                رقم الهاتف أو اسم المستخدم:
              </label>
              <div className="relative">
                <Phone size={14} className="absolute right-3.5 top-4 text-slate-400" />
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  dir="ltr"
                  placeholder="01xxxxxxxxx"
                  className="gold-input w-full rounded-xl border border-slate-700/80 bg-logoDark/80 p-3.5 pr-10 text-left text-sm font-semibold text-white focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 mr-1 block text-xs font-bold text-logoGold">
                كلمة المرور الشخصية:
              </label>
              <div className="relative">
                <Lock size={14} className="absolute right-3.5 top-4 text-slate-400" />
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  dir="ltr"
                  placeholder="••••••••"
                  className="gold-input w-full rounded-xl border border-slate-700/80 bg-logoDark/80 p-3.5 px-10 text-left text-sm text-white focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPass((s) => !s)}
                  className="absolute left-3 top-4 text-slate-400 transition hover:text-logoGold"
                >
                  {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={status === 'loading' || status === 'success'}
            className="btn-glow mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-logoGold to-logoGoldHover py-3.5 text-sm font-black text-logoDark shadow-lg shadow-logoGold/15 transition-all duration-300 active:scale-[0.98] disabled:opacity-70"
          >
            {status === 'loading' ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                جاري الدخول...
              </>
            ) : status === 'success' ? (
              '✨ تم التحقق بنجاح!'
            ) : (
              <>
                دخول المنصة الآن
                <Send size={14} />
              </>
            )}
          </button>

          <p
            className={`mt-4 min-h-[1.25rem] text-center text-xs font-bold transition-all ${
              error ? 'text-rose-400' : status === 'success' ? 'text-emerald-400' : 'text-slate-400'
            }`}
          >
            {error || (status === 'success' ? 'جاري تحضير لوحتك الخاصة...' : '')}
          </p>

          <div className="mt-6 border-t border-slate-700/40 pt-5 text-center">
            <p className="mb-3 text-[11px] font-bold text-slate-400">
              هل أنت طالب جديد وتريد الانضمام لفرسان الضاد؟
            </p>
            <a
              href="https://wa.me/201095300546"
              target="_blank"
              rel="noreferrer"
              className="group inline-flex items-center gap-2 rounded-2xl border border-logoGold/20 bg-logoDark/90 px-5 py-2.5 shadow-lg transition-all duration-300 hover:border-logoGold hover:bg-logoDark"
            >
              <span className="h-2.5 w-2.5 animate-ping rounded-full bg-green-500" />
              <span className="text-xs font-bold tracking-wider text-green-400">WhatsApp</span>
              <span className="text-xs font-bold tracking-wider text-logoGold" dir="ltr">
                010 9530 0546
              </span>
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}
