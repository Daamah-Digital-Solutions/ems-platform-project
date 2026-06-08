import { Link } from 'react-router-dom'
import { useState } from 'react'
import {
  ArrowLeft,
  Calendar,
  MessageCircle,
  Receipt,
  Check,
  Star,
  Sparkles,
  Play,
  ShieldCheck,
  Clock,
  TrendingUp,
  Users,
  Zap,
  ChevronDown,
  Menu,
  X,
  CircleDot,
  BarChart3,
  Heart,
  Smartphone,
  Layers,
  Globe
} from 'lucide-react'
import Logo from '../components/Logo.jsx'
import HeroVisual from '../components/HeroVisual.jsx'
import { testimonials, pricingTiers } from '../data/mockData.js'
import { formatNumberAr } from '../lib/utils.js'

// ============ NAV ============
function Nav() {
  const [open, setOpen] = useState(false)
  return (
    <header className="sticky top-0 z-50 glass border-b border-border/60">
      <div className="container-app flex items-center justify-between h-16">
        <Logo />
        <nav className="hidden md:flex items-center gap-1 text-sm font-bold text-ink-secondary">
          {[
            ['المميزات', '#features'],
            ['كيف يعمل', '#how'],
            ['الأسعار', '#pricing'],
            ['العملاء', '#testimonials'],
            ['الأسئلة', '#faq']
          ].map(([label, href]) => (
            <a
              key={label}
              href={href}
              className="px-3 py-2 rounded-md hover:bg-ink-primary/5 hover:text-ink-primary transition-colors"
            >
              {label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Link to="/login" className="btn-ghost btn-sm hidden sm:inline-flex">
            تسجيل الدخول
          </Link>
          <Link to="/onboarding" className="btn-primary btn-sm">
            <span>ابدأ مجاناً</span>
            <ArrowLeft className="w-3.5 h-3.5" />
          </Link>
          <button
            className="md:hidden p-2 -mr-2 text-ink-primary"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>
      {open && (
        <div className="md:hidden bg-white border-t border-border/60 animate-slide-down">
          <div className="container-app py-4 space-y-1">
            {[
              ['المميزات', '#features'],
              ['كيف يعمل', '#how'],
              ['الأسعار', '#pricing'],
              ['العملاء', '#testimonials'],
              ['الأسئلة', '#faq']
            ].map(([label, href]) => (
              <a
                key={label}
                href={href}
                onClick={() => setOpen(false)}
                className="block px-3 py-2 rounded-md text-sm font-bold text-ink-secondary hover:bg-bg"
              >
                {label}
              </a>
            ))}
            <Link to="/login" className="block px-3 py-2 rounded-md text-sm font-bold text-ink-secondary hover:bg-bg">
              تسجيل الدخول
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}

// ============ HERO ============
function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* Background mesh */}
      <div className="absolute inset-0 bg-mesh-1 pointer-events-none" />
      <div className="absolute inset-0 bg-grid opacity-40 pointer-events-none" />
      <div className="absolute top-0 -right-32 w-[600px] h-[600px] bg-brand/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-[500px] h-[500px] bg-accent/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="container-app relative pt-12 pb-24 sm:pt-16 sm:pb-32 lg:pt-20 lg:pb-40">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left: copy */}
          <div className="lg:col-span-6 text-center lg:text-right order-2 lg:order-1">
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-white/70 backdrop-blur pl-1 pr-3 py-1 mb-7 shadow-sm">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-brand text-white text-[10px] font-extrabold uppercase tracking-wider">
                <Zap className="w-3 h-3 fill-white" />
                جديد
              </span>
              <span className="text-xs font-bold text-ink-secondary">
                إصدار ٢٫٠ — الآن مع تكامل تابي وتمارا
              </span>
              <ArrowLeft className="w-3.5 h-3.5 text-ink-tertiary" />
            </div>

            <h1 className="h-hero text-balance">
              ستوديوهك،
              <br />
              يعمل <span className="text-brand-gradient">من نفسه.</span>
            </h1>

            <p className="mt-7 text-base sm:text-lg lg:text-xl text-ink-secondary leading-relaxed max-w-xl mx-auto lg:mx-0 text-balance">
              نظام إدارة ستوديوهات <strong className="text-ink-primary font-bold">EMS</strong> الأذكى في
              السعودية. حجوزات، عملاء، فواتير ZATCA، وتذكيرات واتساب — كله في مكان واحد.
            </p>

            {/* CTA Row */}
            <div className="mt-9 flex flex-wrap items-center gap-3 justify-center lg:justify-start">
              <Link to="/onboarding" className="btn-primary btn-lg group">
                <span>ابدأ تجربتك المجانية</span>
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              </Link>
              <button className="btn-secondary btn-lg group">
                <span className="w-7 h-7 -mr-1 rounded-full bg-brand-50 flex items-center justify-center group-hover:bg-brand group-hover:text-white transition-colors">
                  <Play className="w-3 h-3 fill-current text-brand group-hover:text-white mr-0.5" />
                </span>
                <span>شاهد العرض ٢:٤٥</span>
              </button>
            </div>

            {/* Trust micro-row */}
            <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 justify-center lg:justify-start">
              {/* Avatars stack */}
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2 rtl:space-x-reverse rtl:-space-x-reverse">
                  {[
                    { i: 'أع', c: 'from-brand to-brand-light' },
                    { i: 'سم', c: 'from-accent to-accent-light' },
                    { i: 'فد', c: 'from-amber-500 to-amber-400' },
                    { i: 'نخ', c: 'from-indigo-500 to-indigo-400' }
                  ].map((a, i) => (
                    <span
                      key={i}
                      className={`relative inline-flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br ${a.c} text-white text-[10px] font-extrabold ring-2 ring-bg`}
                      style={{ zIndex: 10 - i }}
                    >
                      {a.i}
                    </span>
                  ))}
                </div>
                <div className="text-xs">
                  <div className="flex items-center gap-1">
                    {[0, 1, 2, 3, 4].map((i) => (
                      <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                    ))}
                    <span className="font-extrabold text-ink-primary mr-1">٤٫٩</span>
                  </div>
                  <div className="text-ink-tertiary font-medium">من +٥٠ ستوديو</div>
                </div>
              </div>

              <div className="hidden sm:flex items-center gap-1.5 text-xs text-ink-secondary">
                <Check className="w-4 h-4 text-emerald-500" strokeWidth={3} />
                <span className="font-bold">١٤ يوم مجاناً</span>
              </div>
              <div className="hidden sm:flex items-center gap-1.5 text-xs text-ink-secondary">
                <Check className="w-4 h-4 text-emerald-500" strokeWidth={3} />
                <span className="font-bold">بدون بطاقة ائتمان</span>
              </div>
            </div>
          </div>

          {/* Right: Hero visual */}
          <div className="lg:col-span-6 order-1 lg:order-2 flex justify-center">
            <HeroVisual />
          </div>
        </div>
      </div>
    </section>
  )
}

// ============ LOGO MARQUEE ============
function LogoMarquee() {
  const logos = [
    'Fast Move Riyadh',
    'Pulse Studio',
    'EMS Pro Khobar',
    'Body Lab',
    'Move 360',
    'Flex Lab',
    'Energy EMS',
    'Vita Studio'
  ]
  return (
    <section className="py-10 bg-white border-y border-border/60">
      <div className="container-app">
        <p className="text-center text-xs sm:text-sm text-ink-tertiary font-bold tracking-wide mb-6">
          موثوق به من أفضل ستوديوهات EMS في المملكة العربية السعودية
        </p>
        <div className="marquee">
          <div className="flex shrink-0 items-center gap-12 sm:gap-16 pr-12 sm:pr-16 animate-marquee">
            {[...logos, ...logos].map((name, i) => (
              <div
                key={i}
                className="flex items-center gap-2.5 text-ink-secondary/70 hover:text-ink-primary transition-colors shrink-0"
              >
                <span className="w-9 h-9 rounded-lg border-2 border-current flex items-center justify-center font-extrabold text-xs shrink-0">
                  {name
                    .split(' ')
                    .slice(0, 2)
                    .map((s) => s[0])
                    .join('')}
                </span>
                <span className="font-extrabold text-base sm:text-lg tracking-tight whitespace-nowrap">
                  {name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

// ============ FEATURES (Bento) ============
function FeaturesBento() {
  return (
    <section id="features" className="section">
      <div className="container-app">
        <div className="text-center mb-14 sm:mb-20">
          <div className="eyebrow-brand mb-5">المميزات</div>
          <h2 className="h-section text-balance">كل شيء تحتاجه لتشغيل ستوديوهك.</h2>
          <p className="mt-5 text-lg text-ink-secondary max-w-2xl mx-auto text-balance">
            من اللحظة الأولى مع العميل إلى الفاتورة الإلكترونية — MOVE يدير كل تفصيل.
          </p>
        </div>

        {/* Bento grid */}
        <div className="grid grid-cols-1 md:grid-cols-6 lg:grid-cols-12 gap-4 lg:gap-5">
          {/* BIG card - bookings */}
          <div className="md:col-span-6 lg:col-span-7 group card-hover relative overflow-hidden p-7 sm:p-9 min-h-[380px]">
            <div className="absolute inset-0 bg-mesh-1 opacity-30 pointer-events-none" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-12 h-12 rounded-xl bg-brand-gradient flex items-center justify-center shadow-glow text-white">
                  <Calendar className="w-6 h-6" />
                </div>
                <div className="eyebrow-brand">الأساس</div>
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-ink-primary tracking-tight mb-3">
                حجوزات ذكية مصمَّمة لـ EMS.
              </h3>
              <p className="text-ink-secondary leading-relaxed max-w-lg">
                جلسات الـ ٢٠ دقيقة، أوقات الصلاة، الأجهزة، البدلات، والمدربين — كلها في تقويم واحد ذكي
                يفهم احتياجك.
              </p>

              {/* Mini calendar preview */}
              <div className="mt-7 bg-white border border-border/60 rounded-xl shadow-card p-3 max-w-md mx-auto sm:mx-0">
                <div className="flex items-center justify-between mb-2 px-1">
                  <span className="text-xs font-extrabold">الأحد ١٢ يناير</span>
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span className="text-[10px] text-ink-tertiary">٢٤ حجز</span>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-1.5">
                  {[
                    { t: '٦:٠٠', live: true },
                    { t: '٦:٣٠', live: false },
                    { t: '٧:٠٠', live: false },
                    { t: '٧:٣٠', live: false },
                    { t: '٨:٠٠', live: false, free: true },
                    { t: '٨:٣٠', live: false },
                    { t: 'الظهر', live: false, prayer: true },
                    { t: '١:٠٠', live: false }
                  ].map((s, i) => (
                    <div
                      key={i}
                      className={`rounded-md p-1.5 text-center text-[9px] font-bold border ${
                        s.prayer
                          ? 'bg-gray-100 text-ink-tertiary border-gray-200'
                          : s.free
                          ? 'bg-bg text-ink-tertiary border-dashed border-border'
                          : s.live
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-2 ring-emerald-100'
                          : 'bg-brand-50 text-brand border-brand-200/60'
                      }`}
                    >
                      <div className="tabular">{s.t}</div>
                      {s.prayer && <div className="text-[7px] mt-0.5">🕌 صلاة</div>}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Card - WhatsApp */}
          <div className="md:col-span-6 lg:col-span-5 group card-hover relative overflow-hidden p-7 sm:p-8 min-h-[380px]">
            <div className="absolute -top-16 -right-16 w-48 h-48 bg-emerald-100 rounded-full blur-3xl opacity-60" />
            <div className="relative">
              <div className="w-12 h-12 rounded-xl bg-emerald-500 flex items-center justify-center mb-5 shadow-lg shadow-emerald-200">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-extrabold text-ink-primary tracking-tight mb-3">
                واتساب على الطيار الآلي.
              </h3>
              <p className="text-ink-secondary leading-relaxed">
                تذكيرات قبل الجلسة، تأكيدات فورية، متابعة لمن لم يحضر. عملاؤك ما يفوتون موعد.
              </p>

              {/* Chat bubbles */}
              <div className="mt-6 space-y-2">
                <div className="ml-auto max-w-[80%] bg-emerald-50 border border-emerald-200/60 rounded-2xl rounded-bl-sm px-3 py-2">
                  <p className="text-[11px] text-ink-primary leading-snug">
                    تذكير: جلستك مع كابتن سارة الساعة ٦:٠٠ م 💪
                  </p>
                  <div className="flex items-center justify-end gap-0.5 mt-1">
                    <Check className="w-2.5 h-2.5 text-emerald-600" strokeWidth={3} />
                    <Check className="w-2.5 h-2.5 text-emerald-600 -mr-1.5" strokeWidth={3} />
                  </div>
                </div>
                <div className="mr-auto max-w-[60%] bg-white border border-border rounded-2xl rounded-br-sm px-3 py-2">
                  <p className="text-[11px] text-ink-primary leading-snug">جاهزة، شكراً! 🔥</p>
                </div>
              </div>
            </div>
          </div>

          {/* Card - ZATCA */}
          <div className="md:col-span-3 lg:col-span-4 group card-hover relative overflow-hidden p-7 min-h-[300px]">
            <div className="absolute -top-16 -left-16 w-48 h-48 bg-amber-100 rounded-full blur-3xl opacity-60" />
            <div className="relative">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center mb-5 shadow-lg shadow-amber-200">
                <Receipt className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-extrabold text-ink-primary tracking-tight mb-2">
                ZATCA متوافق ١٠٠٪.
              </h3>
              <p className="text-ink-secondary text-sm leading-relaxed">
                فواتير إلكترونية متوافقة مع المرحلة الثانية. بدون مجهود.
              </p>
              <div className="mt-5 flex items-center gap-2">
                <span className="badge-success">
                  <ShieldCheck className="w-3 h-3" />
                  معتمد
                </span>
                <span className="badge-gray">QR Code</span>
              </div>
            </div>
          </div>

          {/* Card - PAR-Q */}
          <div className="md:col-span-3 lg:col-span-4 group card-hover relative overflow-hidden p-7 min-h-[300px]">
            <div className="relative">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-400 to-rose-500 flex items-center justify-center mb-5 shadow-lg shadow-rose-100">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-extrabold text-ink-primary tracking-tight mb-2">
                PAR-Q ذكي.
              </h3>
              <p className="text-ink-secondary text-sm leading-relaxed">
                تحقق صحي تلقائي، تنبيهات للمدرب قبل كل جلسة، حماية كاملة لستوديوهك.
              </p>
              <div className="mt-5 space-y-1.5">
                {['الحمل', 'القلب', 'الصرع', 'الضغط'].map((t) => (
                  <div key={t} className="flex items-center gap-2 text-xs">
                    <Check className="w-3 h-3 text-emerald-500" strokeWidth={3} />
                    <span className="text-ink-secondary">{t}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Card - Reports */}
          <div className="md:col-span-6 lg:col-span-4 group card-hover relative overflow-hidden p-7 min-h-[300px]">
            <div className="relative">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center mb-5 shadow-lg shadow-indigo-100">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-extrabold text-ink-primary tracking-tight mb-2">
                تقارير تفهم ستوديوهك.
              </h3>
              <p className="text-ink-secondary text-sm leading-relaxed">
                إيرادات، احتفاظ، أداء المدربين، رحلة العميل — قرارات أذكى ببيانات حقيقية.
              </p>
              <div className="mt-5 flex items-end gap-1 h-12">
                {[24, 32, 28, 40, 38, 48, 56, 52, 64, 72].map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-sm transition-all"
                    style={{
                      height: `${h}%`,
                      background: `linear-gradient(180deg, hsl(178, ${40 + i * 4}%, ${60 - i * 3}%), hsl(178, 60%, 30%))`
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Sub features bar */}
        <div className="mt-10 grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { i: Smartphone, t: 'تطبيق موبايل', s: 'iOS و Android' },
            { i: Layers, t: 'فروع متعددة', s: 'لوحة موحدة' },
            { i: Globe, t: 'متعدد اللغات', s: 'عربي + إنجليزي' },
            { i: Clock, t: 'وضع رمضان', s: 'تغيير تلقائي' }
          ].map(({ i: I, t, s }) => (
            <div
              key={t}
              className="flex items-center gap-3 p-4 rounded-xl bg-white border border-border/60 hover:border-brand-200/80 hover:shadow-card transition-all"
            >
              <span className="flex-shrink-0 w-10 h-10 rounded-lg bg-brand-50 text-brand flex items-center justify-center">
                <I className="w-5 h-5" strokeWidth={2} />
              </span>
              <div>
                <div className="font-extrabold text-sm text-ink-primary">{t}</div>
                <div className="text-xs text-ink-tertiary">{s}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ============ HOW IT WORKS ============
function HowItWorks() {
  const steps = [
    {
      n: '٠١',
      t: 'سجّل ستوديوهك في ٥ دقائق',
      d: 'معلومات الستوديو، ساعات العمل، أوقات الصلاة، الموارد. كل شيء جاهز للانطلاق.',
      i: Sparkles
    },
    {
      n: '٠٢',
      t: 'أضف عملاءك وباقاتك',
      d: 'استيراد سريع من Excel، أو إضافة يدوية. أنشئ باقاتك المخصصة بأي عدد جلسات.',
      i: Users
    },
    {
      n: '٠٣',
      t: 'وفّر ٣ ساعات يومياً',
      d: 'الحجوزات، التذكيرات، الفواتير، التقارير — كل شيء يعمل من نفسه.',
      i: Zap
    }
  ]
  return (
    <section id="how" className="section bg-white relative overflow-hidden">
      <div className="absolute inset-0 bg-grid opacity-30" />
      <div className="container-app relative">
        <div className="text-center mb-16">
          <div className="eyebrow-brand mb-5">كيف يعمل</div>
          <h2 className="h-section text-balance">من التسجيل إلى أول جلسة — في ١٥ دقيقة.</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6 lg:gap-8 relative">
          {/* Connector line on desktop */}
          <div className="hidden md:block absolute top-12 right-[16.66%] left-[16.66%] h-px">
            <div className="h-full w-full border-t-2 border-dashed border-brand-200" />
          </div>

          {steps.map((s, i) => (
            <div key={s.n} className="relative">
              <div className="relative bg-white card p-7 sm:p-8 hover:shadow-premium hover:-translate-y-1 transition-all duration-300">
                <div className="flex items-start justify-between mb-5">
                  <div className="w-14 h-14 rounded-2xl bg-brand-gradient flex items-center justify-center shadow-glow-lg text-white relative z-10">
                    <s.i className="w-6 h-6" />
                  </div>
                  <div className="text-5xl font-extrabold text-brand-50 tabular leading-none">
                    {s.n}
                  </div>
                </div>
                <h3 className="text-xl font-extrabold text-ink-primary tracking-tight mb-2.5">
                  {s.t}
                </h3>
                <p className="text-ink-secondary leading-relaxed">{s.d}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ============ STATS ============
function Stats() {
  return (
    <section className="relative overflow-hidden">
      <div className="container-app relative">
        <div className="relative bg-brand-gradient rounded-3xl overflow-hidden shadow-premium">
          <div className="absolute inset-0 bg-grid-light opacity-30" />
          <div className="absolute -top-32 -right-32 w-96 h-96 bg-accent/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-white/10 rounded-full blur-3xl" />

          <div className="relative px-6 py-14 sm:px-12 sm:py-20 lg:px-16">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-y-12 gap-x-8">
              {[
                ['+٥٠', 'ستوديو يستخدم MOVE'],
                ['+٢٥٠٠', 'عميل تتم إدارته يومياً'],
                ['٦٠٪', 'تقليل في الـ no-shows'],
                ['٣ ساعات', 'توفير يومي لكل ستوديو']
              ].map(([v, l], i) => (
                <div key={l} className="text-center">
                  <div className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white tabular tracking-tight">
                    {v}
                  </div>
                  <div className="text-xs sm:text-sm text-white/80 mt-2 font-bold">{l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ============ TESTIMONIALS ============
function Testimonials() {
  return (
    <section id="testimonials" className="section">
      <div className="container-app">
        <div className="text-center mb-14 sm:mb-16">
          <div className="eyebrow-brand mb-5">آراء العملاء</div>
          <h2 className="h-section text-balance">
            ستوديوهات تحبّ <span className="text-brand-gradient">MOVE.</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {testimonials.map((t, i) => (
            <figure
              key={i}
              className={`card-hover p-7 sm:p-8 flex flex-col relative ${
                i === 1 ? 'lg:scale-105 lg:-translate-y-2 lg:shadow-premium border-brand-200' : ''
              }`}
            >
              {i === 1 && (
                <div className="absolute -top-3 right-7 px-3 py-1 rounded-full bg-brand text-white text-[10px] font-extrabold uppercase tracking-wider">
                  مميز
                </div>
              )}
              <div className="flex gap-0.5 mb-5">
                {[0, 1, 2, 3, 4].map((s) => (
                  <Star key={s} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <blockquote className="text-ink-primary leading-relaxed font-medium flex-1 text-balance">
                <span className="text-brand text-3xl leading-none font-serif">"</span>
                {t.quote}
              </blockquote>
              <figcaption className="flex items-center gap-3 mt-6 pt-6 border-t border-border/60">
                <div className="w-11 h-11 rounded-full bg-brand-gradient text-white flex items-center justify-center font-extrabold shadow-sm">
                  {t.initials}
                </div>
                <div>
                  <div className="font-extrabold text-ink-primary text-sm">{t.name}</div>
                  <div className="text-xs text-ink-tertiary">{t.role}</div>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  )
}

// ============ PRICING ============
function Pricing() {
  const [yearly, setYearly] = useState(false)
  return (
    <section id="pricing" className="section bg-white relative">
      <div className="absolute inset-0 bg-grid opacity-30" />
      <div className="container-app relative">
        <div className="text-center mb-12">
          <div className="eyebrow-brand mb-5">الأسعار</div>
          <h2 className="h-section text-balance">
            أسعار شفافة. <span className="text-brand-gradient">بدون مفاجآت.</span>
          </h2>
          <p className="mt-5 text-lg text-ink-secondary max-w-xl mx-auto text-balance">
            ابدأ مجاناً لمدة ١٤ يوم. ألغِ في أي وقت بدون التزامات.
          </p>

          {/* Toggle */}
          <div className="mt-8 inline-flex items-center gap-1 p-1 rounded-full bg-bg border border-border/80">
            <button
              onClick={() => setYearly(false)}
              className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all ${
                !yearly ? 'bg-white shadow-sm text-ink-primary' : 'text-ink-secondary'
              }`}
            >
              شهري
            </button>
            <button
              onClick={() => setYearly(true)}
              className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all inline-flex items-center gap-1.5 ${
                yearly ? 'bg-white shadow-sm text-ink-primary' : 'text-ink-secondary'
              }`}
            >
              سنوي
              <span className="px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[9px] font-extrabold">
                وفّر ٢٠٪
              </span>
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-5 lg:gap-6 max-w-5xl mx-auto">
          {pricingTiers.map((tier) => {
            const monthly = tier.price
            const display = yearly && monthly ? Math.round(monthly * 0.8) : monthly
            return (
              <div
                key={tier.id}
                className={`relative rounded-3xl p-7 sm:p-8 transition-all flex flex-col ${
                  tier.highlight
                    ? 'bg-ink-primary text-white shadow-premium ring-1 ring-white/10 sm:scale-105 z-10 overflow-hidden'
                    : 'card-hover'
                }`}
              >
                {tier.highlight && (
                  <>
                    <div className="absolute inset-0 bg-mesh-2 opacity-50" />
                    <div className="absolute -top-32 -right-32 w-72 h-72 bg-brand/40 rounded-full blur-3xl" />
                    <div className="absolute -bottom-32 -left-32 w-72 h-72 bg-accent/20 rounded-full blur-3xl" />
                  </>
                )}

                {tier.badge && (
                  <div className="absolute top-5 left-5 px-2.5 py-1 rounded-full bg-accent text-white text-[10px] font-extrabold uppercase tracking-wider shadow-glow-accent">
                    {tier.badge}
                  </div>
                )}

                <div className="relative">
                  <div className={`text-sm font-extrabold mb-2 ${tier.highlight ? 'text-white/70' : 'text-brand'}`}>
                    {tier.name}
                  </div>
                  <div className="mb-5 flex items-end gap-2">
                    {display ? (
                      <>
                        <span
                          className={`text-5xl font-extrabold tabular tracking-tight ${
                            tier.highlight ? 'text-white' : 'text-ink-primary'
                          }`}
                        >
                          {formatNumberAr(display)}
                        </span>
                        <span
                          className={`text-sm mb-2 font-bold ${
                            tier.highlight ? 'text-white/70' : 'text-ink-secondary'
                          }`}
                        >
                          ر.س / شهر
                        </span>
                      </>
                    ) : (
                      <span
                        className={`text-3xl font-extrabold tracking-tight ${
                          tier.highlight ? 'text-white' : 'text-ink-primary'
                        }`}
                      >
                        تواصل معنا
                      </span>
                    )}
                  </div>
                  <div className={`text-sm mb-7 ${tier.highlight ? 'text-white/80' : 'text-ink-secondary'}`}>
                    {tier.cap}
                  </div>

                  <ul className="space-y-3 mb-8 flex-1">
                    {tier.features.map((f, i) => (
                      <li key={i} className="flex items-start gap-2.5">
                        <span
                          className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5 ${
                            tier.highlight ? 'bg-white/15' : 'bg-brand-50'
                          }`}
                        >
                          <Check
                            className={`w-3 h-3 ${tier.highlight ? 'text-white' : 'text-brand'}`}
                            strokeWidth={3}
                          />
                        </span>
                        <span className={`text-sm ${tier.highlight ? 'text-white/95' : 'text-ink-primary'}`}>
                          {f}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <Link
                    to={tier.price ? '/onboarding' : '#contact'}
                    className={
                      tier.highlight
                        ? 'btn bg-white text-ink-primary hover:bg-gray-100 w-full btn-lg'
                        : 'btn-secondary btn-lg w-full'
                    }
                  >
                    {tier.cta}
                    <ArrowLeft className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            )
          })}
        </div>

        <p className="text-center mt-10 text-sm text-ink-tertiary">
          جميع الأسعار شاملة الضريبة • فواتير ZATCA إلكترونية • دعم فني عربي ٢٤/٧
        </p>
      </div>
    </section>
  )
}

// ============ FAQ ============
function FAQ() {
  const items = [
    {
      q: 'هل أحتاج خبرة تقنية لاستخدام MOVE؟',
      a: 'لا أبداً. النظام مصمَّم ليكون بديهي وسهل، أي شخص يقدر يبدأ خلال ١٥ دقيقة. وعندك دعم فني عربي ٢٤/٧ يساعدك.'
    },
    {
      q: 'كيف يتم تكامل MOVE مع ZATCA؟',
      a: 'MOVE معتمد ومتوافق ١٠٠٪ مع المرحلة الثانية من فواتير ZATCA. الفواتير تنشأ تلقائياً مع QR Code وترسل لهيئة الزكاة بدون أي مجهود إضافي منك.'
    },
    {
      q: 'هل أقدر استورد بيانات عملائي الحاليين؟',
      a: 'نعم، قدر استيراد العملاء والباقات والحجوزات من ملف Excel. وفريقنا يساعدك مجاناً في عملية الانتقال.'
    },
    {
      q: 'ماذا يحدث بعد انتهاء التجربة المجانية؟',
      a: 'تختار الباقة المناسبة وتكمّل. إذا قررت ما تكمّل، بياناتك آمنة وتقدر تحمّلها كاملة. بدون أي رسوم أو التزامات.'
    },
    {
      q: 'هل يدعم النظام تعدد الفروع؟',
      a: 'نعم، في باقة المؤسسات. تقدر تدير فروعك من لوحة موحدة، مع صلاحيات منفصلة لكل فرع وتقارير مجمعة.'
    },
    {
      q: 'هل العملاء يحتاجون تطبيق منفصل؟',
      a: 'لا، كل التواصل عبر واتساب اللي عملاؤك أصلاً يستخدمونه. ولو حبيت، عندنا تطبيق ويب للعميل يقدر يحجز ويتابع باقاته منه.'
    }
  ]
  const [open, setOpen] = useState(0)
  return (
    <section id="faq" className="section">
      <div className="container-app">
        <div className="grid lg:grid-cols-12 gap-12">
          <div className="lg:col-span-4">
            <div className="eyebrow-brand mb-5">الأسئلة الشائعة</div>
            <h2 className="h-section text-balance">
              لديك سؤال؟ <br />
              <span className="text-brand-gradient">الإجابة هنا.</span>
            </h2>
            <p className="mt-5 text-ink-secondary leading-relaxed">
              ما لقيت إجابتك؟ تواصل مع فريقنا، نرد عليك خلال ساعة في أوقات العمل.
            </p>
            <a href="#contact" className="mt-6 inline-flex items-center gap-2 font-bold text-brand hover:text-brand-light">
              تواصل معنا
              <ArrowLeft className="w-4 h-4" />
            </a>
          </div>

          <div className="lg:col-span-8 space-y-3">
            {items.map((item, i) => (
              <div
                key={i}
                className={`card transition-all ${
                  open === i ? 'border-brand-200 shadow-card-hover' : 'hover:border-brand-100'
                }`}
              >
                <button
                  onClick={() => setOpen(open === i ? -1 : i)}
                  className="w-full flex items-center justify-between gap-4 p-5 sm:p-6 text-right"
                >
                  <span className="font-extrabold text-ink-primary text-base sm:text-lg">{item.q}</span>
                  <span
                    className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                      open === i ? 'bg-brand text-white rotate-180' : 'bg-bg text-ink-secondary'
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </span>
                </button>
                {open === i && (
                  <div className="px-5 sm:px-6 pb-5 sm:pb-6 -mt-2 text-ink-secondary leading-relaxed animate-slide-down">
                    {item.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

// ============ FINAL CTA ============
function FinalCTA() {
  return (
    <section id="contact" className="section">
      <div className="container-app">
        <div className="relative bg-ink-primary rounded-3xl overflow-hidden p-10 sm:p-16 lg:p-20 text-center">
          <div className="absolute inset-0 bg-mesh-2 opacity-60" />
          <div className="absolute inset-0 bg-grid-light opacity-30" />
          <div className="absolute -top-32 -right-32 w-96 h-96 bg-brand/40 rounded-full blur-3xl" />
          <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-accent/30 rounded-full blur-3xl" />

          <div className="relative">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-white/90 text-xs font-bold mb-7 backdrop-blur">
              <Sparkles className="w-3.5 h-3.5 text-accent" />
              <span>انضم لـ +٥٠ ستوديو يستخدم MOVE</span>
            </div>
            <h2 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-tight text-balance">
              جاهز تطوّر <br />
              <span className="text-accent">ستوديوهك؟</span>
            </h2>
            <p className="mt-7 text-white/80 text-base sm:text-xl max-w-xl mx-auto text-balance">
              ابدأ تجربتك المجانية لمدة ١٤ يوم. بدون بطاقة ائتمان، بدون التزامات.
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
              <Link to="/onboarding" className="btn-xl bg-white text-ink-primary hover:bg-gray-100 btn group">
                <span>ابدأ الآن مجاناً</span>
                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              </Link>
              <Link to="/login" className="btn-xl btn-ghost text-white hover:bg-white/10">
                لدي حساب
              </Link>
            </div>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-white/70 text-sm">
              {['١٤ يوم مجاناً', 'بدون بطاقة ائتمان', 'إلغاء في أي وقت', 'دعم عربي ٢٤/٧'].map((t) => (
                <div key={t} className="flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-400" strokeWidth={3} />
                  <span className="font-bold">{t}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ============ FOOTER ============
function Footer() {
  return (
    <footer className="bg-white border-t border-border/70">
      <div className="container-app py-14">
        <div className="grid sm:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-12">
          <div className="lg:col-span-4">
            <Logo />
            <p className="mt-5 text-sm text-ink-secondary leading-relaxed max-w-sm">
              نظام إدارة ستوديوهات EMS مصمَّم للسوق السعودي. متوافق مع ZATCA وأوقات الصلاة، ومتكامل
              مع واتساب ومدى وتابي.
            </p>
            <div className="mt-5 flex items-center gap-2">
              {['Twitter', 'Instagram', 'LinkedIn', 'YouTube'].map((s) => (
                <a
                  key={s}
                  href="#"
                  className="w-9 h-9 rounded-lg bg-bg border border-border/60 flex items-center justify-center text-ink-secondary hover:bg-brand hover:text-white hover:border-brand transition-colors text-xs font-extrabold"
                >
                  {s[0]}
                </a>
              ))}
            </div>
          </div>
          <div className="lg:col-span-2">
            <h4 className="font-extrabold text-ink-primary mb-4 text-sm">المنتج</h4>
            <ul className="space-y-2.5 text-sm text-ink-secondary">
              <li><a href="#features" className="hover:text-brand transition-colors">المميزات</a></li>
              <li><a href="#pricing" className="hover:text-brand transition-colors">الأسعار</a></li>
              <li><a href="#" className="hover:text-brand transition-colors">المدونة</a></li>
              <li><a href="#" className="hover:text-brand transition-colors">التحديثات</a></li>
            </ul>
          </div>
          <div className="lg:col-span-2">
            <h4 className="font-extrabold text-ink-primary mb-4 text-sm">الشركة</h4>
            <ul className="space-y-2.5 text-sm text-ink-secondary">
              <li><a href="#" className="hover:text-brand transition-colors">من نحن</a></li>
              <li><a href="#" className="hover:text-brand transition-colors">تواصل معنا</a></li>
              <li><a href="#" className="hover:text-brand transition-colors">الوظائف</a></li>
              <li><a href="#" className="hover:text-brand transition-colors">الشركاء</a></li>
            </ul>
          </div>
          <div className="lg:col-span-2">
            <h4 className="font-extrabold text-ink-primary mb-4 text-sm">المساعدة</h4>
            <ul className="space-y-2.5 text-sm text-ink-secondary">
              <li><a href="#" className="hover:text-brand transition-colors">مركز المساعدة</a></li>
              <li><a href="#" className="hover:text-brand transition-colors">الدعم الفني</a></li>
              <li><a href="#" className="hover:text-brand transition-colors">حالة النظام</a></li>
              <li><a href="#" className="hover:text-brand transition-colors">API للمطورين</a></li>
            </ul>
          </div>
          <div className="lg:col-span-2">
            <h4 className="font-extrabold text-ink-primary mb-4 text-sm">قانوني</h4>
            <ul className="space-y-2.5 text-sm text-ink-secondary">
              <li><a href="#" className="hover:text-brand transition-colors">سياسة الخصوصية</a></li>
              <li><a href="#" className="hover:text-brand transition-colors">شروط الاستخدام</a></li>
              <li><a href="#" className="hover:text-brand transition-colors">اتفاقية الخدمة</a></li>
              <li><a href="#" className="hover:text-brand transition-colors">DPA</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-border/70 mt-12 pt-6 flex flex-wrap justify-between items-center gap-3 text-sm text-ink-tertiary">
          <span>© ٢٠٢٥ MOVE. جميع الحقوق محفوظة.</span>
          <div className="flex items-center gap-4">
            <span className="font-medium flex items-center gap-1.5">
              صُنع في
              <span className="inline-block w-5 h-3.5 rounded-sm bg-gradient-to-b from-emerald-600 to-emerald-700 ring-1 ring-emerald-800/20" />
              المملكة العربية السعودية
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}

// ============ MAIN ============
export default function Landing() {
  return (
    <div className="min-h-screen bg-bg">
      <Nav />
      <Hero />
      <LogoMarquee />
      <FeaturesBento />
      <HowItWorks />
      <Stats />
      <Testimonials />
      <Pricing />
      <FAQ />
      <FinalCTA />
      <Footer />
    </div>
  )
}
