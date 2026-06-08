import { useState } from 'react'
import { Cpu, Layers, Wrench, AlertTriangle, Plus, Edit } from 'lucide-react'
import { resourcesApi } from '../lib/api.js'
import { useApi } from '../lib/useApi.js'
import { cn, toArabicDigits, formatNumberAr } from '../lib/utils.js'
import Modal from '../components/Modal.jsx'

const MACHINE_STATUS = {
  متاح: { bg: 'bg-emerald-50 text-emerald-700', dot: 'bg-emerald-500', icon: '✅' },
  'في جلسة': { bg: 'bg-blue-50 text-blue-700', dot: 'bg-blue-500 animate-pulse', icon: '🔵' },
  'صيانة مجدولة': { bg: 'bg-amber-50 text-amber-700', dot: 'bg-amber-500', icon: '⚠️' }
}

const SUIT_STATUS = {
  متاح: 'bg-emerald-50 text-emerald-700',
  'في الغسيل': 'bg-blue-50 text-blue-700',
  'في جلسة': 'bg-amber-50 text-amber-700',
  'يحتاج استبدال': 'bg-red-50 text-red-700'
}

function washColor(n) {
  if (n <= 30) return 'bg-emerald-500'
  if (n <= 50) return 'bg-amber-500'
  return 'bg-red-500'
}

export default function Resources() {
  const [sizeFilter, setSizeFilter] = useState('all')
  const [modal, setModal] = useState(null) // { type:'machine'|'suit', item?:obj } | null
  const sizes = ['all', 'S', 'M', 'L', 'XL']
  const { data: machines = [], reload: reloadMachines } = useApi(() => resourcesApi.listMachines())
  const { data: suits = [], reload: reloadSuits } = useApi(() => resourcesApi.listSuits())
  const machinesList = machines || []
  const suitsList = suits || []
  const filteredSuits = suitsList.filter((s) => sizeFilter === 'all' || s.size === sizeFilter)

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="page-title">الموارد</h1>
          <p className="page-subtitle">الأجهزة والبدلات والصيانة.</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { v: toArabicDigits(machinesList.length), l: 'الأجهزة', c: 'text-brand', i: Cpu },
          { v: toArabicDigits(suitsList.length), l: 'البدلات', c: 'text-indigo-600', i: Layers },
          { v: toArabicDigits(suitsList.filter((s) => s.washes > 50).length), l: 'تحتاج استبدال', c: 'text-red-600', i: AlertTriangle },
          { v: toArabicDigits(machinesList.filter((m) => m.status === 'صيانة مجدولة').length), l: 'صيانة مجدولة', c: 'text-amber-600', i: Wrench }
        ].map((s) => (
          <div key={s.l} className="card p-4 flex items-center gap-3">
            <span className={cn('w-10 h-10 rounded-lg bg-bg flex items-center justify-center', s.c)}>
              <s.i className="w-5 h-5" />
            </span>
            <div>
              <div className={cn('text-2xl font-extrabold tabular', s.c)}>{s.v}</div>
              <div className="text-[10px] text-ink-tertiary font-bold">{s.l}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Machines */}
      <section className="card p-5 sm:p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <span className="w-9 h-9 rounded-lg bg-brand-50 text-brand flex items-center justify-center">
              <Cpu className="w-5 h-5" />
            </span>
            <div>
              <h2 className="font-extrabold text-ink-primary">الأجهزة</h2>
              <p className="text-xs text-ink-tertiary">{toArabicDigits(machinesList.length)} جهاز</p>
            </div>
          </div>
          <button onClick={() => setModal({ type: 'machine' })} className="btn-secondary btn-sm">
            <Plus className="w-3.5 h-3.5" /> إضافة
          </button>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {machinesList.map((m) => {
            const s = MACHINE_STATUS[m.status] || MACHINE_STATUS['متاح']
            return (
              <div key={m.id} className="border border-border/60 rounded-xl p-4 hover:shadow-card-hover transition-all">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="font-extrabold text-ink-primary">{m.label}</div>
                    <div className="text-xs text-ink-tertiary">{m.model}</div>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className={cn('inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-extrabold', s.bg)}>
                      <span className={cn('w-1.5 h-1.5 rounded-full', s.dot)} />
                      {m.status}
                    </span>
                    <button onClick={() => setModal({ type: 'machine', item: m })} title="تعديل" className="w-7 h-7 rounded-lg hover:bg-bg flex items-center justify-center text-ink-tertiary hover:text-brand">
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[10px]">
                  <div className="bg-bg/60 rounded-lg p-2">
                    <div className="text-ink-tertiary font-bold">آخر صيانة</div>
                    <div className="font-extrabold text-ink-primary tabular">{m.last_service || '—'}</div>
                  </div>
                  <div className="bg-bg/60 rounded-lg p-2">
                    <div className="text-ink-tertiary font-bold">الصيانة القادمة</div>
                    <div className="font-extrabold text-ink-primary tabular">{m.next_service || '—'}</div>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between text-[10px]">
                  <span className="text-ink-tertiary font-bold">إجمالي الجلسات</span>
                  <span className="font-extrabold text-brand tabular">{formatNumberAr(m.total_sessions || 0)}</span>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* Suits */}
      <section className="card p-5 sm:p-6">
        <div className="flex items-center justify-between flex-wrap gap-3 mb-5">
          <div className="flex items-center gap-2">
            <span className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </span>
            <div>
              <h2 className="font-extrabold text-ink-primary">البدلات</h2>
              <p className="text-xs text-ink-tertiary">{toArabicDigits(filteredSuits.length)} من {toArabicDigits(suitsList.length)} بدلة</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="inline-flex items-center gap-0.5 p-1 rounded-lg bg-bg border border-border/60">
              {sizes.map((s) => (
                <button
                  key={s}
                  onClick={() => setSizeFilter(s)}
                  className={cn(
                    'px-3 h-8 rounded-md text-xs font-extrabold',
                    sizeFilter === s ? 'bg-white shadow-sm text-ink-primary' : 'text-ink-secondary'
                  )}
                >
                  {s === 'all' ? 'الكل' : s}
                </button>
              ))}
            </div>
            <button onClick={() => setModal({ type: 'suit' })} className="btn-secondary btn-sm">
              <Plus className="w-3.5 h-3.5" /> إضافة
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {filteredSuits.map((s) => (
            <div key={s.id} className="border border-border/60 rounded-xl p-4 hover:shadow-card transition-all group">
              <div className="flex items-center justify-between mb-2">
                <div className="font-extrabold text-sm">{s.label}</div>
                <div className="flex items-center gap-1">
                  <span className="px-1.5 py-0.5 rounded bg-bg text-[10px] font-extrabold border border-border/60">
                    {s.size}
                  </span>
                  <button onClick={() => setModal({ type: 'suit', item: s })} title="تعديل" className="w-6 h-6 rounded-md hover:bg-bg flex items-center justify-center text-ink-tertiary hover:text-brand opacity-0 group-hover:opacity-100 transition-opacity">
                    <Edit className="w-3 h-3" />
                  </button>
                </div>
              </div>
              <span className={cn('inline-block px-2 py-0.5 rounded-full text-[10px] font-extrabold mb-3', SUIT_STATUS[s.status])}>
                {s.status}
              </span>
              <div>
                <div className="flex items-center justify-between text-[10px] mb-1">
                  <span className="text-ink-tertiary font-bold">الغسلات</span>
                  <span className="font-extrabold tabular">{toArabicDigits(s.washes)} / ٦٠</span>
                </div>
                <div className="h-1.5 bg-bg rounded-full overflow-hidden">
                  <div className={cn('h-full rounded-full', washColor(s.washes))} style={{ width: `${(s.washes / 60) * 100}%` }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <ResourceFormModal
        modal={modal}
        onClose={() => setModal(null)}
        onSaved={() => {
          if (modal?.type === 'machine') reloadMachines()
          else reloadSuits()
          setModal(null)
        }}
      />
    </div>
  )
}

function ResourceFormModal({ modal, onClose, onSaved }) {
  const open = !!modal
  const type = modal?.type
  const item = modal?.item
  const isEdit = !!item
  const [form, setForm] = useState({})
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [lastKey, setLastKey] = useState(null)

  const key = modal ? `${type}-${item?.id || 'new'}` : null
  if (key !== lastKey) {
    setLastKey(key)
    setError('')
    if (modal) {
      if (type === 'machine') {
        setForm(item
          ? { label: item.label || '', model: item.model || '', status: item.status || 'متاح', last_service: item.last_service || '', next_service: item.next_service || '' }
          : { label: '', model: 'miha bodytec II', status: 'متاح', last_service: '', next_service: '' })
      } else {
        setForm(item
          ? { label: item.label || '', size: item.size || 'M', status: item.status || 'متاح', washes: item.washes ?? 0 }
          : { label: '', size: 'M', status: 'متاح', washes: 0 })
      }
    }
  }

  const upd = (p) => setForm((f) => ({ ...f, ...p }))

  async function save() {
    if (!form.label || !form.label.trim()) { setError('الاسم/الرقم مطلوب'); return }
    setSaving(true)
    setError('')
    try {
      if (type === 'machine') {
        const payload = {
          label: form.label.trim(),
          model: form.model || undefined,
          status: form.status || 'متاح',
          last_service: form.last_service || undefined,
          next_service: form.next_service || undefined,
        }
        if (isEdit) await resourcesApi.updateMachine(item.id, payload)
        else await resourcesApi.createMachine(payload)
      } else {
        if (isEdit) {
          // backend suit update supports status + washes
          await resourcesApi.updateSuit(item.id, { status: form.status, washes: Number(form.washes || 0) })
        } else {
          await resourcesApi.createSuit({
            label: form.label.trim(),
            size: form.size || 'M',
            status: form.status || 'متاح',
            washes: Number(form.washes || 0),
          })
        }
      }
      onSaved?.()
    } catch (e) {
      setError(e.message || 'فشل الحفظ')
    } finally {
      setSaving(false)
    }
  }

  const title = `${isEdit ? 'تعديل' : 'إضافة'} ${type === 'machine' ? 'جهاز' : 'بدلة'}`

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      footer={
        <>
          <button onClick={onClose} className="btn-secondary flex-1" disabled={saving}>إلغاء</button>
          <button onClick={save} className="btn-primary flex-1" disabled={saving}>
            {saving ? 'جاري الحفظ...' : isEdit ? 'حفظ التعديلات' : 'إضافة'}
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
          <label className="label">{type === 'machine' ? 'اسم/رقم الجهاز *' : 'اسم/رقم البدلة *'}</label>
          <input className="input" value={form.label || ''} disabled={type === 'suit' && isEdit} onChange={(e) => upd({ label: e.target.value })} placeholder={type === 'machine' ? 'الجهاز #6' : 'البدلة #16'} />
        </div>

        {type === 'machine' ? (
          <>
            <div>
              <label className="label">الموديل</label>
              <input className="input" value={form.model || ''} onChange={(e) => upd({ model: e.target.value })} placeholder="miha bodytec II" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">آخر صيانة</label>
                <input className="input ltr text-right" value={form.last_service || ''} onChange={(e) => upd({ last_service: e.target.value })} placeholder="2025/03/10" />
              </div>
              <div>
                <label className="label">الصيانة القادمة</label>
                <input className="input ltr text-right" value={form.next_service || ''} onChange={(e) => upd({ next_service: e.target.value })} placeholder="2025/06/10" />
              </div>
            </div>
          </>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">المقاس</label>
              <select className="input" value={form.size || 'M'} disabled={isEdit} onChange={(e) => upd({ size: e.target.value })}>
                {['S', 'M', 'L', 'XL'].map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="label">عدد الغسلات</label>
              <input type="number" className="input tabular" value={form.washes ?? 0} onChange={(e) => upd({ washes: e.target.value })} />
            </div>
          </div>
        )}

        <div>
          <label className="label">الحالة</label>
          <select className="input" value={form.status || 'متاح'} onChange={(e) => upd({ status: e.target.value })}>
            {(type === 'machine'
              ? ['متاح', 'في جلسة', 'صيانة مجدولة']
              : ['متاح', 'في الغسيل', 'في جلسة', 'يحتاج استبدال']
            ).map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>
    </Modal>
  )
}
