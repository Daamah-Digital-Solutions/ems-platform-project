import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { Mail, Lock, Eye, EyeOff, ArrowLeft, Sparkles, ShieldCheck, Calendar, MessageCircle, AlertCircle } from 'lucide-react'
import Logo from '../components/Logo.jsx'
import { auth, setSession } from '../lib/api.js'

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('demo@move.sa')
  const [password, setPassword] = useState('demo123')
  const [showPass, setShowPass] = useState(false)
  const [remember, setRemember] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await auth.login(email, password)
      setSession(res)
      navigate('/dashboard')
    } catch (err) {
      setError(err.message || 'فشل تسجيل الدخول')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex bg-bg">
      {/* LEFT — branded side (40%) */}
      <aside className="hidden lg:flex relative w-2/5 bg-brand-gradient text-white p-12 flex-col justify-between overflow-hidden">
        <div className="absolute inset-0 bg-dots opacity-10" />
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-accent/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-white/10 rounded-full blur-3xl" />

        <Logo invert />

        <div className="relative">
          <Sparkles className="w-8 h-8 text-accent mb-6" />
          <blockquote className="text-3xl xl:text-4xl font-extrabold leading-tight tracking-tight">
            "بعد ٣ أشهر من استخدام MOVE، توفّر علينا ٣ ساعات يومياً وقلّ الـ no-show ٦٠٪. ما نقدر نتخيل الستوديو بدونه."
          </blockquote>
          <div className="mt-8 flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-white text-brand flex items-center justify-center font-extrabold">
              أع
            </div>
            <div>
              <div className="font-extrabold">أحمد العتيبي</div>
              <div className="text-sm text-white/80">مالك Fast Move Riyadh</div>
            </div>
          </div>
        </div>

        <div className="relative grid grid-cols-3 gap-3 text-xs">
          {[
            { i: Calendar, t: 'حجوزات ذكية' },
            { i: MessageCircle, t: 'تكامل واتساب' },
            { i: ShieldCheck, t: 'ZATCA متوافق' }
          ].map(({ i: I, t }) => (
            <div key={t} className="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-2.5 backdrop-blur">
              <I className="w-4 h-4" />
              <span className="font-bold">{t}</span>
            </div>
          ))}
        </div>
      </aside>

      {/* RIGHT — login form (60%) */}
      <main className="flex-1 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden mb-8 flex justify-center">
            <Logo />
          </div>

          {/* Demo banner */}
          <div className="mb-7 flex items-start gap-2.5 p-3.5 rounded-xl bg-amber-50 border border-amber-200">
            <Sparkles className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-900 leading-relaxed font-medium">
              <span className="font-extrabold">هذا عرض تجريبي.</span> اضغط "تسجيل الدخول" للدخول مباشرة — أي بيانات تعمل.
            </p>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-ink-primary tracking-tight">
            مرحباً بعودتك 👋
          </h1>
          <p className="mt-2 text-ink-secondary">سجّل دخولك للوصول إلى لوحة تحكم الستوديو.</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            {error && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-800 text-sm animate-fade-in">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span className="font-bold">{error}</span>
              </div>
            )}
            <div>
              <label className="label">البريد الإلكتروني</label>
              <div className="input-icon-wrap">
                <Mail className="icon w-4 h-4" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input ltr text-right"
                  placeholder="you@studio.sa"
                  dir="ltr"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="label mb-0">كلمة المرور</label>
                <a href="#" className="text-xs font-bold text-brand hover:text-brand-light">
                  نسيت كلمة المرور؟
                </a>
              </div>
              <div className="input-icon-wrap">
                <Lock className="icon w-4 h-4" />
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input ltr text-right pl-12"
                  placeholder="••••••••"
                  dir="ltr"
                />
                <button
                  type="button"
                  onClick={() => setShowPass((s) => !s)}
                  className="absolute top-1/2 -translate-y-1/2 left-3 text-ink-tertiary hover:text-brand"
                  tabIndex={-1}
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <span className="relative inline-flex">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="peer sr-only"
                />
                <span className="w-5 h-5 rounded-md border-2 border-border peer-checked:bg-brand peer-checked:border-brand transition-colors flex items-center justify-center">
                  {remember && (
                    <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M2 6.5L4.5 9L10 3" />
                    </svg>
                  )}
                </span>
              </span>
              <span className="text-sm text-ink-primary font-medium">تذكرني</span>
            </label>

            <button type="submit" disabled={loading} className="btn-primary btn-lg w-full group">
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  جاري الدخول...
                </span>
              ) : (
                <>
                  <span>تسجيل الدخول</span>
                  <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                </>
              )}
            </button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-3 bg-bg text-ink-tertiary font-bold">أو</span>
              </div>
            </div>

            <p className="text-center text-sm text-ink-secondary">
              ليس لديك حساب؟{' '}
              <Link to="/onboarding" className="font-extrabold text-brand hover:text-brand-light">
                سجّل ستوديوك الآن
              </Link>
            </p>

            <p className="text-center text-xs text-ink-tertiary mt-6">
              <Link to="/" className="hover:text-brand inline-flex items-center gap-1">
                <ArrowLeft className="w-3 h-3" />
                العودة للصفحة الرئيسية
              </Link>
            </p>
          </form>
        </div>
      </main>
    </div>
  )
}
