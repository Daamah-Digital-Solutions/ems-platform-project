import { useParams, Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import {
  ArrowRight,
  Edit,
  Phone,
  MessageCircle,
  Calendar as CalIcon,
  Mail,
  Cake,
  User as UserIcon,
  ChevronLeft,
  Heart,
  ShieldCheck,
  AlertTriangle,
  Plus,
  FileText,
  Download,
  Snowflake,
  Star,
  CreditCard
} from 'lucide-react'
import { clientsApi } from '../lib/api.js'
import { useApi } from '../lib/useApi.js'
import { cn, toArabicDigits, initials, avatarColor, formatNumberAr, waLink, telLink } from '../lib/utils.js'
import ClientFormModal from '../components/ClientFormModal.jsx'
import PaymentLinkModal from '../components/PaymentLinkModal.jsx'
import { toast, comingSoon } from '../lib/toast.js'

const TABS = [
  { k: 'overview', label: 'نظرة عامة' },
  { k: 'parq', label: 'PAR-Q' },
  { k: 'packages', label: 'الباقات' },
  { k: 'bookings', label: 'الحجوزات' },
  { k: 'docs', label: 'الملفات' },
  { k: 'notes', label: 'الملاحظات' }
]

const STATUS_COLORS = {
  نشط: 'bg-emerald-50 text-emerald-700',
  تجريبي: 'bg-amber-50 text-amber-700',
  مجمد: 'bg-blue-50 text-blue-700',
  منتهي: 'bg-gray-100 text-gray-700'
}

const PARQ_QUESTIONS = [
  { q: 'هل لديك جهاز تنظيم ضربات القلب؟', a: 'لا', warn: false },
  { q: 'هل أنتِ حامل أو في فترة ما بعد الولادة؟', a: 'لا', warn: false },
  { q: 'هل تعاني من الصرع؟', a: 'لا', warn: false },
  { q: 'هل لديك مشاكل في القلب؟', a: 'لا', warn: false },
  { q: 'هل لديك ضغط دم مرتفع/منخفض؟', a: 'نعم', warn: true },
  { q: 'هل خضعت لعملية جراحية مؤخراً؟', a: 'لا', warn: false }
]

const FAKE_BODY = [
  { d: '٢٠٢٤/١٠', w: 78.5, fat: 28.2 },
  { d: '٢٠٢٤/١١', w: 76.8, fat: 26.8 },
  { d: '٢٠٢٤/١٢', w: 75.2, fat: 25.4 },
  { d: '٢٠٢٥/٠١', w: 73.6, fat: 24.0 }
]

const FAKE_NOTES = [
  { d: 'قبل ٣ أيام', author: 'كابتن سارة', text: 'تقدم ممتاز في القوة، نزيد الشدة ٢٠٪ الجلسة القادمة.' },
  { d: 'قبل أسبوع', author: 'أحمد العتيبي', text: 'العميلة سألت عن باقة VIP، تواصل لاحقاً.' },
  { d: 'قبل أسبوعين', author: 'كابتن منى', text: 'تشتكي من توتر في الكتف الأيمن — نتجنب التحفيز العالي هناك.' }
]

const FAKE_DOCS = [
  { name: 'صورة الهوية.pdf', size: '٢٫٤ MB', date: '٢٠٢٤/٠٨/١٥' },
  { name: 'شهادة طبية.pdf', size: '١٫١ MB', date: '٢٠٢٤/٠٨/١٥' },
  { name: 'استشارة أولية.pdf', size: '٣٫٧ MB', date: '٢٠٢٤/٠٨/٢٠' }
]

function TabButton({ active, onClick, children, badge }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-2 px-4 h-11 rounded-lg text-sm font-bold transition-all whitespace-nowrap relative',
        active ? 'text-brand' : 'text-ink-secondary hover:text-ink-primary'
      )}
    >
      {children}
      {badge && (
        <span className="px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 text-[9px] font-extrabold">
          {badge}
        </span>
      )}
      {active && <span className="absolute bottom-0 right-0 left-0 h-0.5 bg-brand rounded-full" />}
    </button>
  )
}

function InfoCard({ icon: Icon, label, value }) {
  return (
    <div className="card p-4 flex items-center gap-3">
      <span className="w-10 h-10 rounded-lg bg-brand-50 text-brand flex items-center justify-center">
        <Icon className="w-5 h-5" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="text-[10px] font-bold text-ink-tertiary uppercase tracking-wider">{label}</div>
        <div className="text-sm font-extrabold text-ink-primary truncate">{value}</div>
      </div>
    </div>
  )
}

export default function ClientDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { data: client, loading, reload } = useApi(() => clientsApi.get(Number(id)), [id])
  const [tab, setTab] = useState('overview')
  const [editOpen, setEditOpen] = useState(false)
  const [payOpen, setPayOpen] = useState(false)

  if (loading && !client) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] text-ink-tertiary">
        جاري التحميل...
      </div>
    )
  }
  if (!client) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-ink-tertiary gap-3">
        <p>العميل غير موجود</p>
        <button onClick={() => navigate('/clients')} className="btn-secondary btn-sm">العودة للعملاء</button>
      </div>
    )
  }
  // Normalize API fields (snake_case) → existing camelCase the template expects
  const c = {
    ...client,
    parqFlags: client.parq_flags || [],
    parq: client.parq_status,
    parqExpiry: client.parq_expiry,
    package: client.active_package,
    remaining: client.remaining,
    total: client.total,
    lastSession: client.last_session,
    joinDate: client.join_date,
    nextBooking: client.next_booking,
    preferredTrainer: client.preferred_trainer_name,
    suitSize: client.suit_size,
    tags: client.tags || [],
  }
  const hasFlags = c.parqFlags && c.parqFlags.length > 0
  const parqWarnings = hasFlags ? c.parqFlags.length : 0

  return (
    <div className="space-y-5">
      {/* Back */}
      <button onClick={() => navigate('/clients')} className="inline-flex items-center gap-1.5 text-sm font-bold text-ink-secondary hover:text-brand">
        <ArrowRight className="w-4 h-4" />
        كل العملاء
      </button>

      {/* Header card */}
      <div className="card p-5 sm:p-7 relative overflow-hidden">
        <div className="absolute -top-20 -left-20 w-56 h-56 bg-brand-50/60 rounded-full blur-3xl" />
        <div className="relative flex flex-wrap items-start gap-5 sm:gap-6">
          <div
            className={cn(
              'w-20 h-20 sm:w-24 sm:h-24 rounded-2xl flex items-center justify-center text-2xl sm:text-3xl font-extrabold flex-shrink-0',
              avatarColor(c.name_ar)
            )}
          >
            {initials(c.name_ar)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">{c.name_ar}</h1>
              <span className={cn('px-2.5 py-0.5 rounded-full text-xs font-extrabold', STATUS_COLORS[c.status])}>
                {c.status}
              </span>
              {c.tags.includes('VIP') && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gradient-to-l from-amber-400 to-amber-500 text-white text-[10px] font-extrabold">
                  <Star className="w-2.5 h-2.5 fill-white" />
                  VIP
                </span>
              )}
            </div>
            <div className="text-sm text-ink-secondary">{c.name_en}</div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3 text-xs text-ink-secondary">
              <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" /><span className="tabular" dir="ltr">{c.phone}</span></span>
              <span className="flex items-center gap-1.5"><UserIcon className="w-3.5 h-3.5" />{c.gender}، {toArabicDigits(c.age)} سنة</span>
              <span className="flex items-center gap-1.5"><CalIcon className="w-3.5 h-3.5" />انضم {c.joinDate}</span>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button onClick={() => setEditOpen(true)} className="btn-secondary btn-sm">
              <Edit className="w-3.5 h-3.5" /> تعديل
            </button>
            <a href={telLink(c.phone)} className="btn-secondary btn-sm">
              <Phone className="w-3.5 h-3.5" /> اتصال
            </a>
            <button onClick={() => window.open(waLink(c.phone, `مرحباً ${c.name_ar.split(' ')[0]}،`), '_blank')} className="btn bg-emerald-500 text-white hover:bg-emerald-600 btn-sm">
              <MessageCircle className="w-3.5 h-3.5" /> واتساب
            </button>
            <button onClick={() => navigate(`/bookings/new?client=${c.id}`)} className="btn-primary btn-sm">
              <Plus className="w-3.5 h-3.5" /> حجز جديد
            </button>
            <button onClick={() => setPayOpen(true)} className="btn-secondary btn-sm">
              <CreditCard className="w-3.5 h-3.5" /> رابط دفع
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="card overflow-hidden">
        <div className="px-2 sm:px-4 flex items-center gap-1 overflow-x-auto border-b border-border/60">
          {TABS.map((t) => (
            <TabButton
              key={t.k}
              active={tab === t.k}
              onClick={() => setTab(t.k)}
              badge={t.k === 'parq' && hasFlags ? toArabicDigits(parqWarnings) : null}
            >
              {t.label}
            </TabButton>
          ))}
        </div>

        <div className="p-5 sm:p-7">
          {tab === 'overview' && <OverviewTab c={c} />}
          {tab === 'parq' && <ParqTab c={c} />}
          {tab === 'packages' && <PackagesTab c={c} />}
          {tab === 'bookings' && <BookingsTab c={c} clientId={Number(id)} />}
          {tab === 'docs' && <DocsTab />}
          {tab === 'notes' && <NotesTab clientId={Number(id)} />}
        </div>
      </div>

      <ClientFormModal
        open={editOpen}
        client={client}
        onClose={() => setEditOpen(false)}
        onSaved={() => { setEditOpen(false); reload() }}
      />

      <PaymentLinkModal
        open={payOpen}
        fixedClient={client}
        onClose={() => setPayOpen(false)}
      />
    </div>
  )
}

function OverviewTab({ c }) {
  const pct = typeof c.remaining === 'string' ? 100 : (c.remaining / c.total) * 100
  return (
    <div className="grid lg:grid-cols-3 gap-5">
      <div className="lg:col-span-2 space-y-5">
        {/* Current package */}
        <div className="rounded-2xl bg-brand-gradient text-white p-5 sm:p-6 relative overflow-hidden">
          <div className="absolute -top-20 -left-20 w-48 h-48 bg-accent/20 rounded-full blur-3xl" />
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-[10px] font-extrabold uppercase tracking-wider text-white/70">الباقة الحالية</div>
                <div className="text-2xl font-extrabold mt-1">{c.package}</div>
              </div>
              <Link to="/packages" className="text-xs font-extrabold text-white/90 hover:text-white inline-flex items-center gap-1">
                إدارة <ChevronLeft className="w-3 h-3" />
              </Link>
            </div>
            <div className="flex items-end gap-4 mb-3">
              <div>
                <div className="text-5xl font-extrabold tabular">
                  {typeof c.remaining === 'string' ? c.remaining : toArabicDigits(c.remaining)}
                </div>
                <div className="text-xs text-white/80 mt-0.5">جلسة متبقية</div>
              </div>
              <div className="text-xs text-white/70 pb-1.5">
                من {c.total === 999 ? '∞' : toArabicDigits(c.total)} جلسة
              </div>
            </div>
            <div className="h-2 bg-white/15 rounded-full overflow-hidden">
              <div className="h-full bg-accent rounded-full" style={{ width: `${pct}%` }} />
            </div>
            <div className="flex justify-between text-[10px] text-white/70 mt-2">
              <span>تنتهي بعد ٣ أشهر</span>
              <span>{toArabicDigits(Math.round(pct))}٪</span>
            </div>
          </div>
        </div>

        {/* Body composition */}
        <div className="card p-5 sm:p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-extrabold text-ink-primary">تطور الجسم</h3>
            <span className="text-xs text-emerald-600 font-extrabold">▼ ٤٫٢ كجم</span>
          </div>
          <BodyChart data={FAKE_BODY} />
          <div className="grid grid-cols-2 gap-3 mt-5">
            <Metric label="الوزن الحالي" value={`${toArabicDigits(73.6)} كجم`} delta="-٤٫٩" tone="success" />
            <Metric label="نسبة الدهون" value={`${toArabicDigits(24.0)}٪`} delta="-٤٫٢" tone="success" />
          </div>
        </div>
      </div>

      <div className="space-y-5">
        {/* Quick info cards */}
        <div className="space-y-3">
          <InfoCard icon={CalIcon} label="الجلسة القادمة" value={c.nextBooking} />
          <InfoCard icon={UserIcon} label="المدرب المفضل" value={c.preferredTrainer} />
          <InfoCard icon={Heart} label="مقاس البدلة" value={c.suitSize} />
        </div>

        {/* Recent notes */}
        <div className="card p-5">
          <h3 className="font-extrabold text-ink-primary mb-4">آخر الملاحظات</h3>
          <div className="space-y-3">
            {FAKE_NOTES.slice(0, 2).map((n, i) => (
              <div key={i} className="text-xs">
                <div className="flex items-center justify-between text-[10px] mb-1">
                  <span className="font-extrabold text-brand">{n.author}</span>
                  <span className="text-ink-tertiary">{n.d}</span>
                </div>
                <p className="text-ink-secondary leading-snug">{n.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function Metric({ label, value, delta, tone = 'success' }) {
  return (
    <div className="bg-bg/60 rounded-xl p-3 border border-border/40">
      <div className="text-[10px] text-ink-tertiary font-bold uppercase tracking-wider mb-1">{label}</div>
      <div className="flex items-baseline gap-2">
        <span className="text-lg font-extrabold tabular">{value}</span>
        <span
          className={cn(
            'text-[10px] font-extrabold',
            tone === 'success' ? 'text-emerald-600' : 'text-red-600'
          )}
        >
          {delta}
        </span>
      </div>
    </div>
  )
}

function BodyChart({ data }) {
  const max = Math.max(...data.map((d) => d.w))
  const min = Math.min(...data.map((d) => d.w))
  const range = max - min || 1
  return (
    <div className="flex items-end gap-2 h-32">
      {data.map((d, i) => {
        const h = ((d.w - min) / range) * 80 + 20
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
            <div className="text-[10px] font-extrabold text-ink-primary tabular">{toArabicDigits(d.w)}</div>
            <div className="w-full bg-bg rounded-lg relative" style={{ height: '100%' }}>
              <div
                className="absolute bottom-0 right-0 left-0 bg-gradient-to-t from-brand to-brand-300 rounded-lg"
                style={{ height: `${h}%` }}
              />
            </div>
            <div className="text-[10px] text-ink-tertiary tabular">{d.d.split('/')[1]}</div>
          </div>
        )
      })}
    </div>
  )
}

function ParqTab({ c }) {
  const hasFlags = c.parqFlags && c.parqFlags.length > 0
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span
            className={cn(
              'w-12 h-12 rounded-xl flex items-center justify-center text-white',
              c.parq === 'ساري' ? 'bg-emerald-500' : 'bg-red-500'
            )}
          >
            <ShieldCheck className="w-6 h-6" />
          </span>
          <div>
            <div className="font-extrabold">نموذج PAR-Q الصحي</div>
            <div className="text-xs text-ink-tertiary">
              {c.parq === 'ساري' ? 'ساري حتى' : 'انتهى في'} {c.parqExpiry}
            </div>
          </div>
        </div>
        <button onClick={() => comingSoon('تحديث نموذج PAR-Q')} className="btn-primary btn-sm">
          <Edit className="w-3.5 h-3.5" /> تحديث النموذج
        </button>
      </div>

      {hasFlags && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200/60 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <div className="font-extrabold text-red-900">تنبيه: حالات تحتاج انتباه</div>
            <p className="text-sm text-red-800 mt-1">
              يجب على المدرب التأكيد قبل بدء أي جلسة. الحالات: {c.parqFlags.join('، ')}.
            </p>
            <button onClick={() => toast('تم تسجيل توقيع المدرب على الحالة الصحية', 'success')} className="mt-2 text-xs font-extrabold text-red-700 underline">
              توقيع المدرب →
            </button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {PARQ_QUESTIONS.map((q, i) => (
          <div
            key={i}
            className={cn(
              'flex items-center justify-between gap-3 p-4 rounded-xl border',
              q.warn
                ? 'bg-amber-50 border-amber-200'
                : 'bg-bg/40 border-border/50'
            )}
          >
            <span className="text-sm flex-1">{q.q}</span>
            <span
              className={cn(
                'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-extrabold',
                q.a === 'نعم'
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-emerald-100 text-emerald-800'
              )}
            >
              {q.a === 'نعم' ? '⚠️' : '❌'} {q.a}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

function PackagesTab({ c }) {
  return (
    <div className="space-y-5">
      <div className="rounded-2xl bg-gradient-to-bl from-brand-50/50 to-white border border-brand-100 p-5">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <div className="text-[10px] font-extrabold uppercase tracking-wider text-brand mb-1">الباقة النشطة</div>
            <div className="text-xl font-extrabold">{c.package}</div>
            <div className="text-xs text-ink-secondary mt-1">
              {typeof c.remaining === 'string' ? c.remaining : `${toArabicDigits(c.remaining)} من ${toArabicDigits(c.total)}`} جلسة • ينتهي بعد ٣ أشهر
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => comingSoon('تجميد الاشتراك')} className="btn-secondary btn-sm">
              <Snowflake className="w-3.5 h-3.5" /> تجميد
            </button>
            <Link to="/packages" className="btn-primary btn-sm">
              <Plus className="w-3.5 h-3.5" /> باقة جديدة
            </Link>
          </div>
        </div>
      </div>

      <div>
        <h4 className="text-sm font-extrabold text-ink-primary mb-3">السجل</h4>
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-bg/60 text-[10px] font-extrabold uppercase tracking-wider text-ink-tertiary">
              <tr>
                <th className="text-right px-4 py-3">الباقة</th>
                <th className="text-right px-4 py-3 hidden sm:table-cell">البدء</th>
                <th className="text-right px-4 py-3 hidden sm:table-cell">الانتهاء</th>
                <th className="text-right px-4 py-3">المبلغ</th>
                <th className="text-right px-4 py-3">الحالة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {[
                { name: c.package, start: c.joinDate, end: '٢٠٢٥/٠٤/١٥', amount: 3900, status: 'نشطة', tone: 'success' },
                { name: 'باقة التجربة', start: '٢٠٢٤/٠٧/٠١', end: '٢٠٢٤/٠٨/٠١', amount: 799, status: 'منتهية', tone: 'gray' }
              ].map((p, i) => (
                <tr key={i} className="hover:bg-bg/40">
                  <td className="px-4 py-3 font-bold">{p.name}</td>
                  <td className="px-4 py-3 text-ink-secondary hidden sm:table-cell">{p.start}</td>
                  <td className="px-4 py-3 text-ink-secondary hidden sm:table-cell">{p.end}</td>
                  <td className="px-4 py-3 font-extrabold tabular">{formatNumberAr(p.amount)} ر.س</td>
                  <td className="px-4 py-3">
                    <span className={cn('px-2 py-0.5 rounded-full text-[10px] font-extrabold', p.tone === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-700')}>
                      {p.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function BookingsTab({ c, clientId }) {
  const { data: bookings = [] } = useApi(() => clientsApi.bookings(clientId), [clientId])
  const fake = (bookings || []).map((b) => ({
    time: new Date(b.start_time).toLocaleString('ar-SA', { weekday: 'long', hour: '2-digit', minute: '2-digit', hour12: true }),
    trainer: b.trainer_name,
    machine: b.machine_label,
    status: b.status,
  }))
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-3">
        <StatBlock value={toArabicDigits(c.total - (typeof c.remaining === 'string' ? 0 : c.remaining))} label="جلسات مكتملة" tone="brand" />
        <StatBlock value={toArabicDigits(2)} label="لم يحضر" tone="danger" />
        <StatBlock value={toArabicDigits(1)} label="ملغية" tone="gray" />
      </div>
      <div className="card overflow-hidden">
        <div className="divide-y divide-border/40">
          {fake.map((b, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-3">
              <span className="w-9 h-9 rounded-full bg-brand-50 text-brand flex items-center justify-center text-xs font-extrabold">
                {b.machine}
              </span>
              <div className="flex-1 min-w-0">
                <div className="font-extrabold text-sm">{b.time}</div>
                <div className="text-[11px] text-ink-tertiary">{b.trainer}</div>
              </div>
              <span
                className={cn(
                  'px-2 py-0.5 rounded-full text-[10px] font-extrabold',
                  b.status === 'مكتمل' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                )}
              >
                {b.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function StatBlock({ value, label, tone }) {
  const tones = { brand: 'text-brand', danger: 'text-red-600', gray: 'text-ink-tertiary' }
  return (
    <div className="card p-4 text-center">
      <div className={cn('text-2xl font-extrabold tabular', tones[tone])}>{value}</div>
      <div className="text-[10px] text-ink-tertiary font-bold uppercase tracking-wider mt-0.5">{label}</div>
    </div>
  )
}

function DocsTab() {
  return (
    <div className="space-y-5">
      <label className="block border-2 border-dashed border-border rounded-2xl p-8 text-center hover:border-brand hover:bg-brand-50/20 cursor-pointer transition-all">
        <div className="w-12 h-12 mx-auto rounded-xl bg-brand-50 text-brand flex items-center justify-center mb-3">
          <Plus className="w-6 h-6" />
        </div>
        <div className="font-extrabold text-ink-primary">رفع ملف جديد</div>
        <div className="text-xs text-ink-tertiary mt-1">اسحب الملفات هنا أو اضغط للاختيار • PDF / JPG / PNG</div>
        <input
          type="file"
          className="hidden"
          onChange={(e) => { if (e.target.files?.length) toast(`تم اختيار: ${e.target.files[0].name}`, 'success') }}
        />
      </label>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {FAKE_DOCS.map((d, i) => (
          <div key={i} className="card p-4 flex items-center gap-3 group hover:shadow-card-hover transition-all">
            <span className="w-11 h-11 rounded-lg bg-red-50 text-red-600 flex items-center justify-center flex-shrink-0">
              <FileText className="w-5 h-5" />
            </span>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-sm truncate">{d.name}</div>
              <div className="text-[10px] text-ink-tertiary tabular">{d.size} • {d.date}</div>
            </div>
            <button onClick={() => comingSoon('تحميل الملف')} className="w-8 h-8 rounded-lg hover:bg-bg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Download className="w-4 h-4 text-ink-secondary" />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

function NotesTab({ clientId }) {
  const [draft, setDraft] = useState('')
  const [saving, setSaving] = useState(false)
  const { data: notes = [], reload } = useApi(() => clientsApi.notes(clientId), [clientId])
  const list = (notes && notes.length) ? notes.map((n) => ({
    d: new Date(n.created_at).toLocaleDateString('ar-SA'),
    author: n.author_name || 'مستخدم',
    text: n.body,
  })) : FAKE_NOTES
  async function add() {
    if (!draft.trim()) return
    setSaving(true)
    try {
      await clientsApi.addNote(clientId, draft.trim())
      setDraft('')
      reload()
    } finally {
      setSaving(false)
    }
  }
  return (
    <div className="space-y-5">
      <div className="card p-4">
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          rows={3}
          placeholder="أضف ملاحظة جديدة..."
          className="w-full bg-bg border border-border rounded-lg p-3 text-sm focus:outline-none focus:border-brand resize-none"
        />
        <div className="flex justify-end mt-3">
          <button className="btn-primary btn-sm" disabled={!draft.trim() || saving} onClick={add}>
            <Plus className="w-3.5 h-3.5" /> {saving ? 'جاري الحفظ...' : 'إضافة ملاحظة'}
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {list.map((n, i) => (
          <div key={i} className="card p-5 group">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-brand-50 text-brand flex items-center justify-center text-[10px] font-extrabold">
                  {n.author.split(' ').map((s) => s[0]).join('').slice(0, 2)}
                </span>
                <span className="font-extrabold text-sm text-ink-primary">{n.author}</span>
              </div>
              <span className="text-[10px] text-ink-tertiary">{n.d}</span>
            </div>
            <p className="text-sm text-ink-secondary leading-relaxed pr-10">{n.text}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
