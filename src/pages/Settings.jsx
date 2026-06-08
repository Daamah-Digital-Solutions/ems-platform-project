import { useState } from 'react'
import {
  Building2,
  Clock,
  Sun,
  GitBranch,
  Users,
  Package,
  Bell,
  Receipt,
  Shield,
  Upload,
  MapPin,
  Phone,
  Mail,
  Globe,
  Save
} from 'lucide-react'
import { studioApi, getStoredStudio } from '../lib/api.js'
import { useApi } from '../lib/useApi.js'
import { workingHours } from '../data/mockData.js'
import { cn } from '../lib/utils.js'
import { toast, comingSoon } from '../lib/toast.js'

const TABS = [
  { k: 'studio', l: 'معلومات الستوديو', i: Building2 },
  { k: 'hours', l: 'ساعات العمل', i: Clock },
  { k: 'prayer', l: 'أوقات الصلاة', i: Sun },
  // مخفي مؤقتاً — الفروع / الفريق / الأسعار / الأمان / الإشعارات / الفوترة
  // { k: 'branches', l: 'الفروع', i: GitBranch },
  // { k: 'team', l: 'الفريق', i: Users },
  // { k: 'pricing', l: 'الأسعار والباقات', i: Package },
  // { k: 'notifications', l: 'الإشعارات', i: Bell, soon: true },
  // { k: 'billing', l: 'الفوترة', i: Receipt, soon: true },
  // { k: 'security', l: 'الأمان', i: Shield }
]

export default function Settings() {
  const [tab, setTab] = useState('studio')
  return (
    <div className="space-y-5">
      <div>
        <h1 className="page-title">الإعدادات</h1>
        <p className="page-subtitle">إدارة كل تفاصيل ستوديوهك من مكان واحد.</p>
      </div>

      <div className="grid lg:grid-cols-12 gap-5">
        {/* Sidebar */}
        <aside className="lg:col-span-3">
          <nav className="card p-2 space-y-0.5 lg:sticky lg:top-24">
            {TABS.map((t) => (
              <button
                key={t.k}
                onClick={() => !t.soon && setTab(t.k)}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-bold text-right transition-all',
                  tab === t.k ? 'bg-brand-50 text-brand' :
                  t.soon ? 'text-ink-tertiary cursor-not-allowed opacity-60' :
                  'text-ink-secondary hover:bg-bg'
                )}
              >
                <t.i className="w-4 h-4" />
                <span className="flex-1">{t.l}</span>
                {t.soon && (
                  <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700">
                    قريباً
                  </span>
                )}
              </button>
            ))}
          </nav>
        </aside>

        {/* Content */}
        <section className="lg:col-span-9">
          {tab === 'studio' && <StudioInfo />}
          {tab === 'hours' && <WorkingHours />}
          {tab === 'prayer' && <PrayerSettings />}
          {tab === 'branches' && <BranchesPlaceholder />}
          {tab === 'team' && <TeamPlaceholder />}
          {tab === 'pricing' && <PricingPlaceholder />}
          {tab === 'security' && <SecurityPlaceholder />}
        </section>
      </div>
    </div>
  )
}

function StudioInfo() {
  const { data: studioRemote, reload } = useApi(() => studioApi.get())
  const [form, setForm] = useState({})
  const [seeded, setSeeded] = useState(false)
  const [saving, setSaving] = useState(false)

  const base = studioRemote || getStoredStudio() || {}
  if (studioRemote && !seeded) {
    setSeeded(true)
    setForm({
      name_ar: studioRemote.name_ar || '',
      name_en: studioRemote.name_en || '',
      phone: studioRemote.phone || '',
      email: studioRemote.email || '',
      city: studioRemote.city || '',
      branch: studioRemote.branch || '',
      vat: studioRemote.vat || '',
      cr: studioRemote.cr || '',
    })
  }
  const f = { ...base, ...form }
  const upd = (p) => setForm((s) => ({ ...s, ...p }))

  async function save() {
    setSaving(true)
    try {
      await studioApi.update({
        name_ar: f.name_ar,
        name_en: f.name_en || undefined,
        phone: f.phone || undefined,
        email: f.email || undefined,
        city: f.city || undefined,
        branch: f.branch || undefined,
        vat: f.vat || undefined,
        cr: f.cr || undefined,
      })
      toast('تم حفظ معلومات الستوديو', 'success')
      reload()
    } catch (e) {
      toast(e.message || 'فشل الحفظ', 'error')
    } finally {
      setSaving(false)
    }
  }

  function pickLogo() {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = () => { if (input.files?.length) toast(`تم اختيار الشعار: ${input.files[0].name}`, 'success') }
    input.click()
  }

  return (
    <div className="card p-5 sm:p-7 space-y-6">
      <div>
        <h2 className="text-lg font-extrabold">معلومات الستوديو</h2>
        <p className="text-sm text-ink-tertiary mt-1">ستظهر هذه المعلومات في الفواتير ولوحة التحكم.</p>
      </div>

      {/* Logo */}
      <div>
        <label className="label">الشعار</label>
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-2xl bg-brand-gradient text-white flex items-center justify-center font-extrabold text-2xl shadow-soft">
            {f.logo || (f.name_ar || 'FM').slice(0, 2)}
          </div>
          <div>
            <button onClick={pickLogo} className="btn-secondary btn-sm">
              <Upload className="w-3.5 h-3.5" /> رفع شعار جديد
            </button>
            <div className="text-xs text-ink-tertiary mt-2">PNG / JPG / SVG • مقاس مفضّل ٥١٢×٥١٢</div>
          </div>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-5">
        <div>
          <label className="label">اسم الستوديو بالعربي</label>
          <input className="input" value={f.name_ar || ''} onChange={(e) => upd({ name_ar: e.target.value })} />
        </div>
        <div>
          <label className="label">اسم الستوديو بالإنجليزي</label>
          <input className="input ltr text-right" dir="ltr" value={f.name_en || ''} onChange={(e) => upd({ name_en: e.target.value })} />
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-5">
        <div>
          <label className="label">رقم الهاتف</label>
          <div className="input-icon-wrap">
            <Phone className="icon w-4 h-4" />
            <input className="input ltr text-right" dir="ltr" value={f.phone || ''} onChange={(e) => upd({ phone: e.target.value })} />
          </div>
        </div>
        <div>
          <label className="label">البريد الإلكتروني</label>
          <div className="input-icon-wrap">
            <Mail className="icon w-4 h-4" />
            <input className="input ltr text-right" dir="ltr" value={f.email || ''} onChange={(e) => upd({ email: e.target.value })} />
          </div>
        </div>
        <div>
          <label className="label">المدينة</label>
          <div className="input-icon-wrap">
            <Globe className="icon w-4 h-4" />
            <input className="input" value={f.city || ''} onChange={(e) => upd({ city: e.target.value })} />
          </div>
        </div>
      </div>

      <div>
        <label className="label">الفرع</label>
        <div className="input-icon-wrap">
          <MapPin className="icon w-4 h-4" />
          <input className="input" value={f.branch || ''} onChange={(e) => upd({ branch: e.target.value })} />
        </div>
      </div>

      <div className="pt-5 border-t border-border/60">
        <h3 className="font-extrabold mb-4">المعلومات الضريبية</h3>
        <div className="grid sm:grid-cols-2 gap-5">
          <div>
            <label className="label">الرقم الضريبي (VAT)</label>
            <input className="input ltr text-right tabular" dir="ltr" value={f.vat || ''} onChange={(e) => upd({ vat: e.target.value })} />
            <p className="text-[11px] text-ink-tertiary mt-1.5">للفواتير المتوافقة مع ZATCA</p>
          </div>
          <div>
            <label className="label">السجل التجاري (CR)</label>
            <input className="input ltr text-right tabular" dir="ltr" value={f.cr || ''} onChange={(e) => upd({ cr: e.target.value })} />
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-5 border-t border-border/60">
        <button onClick={() => { setSeeded(false); setForm({}) }} className="btn-secondary" disabled={saving}>إلغاء</button>
        <button onClick={save} className="btn-primary" disabled={saving}>
          <Save className="w-4 h-4" /> {saving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
        </button>
      </div>
    </div>
  )
}

function WorkingHours() {
  const days = Object.keys(workingHours)
  const [closed, setClosed] = useState({})
  return (
    <div className="card p-5 sm:p-7">
      <h2 className="text-lg font-extrabold mb-1">ساعات العمل</h2>
      <p className="text-sm text-ink-tertiary mb-5">تستطيع التعديل بأي وقت — التغييرات تنطبق فوراً.</p>
      <div className="divide-y divide-border/60">
        {days.map((d) => {
          const h = workingHours[d]
          const isClosed = closed[d]
          return (
            <div key={d} className="flex items-center gap-4 py-3">
              <div className="w-24 font-extrabold">{d}</div>
              <input type="time" disabled={isClosed} className="input ltr text-center tabular flex-1 max-w-[120px] disabled:opacity-40" defaultValue={h.open} />
              <span className="text-ink-tertiary">—</span>
              <input type="time" disabled={isClosed} className="input ltr text-center tabular flex-1 max-w-[120px] disabled:opacity-40" defaultValue={h.close} />
              <button
                onClick={() => setClosed((c) => ({ ...c, [d]: !c[d] }))}
                className={cn('btn-sm text-xs', isClosed ? 'btn-primary' : 'btn-ghost')}
              >
                {isClosed ? 'مغلق ✓' : 'مغلق'}
              </button>
            </div>
          )
        })}
      </div>
      <div className="flex justify-end mt-5 pt-5 border-t border-border/60">
        <button onClick={() => toast('تم حفظ ساعات العمل', 'success')} className="btn-primary">حفظ ساعات العمل</button>
      </div>
    </div>
  )
}

function PrayerSettings() {
  const { data: studio, reload } = useApi(() => studioApi.get())
  const [blockPrayer, setBlockPrayer] = useState(null)
  const [buffer, setBuffer] = useState(null)
  const [reminder, setReminder] = useState(true)
  const [autoFetch, setAutoFetch] = useState(true)
  const [saving, setSaving] = useState(false)
  const [seeded, setSeeded] = useState(false)

  if (studio && !seeded) {
    setSeeded(true)
    setBlockPrayer(studio.block_prayer ?? true)
    setBuffer(studio.prayer_buffer_min ?? 10)
  }
  const block = blockPrayer ?? true
  const buf = buffer ?? 10

  async function save() {
    setSaving(true)
    try {
      await studioApi.update({ block_prayer: block, prayer_buffer_min: Number(buf) })
      toast('تم حفظ إعدادات الصلاة', 'success')
      reload()
    } catch (e) {
      toast(e.message || 'فشل الحفظ', 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="card p-5 sm:p-7 space-y-5">
      <div>
        <h2 className="text-lg font-extrabold">أوقات الصلاة</h2>
        <p className="text-sm text-ink-tertiary mt-1">إعدادات الحجوزات وقت الصلاة.</p>
      </div>
      <ToggleRow
        title="حجب الحجوزات وقت الصلاة"
        sub="ينطبق على كل أوقات الصلوات الخمس"
        on={block}
        onToggle={() => setBlockPrayer(!block)}
      />
      <div className="flex items-center justify-between gap-3 p-4 rounded-xl border border-border/60">
        <div>
          <div className="font-extrabold">مدة الحجب قبل/بعد الأذان (دقائق)</div>
          <div className="text-xs text-ink-tertiary mt-0.5">الفترة اللي يتمنع فيها الحجز حوالين وقت الصلاة</div>
        </div>
        <input
          type="number"
          min="0"
          max="60"
          value={buf}
          onChange={(e) => setBuffer(e.target.value)}
          className="input tabular w-20 text-center"
        />
      </div>
      <ToggleRow
        title="إرسال تذكير قبل الصلاة"
        sub="رسالة واتساب للعملاء قبل ١٠ دقائق من وقت الصلاة"
        on={reminder}
        onToggle={() => setReminder(!reminder)}
      />
      <ToggleRow
        title="جلب أوقات الصلاة تلقائياً"
        sub="حسب الموقع الجغرافي للستوديو"
        on={autoFetch}
        onToggle={() => setAutoFetch(!autoFetch)}
      />
      <div className="flex justify-end pt-2">
        <button onClick={save} disabled={saving} className="btn-primary">
          {saving ? 'جاري الحفظ...' : 'حفظ إعدادات الصلاة'}
        </button>
      </div>
    </div>
  )
}

function ToggleRow({ title, sub, on, onToggle }) {
  return (
    <div className="flex items-center justify-between gap-3 p-4 rounded-xl border border-border/60">
      <div>
        <div className="font-extrabold">{title}</div>
        <div className="text-xs text-ink-tertiary mt-0.5">{sub}</div>
      </div>
      <button
        onClick={onToggle}
        className={cn('relative inline-flex items-center w-11 h-6 rounded-full', on ? 'bg-brand' : 'bg-gray-300')}
      >
        <span className={cn('inline-block w-5 h-5 rounded-full bg-white shadow-sm transition-transform', on ? '-translate-x-0.5' : '-translate-x-5')} />
      </button>
    </div>
  )
}

function BranchesPlaceholder() {
  return <Placeholder icon={GitBranch} title="الفروع" body="إدارة الفروع المتعددة متاحة في باقة المؤسسات." />
}
function TeamPlaceholder() {
  return <Placeholder icon={Users} title="الفريق" body="إدارة المستخدمين والصلاحيات." />
}
function PricingPlaceholder() {
  return <Placeholder icon={Package} title="الأسعار والباقات" body="استخدم صفحة الباقات لإدارة قوالب الباقات." />
}
function SecurityPlaceholder() {
  return <Placeholder icon={Shield} title="الأمان" body="كلمات المرور، المصادقة الثنائية، وسجل الدخول." />
}

function Placeholder({ icon: Icon, title, body }) {
  return (
    <div className="card p-12 text-center">
      <span className="w-14 h-14 mx-auto rounded-2xl bg-brand-50 text-brand flex items-center justify-center mb-4">
        <Icon className="w-7 h-7" />
      </span>
      <h2 className="text-lg font-extrabold">{title}</h2>
      <p className="text-sm text-ink-secondary mt-1">{body}</p>
    </div>
  )
}
