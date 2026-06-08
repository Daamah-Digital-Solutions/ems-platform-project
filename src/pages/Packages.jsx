import { useState } from 'react'
import { Plus, Edit, Snowflake, RotateCcw, MoreHorizontal, Crown, Calendar, Users, AlertTriangle } from 'lucide-react'
import { packagesApi } from '../lib/api.js'
import { useApi } from '../lib/useApi.js'
import { cn, toArabicDigits, formatNumberAr, initials, avatarColor } from '../lib/utils.js'
import Modal from '../components/Modal.jsx'
import { toast } from '../lib/toast.js'

export default function Packages() {
  const [tab, setTab] = useState('templates')
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const openNew = () => { setEditing(null); setFormOpen(true) }
  const openEdit = (p) => { setEditing(p); setFormOpen(true) }
  const onSaved = () => { setFormOpen(false); setRefreshKey((k) => k + 1) }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="page-title">الباقات</h1>
          <p className="page-subtitle">قوالب الباقات واشتراكات العملاء.</p>
        </div>
        <button onClick={openNew} className="btn-primary btn-sm">
          <Plus className="w-4 h-4" /> باقة جديدة
        </button>
      </div>

      <PackageFormModal
        open={formOpen}
        pkg={editing}
        onClose={() => setFormOpen(false)}
        onSaved={onSaved}
      />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { v: '٤', l: 'قوالب الباقات', t: 'text-brand' },
          { v: '١٣٧', l: 'اشتراكات نشطة', t: 'text-emerald-600' },
          { v: '٢١', l: 'تنتهي قريباً', t: 'text-amber-600' },
          { v: '١٨٧K', l: 'إيراد الشهر (ر.س)', t: 'text-indigo-600' }
        ].map((s) => (
          <div key={s.l} className="card p-4">
            <div className={cn('text-2xl font-extrabold tabular', s.t)}>{s.v}</div>
            <div className="text-[10px] text-ink-tertiary font-bold mt-0.5">{s.l}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="card overflow-hidden">
        <div className="flex items-center gap-1 px-2 sm:px-4 border-b border-border/60">
          {[
            { k: 'templates', l: 'قوالب الباقات' },
            { k: 'subscriptions', l: 'اشتراكات العملاء' }
          ].map((t) => (
            <button
              key={t.k}
              onClick={() => setTab(t.k)}
              className={cn(
                'px-4 h-12 text-sm font-extrabold relative transition-colors',
                tab === t.k ? 'text-brand' : 'text-ink-secondary hover:text-ink-primary'
              )}
            >
              {t.l}
              {tab === t.k && <span className="absolute bottom-0 right-0 left-0 h-0.5 bg-brand rounded-full" />}
            </button>
          ))}
        </div>

        <div className="p-5 sm:p-6">
          {tab === 'templates' && <Templates onEdit={openEdit} onNew={openNew} refreshKey={refreshKey} />}
          {tab === 'subscriptions' && <Subscriptions />}
        </div>
      </div>
    </div>
  )
}

function Templates({ onEdit, onNew, refreshKey }) {
  const { data: packages = [] } = useApi(() => packagesApi.list(), [refreshKey])
  const list = packages || []
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {list.map((p, i) => (
        <div key={p.id} className="card-hover p-5 relative group overflow-hidden">
          {p.unlimited && (
            <Crown className="absolute top-4 left-4 w-5 h-5 text-amber-500 fill-amber-500" />
          )}
          <div className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold mb-3', p.color || 'bg-brand-50 text-brand')}>
            {p.unlimited ? 'غير محدود' : `${toArabicDigits(p.sessions)} جلسة`}
          </div>
          <h3 className="text-lg font-extrabold tracking-tight">{p.name_ar}</h3>
          <div className="mt-4 flex items-baseline gap-1.5">
            <span className="text-3xl font-extrabold tabular text-ink-primary">{formatNumberAr(p.price)}</span>
            <span className="text-xs text-ink-secondary font-bold">ر.س</span>
          </div>
          <div className="text-xs text-ink-tertiary mt-1">{toArabicDigits(p.duration_months)} {p.duration_months === 1 ? 'شهر' : 'أشهر'}</div>

          <div className="mt-5 pt-5 border-t border-border/40">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-ink-secondary font-bold">اشتراكات نشطة</span>
              <span className="text-sm font-extrabold tabular text-brand">{toArabicDigits(p.active_subs || 0)}</span>
            </div>
            <div className="h-1.5 bg-bg rounded-full overflow-hidden">
              <div className="h-full bg-brand-gradient rounded-full" style={{ width: `${Math.min(100, ((p.active_subs || 0) / 70) * 100)}%` }} />
            </div>
          </div>

          <button onClick={() => onEdit(p)} className="mt-5 w-full btn-secondary btn-sm">
            <Edit className="w-3.5 h-3.5" /> تعديل
          </button>
        </div>
      ))}
      <button onClick={onNew} className="rounded-card border-2 border-dashed border-border hover:border-brand hover:bg-brand-50/30 p-5 flex flex-col items-center justify-center gap-3 text-ink-secondary hover:text-brand transition-all min-h-[240px]">
        <span className="w-12 h-12 rounded-xl bg-bg flex items-center justify-center">
          <Plus className="w-6 h-6" />
        </span>
        <span className="font-extrabold text-sm">إضافة باقة جديدة</span>
      </button>
    </div>
  )
}

const EMPTY_PKG = { name_ar: '', sessions: '', duration_months: '', price: '', unlimited: false }

function PackageFormModal({ open, pkg, onClose, onSaved }) {
  const isEdit = !!pkg
  const [form, setForm] = useState(EMPTY_PKG)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [lastOpen, setLastOpen] = useState(false)

  if (open !== lastOpen) {
    setLastOpen(open)
    if (open) {
      setError('')
      setForm(pkg ? {
        name_ar: pkg.name_ar || '',
        sessions: pkg.sessions ?? '',
        duration_months: pkg.duration_months ?? '',
        price: pkg.price ?? '',
        unlimited: !!pkg.unlimited,
      } : EMPTY_PKG)
    }
  }

  const upd = (p) => setForm((f) => ({ ...f, ...p }))

  async function save() {
    if (!form.name_ar.trim()) { setError('اسم الباقة مطلوب'); return }
    if (form.price === '' || Number(form.price) < 0) { setError('السعر مطلوب'); return }
    setSaving(true)
    setError('')
    const payload = {
      name_ar: form.name_ar.trim(),
      sessions: form.unlimited ? 999 : Number(form.sessions || 0),
      duration_months: Number(form.duration_months || 1),
      price: Number(form.price),
      unlimited: !!form.unlimited,
    }
    try {
      if (isEdit) await packagesApi.update(pkg.id, payload)
      else await packagesApi.create(payload)
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
      title={isEdit ? 'تعديل باقة' : 'باقة جديدة'}
      footer={
        <>
          <button onClick={onClose} className="btn-secondary flex-1" disabled={saving}>إلغاء</button>
          <button onClick={save} className="btn-primary flex-1" disabled={saving}>
            {saving ? 'جاري الحفظ...' : isEdit ? 'حفظ التعديلات' : 'إضافة الباقة'}
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
          <label className="label">اسم الباقة *</label>
          <input className="input" value={form.name_ar} onChange={(e) => upd({ name_ar: e.target.value })} placeholder="مثال: الباقة الذهبية" />
        </div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={form.unlimited} onChange={(e) => upd({ unlimited: e.target.checked })} className="w-4 h-4 accent-brand" />
          <span className="text-sm font-bold text-ink-primary">باقة غير محدودة (جلسات لا نهائية)</span>
        </label>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="label">عدد الجلسات</label>
            <input type="number" className="input tabular" value={form.unlimited ? '' : form.sessions} disabled={form.unlimited} onChange={(e) => upd({ sessions: e.target.value })} placeholder="٢٤" />
          </div>
          <div>
            <label className="label">المدة (أشهر)</label>
            <input type="number" className="input tabular" value={form.duration_months} onChange={(e) => upd({ duration_months: e.target.value })} placeholder="٣" />
          </div>
          <div>
            <label className="label">السعر (ر.س) *</label>
            <input type="number" className="input tabular" value={form.price} onChange={(e) => upd({ price: e.target.value })} placeholder="٣٩٠٠" />
          </div>
        </div>
      </div>
    </Modal>
  )
}

function Subscriptions() {
  const { data: subs = [], reload } = useApi(() => packagesApi.listSubscriptions())
  const [openId, setOpenId] = useState(null)
  const [busyId, setBusyId] = useState(null)
  async function freeze(id) {
    setBusyId(id)
    setOpenId(null)
    try {
      const res = await packagesApi.freezeSubscription(id)
      toast(res?.status === 'مجمدة' ? 'تم تجميد الاشتراك' : 'تم تفعيل الاشتراك', 'success')
      reload()
    } catch (e) {
      toast(e.message || 'تعذّر تنفيذ العملية', 'error')
    } finally {
      setBusyId(null)
    }
  }
  const data = (subs || []).map((s) => ({
    id: s.id,
    name_ar: s.client_name,
    package: s.package_name,
    startDate: s.start_date,
    endDate: s.end_date,
    remaining: s.sessions_remaining,
    total: s.sessions_total,
    amount: s.price_paid,
    rawStatus: s.status,
    status: s.status === 'نشطة' ? 'نشط' : s.status === 'مجمدة' ? 'مجمد' : 'منتهي',
  }))
  return (
    <div className="overflow-x-auto -mx-5 sm:-mx-6">
      <table className="min-w-full text-sm">
        <thead className="bg-bg/60 text-[10px] font-extrabold uppercase tracking-wider text-ink-tertiary">
          <tr>
            <th className="text-right px-5 py-3">العميل</th>
            <th className="text-right px-3 py-3">الباقة</th>
            <th className="text-right px-3 py-3 hidden md:table-cell">البدء</th>
            <th className="text-right px-3 py-3 hidden md:table-cell">المتبقي</th>
            <th className="text-right px-3 py-3 hidden lg:table-cell">المبلغ</th>
            <th className="text-right px-3 py-3">الحالة</th>
            <th className="text-right px-5 py-3"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/40">
          {data.map((c) => (
            <tr key={c.id} className="hover:bg-bg/40">
              <td className="px-5 py-3">
                <div className="flex items-center gap-2.5">
                  <span className={cn('w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-extrabold flex-shrink-0', avatarColor(c.name_ar))}>
                    {initials(c.name_ar)}
                  </span>
                  <span className="font-bold truncate">{c.name_ar}</span>
                </div>
              </td>
              <td className="px-3 py-3 font-bold">{c.package}</td>
              <td className="px-3 py-3 text-ink-secondary hidden md:table-cell">{c.startDate}</td>
              <td className="px-3 py-3 hidden md:table-cell">
                <span className="font-extrabold text-brand tabular">{typeof c.remaining === 'string' ? c.remaining : toArabicDigits(c.remaining)}</span>
                <span className="text-ink-tertiary"> / {c.total === 999 ? '∞' : toArabicDigits(c.total)}</span>
              </td>
              <td className="px-3 py-3 font-extrabold tabular hidden lg:table-cell">{formatNumberAr(c.amount)} ر.س</td>
              <td className="px-3 py-3">
                <span className={cn(
                  'px-2 py-0.5 rounded-full text-[10px] font-extrabold',
                  c.status === 'نشط' ? 'bg-emerald-50 text-emerald-700' :
                  c.status === 'مجمد' ? 'bg-blue-50 text-blue-700' :
                  c.status === 'تجريبي' ? 'bg-amber-50 text-amber-700' :
                  'bg-gray-100 text-gray-700'
                )}>
                  {c.status}
                </span>
              </td>
              <td className="px-5 py-3 text-left relative">
                <button
                  onClick={() => setOpenId(openId === c.id ? null : c.id)}
                  disabled={busyId === c.id}
                  title="خيارات"
                  className="w-8 h-8 rounded-lg hover:bg-bg flex items-center justify-center text-ink-tertiary disabled:opacity-40"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </button>
                {openId === c.id && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setOpenId(null)} />
                    <div className="absolute left-4 mt-1 w-44 bg-white rounded-xl shadow-card-hover border border-border/60 p-1.5 z-50 animate-fade-in">
                      {c.rawStatus === 'نشطة' ? (
                        <button onClick={() => freeze(c.id)} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-bold text-blue-700 hover:bg-blue-50 text-right">
                          <Snowflake className="w-4 h-4" /> تجميد الاشتراك
                        </button>
                      ) : c.rawStatus === 'مجمدة' ? (
                        <button onClick={() => freeze(c.id)} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-bold text-emerald-700 hover:bg-emerald-50 text-right">
                          <RotateCcw className="w-4 h-4" /> إلغاء التجميد
                        </button>
                      ) : (
                        <div className="px-3 py-2 text-xs text-ink-tertiary">لا توجد إجراءات متاحة</div>
                      )}
                    </div>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
