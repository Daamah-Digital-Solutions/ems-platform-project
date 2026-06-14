import { useState } from 'react'
import { AlertTriangle, Copy, MessageCircle, Check, ExternalLink } from 'lucide-react'
import { clientsApi, packagesApi, paymentsApi } from '../lib/api.js'
import { useApi } from '../lib/useApi.js'
import { waLink, formatNumberAr } from '../lib/utils.js'
import { toast } from '../lib/toast.js'
import Modal from './Modal.jsx'

/**
 * Shared "create payment link" modal.
 * Props: open, onClose, fixedClient (client obj), fixedPackage (package obj), onCreated()
 */
export default function PaymentLinkModal({ open, onClose, fixedClient, fixedPackage, onCreated }) {
  const { data: clients = [] } = useApi(() => clientsApi.list(), [])
  const { data: packages = [] } = useApi(() => packagesApi.list(), [])

  const [clientId, setClientId] = useState('')
  const [packageId, setPackageId] = useState('')
  const [amount, setAmount] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [created, setCreated] = useState(null)
  const [lastOpen, setLastOpen] = useState(false)

  if (open !== lastOpen) {
    setLastOpen(open)
    if (open) {
      setError(''); setCreated(null); setSaving(false)
      setClientId(fixedClient ? String(fixedClient.id) : '')
      setPackageId(fixedPackage ? String(fixedPackage.id) : '')
      setAmount(fixedPackage ? String(fixedPackage.price) : '')
    }
  }

  const pkgList = packages || []
  const onPickPackage = (id) => {
    setPackageId(id)
    const p = pkgList.find((x) => String(x.id) === String(id))
    if (p) setAmount(String(p.price))
  }

  async function create() {
    if (!clientId || !packageId) { setError('اختر العميل والباقة'); return }
    setSaving(true); setError('')
    try {
      const p = await paymentsApi.create({
        client_id: Number(clientId),
        package_id: Number(packageId),
        amount: amount !== '' ? Number(amount) : undefined,
      })
      setCreated(p)
      onCreated?.()
    } catch (e) {
      setError(e.message || 'تعذّر إنشاء رابط الدفع')
    } finally {
      setSaving(false)
    }
  }

  function copyLink() {
    if (created?.payment_url) {
      navigator.clipboard?.writeText(created.payment_url)
      toast('تم نسخ الرابط', 'success')
    }
  }
  function sendWhatsApp() {
    if (!created) return
    const msg = `مرحباً ${created.client_name || ''}،\nرابط دفع باقة "${created.package_name}" بمبلغ ${formatNumberAr(created.amount)} ر.س:\n${created.payment_url}`
    window.open(waLink(created.client_phone, msg), '_blank')
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="إنشاء رابط دفع"
      footer={created ? (
        <button onClick={onClose} className="btn-primary flex-1">تم</button>
      ) : (
        <>
          <button onClick={onClose} className="btn-secondary flex-1" disabled={saving}>إلغاء</button>
          <button onClick={create} className="btn-primary flex-1" disabled={saving}>
            {saving ? 'جاري الإنشاء...' : 'إنشاء الرابط'}
          </button>
        </>
      )}
    >
      {!created ? (
        <div className="space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-800 text-sm font-bold flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}
          <div>
            <label className="label">العميل *</label>
            <select className="input" value={clientId} disabled={!!fixedClient} onChange={(e) => setClientId(e.target.value)}>
              <option value="">— اختر العميل —</option>
              {(clients || []).map((c) => <option key={c.id} value={c.id}>{c.name_ar} — {c.phone}</option>)}
            </select>
          </div>
          <div>
            <label className="label">الباقة *</label>
            <select className="input" value={packageId} disabled={!!fixedPackage} onChange={(e) => onPickPackage(e.target.value)}>
              <option value="">— اختر الباقة —</option>
              {pkgList.map((p) => <option key={p.id} value={p.id}>{p.name_ar} — {formatNumberAr(p.price)} ر.س</option>)}
            </select>
          </div>
          <div>
            <label className="label">المبلغ (ر.س)</label>
            <input type="number" className="input tabular" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="السعر الافتراضي للباقة" />
          </div>
          <p className="text-xs text-ink-tertiary">
            هيتولّد رابط دفع من Tap — العميل يفتحه ويختار طريقة الدفع (mada / بطاقة / Apple Pay / تابي / تمارا حسب المُفعّل).
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-bold flex items-center gap-2">
            <Check className="w-4 h-4" /> تم إنشاء الرابط — ابعته للعميل
          </div>
          <div className="rounded-xl border border-border/60 p-3 bg-bg/50">
            <div className="text-[10px] font-extrabold text-ink-tertiary mb-1">{created.package_name} • {formatNumberAr(created.amount)} ر.س • {created.client_name}</div>
            <div className="text-xs ltr break-all text-brand font-bold">{created.payment_url}</div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button onClick={sendWhatsApp} className="btn bg-emerald-500 text-white hover:bg-emerald-600 btn-sm justify-center">
              <MessageCircle className="w-4 h-4" /> واتساب
            </button>
            <button onClick={copyLink} className="btn-secondary btn-sm justify-center">
              <Copy className="w-4 h-4" /> نسخ
            </button>
            <a href={created.payment_url} target="_blank" rel="noreferrer" className="btn-secondary btn-sm justify-center">
              <ExternalLink className="w-4 h-4" /> فتح
            </a>
          </div>
        </div>
      )}
    </Modal>
  )
}
