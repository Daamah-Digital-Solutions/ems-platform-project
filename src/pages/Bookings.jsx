import { Link } from 'react-router-dom'
import { useState } from 'react'
import { ChevronRight, ChevronLeft, Plus, Calendar as CalIcon } from 'lucide-react'
import { bookingsApi, resourcesApi } from '../lib/api.js'
import { useApi } from '../lib/useApi.js'
import { cn, toArabicDigits } from '../lib/utils.js'

function statusColor(status) {
  switch (status) {
    case 'مؤكد':
      return { bg: 'bg-blue-50 border-blue-200', text: 'text-blue-900', dot: 'bg-blue-500' }
    case 'جاري':
      return { bg: 'bg-emerald-50 border-emerald-300 ring-2 ring-emerald-100', text: 'text-emerald-900', dot: 'bg-emerald-500 animate-pulse' }
    case 'مكتمل':
      return { bg: 'bg-gray-50 border-gray-200', text: 'text-gray-700', dot: 'bg-gray-400' }
    case 'لم يحضر':
      return { bg: 'bg-red-50 border-red-200 border-dashed', text: 'text-red-900 line-through', dot: 'bg-red-500' }
    case 'ملغي':
      return { bg: 'bg-gray-50 border-gray-200 border-dashed', text: 'text-gray-500 line-through', dot: 'bg-gray-400' }
    default:
      return { bg: 'bg-gray-50 border-gray-200', text: 'text-gray-700', dot: 'bg-gray-400' }
  }
}

const HOURS = Array.from({ length: 18 }, (_, i) => 6 + i) // 6am - 11pm
const PRAYER_HOURS = { 12: 'الظهر', 15: 'العصر', 18: 'المغرب', 19: 'العشاء' }
const DAY_NAMES = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت']
const MONTH_NAMES = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر']

// ---- date helpers (local, timezone-naive to match backend storage) ----
const pad = (n) => String(n).padStart(2, '0')
const ymd = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
const naive = (d) => `${ymd(d)}T00:00:00`
const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x }
const sameDay = (a, b) => ymd(a) === ymd(b)
// Saudi week starts Saturday
const startOfWeek = (d) => addDays(d, -((d.getDay() + 1) % 7))
const fmtFull = (d) => `${DAY_NAMES[d.getDay()]}، ${toArabicDigits(d.getDate())} ${MONTH_NAMES[d.getMonth()]} ${toArabicDigits(d.getFullYear())}`
const fmtTime = (d) => {
  let h = d.getHours()
  const period = h < 12 ? 'ص' : 'م'
  const dh = h === 0 ? 12 : h > 12 ? h - 12 : h
  return `${toArabicDigits(dh)}:${toArabicDigits(pad(d.getMinutes()))} ${period}`
}

export default function Bookings() {
  const [view, setView] = useState('day')
  const [current, setCurrent] = useState(new Date())

  // Range covering the active view (timezone-naive ISO so the backend matches)
  let rangeStart, rangeEnd
  if (view === 'day') { rangeStart = current; rangeEnd = addDays(current, 1) }
  else if (view === 'week') { rangeStart = startOfWeek(current); rangeEnd = addDays(rangeStart, 7) }
  else {
    const monthStart = new Date(current.getFullYear(), current.getMonth(), 1)
    rangeStart = startOfWeek(monthStart)
    rangeEnd = addDays(rangeStart, 42)
  }

  const rangeKey = `${view}_${ymd(rangeStart)}`
  const { data: bookings = [], loading } = useApi(
    () => bookingsApi.list({ start: naive(rangeStart), end: naive(rangeEnd) }),
    [rangeKey]
  )
  const { data: machines = [] } = useApi(() => resourcesApi.listMachines())
  const list = (bookings || []).map((b) => ({ ...b, _d: new Date(b.start_time) }))
  const machinesList = machines || []

  // Stats for the visible range
  const stats = {
    total: list.length,
    done: list.filter((b) => b.status === 'مكتمل').length,
    upcoming: list.filter((b) => b.status === 'مؤكد' || b.status === 'جاري').length,
    noshow: list.filter((b) => b.status === 'لم يحضر').length,
  }

  const step = view === 'month' ? null : view === 'week' ? 7 : 1
  const goPrev = () => setCurrent((d) => view === 'month' ? new Date(d.getFullYear(), d.getMonth() - 1, 1) : addDays(d, -step))
  const goNext = () => setCurrent((d) => view === 'month' ? new Date(d.getFullYear(), d.getMonth() + 1, 1) : addDays(d, step))

  const navLabel = view === 'month'
    ? `${MONTH_NAMES[current.getMonth()]} ${toArabicDigits(current.getFullYear())}`
    : view === 'week'
    ? `أسبوع ${toArabicDigits(startOfWeek(current).getDate())} ${MONTH_NAMES[startOfWeek(current).getMonth()]}`
    : fmtFull(current)

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="page-title">الحجوزات</h1>
          <p className="page-subtitle">{fmtFull(new Date())}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex items-center gap-0.5 p-1 rounded-lg bg-bg border border-border/60">
            {[{ k: 'day', l: 'يومي' }, { k: 'week', l: 'أسبوعي' }, { k: 'month', l: 'شهري' }].map((v) => (
              <button
                key={v.k}
                onClick={() => setView(v.k)}
                className={cn(
                  'px-3 h-8 rounded-md text-xs font-extrabold transition-all',
                  view === v.k ? 'bg-white shadow-sm text-ink-primary' : 'text-ink-secondary hover:text-ink-primary'
                )}
              >
                {v.l}
              </button>
            ))}
          </div>
          <button onClick={() => setCurrent(new Date())} className="btn-secondary btn-sm">اليوم</button>
          <Link to="/bookings/new" className="btn-primary btn-sm">
            <Plus className="w-4 h-4" /> حجز جديد
          </Link>
        </div>
      </div>

      {/* Date nav */}
      <div className="card px-4 py-3 flex items-center justify-between">
        <button onClick={goPrev} className="w-9 h-9 rounded-lg hover:bg-bg flex items-center justify-center">
          <ChevronRight className="w-4 h-4" />
        </button>
        <div className="text-center">
          <div className="text-xs text-ink-tertiary">{view === 'day' ? 'اليوم المحدد' : view === 'week' ? 'الأسبوع' : 'الشهر'}</div>
          <div className="font-extrabold text-ink-primary">{navLabel}</div>
        </div>
        <button onClick={goNext} className="w-9 h-9 rounded-lg hover:bg-bg flex items-center justify-center">
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { v: stats.total, l: view === 'day' ? 'حجوزات اليوم' : view === 'week' ? 'حجوزات الأسبوع' : 'حجوزات الشهر', c: 'text-brand' },
          { v: stats.done, l: 'مكتملة', c: 'text-emerald-600' },
          { v: stats.upcoming, l: 'قادمة', c: 'text-blue-600' },
          { v: stats.noshow, l: 'لم يحضر', c: 'text-red-600' }
        ].map((s) => (
          <div key={s.l} className="card p-3 text-center">
            <div className={cn('text-2xl font-extrabold tabular', s.c)}>{toArabicDigits(s.v)}</div>
            <div className="text-[10px] text-ink-tertiary font-bold mt-0.5">{s.l}</div>
          </div>
        ))}
      </div>

      {loading && <div className="card p-12 text-center text-ink-tertiary font-bold">جاري التحميل...</div>}

      {!loading && view === 'day' && <DayView bookings={list} machines={machinesList} />}
      {!loading && view === 'week' && <WeekView bookings={list} current={current} onPickDay={(d) => { setCurrent(d); setView('day') }} />}
      {!loading && view === 'month' && <MonthView bookings={list} current={current} onPickDay={(d) => { setCurrent(d); setView('day') }} />}

      {/* Legend */}
      <div className="card p-4 flex flex-wrap items-center gap-4 text-xs">
        <span className="font-extrabold text-ink-secondary">دليل الألوان:</span>
        {[
          { c: 'bg-blue-500', l: 'مؤكد' },
          { c: 'bg-emerald-500', l: 'جاري' },
          { c: 'bg-gray-400', l: 'مكتمل' },
          { c: 'bg-red-500', l: 'لم يحضر' }
        ].map((x) => (
          <span key={x.l} className="inline-flex items-center gap-1.5">
            <span className={cn('w-2.5 h-2.5 rounded-full', x.c)} />
            <span className="font-bold">{x.l}</span>
          </span>
        ))}
      </div>
    </div>
  )
}

function DayView({ bookings, machines }) {
  const cols = machines.length || 1
  const gridCols = `80px repeat(${cols}, minmax(120px, 1fr))`

  if (machines.length === 0) {
    return <div className="card p-12 text-center text-ink-tertiary font-bold">لا توجد أجهزة معرّفة بعد.</div>
  }

  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <div style={{ minWidth: 140 * cols + 80 }}>
          {/* Header: machine labels */}
          <div className="grid border-b border-border/60 bg-bg/50" style={{ gridTemplateColumns: gridCols }}>
            <div className="px-3 py-3 text-[10px] font-extrabold uppercase tracking-wider text-ink-tertiary border-l border-border/60">الوقت</div>
            {machines.map((m) => (
              <div key={m.id} className="px-3 py-3 text-center border-l border-border/60 last:border-l-0">
                <div className="text-xs font-extrabold text-ink-primary">{m.label}</div>
                <div className="text-[10px] text-ink-tertiary">{m.model}</div>
              </div>
            ))}
          </div>

          {/* Hours */}
          {HOURS.map((h) => {
            const isPrayer = PRAYER_HOURS[h]
            const period = h < 12 ? 'ص' : 'م'
            const displayHour = h === 0 ? 12 : h > 12 ? h - 12 : h
            return (
              <div key={h}>
                {isPrayer && (
                  <div className="grid bg-gradient-to-bl from-amber-50 to-bg border-y border-amber-200/60" style={{ gridTemplateColumns: gridCols }}>
                    <div className="px-3 py-2 text-[10px] font-extrabold text-amber-800 border-l border-amber-200/60">{toArabicDigits(displayHour)}:٠٠</div>
                    <div className="px-3 py-2 flex items-center gap-2 text-xs font-extrabold text-amber-800" style={{ gridColumn: `span ${cols}` }}>
                      🕌 صلاة {isPrayer} — يفضّل عدم الحجز
                    </div>
                  </div>
                )}
                <div className="grid border-b border-border/40" style={{ gridTemplateColumns: gridCols }}>
                  <div className="px-3 py-3 text-[11px] tabular font-extrabold text-ink-secondary border-l border-border/60 bg-bg/30 flex flex-col items-center justify-center">
                    <span>{toArabicDigits(displayHour)}:٠٠</span>
                    <span className="text-[9px] text-ink-tertiary font-bold">{period}</span>
                  </div>
                  {machines.map((m) => {
                    const cell = bookings.filter((b) => b.machine_id === m.id && b._d.getHours() === h)
                    if (cell.length > 0) {
                      return (
                        <div key={m.id} className="px-2 py-2 border-l border-border/40 last:border-l-0 space-y-1">
                          {cell.map((b) => {
                            const s = statusColor(b.status)
                            return (
                              <div key={b.id} className={cn('rounded-lg p-2 border', s.bg, s.text)}>
                                <div className="flex items-center gap-1.5 mb-1">
                                  <span className={cn('w-1.5 h-1.5 rounded-full', s.dot)} />
                                  <span className="text-[9px] font-extrabold opacity-80 tabular">{fmtTime(b._d)}</span>
                                </div>
                                <div className="font-extrabold text-xs truncate">{b.client_name}</div>
                                <div className="text-[10px] opacity-75 truncate">{b.trainer_name}</div>
                              </div>
                            )
                          })}
                        </div>
                      )
                    }
                    return (
                      <Link
                        key={m.id}
                        to="/bookings/new"
                        className="border-l border-border/40 last:border-l-0 hover:bg-brand-50/20 transition-colors group min-h-[60px] flex items-center justify-center"
                      >
                        <span className="opacity-0 group-hover:opacity-100 text-xs text-brand font-extrabold">+ حجز</span>
                      </Link>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function WeekView({ bookings, current, onPickDay }) {
  const weekStart = startOfWeek(current)
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
  return (
    <div className="card overflow-hidden">
      <div className="grid grid-cols-7 divide-x divide-x-reverse divide-border/40">
        {days.map((d) => {
          const dayBookings = bookings
            .filter((b) => sameDay(b._d, d))
            .sort((a, b) => a._d - b._d)
          const isToday = sameDay(d, new Date())
          return (
            <div key={ymd(d)} className="min-h-[320px]">
              <button
                onClick={() => onPickDay(d)}
                className={cn('w-full px-2 py-3 text-center border-b border-border/60 hover:bg-bg/60 transition-colors',
                  isToday ? 'bg-brand-50' : 'bg-bg/40')}
              >
                <div className="text-[10px] font-bold text-ink-tertiary">{DAY_NAMES[d.getDay()]}</div>
                <div className={cn('text-lg font-extrabold tabular', isToday ? 'text-brand' : 'text-ink-primary')}>{toArabicDigits(d.getDate())}</div>
              </button>
              <div className="p-1.5 space-y-1.5">
                {dayBookings.length === 0 && <div className="text-center text-[10px] text-ink-tertiary py-4">—</div>}
                {dayBookings.map((b) => {
                  const s = statusColor(b.status)
                  return (
                    <div key={b.id} className={cn('rounded-lg p-1.5 border', s.bg, s.text)}>
                      <div className="text-[9px] font-extrabold opacity-80 tabular">{fmtTime(b._d)}</div>
                      <div className="font-extrabold text-[11px] truncate">{b.client_name}</div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function MonthView({ bookings, current, onPickDay }) {
  const monthStart = new Date(current.getFullYear(), current.getMonth(), 1)
  const gridStart = startOfWeek(monthStart)
  const cells = Array.from({ length: 42 }, (_, i) => addDays(gridStart, i))
  return (
    <div className="card overflow-hidden">
      <div className="grid grid-cols-7 bg-bg/50 border-b border-border/60">
        {['السبت', 'الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'].map((d) => (
          <div key={d} className="px-2 py-2 text-center text-[10px] font-extrabold text-ink-tertiary">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {cells.map((d) => {
          const inMonth = d.getMonth() === current.getMonth()
          const count = bookings.filter((b) => sameDay(b._d, d)).length
          const isToday = sameDay(d, new Date())
          return (
            <button
              key={ymd(d)}
              onClick={() => onPickDay(d)}
              className={cn(
                'min-h-[84px] p-2 border-b border-l border-border/40 text-right hover:bg-brand-50/30 transition-colors flex flex-col',
                !inMonth && 'bg-bg/30 opacity-50'
              )}
            >
              <span className={cn('text-xs font-extrabold tabular self-start w-6 h-6 flex items-center justify-center rounded-full',
                isToday ? 'bg-brand text-white' : 'text-ink-primary')}>
                {toArabicDigits(d.getDate())}
              </span>
              {count > 0 && (
                <span className="mt-auto inline-flex items-center gap-1 text-[10px] font-extrabold text-brand">
                  <CalIcon className="w-3 h-3" /> {toArabicDigits(count)} حجز
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
