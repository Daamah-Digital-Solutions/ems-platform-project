import { CreditCard, Receipt, Sparkles, Bell, Check, ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'

const CONFIG = {
  payments: {
    icon: CreditCard,
    eyebrow: 'قريباً',
    title: 'نظام المدفوعات',
    sub: 'قادم بشكل رائع',
    body:
      'نحن نعمل على تكامل سلس مع طرق الدفع السعودية الشهيرة، لتقبل المدفوعات مباشرة من ستوديوهك بدون مجهود.',
    badges: ['مدى', 'Apple Pay', 'STC Pay', 'تابي', 'تمارا'],
    tone: 'from-emerald-500 to-emerald-600'
  },
  invoices: {
    icon: Receipt,
    eyebrow: 'قريباً',
    title: 'الفواتير المتوافقة مع ZATCA',
    sub: 'إصدار آلي ومتوافق',
    body:
      'إصدار فواتير إلكترونية متوافقة ١٠٠٪ مع المرحلة الثانية من هيئة الزكاة والضريبة والجمارك — بدون أي مجهود إضافي.',
    badges: ['متوافق ZATCA', 'QR Code', 'تقارير ضريبية', 'تصدير PDF'],
    tone: 'from-amber-400 to-amber-500'
  }
}

export default function ComingSoon({ kind }) {
  const c = CONFIG[kind] || CONFIG.payments
  const Icon = c.icon
  return (
    <div className="min-h-[70vh] flex items-center justify-center py-10">
      <div className="relative max-w-2xl w-full text-center">
        {/* Background blobs */}
        <div className="absolute -top-32 -right-32 w-72 h-72 bg-brand/10 rounded-full blur-3xl -z-10" />
        <div className="absolute -bottom-32 -left-32 w-72 h-72 bg-accent/10 rounded-full blur-3xl -z-10" />

        {/* Animated icon */}
        <div className="relative inline-block mb-8">
          <div className={`w-28 h-28 mx-auto rounded-[32px] bg-gradient-to-br ${c.tone} flex items-center justify-center shadow-glow-lg animate-bounce-subtle relative`}>
            <Icon className="w-14 h-14 text-white" strokeWidth={1.7} />
            <span className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-accent text-white flex items-center justify-center shadow-glow-accent animate-pulse">
              <Sparkles className="w-4 h-4" />
            </span>
          </div>
          {/* Decorative dots */}
          <span className="absolute top-4 -right-8 w-3 h-3 rounded-full bg-amber-400 animate-pulse" />
          <span className="absolute bottom-2 -left-6 w-2 h-2 rounded-full bg-brand animate-pulse-slow" />
          <span className="absolute -top-2 left-4 w-2.5 h-2.5 rounded-full bg-accent animate-bounce-subtle" />
        </div>

        <div className="eyebrow-brand mb-4 mx-auto">{c.eyebrow}</div>
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
          {c.title}
          <br />
          <span className="text-brand-gradient">{c.sub}</span>
        </h1>
        <p className="mt-6 text-base text-ink-secondary max-w-md mx-auto leading-relaxed">{c.body}</p>

        {/* Badges */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
          {c.badges.map((b) => (
            <span
              key={b}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-border/60 text-xs font-extrabold shadow-sm"
            >
              <Check className="w-3 h-3 text-emerald-500" strokeWidth={3} />
              {b}
            </span>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <button className="btn-primary">
            <Bell className="w-4 h-4" />
            أعلمني عند الإطلاق
          </button>
          <Link to="/dashboard" className="btn-secondary">
            <ArrowLeft className="w-4 h-4" />
            العودة للوحة التحكم
          </Link>
        </div>

        <p className="mt-8 text-xs text-ink-tertiary">
          المتوقع الإطلاق: <strong className="text-ink-secondary">الربع الثاني ٢٠٢٥</strong>
        </p>
      </div>
    </div>
  )
}
