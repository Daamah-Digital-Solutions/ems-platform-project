import { useState } from 'react'
import { Plus, Star, ShieldCheck, Edit, AlertTriangle } from 'lucide-react'
import { trainersApi } from '../lib/api.js'
import { useApi } from '../lib/useApi.js'
import { cn, toArabicDigits } from '../lib/utils.js'
import Modal from '../components/Modal.jsx'

const STATUS = {
  متاح: 'bg-emerald-50 text-emerald-700',
  'في جلسة': 'bg-blue-50 text-blue-700',
  إجازة: 'bg-gray-100 text-gray-600'
}

export default function Trainers() {
  const { data: trainers = [], reload } = useApi(() => trainersApi.list())
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const list = trainers || []

  const avgRating = list.length
    ? (list.reduce((s, t) => s + (t.rating || 0), 0) / list.length).toFixed(2)
    : '0'
  const stats = [
    { v: toArabicDigits(list.length), l: 'إجمالي المدربين', c: 'text-brand' },
    { v: toArabicDigits(list.filter((t) => t.status === 'متاح').length), l: 'متاح الآن', c: 'text-emerald-600' },
    { v: toArabicDigits(list.filter((t) => t.status === 'في جلسة').length), l: 'في جلسة', c: 'text-blue-600' },
    { v: toArabicDigits(avgRating), l: 'متوسط التقييم', c: 'text-amber-600' },
  ]

  const openNew = () => { setEditing(null); setFormOpen(true) }
  const openEdit = (t) => { setEditing(t); setFormOpen(true) }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="page-title">
            المدربين <span className="text-ink-tertiary font-bold">({toArabicDigits(list.length)})</span>
          </h1>
          <p className="page-subtitle">فريق التدريب وأدائهم وشهاداتهم.</p>
        </div>
        <button onClick={openNew} className="btn-primary btn-sm">
          <Plus className="w-4 h-4" /> مدرب جديد
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((s) => (
          <div key={s.l} className="card p-4">
            <div className={cn('text-2xl font-extrabold tabular', s.c)}>{s.v}</div>
            <div className="text-[10px] text-ink-tertiary font-bold mt-0.5">{s.l}</div>
          </div>
        ))}
      </div>

      {/* Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {list.map((t) => (
          <div key={t.id} className="card-hover p-5 relative group">
            <div className="flex items-start justify-between mb-3">
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-brand-gradient text-white flex items-center justify-center font-extrabold text-lg shadow-soft">
                  {t.initials || (t.name_ar || '').slice(0, 2)}
                </div>
                <span
                  className={cn(
                    'absolute -bottom-1 -left-1 w-5 h-5 rounded-full ring-2 ring-white',
                    t.status === 'متاح' ? 'bg-emerald-500' :
                    t.status === 'في جلسة' ? 'bg-blue-500' : 'bg-gray-400'
                  )}
                />
              </div>
              <div className="flex items-center gap-1">
                <span className={cn('px-2 py-0.5 rounded-full text-[10px] font-extrabold', STATUS[t.status])}>
                  {t.status}
                </span>
                <button onClick={() => openEdit(t)} title="تعديل" className="w-7 h-7 rounded-lg hover:bg-bg flex items-center justify-center text-ink-tertiary hover:text-brand">
                  <Edit className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            <h3 className="font-extrabold text-ink-primary leading-tight">{t.name_ar}</h3>
            <p className="text-xs text-ink-tertiary mt-0.5">{t.specialty || '—'}</p>

            <div className="mt-4 flex items-center gap-2 text-xs">
              <div className="flex items-center gap-1 text-amber-600">
                <Star className="w-3.5 h-3.5 fill-amber-500" />
                <span className="font-extrabold">{toArabicDigits(t.rating)}</span>
              </div>
              <span className="text-ink-tertiary">•</span>
              <span className="text-ink-secondary tabular">
                <span className="font-extrabold text-ink-primary">{toArabicDigits(t.month_sessions || 0)}</span> جلسة/شهر
              </span>
            </div>

            {/* Cert */}
            <div className="mt-3 p-2.5 rounded-lg bg-bg/60 border border-border/40">
              <div className="flex items-center gap-1.5 text-[10px] font-extrabold text-ink-secondary uppercase tracking-wider mb-1">
                <ShieldCheck className="w-3 h-3" />
                الشهادة
              </div>
              <div className="text-xs font-bold">{t.certification || '—'}</div>
              <div className="text-[10px] text-ink-tertiary mt-0.5">
                تنتهي: <span className="tabular">{t.cert_expiry || '—'}</span>
              </div>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2 text-center">
              <div className="bg-emerald-50 rounded-lg p-2">
                <div className="text-base font-extrabold tabular text-emerald-700">{toArabicDigits(t.conversion_rate || 0)}٪</div>
                <div className="text-[9px] text-emerald-700 font-bold">تحويل</div>
              </div>
              <div className="bg-brand-50 rounded-lg p-2">
                <div className="text-base font-extrabold tabular text-brand">{toArabicDigits(t.month_sessions || 0)}</div>
                <div className="text-[9px] text-brand font-bold">جلسة</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <TrainerFormModal
        open={formOpen}
        trainer={editing}
        onClose={() => setFormOpen(false)}
        onSaved={() => { setFormOpen(false); reload() }}
      />
    </div>
  )
}

const EMPTY = { name_ar: '', specialty: '', gender: '', certification: '', cert_expiry: '', rating: 4.5, status: 'متاح' }

function TrainerFormModal({ open, trainer, onClose, onSaved }) {
  const isEdit = !!trainer
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [lastOpen, setLastOpen] = useState(false)

  if (open !== lastOpen) {
    setLastOpen(open)
    if (open) {
      setError('')
      setForm(trainer ? {
        name_ar: trainer.name_ar || '',
        specialty: trainer.specialty || '',
        gender: trainer.gender || '',
        certification: trainer.certification || '',
        cert_expiry: trainer.cert_expiry || '',
        rating: trainer.rating ?? 4.5,
        status: trainer.status || 'متاح',
      } : EMPTY)
    }
  }

  const upd = (p) => setForm((f) => ({ ...f, ...p }))

  async function save() {
    if (!form.name_ar.trim()) { setError('اسم المدرب مطلوب'); return }
    setSaving(true)
    setError('')
    const payload = {
      name_ar: form.name_ar.trim(),
      specialty: form.specialty || undefined,
      gender: form.gender || undefined,
      certification: form.certification || undefined,
      cert_expiry: form.cert_expiry || undefined,
      rating: Number(form.rating) || 4.5,
      status: form.status,
    }
    try {
      if (isEdit) await trainersApi.update(trainer.id, payload)
      else await trainersApi.create(payload)
      onSaved?.()
    } catch (e) {
      setError(e.message || 'فشل الحفظ')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'تعديل مدرب' : 'مدرب جديد'}
      footer={
        <>
          <button onClick={onClose} className="btn-secondary flex-1" disabled={saving}>إلغاء</button>
          <button onClick={save} className="btn-primary flex-1" disabled={saving}>
            {saving ? 'جاري الحفظ...' : isEdit ? 'حفظ التعديلات' : 'إضافة المدرب'}
          </button>
        </>
      }
    >
      <div className="space-y-4">
        {error && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-800 text-sm font-bold flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}
        <div>
          <label className="label">اسم المدرب *</label>
          <input className="input" value={form.name_ar} onChange={(e) => upd({ name_ar: e.target.value })} placeholder="مثال: كابتن سارة العنزي" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">التخصص</label>
            <input className="input" value={form.specialty} onChange={(e) => upd({ specialty: e.target.value })} placeholder="تخسيس / كمال أجسام" />
          </div>
          <div>
            <label className="label">الجنس</label>
            <select className="input" value={form.gender} onChange={(e) => upd({ gender: e.target.value })}>
              <option value="">—</option>
              <option value="ذكر">ذكر</option>
              <option value="أنثى">أنثى</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">الشهادة</label>
            <input className="input" value={form.certification} onChange={(e) => upd({ certification: e.target.value })} placeholder="EMS Level 2" />
          </div>
          <div>
            <label className="label">انتهاء الشهادة</label>
            <input className="input ltr text-right" value={form.cert_expiry} onChange={(e) => upd({ cert_expiry: e.target.value })} placeholder="2027-01" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">التقييم</label>
            <input type="number" step="0.1" min="0" max="5" className="input tabular" value={form.rating} onChange={(e) => upd({ rating: e.target.value })} />
          </div>
          <div>
            <label className="label">الحالة</label>
            <select className="input" value={form.status} onChange={(e) => upd({ status: e.target.value })}>
              {['متاح', 'في جلسة', 'إجازة'].map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>
      </div>
    </Modal>
  )
}
