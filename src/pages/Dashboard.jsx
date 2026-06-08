import { Link } from 'react-router-dom'
import {
  ArrowUp,
  ArrowDown,
  Calendar,
  Users,
  DollarSign,
  TrendingDown,
  MoreHorizontal,
  ChevronLeft,
  Plus,
  AlertTriangle,
  RotateCw,
  ClipboardList,
  ShieldAlert,
  Sparkles,
  Filter,
  Clock,
  Trophy
} from 'lucide-react'
import { prayerTimes } from '../data/mockData.js'
import { reportsApi, bookingsApi } from '../lib/api.js'
import { getStoredUser, getStoredStudio } from '../lib/api.js'
import { useApi } from '../lib/useApi.js'
import { comingSoon } from '../lib/toast.js'
import { useNavigate } from 'react-router-dom'
import {
  cn,
  toArabicDigits,
  formatNumberAr,
  greetingByHour,
  todayArabic
} from '../lib/utils.js'
import { useState } from 'react'

// =============== Sparkline ===============
function Sparkline({ data, color = '#0D4F4E', height = 36, accent = '#1A6E6D' }) {
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * 100
    const y = 100 - ((v - min) / range) * 100
    return [x, y]
  })
  const path = points.map(([x, y], i) => (i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`)).join(' ')
  const area = `${path} L 100 100 L 0 100 Z`
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full" style={{ height }}>
      <defs>
        <linearGradient id={`grad-${color}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#grad-${color})`} />
      <path d={path} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {points.length > 0 && (
        <circle cx={points[points.length - 1][0]} cy={points[points.length - 1][1]} r="2.5" fill={accent} />
      )}
    </svg>
  )
}

// =============== KPI Card ===============
function KPI({ label, value, delta, deltaTone, sub, icon: Icon, tint, chart }) {
  const positive = deltaTone === 'success'
  return (
    <div className="card p-5 sm:p-6 group hover:shadow-card-hover transition-all">
      <div className="flex items-start justify-between mb-3">
        <div
          className={cn(
            'w-10 h-10 rounded-xl flex items-center justify-center',
            tint || 'bg-brand-50 text-brand'
          )}
        >
          <Icon className="w-5 h-5" strokeWidth={2.2} />
        </div>
        <span
          className={cn(
            'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-extrabold',
            positive ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
          )}
        >
          {positive ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
          {delta}
        </span>
      </div>
      <div className="text-3xl sm:text-4xl font-extrabold text-ink-primary tabular tracking-tight">
        {value}
      </div>
      <div className="mt-1 text-xs text-ink-secondary font-bold">{label}</div>
      {sub && <div className="text-[11px] text-ink-tertiary mt-0.5">{sub}</div>}
      {chart}
    </div>
  )
}

// =============== Schedule Timeline ===============
function statusStyle(status) {
  switch (status) {
    case 'مؤكد':
      return { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500', label: 'مؤكد' }
    case 'جاري':
      return { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500 animate-pulse', label: 'جاري الآن' }
    case 'مكتمل':
      return { bg: 'bg-gray-100', text: 'text-gray-600', dot: 'bg-gray-400', label: 'مكتمل' }
    case 'لم يحضر':
      return { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500', label: 'لم يحضر' }
    case 'ملغي':
      return { bg: 'bg-gray-100', text: 'text-gray-500', dot: 'bg-gray-400', label: 'ملغي' }
    default:
      return { bg: 'bg-gray-100', text: 'text-gray-600', dot: 'bg-gray-400', label: status }
  }
}

function PrayerRow({ name, time }) {
  return (
    <div className="flex items-center gap-3 px-3 sm:px-4 py-2.5 bg-gradient-to-bl from-gray-50 to-bg border-y border-border/40 -mx-2">
      <div className="text-xs tabular font-extrabold text-ink-tertiary w-12 text-left">{time}</div>
      <span className="text-lg">🕌</span>
      <span className="text-xs font-bold text-ink-secondary flex-1">صلاة {name}</span>
      <span className="text-[10px] text-ink-tertiary">حجز موقوف</span>
    </div>
  )
}

function ScheduleCard({ schedule }) {
  const navigate = useNavigate()
  const [filter, setFilter] = useState('all')
  const filtered = (schedule || []).filter((b) => {
    if (filter === 'all') return true
    if (filter === 'confirmed') return b.status === 'مؤكد' || b.status === 'جاري'
    if (filter === 'completed') return b.status === 'مكتمل'
    if (filter === 'cancelled') return b.status === 'لم يحضر' || b.status === 'ملغي'
    return true
  })

  // Insert prayer rows between bookings to convey timeline
  const items = []
  const prayerInsertAfter = { 9: 'الفجر', 11: 'الظهر', 13: 'العصر', 19: 'المغرب', 22: 'العشاء' }
  filtered.slice(0, 16).forEach((b, i) => {
    items.push({ kind: 'booking', b })
    if (prayerInsertAfter[i]) {
      const p = prayerTimes.find((pt) => pt.name === prayerInsertAfter[i])
      if (p) items.push({ kind: 'prayer', p })
    }
  })

  return (
    <section className="card overflow-hidden">
      <header className="flex items-center justify-between gap-3 p-5 sm:p-6 border-b border-border/60">
        <div>
          <h2 className="text-lg sm:text-xl font-extrabold text-ink-primary tracking-tight">
            جدول اليوم
          </h2>
          <p className="text-xs text-ink-tertiary mt-0.5">
            {toArabicDigits(filtered.length)} جلسة • {toArabicDigits(filtered.filter((b) => b.status === 'مكتمل').length)} مكتملة
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden sm:inline-flex items-center gap-1 p-1 rounded-lg bg-bg border border-border/60">
            {[
              { k: 'all', l: 'الكل' },
              { k: 'confirmed', l: 'مؤكد' },
              { k: 'completed', l: 'مكتمل' },
              { k: 'cancelled', l: 'ملغي' }
            ].map((f) => (
              <button
                key={f.k}
                onClick={() => setFilter(f.k)}
                className={cn(
                  'px-2.5 py-1 rounded-md text-xs font-bold transition-all',
                  filter === f.k
                    ? 'bg-white shadow-sm text-ink-primary'
                    : 'text-ink-secondary hover:text-ink-primary'
                )}
              >
                {f.l}
              </button>
            ))}
          </div>
          <Link to="/bookings" className="btn-sm btn-ghost text-brand font-extrabold">
            عرض الكل
            <ChevronLeft className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      <div className="max-h-[680px] overflow-y-auto px-2 sm:px-4 py-2">
        {items.map((it, i) => {
          if (it.kind === 'prayer') return <PrayerRow key={`p-${i}`} {...it.p} />
          const b = it.b
          const s = statusStyle(b.status)
          const timeStr = b.start_time
            ? new Date(b.start_time).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit', hour12: true })
            : (b.time || '')
          const clientName = b.client_name || b.clientName || ''
          const trainerName = b.trainer_name || b.trainerName || ''
          const machineLabel = b.machine_label || b.machine || ''
          return (
            <div
              key={b.id}
              className="group flex items-center gap-3 px-3 py-3 hover:bg-bg/60 rounded-xl transition-colors"
            >
              {/* Time */}
              <div className="text-right w-14 sm:w-16 flex-shrink-0">
                <div className="text-sm sm:text-base font-extrabold tabular text-ink-primary leading-none">
                  {timeStr}
                </div>
              </div>

              {/* Status indicator bar */}
              <div className={cn('w-1 h-11 rounded-full flex-shrink-0', s.dot)} />

              {/* Client */}
              <div className="flex items-center gap-2.5 flex-1 min-w-0">
                <span className="flex-shrink-0 w-9 h-9 rounded-full bg-gradient-to-br from-brand-100 to-brand-50 text-brand flex items-center justify-center text-xs font-extrabold border border-brand-200/40">
                  {clientName.split(' ').map((s) => s[0]).join('').slice(0, 2)}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="font-extrabold text-sm text-ink-primary truncate">{clientName}</div>
                  <div className="text-[11px] text-ink-tertiary truncate">
                    {trainerName} • {machineLabel}
                  </div>
                </div>
              </div>

              {/* Status badge */}
              <span
                className={cn(
                  'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-extrabold flex-shrink-0',
                  s.bg,
                  s.text
                )}
              >
                <span className={cn('w-1.5 h-1.5 rounded-full', s.dot)} />
                {s.label}
              </span>

              {/* Hover action */}
              <button onClick={() => navigate('/bookings')} title="عرض في الحجوزات" className="opacity-0 group-hover:opacity-100 w-8 h-8 rounded-lg hover:bg-bg flex items-center justify-center text-ink-tertiary transition-all hidden sm:flex flex-shrink-0">
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </div>
          )
        })}
      </div>
    </section>
  )
}

// =============== Alerts ===============
function AlertsCard({ alerts = [] }) {
  const navigate = useNavigate()
  const toneMap = {
    warning: { bg: 'bg-amber-50', text: 'text-amber-700', icon: AlertTriangle, dot: 'bg-amber-500' },
    info: { bg: 'bg-blue-50', text: 'text-blue-700', icon: RotateCw, dot: 'bg-blue-500' },
    danger: { bg: 'bg-red-50', text: 'text-red-700', icon: ShieldAlert, dot: 'bg-red-500' }
  }
  return (
    <section className="card p-5 sm:p-6">
      <header className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-extrabold text-ink-primary">تنبيهات تحتاج انتباهك</h2>
          <span className="badge-warning text-[10px]">
            {toArabicDigits(alerts.length)}
          </span>
        </div>
        <button onClick={() => navigate('/clients')} className="text-xs font-extrabold text-brand hover:text-brand-light">عرض الكل</button>
      </header>
      <div className="space-y-2">
        {alerts.map((a) => {
          const t = toneMap[a.tone] || toneMap.info
          return (
            <div
              key={a.id}
              className="flex items-center gap-3 p-3 rounded-xl bg-bg/60 border border-border/40 hover:bg-bg hover:border-brand-200/60 transition-all group"
            >
              <span className={cn('w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0', t.bg, t.text)}>
                <t.icon className="w-4 h-4" />
              </span>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold text-ink-primary leading-snug">{a.text}</div>
              </div>
              <button onClick={() => navigate('/clients')} className="text-xs font-extrabold text-brand opacity-70 group-hover:opacity-100 flex-shrink-0">
                {a.cta}
                <ChevronLeft className="w-3 h-3 inline mr-0.5" />
              </button>
            </div>
          )
        })}
      </div>
    </section>
  )
}

// =============== Top Performers ===============
function TopPerformersCard({ topPerformers = [] }) {
  if (!topPerformers.length) return null
  const max = Math.max(...topPerformers.map((p) => p.sessions || 1))
  return (
    <section className="card p-5 sm:p-6 relative overflow-hidden">
      <div className="absolute -top-16 -right-16 w-40 h-40 bg-amber-100/60 rounded-full blur-3xl" />
      <header className="flex items-center justify-between mb-5 relative">
        <div className="flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-amber-500 text-white flex items-center justify-center shadow-soft">
            <Trophy className="w-4 h-4" />
          </span>
          <h2 className="text-base font-extrabold text-ink-primary">أفضل المدربين</h2>
        </div>
        <Link to="/trainers" className="text-xs font-extrabold text-brand">عرض الكل</Link>
      </header>
      <div className="space-y-3.5 relative">
        {topPerformers.map((p, i) => {
          const pct = (p.sessions / max) * 100
          const medals = ['🥇', '🥈', '🥉']
          return (
            <div key={p.name} className="flex items-center gap-3">
              <span className="text-xl flex-shrink-0">{medals[i]}</span>
              <span className="w-10 h-10 rounded-full bg-brand-gradient text-white flex items-center justify-center text-xs font-extrabold flex-shrink-0 shadow-soft">
                {p.initials}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <div className="font-extrabold text-sm text-ink-primary truncate">{p.name}</div>
                  <div className="text-xs font-extrabold text-ink-primary tabular flex-shrink-0">
                    {toArabicDigits(p.sessions)}{' '}
                    <span className="text-ink-tertiary font-bold">جلسة</span>
                  </div>
                </div>
                <div className="h-1.5 bg-bg rounded-full overflow-hidden">
                  <div
                    className={cn(
                      'h-full rounded-full transition-all',
                      i === 0 ? 'bg-gradient-to-l from-amber-400 to-amber-500' : 'bg-brand'
                    )}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

// =============== Quick Stats Strip ===============
function QuickStats() {
  return (
    <section className="card p-5 sm:p-6 relative overflow-hidden bg-gradient-to-bl from-brand-50/40 to-white border-brand-100/80">
      <div className="absolute -top-20 -left-20 w-48 h-48 bg-brand/8 rounded-full blur-3xl" />
      <div className="relative grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { l: 'حجوزات الأسبوع', v: '١٥٠', t: 'text-brand' },
          { l: 'جلسات ساعة الذروة', v: '٤٠', t: 'text-accent' },
          { l: 'متوسط مدة الجلسة', v: '٢٠د', t: 'text-emerald-600' },
          { l: 'معدل الاحتفاظ', v: '٨٢٪', t: 'text-indigo-600' }
        ].map((s) => (
          <div key={s.l}>
            <div className={cn('text-2xl sm:text-3xl font-extrabold tabular tracking-tight', s.t)}>
              {s.v}
            </div>
            <div className="text-[11px] sm:text-xs text-ink-secondary font-bold mt-0.5">{s.l}</div>
          </div>
        ))}
      </div>
    </section>
  )
}

// =============== MAIN DASHBOARD ===============
export default function Dashboard() {
  const user = getStoredUser() || { name_ar: 'مستخدم' }
  const studio = getStoredStudio() || { name_ar: 'ستوديوهك' }
  const { data: kpis, loading } = useApi(() => reportsApi.dashboard())

  // today's bookings
  const today = new Date().toISOString().slice(0, 10)
  const { data: schedule } = useApi(() => bookingsApi.list({ date: today }), [today])

  const lastDays = kpis?.last_7_days || []
  const alerts = kpis?.alerts || []
  const topPerformers = kpis?.top_performers || []
  const bookingsToday = kpis?.bookings_today ?? 0
  const bookingsDelta = kpis?.bookings_today_delta ?? 0
  const activeClients = kpis?.active_clients ?? 0
  const activeDelta = kpis?.active_clients_delta ?? 0
  const monthlyRevenue = kpis?.monthly_revenue ?? 0
  const monthlyDelta = kpis?.monthly_revenue_delta ?? 0
  const noShowRate = kpis?.no_show_rate ?? 0
  const noShowDelta = kpis?.no_show_delta ?? 0

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs sm:text-sm font-bold text-ink-tertiary">{todayArabic()}</span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-extrabold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              متاح
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-ink-primary tracking-tight">
            {greetingByHour()}، {user.name_ar.split(' ')[0]} <span className="inline-block animate-bounce-subtle">👋</span>
          </h1>
          <p className="text-sm text-ink-secondary mt-1">
            إليك ملخص يومك في <span className="font-extrabold text-ink-primary">{studio.name_ar}</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => comingSoon('فلترة لوحة المعلومات')} className="btn-secondary btn-sm">
            <Filter className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">فلتر</span>
          </button>
          <Link to="/bookings/new" className="btn-primary btn-sm sm:hidden">
            <Plus className="w-3.5 h-3.5" />
            حجز
          </Link>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
        <KPI
          label="حجوزات اليوم"
          value={toArabicDigits(bookingsToday)}
          delta={`${bookingsDelta >= 0 ? '+' : ''}${toArabicDigits(bookingsDelta)} من أمس`}
          deltaTone={bookingsDelta >= 0 ? 'success' : 'danger'}
          icon={Calendar}
          tint="bg-brand-50 text-brand"
          chart={
            <div className="mt-3">
              <Sparkline data={lastDays.length ? lastDays.map((d) => d.value) : [1,1,1,1,1,1,1]} color="#0D4F4E" />
            </div>
          }
        />
        <KPI
          label="العملاء النشطين"
          value={toArabicDigits(activeClients)}
          delta={`+${toArabicDigits(activeDelta)} هذا الشهر`}
          deltaTone="success"
          icon={Users}
          tint="bg-indigo-50 text-indigo-600"
          chart={
            <div className="mt-4">
              <div className="flex justify-between text-[10px] text-ink-tertiary mb-1 font-bold tabular">
                <span>{toArabicDigits(activeClients)} / ٥٠٠</span>
                <span>{toArabicDigits(Math.round((activeClients / 500) * 100))}٪</span>
              </div>
              <div className="h-1.5 bg-bg rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-l from-indigo-500 to-indigo-400 rounded-full" style={{ width: `${Math.min(100, (activeClients / 500) * 100)}%` }} />
              </div>
            </div>
          }
        />
        <KPI
          label="الإيراد الشهري"
          value={
            <span>
              {formatNumberAr(Math.round(monthlyRevenue))}
              <span className="text-sm text-ink-secondary mr-1">ر.س</span>
            </span>
          }
          delta={`${monthlyDelta >= 0 ? '+' : ''}${toArabicDigits(monthlyDelta)}٪`}
          deltaTone={monthlyDelta >= 0 ? 'success' : 'danger'}
          icon={DollarSign}
          tint="bg-emerald-50 text-emerald-600"
          chart={
            <div className="mt-3">
              <Sparkline data={[41, 47, 52, 55, 58, Math.max(58, Math.round(monthlyRevenue / 1000))]} color="#10B981" accent="#10B981" />
            </div>
          }
        />
        <KPI
          label="معدل الـ No-show"
          value={`${toArabicDigits(noShowRate)}٪`}
          delta={`${toArabicDigits(noShowDelta)}٪`}
          deltaTone="success"
          icon={TrendingDown}
          tint="bg-rose-50 text-rose-600"
          chart={
            <div className="mt-3">
              <Sparkline data={[14, 12, 11, 13, 10, 9, 10, noShowRate || 8]} color="#EF4444" accent="#10B981" />
            </div>
          }
        />
      </div>

      {/* Quick stats strip */}
      <QuickStats />

      {/* Grid: Schedule + Side */}
      <div className="grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <ScheduleCard schedule={schedule} />
        </div>
        <div className="lg:col-span-1 space-y-5">
          <AlertsCard alerts={alerts} />
          <TopPerformersCard topPerformers={topPerformers} />
        </div>
      </div>
    </div>
  )
}
