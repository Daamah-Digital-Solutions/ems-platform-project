import { useState, Fragment } from 'react'
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  ReferenceLine,
  CartesianGrid
} from 'recharts'
import { TrendingUp, TrendingDown, Calendar, Users, Activity, Download } from 'lucide-react'
import { reportsApi } from '../lib/api.js'
import { useApi } from '../lib/useApi.js'
import { cn, toArabicDigits, formatNumberAr } from '../lib/utils.js'
import { toast } from '../lib/toast.js'

export default function Reports() {
  const [range, setRange] = useState('30d')
  const { data } = useApi(() => reportsApi.overview(range), [range])
  const revenue6Months = data?.revenue_6_months || []
  const packageDistribution = data?.package_distribution || []
  const noShowWeekly = data?.no_show_weekly || []
  const trainerPerformance = data?.trainer_performance || []
  const funnel = data?.funnel || []
  const peakHeatmap = data?.peak_heatmap || { hours: [], days: [], grid: [] }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="page-title">التقارير</h1>
          <p className="page-subtitle">ملخص أداء ستوديوهك خلال الفترة المختارة.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="inline-flex items-center gap-0.5 p-1 rounded-lg bg-bg border border-border/60">
            {[
              { k: '7d', l: '٧ أيام' },
              { k: '30d', l: '٣٠ يوم' },
              { k: '90d', l: '٩٠ يوم' }
            ].map((r) => (
              <button
                key={r.k}
                onClick={() => setRange(r.k)}
                className={cn(
                  'px-3 h-8 rounded-md text-xs font-extrabold transition-all',
                  range === r.k ? 'bg-white shadow-sm text-ink-primary' : 'text-ink-secondary'
                )}
              >
                {r.l}
              </button>
            ))}
          </div>
          <button onClick={() => { toast('جاري تجهيز التقرير للطباعة...', 'success'); setTimeout(() => window.print(), 400) }} className="btn-secondary btn-sm">
            <Download className="w-3.5 h-3.5" /> تصدير
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[
          { l: 'إجمالي الإيراد', v: formatNumberAr(Math.round(data?.total_revenue || 0)), sub: 'ر.س', delta: data?.total_revenue_delta ?? 0, unit: '٪', icon: Activity, color: 'bg-emerald-50 text-emerald-600' },
          { l: 'جلسات مكتملة', v: toArabicDigits(data?.completed_sessions || 0), sub: 'جلسة', delta: data?.completed_sessions_delta ?? 0, unit: '٪', icon: Activity, color: 'bg-brand-50 text-brand' },
          { l: 'عملاء جدد', v: toArabicDigits(data?.new_clients || 0), sub: 'عميل', delta: data?.new_clients_delta ?? 0, unit: '', icon: Users, color: 'bg-indigo-50 text-indigo-600' },
          { l: 'تحويل تجريبي', v: `${toArabicDigits(data?.trial_conversion || 0)}٪`, sub: 'هذه الفترة', delta: data?.trial_conversion_delta ?? 0, unit: ' نقطة', icon: TrendingUp, color: 'bg-rose-50 text-rose-600' }
        ].map((k) => {
          const positive = k.delta >= 0
          const DeltaIcon = positive ? TrendingUp : TrendingDown
          return (
            <div key={k.l} className="card p-5">
              <div className="flex items-start justify-between mb-3">
                <span className={cn('w-10 h-10 rounded-xl flex items-center justify-center', k.color)}>
                  <k.icon className="w-5 h-5" />
                </span>
                <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-extrabold', positive ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700')}>
                  <DeltaIcon className="w-3 h-3" />
                  {positive ? '+' : ''}{toArabicDigits(k.delta)}{k.unit}
                </span>
              </div>
              <div className="text-3xl font-extrabold tabular tracking-tight">{k.v}</div>
              <div className="text-xs text-ink-tertiary mt-0.5">
                <span className="font-bold text-ink-secondary">{k.l}</span> • {k.sub}
              </div>
            </div>
          )
        })}
      </div>

      {/* Revenue */}
      <div className="grid lg:grid-cols-3 gap-5">
        <ChartCard className="lg:col-span-2" title="الإيراد الشهري" subtitle="آخر ٦ أشهر">
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={revenue6Months}>
              <defs>
                <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0D4F4E" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#0D4F4E" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#E5E7EB" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fontFamily: 'Tajawal' }} reversed axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fontFamily: 'Tajawal' }} orientation="right" axisLine={false} tickLine={false} tickFormatter={(v) => `${v / 1000}K`} />
              <Tooltip
                contentStyle={{ borderRadius: 12, border: '1px solid #E5E7EB', fontFamily: 'Tajawal' }}
                formatter={(v) => [`${formatNumberAr(v)} ر.س`, 'الإيراد']}
              />
              <Area type="monotone" dataKey="value" stroke="#0D4F4E" strokeWidth={2.5} fill="url(#rev)" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="توزيع الباقات" subtitle="حسب عدد المشتركين">
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={packageDistribution} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={2}>
                {packageDistribution.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #E5E7EB', fontFamily: 'Tajawal' }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-2">
            {packageDistribution.map((p) => (
              <div key={p.name} className="flex items-center gap-2 text-xs">
                <span className="w-2.5 h-2.5 rounded-sm" style={{ background: p.color }} />
                <span className="flex-1 font-bold">{p.name}</span>
                <span className="font-extrabold tabular">{toArabicDigits(p.value)}٪</span>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>

      {/* No-show + Trainers */}
      <div className="grid lg:grid-cols-2 gap-5">
        <ChartCard title="معدل الـ No-show الأسبوعي" subtitle="مع خط الهدف ٥٪">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={noShowWeekly}>
              <CartesianGrid stroke="#E5E7EB" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="week" tick={{ fontSize: 11, fontFamily: 'Tajawal' }} reversed axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fontFamily: 'Tajawal' }} orientation="right" axisLine={false} tickLine={false} tickFormatter={(v) => `${v}٪`} />
              <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #E5E7EB', fontFamily: 'Tajawal' }} formatter={(v) => [`${v}٪`, 'No-show']} />
              <ReferenceLine y={5} stroke="#10B981" strokeDasharray="4 4" strokeWidth={2} />
              <Bar dataKey="value" fill="#FF6B6B" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="أداء المدربين" subtitle="أفضل ٥ مدربين هذا الشهر">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={trainerPerformance} layout="vertical">
              <CartesianGrid stroke="#E5E7EB" strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fontFamily: 'Tajawal' }} orientation="top" axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fontFamily: 'Tajawal' }} orientation="right" axisLine={false} tickLine={false} width={90} />
              <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #E5E7EB', fontFamily: 'Tajawal' }} formatter={(v) => [`${toArabicDigits(v)} جلسة`, '']} />
              <Bar dataKey="sessions" fill="#0D4F4E" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Heatmap */}
      <ChartCard title="أكثر الأوقات حجزاً" subtitle="حدة اللون = حجوزات أكثر">
        <Heatmap peakHeatmap={peakHeatmap} />
      </ChartCard>

      {/* Funnel */}
      <ChartCard title="رحلة العميل" subtitle="من leads إلى عملاء محتفظ بهم">
        <Funnel data={funnel} />
      </ChartCard>
    </div>
  )
}

function ChartCard({ children, title, subtitle, className }) {
  return (
    <div className={cn('card p-5 sm:p-6', className)}>
      <div className="mb-4">
        <h3 className="font-extrabold text-ink-primary">{title}</h3>
        {subtitle && <p className="text-xs text-ink-tertiary mt-0.5">{subtitle}</p>}
      </div>
      {children}
    </div>
  )
}

function Heatmap({ peakHeatmap }) {
  const intensities = ['bg-bg', 'bg-brand-50', 'bg-brand-100', 'bg-brand-300', 'bg-brand-500', 'bg-brand-700']
  if (!peakHeatmap || !peakHeatmap.hours || !peakHeatmap.days || !peakHeatmap.grid) {
    return <div className="text-sm text-ink-tertiary">جاري التحميل...</div>
  }
  return (
    <div className="overflow-x-auto -mx-2">
      <div className="min-w-[700px] px-2">
        <div className="grid grid-cols-[60px_repeat(18,1fr)] gap-1 text-[10px]">
          <div />
          {peakHeatmap.hours.map((h) => (
            <div key={h} className="text-center tabular text-ink-tertiary font-bold">{toArabicDigits(h)}</div>
          ))}
          {peakHeatmap.days.map((d, di) => (
            <Fragment key={`row-${di}`}>
              <div className="text-right pr-1 font-bold text-ink-secondary self-center">{d}</div>
              {(peakHeatmap.grid[di] || []).map((v, hi) => (
                <div
                  key={`${di}-${hi}`}
                  className={cn('aspect-square rounded-md', intensities[v])}
                  title={`${peakHeatmap.days[di]} ${peakHeatmap.hours[hi]}:00 — ${v} حجز`}
                />
              ))}
            </Fragment>
          ))}
        </div>
        <div className="flex items-center justify-end gap-2 mt-4 text-[10px] text-ink-tertiary">
          <span className="font-bold">أقل</span>
          {intensities.map((c, i) => (
            <span key={i} className={cn('w-4 h-4 rounded-sm', c)} />
          ))}
          <span className="font-bold">أكثر</span>
        </div>
      </div>
    </div>
  )
}

function Funnel({ data }) {
  if (!data || !data.length) return <div className="text-sm text-ink-tertiary">جاري التحميل...</div>
  const max = data[0].value || 1
  const colors = ['#0D4F4E', '#1A6E6D', '#3F8E8C', '#73B3B0']
  return (
    <div className="space-y-3">
      {data.map((f, i) => {
        const pct = (f.value / max) * 100
        const conv = i > 0 ? Math.round((f.value / data[i - 1].value) * 100) : 100
        return (
          <div key={f.stage}>
            <div className="flex items-center justify-between mb-1 text-xs">
              <span className="font-extrabold text-ink-primary">{f.stage}</span>
              <div className="flex items-center gap-3">
                {i > 0 && (
                  <span className="text-[10px] font-extrabold text-ink-tertiary tabular">{toArabicDigits(conv)}٪ تحويل</span>
                )}
                <span className="font-extrabold tabular">{toArabicDigits(f.value)}</span>
              </div>
            </div>
            <div className="h-9 bg-bg rounded-lg overflow-hidden relative">
              <div
                className="h-full rounded-lg transition-all"
                style={{ width: `${pct}%`, background: `linear-gradient(135deg, ${colors[i]} 0%, ${colors[i]}dd 100%)` }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}
