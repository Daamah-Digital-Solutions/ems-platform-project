import { useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import { clientsApi } from '../lib/api.js'
import Modal from './Modal.jsx'

const EMPTY_FORM = {
  name_ar: '', phone: '', email: '', gender: '', age: '',
  status: 'تجريبي', suit_size: '', parq_status: 'ساري',
}

/** Shared create/edit client modal. Pass `client` to edit, omit to create. */
export default function ClientFormModal({ open, client, onClose, onSaved }) {
  const isEdit = !!client
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [lastOpen, setLastOpen] = useState(false)

  if (open !== lastOpen) {
    setLastOpen(open)
    if (open) {
      setError('')
      setForm(client ? {
        name_ar: client.name_ar || '',
        phone: client.phone || '',
        email: client.email || '',
        gender: client.gender || '',
        age: client.age ?? '',
        status: client.status || 'تجريبي',
        suit_size: client.suit_size || '',
        parq_status: client.parq_status || 'ساري',
      } : EMPTY_FORM)
    }
  }

  const upd = (p) => setForm((f) => ({ ...f, ...p }))

  async function save() {
    if (!form.name_ar.trim() || !form.phone.trim()) {
      setError('الاسم ورقم الجوال مطلوبان')
      return
    }
    setSaving(true)
    setError('')
    const payload = {
      name_ar: form.name_ar.trim(),
      phone: form.phone.trim(),
      email: form.email.trim() || undefined,
      gender: form.gender || undefined,
      age: form.age ? Number(form.age) : undefined,
      status: form.status,
      suit_size: form.suit_size || undefined,
      parq_status: form.parq_status || undefined,
    }
    try {
      if (isEdit) await clientsApi.update(client.id, payload)
      else await clientsApi.create(payload)
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
      title={isEdit ? 'تعديل عميل' : 'عميل جديد'}
      footer={
        <>
          <button onClick={onClose} className="btn-secondary flex-1" disabled={saving}>إلغاء</button>
          <button onClick={save} className="btn-primary flex-1" disabled={saving}>
            {saving ? 'جاري الحفظ...' : isEdit ? 'حفظ التعديلات' : 'إضافة العميل'}
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
          <label className="label">الاسم الكامل *</label>
          <input className="input" value={form.name_ar} onChange={(e) => upd({ name_ar: e.target.value })} placeholder="مثال: سارة العتيبي" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">رقم الجوال *</label>
            <input className="input ltr text-right" value={form.phone} onChange={(e) => upd({ phone: e.target.value })} placeholder="05XXXXXXXX" />
          </div>
          <div>
            <label className="label">البريد (اختياري)</label>
            <input className="input ltr text-right" value={form.email} onChange={(e) => upd({ email: e.target.value })} placeholder="name@email.com" />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="label">الجنس</label>
            <select className="input" value={form.gender} onChange={(e) => upd({ gender: e.target.value })}>
              <option value="">—</option>
              <option value="ذكر">ذكر</option>
              <option value="أنثى">أنثى</option>
            </select>
          </div>
          <div>
            <label className="label">العمر</label>
            <input type="number" className="input tabular" value={form.age} onChange={(e) => upd({ age: e.target.value })} placeholder="٣٠" />
          </div>
          <div>
            <label className="label">المقاس</label>
            <select className="input" value={form.suit_size} onChange={(e) => upd({ suit_size: e.target.value })}>
              <option value="">—</option>
              {['S', 'M', 'L', 'XL'].map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className="label">الحالة</label>
          <select className="input" value={form.status} onChange={(e) => upd({ status: e.target.value })}>
            {['نشط', 'تجريبي', 'مجمد', 'منتهي'].map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>
    </Modal>
  )
}
