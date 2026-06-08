import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import {
  ArrowRight,
  ArrowLeft,
  Search,
  Check,
  AlertTriangle,
  Sparkles,
  PartyPopper,
  Calendar,
  Clock,
  Users,
  Cpu,
  Layers
} from 'lucide-react'
import { clientsApi, trainersApi, resourcesApi, bookingsApi } from '../lib/api.js'
import { useApi } from '../lib/useApi.js'
import { cn, toArabicDigits, initials, avatarColor } from '../lib/utils.js'

const STEPS = ['العميل', 'الوقت', 'المدرب', 'الجهاز', 'تأكيد']
const TIME_SLOTS = [
  '6:00', '6:30', '7:00', '7:30', '8:00', '8:30', '9:00',
  '10:00', '10:30', '11:00', '11:30',
  '1:00', '2:00', '3:00', '4:00', '4:30', '5:00', '5:30', '6:00', '6:30', '7:00', '7:30'
]
const BOOKED = new Set(['6:00', '6:30', '7:30', '11:00', '5:00', '5:30'])
const PRAYER = new Set(['12:00', '3:30', '6:00'])

export default function NewBooking() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const preClientId = searchParams.get('client')
  const [step, setStep] = useState(0)
  const [done, setDone] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [data, setData] = useState({
    client: null,
    time: '',
    trainer: null,
    machine: null,
    suit: null,
    note: '',
    parqAck: false
  })
  const set = (p) => setData((d) => ({ ...d, ...p }))

  // Preselect a client coming from "حجز" on the clients page, and skip the picker step.
  useEffect(() => {
    if (!preClientId) return
    let active = true
    clientsApi.get(Number(preClientId))
      .then((c) => {
        if (!active || !c) return
        setData((d) => ({ ...d, client: c }))
        setStep((s) => (s === 0 ? 1 : s))
      })
      .catch(() => {})
    return () => { active = false }
  }, [preClientId])

  if (done) return <Success data={data} onGo={() => navigate('/bookings')} />

  const canNext = [
    () => !!data.client,
    () => !!data.time,
    () => !!data.trainer,
    () => !!data.machine && !!data.suit,
    () => ((data.client?.parq_flags?.length || data.client?.parqFlags?.length) ? data.parqAck : true)
  ][step]()

  async function submit() {
    setSubmitting(true)
    setSubmitError('')
    try {
      // Compose start_time: today + chosen HH:MM (the wizard uses arabic-friendly slot like "5:30" meaning PM later)
      const now = new Date()
      const [hStr, mStr] = data.time.split(':')
      let h = parseInt(hStr)
      const m = parseInt(mStr || '0')
      // Times like 1:00..7:30 are PM in the wizard semantics
      if (h >= 1 && h <= 9) h += 12
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m, 0, 0)
      await bookingsApi.create({
        client_id: data.client.id,
        trainer_id: data.trainer.id,
        machine_id: data.machine.id,
        suit_id: data.suit?.id,
        start_time: start.toISOString(),
        duration_min: 20,
        note: data.note || undefined,
        parq_ack: !!data.parqAck,
      })
      setDone(true)
    } catch (e) {
      setSubmitError(e.message || 'فشل إنشاء الحجز')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <Link to="/bookings" className="inline-flex items-center gap-1.5 text-sm font-bold text-ink-secondary hover:text-brand">
            <ArrowRight className="w-4 h-4" />
            العودة
          </Link>
          <h1 className="page-title mt-1">حجز جديد</h1>
        </div>
      </div>

      {/* Stepper */}
      <div className="card p-4">
        <div className="flex items-center gap-2">
          {STEPS.map((label, i) => (
            <div key={label} className="flex-1 flex items-center gap-2">
              <div className="flex-1 flex items-center gap-2">
                <span
                  className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center text-xs font-extrabold flex-shrink-0',
                    i < step ? 'bg-emerald-500 text-white' :
                    i === step ? 'bg-brand text-white shadow-glow' :
                    'bg-bg text-ink-tertiary'
                  )}
                >
                  {i < step ? <Check className="w-4 h-4" strokeWidth={3} /> : toArabicDigits(i + 1)}
                </span>
                <span className={cn('text-xs font-extrabold hidden sm:inline', i === step ? 'text-brand' : 'text-ink-secondary')}>
                  {label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <span className={cn('flex-1 h-0.5 rounded-full', i < step ? 'bg-emerald-500' : 'bg-bg')} />
              )}
            </div>
          ))}
        </div>
      </div>

      {step === 0 && <StepClient data={data} set={set} />}
      {step === 1 && <StepTime data={data} set={set} />}
      {step === 2 && <StepTrainer data={data} set={set} />}
      {step === 3 && <StepResource data={data} set={set} />}
      {step === 4 && <StepConfirm data={data} set={set} />}

      {submitError && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-800 text-sm font-bold flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{submitError}</span>
        </div>
      )}

      <div className="flex items-center justify-between">
        <button
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0 || submitting}
          className="btn-ghost disabled:opacity-30"
        >
          <ArrowRight className="w-4 h-4" /> السابق
        </button>
        <button
          onClick={() => {
            if (step === STEPS.length - 1) submit()
            else setStep((s) => Math.min(STEPS.length - 1, s + 1))
          }}
          disabled={!canNext || submitting}
          className={cn(step === STEPS.length - 1 ? 'btn-accent' : 'btn-primary')}
        >
          {step === STEPS.length - 1 ? (
            submitting ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                جاري الحجز...
              </>
            ) : (
              <>
                <Check className="w-4 h-4" /> تأكيد الحجز
              </>
            )
          ) : (
            <>
              متابعة <ArrowLeft className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  )
}

function StepClient({ data, set }) {
  const [q, setQ] = useState('')
  const { data: clients = [] } = useApi(() => clientsApi.list({ q: q || undefined }), [q])
  const filtered = clients || []
  return (
    <div className="card p-5 sm:p-6">
      <h3 className="font-extrabold text-ink-primary mb-1">اختر العميل</h3>
      <p className="text-sm text-ink-secondary mb-4">ابحث عن عميل أو اختر من القائمة.</p>
      <div className="relative mb-4">
        <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-ink-tertiary" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="ابحث عن عميل..."
          className="input"
          style={{ paddingInlineStart: '40px' }}
        />
      </div>

      {/* Recent chips */}
      <div className="mb-4">
        <div className="text-[10px] font-extrabold uppercase tracking-wider text-ink-tertiary mb-2">آخر العملاء</div>
        <div className="flex flex-wrap gap-2">
          {filtered.slice(0, 5).map((c) => (
            <button
              key={c.id}
              onClick={() => set({ client: c })}
              className={cn(
                'inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border transition-all',
                data.client?.id === c.id
                  ? 'bg-brand text-white border-brand'
                  : 'bg-bg text-ink-secondary border-border hover:border-brand-200'
              )}
            >
              {c.name_ar.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Result list */}
      <div className="space-y-2 max-h-[400px] overflow-y-auto">
        {filtered.map((c) => {
          const selected = data.client?.id === c.id
          return (
            <button
              key={c.id}
              onClick={() => set({ client: c })}
              className={cn(
                'w-full flex items-center gap-3 p-3 rounded-xl border transition-all',
                selected ? 'bg-brand-50/60 border-brand' : 'bg-white border-border hover:border-brand-200 hover:bg-bg/60'
              )}
            >
              <span className={cn('w-10 h-10 rounded-full flex items-center justify-center font-extrabold text-xs flex-shrink-0', avatarColor(c.name_ar))}>
                {initials(c.name_ar)}
              </span>
              <div className="flex-1 text-right min-w-0">
                <div className="font-extrabold text-sm">{c.name_ar}</div>
                <div className="text-[11px] text-ink-tertiary">
                  {(c.active_package || c.package) || '—'} • {typeof c.remaining === 'string' ? c.remaining : toArabicDigits(c.remaining ?? 0)} متبقي
                  {(c.preferred_trainer_name || c.preferredTrainer) && ` • ${c.preferred_trainer_name || c.preferredTrainer}`}
                </div>
              </div>
              <div className="flex flex-col items-end gap-1 flex-shrink-0">
                {(c.parq_flags?.length || c.parqFlags?.length) > 0 && (
                  <span className="badge-warning text-[9px]">
                    <AlertTriangle className="w-2.5 h-2.5" /> PAR-Q
                  </span>
                )}
                {selected && <Check className="w-5 h-5 text-brand" strokeWidth={3} />}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

function StepTime({ data, set }) {
  return (
    <div className="card p-5 sm:p-6">
      <h3 className="font-extrabold text-ink-primary mb-1">اختر التاريخ والوقت</h3>
      <p className="text-sm text-ink-secondary mb-4">الأوقات المظللة بالأمان متاحة. الأوقات الرمادية محجوزة أو وقت صلاة.</p>
      <div className="mb-5 grid grid-cols-7 gap-2">
        {['السبت', 'الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'].map((d, i) => (
          <button
            key={d}
            className={cn(
              'rounded-lg p-2 text-center border transition-all',
              i === 0 ? 'bg-brand text-white border-brand' : 'bg-bg border-border hover:border-brand-200'
            )}
          >
            <div className="text-[10px] font-bold opacity-80">{d.slice(0, 3)}</div>
            <div className="text-lg font-extrabold tabular">{toArabicDigits(12 + i)}</div>
          </button>
        ))}
      </div>

      <div className="text-xs font-extrabold uppercase tracking-wider text-ink-tertiary mb-2">الأوقات المتاحة</div>
      <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2">
        {TIME_SLOTS.map((t, ti) => {
          const booked = BOOKED.has(t)
          const prayer = PRAYER.has(t)
          const disabled = booked || prayer
          const selected = data.time === t
          return (
            <button
              key={`${t}-${ti}`}
              disabled={disabled}
              onClick={() => set({ time: t })}
              className={cn(
                'h-12 rounded-lg text-sm font-extrabold tabular border transition-all',
                disabled && !selected
                  ? 'bg-bg text-ink-tertiary border-border cursor-not-allowed line-through'
                  : selected
                  ? 'bg-brand text-white border-brand shadow-glow'
                  : 'bg-white text-ink-primary border-border hover:border-brand-200 hover:bg-brand-50/30'
              )}
            >
              {toArabicDigits(t)}
              {prayer && <span className="block text-[8px] font-bold text-amber-600">صلاة</span>}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function StepTrainer({ data, set }) {
  const { data: trainers = [] } = useApi(() => trainersApi.list())
  const list = (trainers || []).filter((t) => t.status !== 'إجازة')
  const preferredName = data.client?.preferred_trainer_name || data.client?.preferredTrainer
  return (
    <div className="card p-5 sm:p-6">
      <h3 className="font-extrabold text-ink-primary mb-1">اختر المدرب</h3>
      <p className="text-sm text-ink-secondary mb-4">المدربين المتاحين في الوقت المختار.</p>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {list.map((t) => {
          const preferred = preferredName === t.name_ar
          const selected = data.trainer?.id === t.id
          return (
            <button
              key={t.id}
              onClick={() => set({ trainer: t })}
              className={cn(
                'p-4 rounded-2xl border-2 text-right transition-all relative',
                selected ? 'border-brand bg-brand-50/40 shadow-card' :
                preferred ? 'border-amber-300 bg-amber-50/30' :
                'border-border bg-white hover:border-brand-200'
              )}
            >
              {preferred && (
                <span className="absolute top-3 left-3 inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-amber-500 text-white text-[9px] font-extrabold">
                  ⭐ المفضل
                </span>
              )}
              <div className="flex items-center gap-3 mb-3">
                <span className="w-11 h-11 rounded-full bg-brand-gradient text-white flex items-center justify-center font-extrabold text-sm">
                  {t.initials}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="font-extrabold text-sm truncate">{t.name_ar}</div>
                  <div className="text-[10px] text-ink-tertiary truncate">{t.specialty}</div>
                </div>
              </div>
              <div className="flex items-center justify-between text-[10px]">
                <span className="badge-success">
                  <Check className="w-2.5 h-2.5" strokeWidth={3} /> {t.certification}
                </span>
                <span className="text-ink-tertiary">⭐ {toArabicDigits(t.rating)}</span>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

function StepResource({ data, set }) {
  const suitSize = data.client?.suit_size || data.client?.suitSize || 'M'
  const { data: machines = [] } = useApi(() => resourcesApi.listMachines())
  const { data: suits = [] } = useApi(() => resourcesApi.listSuits(suitSize), [suitSize])
  const availableMachines = (machines || []).filter((m) => m.status !== 'صيانة مجدولة')
  const matchedSuits = (suits || []).filter((s) => s.status === 'متاح')
  return (
    <div className="space-y-5">
      <div className="card p-5 sm:p-6">
        <h3 className="font-extrabold text-ink-primary mb-1">اختر الجهاز</h3>
        <p className="text-sm text-ink-secondary mb-4">الأجهزة المتاحة في الوقت المختار.</p>
        <div className="grid sm:grid-cols-3 gap-3">
          {availableMachines.map((m) => {
            const selected = data.machine?.id === m.id
            return (
              <button
                key={m.id}
                onClick={() => set({ machine: m })}
                className={cn(
                  'p-4 rounded-2xl border-2 text-right transition-all',
                  selected ? 'border-brand bg-brand-50/40' : 'border-border bg-white hover:border-brand-200'
                )}
              >
                <div className="flex items-center gap-3 mb-2">
                  <span className={cn('w-10 h-10 rounded-lg flex items-center justify-center', selected ? 'bg-brand text-white' : 'bg-brand-50 text-brand')}>
                    <Cpu className="w-5 h-5" />
                  </span>
                  <div>
                    <div className="font-extrabold text-sm">{m.label}</div>
                    <div className="text-[10px] text-ink-tertiary">{m.model}</div>
                  </div>
                </div>
                <span className="badge-success">
                  <Check className="w-2.5 h-2.5" strokeWidth={3} /> متاح
                </span>
              </button>
            )
          })}
        </div>
      </div>

      <div className="card p-5 sm:p-6">
        <h3 className="font-extrabold text-ink-primary mb-1">اختر البدلة</h3>
        <p className="text-sm text-ink-secondary mb-4">
          مقاس العميل: <strong>{suitSize}</strong> — البدلات المتاحة بهذا المقاس.
        </p>
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
          {matchedSuits.slice(0, 6).map((s) => {
            const selected = data.suit?.id === s.id
            const numFromLabel = String(s.label || '').match(/\d+/)?.[0] || String(s.id)
            return (
              <button
                key={s.id}
                onClick={() => set({ suit: s })}
                className={cn(
                  'h-20 rounded-xl border-2 flex flex-col items-center justify-center transition-all',
                  selected ? 'border-brand bg-brand-50/40' : 'border-border bg-white hover:border-brand-200'
                )}
              >
                <Layers className={cn('w-5 h-5 mb-1', selected ? 'text-brand' : 'text-ink-tertiary')} />
                <div className="text-xs font-extrabold">#{numFromLabel}</div>
                <div className="text-[9px] text-ink-tertiary tabular">{toArabicDigits(s.washes)} غسلة</div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function StepConfirm({ data, set }) {
  const flags = data.client?.parq_flags || data.client?.parqFlags || []
  const hasFlags = flags.length > 0
  const suitNum = data.suit?.label ? String(data.suit.label).match(/\d+/)?.[0] : String(data.suit?.id || '')
  return (
    <div className="space-y-5">
      <div className="card p-5 sm:p-6">
        <h3 className="font-extrabold text-ink-primary mb-1">تأكيد الحجز</h3>
        <p className="text-sm text-ink-secondary mb-5">راجع التفاصيل قبل التأكيد.</p>

        <div className="space-y-3">
          {[
            { i: Users, l: 'العميل', v: data.client?.name_ar },
            { i: Clock, l: 'الوقت', v: `${toArabicDigits(data.time)} م` },
            { i: Users, l: 'المدرب', v: data.trainer?.name_ar },
            { i: Cpu, l: 'الجهاز', v: data.machine?.label },
            { i: Layers, l: 'البدلة', v: `#${suitNum} (${data.client?.suit_size || data.client?.suitSize || 'M'})` }
          ].map((row) => (
            <div key={row.l} className="flex items-center gap-3 p-3 rounded-xl bg-bg/50 border border-border/40">
              <span className="w-9 h-9 rounded-lg bg-white text-brand flex items-center justify-center shadow-sm">
                <row.i className="w-4 h-4" />
              </span>
              <span className="text-sm text-ink-secondary font-bold flex-1">{row.l}</span>
              <span className="font-extrabold text-ink-primary">{row.v}</span>
            </div>
          ))}
        </div>

        <div className="mt-5">
          <label className="label">ملاحظات (اختياري)</label>
          <textarea
            value={data.note}
            onChange={(e) => set({ note: e.target.value })}
            rows={2}
            className="w-full bg-bg border border-border rounded-lg p-3 text-sm focus:outline-none focus:border-brand"
            placeholder="أي ملاحظة خاصة بالجلسة..."
          />
        </div>
      </div>

      {hasFlags && (
        <div className="p-5 rounded-2xl bg-red-50 border-2 border-red-200">
          <div className="flex items-start gap-3 mb-3">
            <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-extrabold text-red-900">تنبيه PAR-Q</div>
              <p className="text-sm text-red-800 mt-1">
                العميل لديه تنبيهات صحية: {flags.join('، ')}. يجب على المدرب التأكيد قبل بدء الجلسة.
              </p>
            </div>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={data.parqAck}
              onChange={(e) => set({ parqAck: e.target.checked })}
              className="w-4 h-4 accent-brand"
            />
            <span className="text-sm font-bold text-red-900">
              أؤكد أنني اطلعت على الحالات الصحية وسأتخذ الاحتياطات اللازمة
            </span>
          </label>
        </div>
      )}
    </div>
  )
}

function Success({ data, onGo }) {
  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="text-center max-w-md animate-slide-up">
        <div className="w-24 h-24 mx-auto rounded-[28px] bg-brand-gradient flex items-center justify-center shadow-glow-lg mb-6 relative animate-bounce-subtle">
          <PartyPopper className="w-12 h-12 text-white" />
          <span className="absolute -top-2 -right-2 w-7 h-7 bg-accent rounded-full flex items-center justify-center animate-pulse">
            <Sparkles className="w-3.5 h-3.5 text-white" />
          </span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight">تم الحجز بنجاح!</h1>
        <p className="text-ink-secondary mt-3">
          تم حجز جلسة <strong>{data.client?.name_ar}</strong> مع <strong>{data.trainer?.name_ar}</strong> في تمام الساعة <strong className="tabular">{toArabicDigits(data.time)} م</strong>.
        </p>
        <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-extrabold">
          <Check className="w-3.5 h-3.5" strokeWidth={3} />
          تذكير واتساب سيُرسل تلقائياً قبل ساعة
        </div>
        <div className="mt-7 flex flex-wrap items-center justify-center gap-2">
          <button onClick={onGo} className="btn-primary">
            <Calendar className="w-4 h-4" /> عرض الحجوزات
          </button>
          <button onClick={() => window.location.reload()} className="btn-secondary">
            <ArrowLeft className="w-4 h-4" /> حجز آخر
          </button>
        </div>
      </div>
    </div>
  )
}
