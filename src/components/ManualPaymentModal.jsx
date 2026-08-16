import { useState } from 'react'
import { AlertTriangle, Upload, X, FileText } from 'lucide-react'
import { clientsApi, manualPaymentsApi } from '../lib/api.js'
import { useApi } from '../lib/useApi.js'
import Modal from './Modal.jsx'

const KINDS = ['اشتراك', 'جلسة تجريبية', 'أخرى']
const METHODS = ['نقدًا', 'شبكة (مدى)', 'تحويل', 'أخرى']
const todayISO = () => new Date().toISOString().slice(0, 10)

/** Log a manual payment for a client with an optional invoice image/file. */
export default function ManualPaymentModal({ open, onClose, onSaved, fixedClient }) {
  const { data: clients = [] } = useApi(() => clientsApi.list(), [])
  const [clientId, setClientId] = useState('')
  const [name, setName] = useState('')
  const [amount, setAmount] = useState('')
  const [kind, setKind] = useState('اشتراك')
  const [method, setMethod] = useState('نقدًا')
  const [date, setDate] = useState(todayISO())
  const [note, setNote] = useState('')
  const [file, setFile] = useState(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [lastOpen, setLastOpen] = useState(false)

  if (open !== lastOpen) {
    setLastOpen(open)
    if (open) {
      setError(''); setSaving(false); setFile(null)
      setClientId(fixedClient ? String(fixedClient.id) : '')
      setName(''); setAmount(''); setKind('اشتراك'); setMethod('نقدًا'); setDate(todayISO()); setNote('')
    }
  }

  function pickFile(e) {
    const f = e.target.files?.[0]
    if (!f) return
    const ok = f.type.startsWith('image/') || f.type === 'application/pdf'
    if (!ok) { setError('الملف لازم يكون صورة أو PDF'); return }
    if (f.size > 10 * 1024 * 1024) { setError('حجم الملف أكبر من ١٠ ميجابايت'); return }
    setError(''); setFile(f)
  }

  async function save() {
    const isOther = clientId === 'other' || clientId === ''
    if (isOther && !name.trim()) { setError('اختر عميلًا أو اكتب اسمه'); return }
    if (amount === '' || Number(amount) <= 0) { setError('أدخل مبلغًا صحيحًا'); return }
    setSaving(true); setError('')
    try {
      const fd = new FormData()
      fd.append('amount', String(Number(amount)))
      fd.append('kind', kind)
      if (!isOther) fd.append('client_id', clientId)
      else fd.append('client_name', name.trim())
      if (method) fd.append('method', method)
      if (date) fd.append('paid_at', date)
      if (note.trim()) fd.append('note', note.trim())
      if (file) fd.append('file', file)
      await manualPaymentsApi.create(fd)
      onSaved?.()
      onClose()
    } catch (e) {
      setError(e.message || 'تعذّر حفظ الدفعة')
      setSaving(false)
    }
  }

  const showName = clientId === 'other' || (clientId === '' && !fixedClient)

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="تسجيل دفعة"
      footer={
        <>
          <button onClick={onClose} className="btn-secondary flex-1" disabled={saving}>إلغاء</button>
          <button onClick={save} className="btn-primary flex-1" disabled={saving}>
            {saving ? 'جاري الحفظ...' : 'حفظ الدفعة'}
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

        {/* Client */}
        <div>
          <label className="label">العميل *</label>
          <select className="input" value={clientId} disabled={!!fixedClient} onChange={(e) => setClientId(e.target.value)}>
            <option value="">— اختر عميلًا مسجّلًا —</option>
            {(clients || []).map((c) => <option key={c.id} value={c.id}>{c.name_ar} — {c.phone}</option>)}
            <option value="other">عميل غير مسجّل (اكتب الاسم)</option>
          </select>
        </div>
        {showName && (
          <div>
            <label className="label">اسم العميل</label>
            <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="مثال: زائر — جلسة تجريبية" />
          </div>
        )}

        {/* Amount + kind */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">المبلغ (ر.س) *</label>
            <input type="number" className="input tabular" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="٣٩٠٠" />
          </div>
          <div>
            <label className="label">التاريخ</label>
            <input type="date" className="input tabular" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
        </div>

        <div>
          <label className="label">النوع</label>
          <div className="flex gap-2">
            {KINDS.map((k) => (
              <button key={k} type="button" onClick={() => setKind(k)}
                className={`flex-1 h-10 rounded-lg text-sm font-bold border transition-all ${kind === k ? 'bg-brand text-white border-brand' : 'bg-white text-ink-secondary border-border hover:border-brand-200'}`}>
                {k}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="label">طريقة الدفع</label>
          <select className="input" value={method} onChange={(e) => setMethod(e.target.value)}>
            {METHODS.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>

        {/* Invoice attachment */}
        <div>
          <label className="label">الفاتورة (صورة أو PDF) — اختياري</label>
          {file ? (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-bg border border-border">
              <FileText className="w-4 h-4 text-brand flex-shrink-0" />
              <span className="text-sm font-bold text-ink-primary flex-1 truncate">{file.name}</span>
              <span className="text-[11px] text-ink-tertiary">{(file.size / 1024).toFixed(0)} KB</span>
              <button type="button" onClick={() => setFile(null)} className="w-6 h-6 rounded-md hover:bg-red-50 text-red-600 flex items-center justify-center">
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <label className="flex items-center justify-center gap-2 p-4 rounded-lg border-2 border-dashed border-border hover:border-brand-200 cursor-pointer text-ink-secondary hover:text-brand transition-all">
              <Upload className="w-4 h-4" />
              <span className="text-sm font-bold">ارفع صورة الفاتورة أو ملف PDF</span>
              <input type="file" accept="image/*,application/pdf" onChange={pickFile} className="hidden" />
            </label>
          )}
        </div>

        <div>
          <label className="label">ملاحظة (اختياري)</label>
          <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2}
            className="w-full bg-bg border border-border rounded-lg p-3 text-sm focus:outline-none focus:border-brand"
            placeholder="أي تفاصيل عن الدفعة..." />
        </div>
      </div>
    </Modal>
  )
}
