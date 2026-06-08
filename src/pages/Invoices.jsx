import { useState } from 'react'
import {
  Receipt,
  Plus,
  Download,
  QrCode,
  ShieldCheck,
  FileText,
  X,
  Search,
  Check,
  AlertCircle
} from 'lucide-react'
import { invoicesApi, clientsApi } from '../lib/api.js'
import { useApi } from '../lib/useApi.js'
import { cn, toArabicDigits, formatNumberAr } from '../lib/utils.js'


function StatusBadge({ status }) {
  const styles = {
    cleared: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500', label: 'مُعتمد ZATCA' },
    pending: { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500', label: 'قيد المعالجة' },
    rejected: { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500', label: 'مرفوض' },
  }
  const s = styles[status] || styles.pending
  return (
    <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-extrabold', s.bg, s.text)}>
      <span className={cn('w-1.5 h-1.5 rounded-full', s.dot)} />
      {s.label}
    </span>
  )
}


function NewInvoiceModal({ onClose, onCreated }) {
  const { data: clients = [] } = useApi(() => clientsApi.list())
  const [clientId, setClientId] = useState('')
  const [description, setDescription] = useState('باقة EMS')
  const [items, setItems] = useState([{ name: 'جلسة EMS', quantity: 1, unit_price: 200 }])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const subtotal = items.reduce((s, it) => s + (it.quantity || 0) * (it.unit_price || 0), 0)
  const vat = +(subtotal * 0.15).toFixed(2)
  const total = +(subtotal + vat).toFixed(2)

  function addItem() {
    setItems([...items, { name: '', quantity: 1, unit_price: 0 }])
  }
  function updateItem(i, patch) {
    setItems(items.map((it, idx) => (idx === i ? { ...it, ...patch } : it)))
  }
  function removeItem(i) {
    setItems(items.filter((_, idx) => idx !== i))
  }

  async function submit() {
    setError('')
    setSubmitting(true)
    try {
      const inv = await invoicesApi.create({
        client_id: clientId ? Number(clientId) : undefined,
        description,
        invoice_type: clientId ? 'standard' : 'simplified',
        items: items.map(it => ({ name: it.name, quantity: Number(it.quantity), unit_price: Number(it.unit_price) })),
      })
      onCreated(inv)
    } catch (e) {
      setError(e.message || 'فشل إنشاء الفاتورة')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 animate-fade-in" onClick={onClose} />
      <div className="relative card-premium w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-slide-up">
        <header className="sticky top-0 bg-white border-b border-border/60 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-extrabold">فاتورة جديدة</h2>
            <p className="text-xs text-ink-tertiary">متوافقة مع ZATCA Phase 2</p>
          </div>
          <button onClick={onClose} className="p-2 -ml-2 rounded-lg hover:bg-bg">
            <X className="w-5 h-5" />
          </button>
        </header>

        <div className="p-6 space-y-5">
          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-800 text-sm font-bold flex items-start gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              {error}
            </div>
          )}

          <div>
            <label className="label">العميل (اختياري — للفاتورة الـ B2B)</label>
            <select
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              className="input"
            >
              <option value="">— فاتورة مبسطة (B2C) —</option>
              {(clients || []).map(c => (
                <option key={c.id} value={c.id}>{c.name_ar}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">الوصف</label>
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="input"
              placeholder="مثلاً: الباقة الذهبية - ٢٤ جلسة"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="label mb-0">البنود</label>
              <button onClick={addItem} className="text-xs font-extrabold text-brand hover:text-brand-light">
                + بند جديد
              </button>
            </div>
            <div className="space-y-2">
              {items.map((it, i) => (
                <div key={i} className="grid grid-cols-12 gap-2 items-center">
                  <input
                    value={it.name}
                    onChange={(e) => updateItem(i, { name: e.target.value })}
                    placeholder="اسم البند"
                    className="input col-span-6 h-11"
                  />
                  <input
                    type="number"
                    value={it.quantity}
                    onChange={(e) => updateItem(i, { quantity: e.target.value })}
                    placeholder="كمية"
                    className="input col-span-2 h-11 tabular"
                  />
                  <input
                    type="number"
                    value={it.unit_price}
                    onChange={(e) => updateItem(i, { unit_price: e.target.value })}
                    placeholder="السعر"
                    className="input col-span-3 h-11 tabular"
                  />
                  <button
                    onClick={() => removeItem(i)}
                    disabled={items.length === 1}
                    className="col-span-1 w-9 h-9 rounded-lg hover:bg-red-50 text-red-600 flex items-center justify-center disabled:opacity-30"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-bg/60 rounded-xl p-4 border border-border/60 space-y-1.5 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-ink-secondary">الإجمالي قبل الضريبة</span>
              <span className="font-extrabold tabular">{formatNumberAr(subtotal.toFixed(2))} ر.س</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-ink-secondary">ضريبة القيمة المضافة ١٥٪</span>
              <span className="font-extrabold tabular">{formatNumberAr(vat.toFixed(2))} ر.س</span>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-border/60">
              <span className="font-extrabold text-ink-primary">الإجمالي شامل الضريبة</span>
              <span className="text-xl font-extrabold tabular text-brand">{formatNumberAr(total.toFixed(2))} ر.س</span>
            </div>
          </div>
        </div>

        <footer className="sticky bottom-0 bg-white border-t border-border/60 px-6 py-4 flex justify-end gap-2">
          <button onClick={onClose} className="btn-secondary">إلغاء</button>
          <button onClick={submit} disabled={submitting} className="btn-primary">
            {submitting ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                جاري الإصدار...
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                إصدار وتسجيل في ZATCA
              </>
            )}
          </button>
        </footer>
      </div>
    </div>
  )
}


function InvoiceDetailModal({ invoice, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 animate-fade-in" onClick={onClose} />
      <div className="relative card-premium w-full max-w-3xl max-h-[90vh] overflow-y-auto animate-slide-up">
        <header className="sticky top-0 bg-white border-b border-border/60 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Receipt className="w-5 h-5" />
            </span>
            <div>
              <div className="text-xs text-ink-tertiary">فاتورة</div>
              <div className="font-extrabold tabular">{invoice.invoice_number}</div>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-bg">
            <X className="w-5 h-5" />
          </button>
        </header>

        <div className="p-6 space-y-5">
          <StatusBadge status={invoice.zatca_status} />

          <div className="grid sm:grid-cols-2 gap-5">
            <div className="space-y-3">
              <div>
                <div className="text-[10px] uppercase tracking-wider font-extrabold text-ink-tertiary mb-1">العميل</div>
                <div className="font-bold">{invoice.client_name || 'عميل عام (B2C)'}</div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wider font-extrabold text-ink-tertiary mb-1">نوع الفاتورة</div>
                <div className="font-bold">{invoice.invoice_type === 'standard' ? 'ضريبية (B2B)' : 'مبسطة (B2C)'}</div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wider font-extrabold text-ink-tertiary mb-1">تاريخ الإصدار</div>
                <div className="font-bold">{new Date(invoice.issue_date).toLocaleString('ar-SA')}</div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wider font-extrabold text-ink-tertiary mb-1">Invoice Hash</div>
                <div className="font-mono text-[10px] break-all bg-bg p-2 rounded">{invoice.invoice_hash}</div>
              </div>
            </div>

            <div className="flex flex-col items-center justify-center bg-bg/60 rounded-xl p-5 border border-border/60">
              <div className="text-[10px] uppercase tracking-wider font-extrabold text-ink-tertiary mb-3 flex items-center gap-1.5">
                <QrCode className="w-3 h-3" /> QR Code (ZATCA TLV)
              </div>
              {invoice.qr_base64 && (
                <img
                  src={`data:image/png;base64,${invoice.qr_base64}`}
                  alt="ZATCA QR"
                  className="w-40 h-40 rounded-lg border border-border/60 bg-white p-2"
                />
              )}
              <div className="mt-3 text-[10px] text-ink-tertiary text-center">
                Tags 1-5: المُصدر، الرقم الضريبي، الوقت، الإجمالي، الضريبة
              </div>
            </div>
          </div>

          <div className="bg-bg/40 rounded-xl p-4 border border-border/60 space-y-1.5 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-ink-secondary">الإجمالي قبل الضريبة</span>
              <span className="font-extrabold tabular">{formatNumberAr(invoice.subtotal.toFixed(2))} ر.س</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-ink-secondary">ضريبة القيمة المضافة ١٥٪</span>
              <span className="font-extrabold tabular">{formatNumberAr(invoice.vat_amount.toFixed(2))} ر.س</span>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-border/60">
              <span className="font-extrabold text-ink-primary">الإجمالي شامل الضريبة</span>
              <span className="text-2xl font-extrabold tabular text-brand">{formatNumberAr(invoice.total.toFixed(2))} ر.س</span>
            </div>
          </div>

          <div className="flex gap-2">
            <a
              href={`/api/invoices/${invoice.id}/xml`}
              target="_blank"
              rel="noreferrer"
              className="btn-secondary flex-1"
            >
              <FileText className="w-4 h-4" /> تحميل XML
            </a>
            <button onClick={() => window.print()} className="btn-primary flex-1">
              <Download className="w-4 h-4" /> طباعة PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}


export default function Invoices() {
  const [showNew, setShowNew] = useState(false)
  const [openInvoice, setOpenInvoice] = useState(null)
  const [search, setSearch] = useState('')
  const { data: invoices = [], reload } = useApi(() => invoicesApi.list())
  const list = (invoices || []).filter(i =>
    !search || i.invoice_number.includes(search) || (i.client_name || '').includes(search)
  )
  const totalRevenue = (invoices || []).reduce((s, i) => s + i.total, 0)
  const totalVat = (invoices || []).reduce((s, i) => s + i.vat_amount, 0)
  const cleared = (invoices || []).filter(i => i.zatca_status === 'cleared').length

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="page-title">الفواتير</h1>
          <p className="page-subtitle">فواتير إلكترونية متوافقة مع ZATCA Phase 2.</p>
        </div>
        <button onClick={() => setShowNew(true)} className="btn-primary btn-sm">
          <Plus className="w-4 h-4" /> فاتورة جديدة
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { v: toArabicDigits((invoices || []).length), l: 'إجمالي الفواتير', c: 'text-brand' },
          { v: toArabicDigits(cleared), l: 'مُعتمدة ZATCA', c: 'text-emerald-600' },
          { v: formatNumberAr(totalRevenue.toFixed(0)), l: 'إيراد (ر.س)', c: 'text-indigo-600' },
          { v: formatNumberAr(totalVat.toFixed(0)), l: 'ضريبة (ر.س)', c: 'text-amber-600' },
        ].map((s) => (
          <div key={s.l} className="card p-4">
            <div className={cn('text-2xl font-extrabold tabular', s.c)}>{s.v}</div>
            <div className="text-[10px] text-ink-tertiary font-bold mt-0.5">{s.l}</div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="card p-3 flex items-center gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-ink-tertiary" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ابحث برقم الفاتورة أو العميل..."
            className="w-full bg-bg border border-border rounded-lg pr-10 pl-3 h-10 text-sm focus:outline-none focus:border-brand"
          />
        </div>
      </div>

      {/* Invoice list */}
      {list.length === 0 ? (
        <div className="card p-12 text-center">
          <span className="w-14 h-14 mx-auto rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
            <Receipt className="w-7 h-7" />
          </span>
          <h3 className="font-extrabold text-ink-primary">لا توجد فواتير بعد</h3>
          <p className="text-sm text-ink-secondary mt-1">أنشئ أول فاتورة متوافقة مع ZATCA Phase 2.</p>
          <button onClick={() => setShowNew(true)} className="btn-primary btn-sm mt-5">
            <Plus className="w-4 h-4" /> فاتورة جديدة
          </button>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-bg/60 text-[10px] font-extrabold uppercase tracking-wider text-ink-tertiary">
                <tr>
                  <th className="text-right px-5 py-3">رقم الفاتورة</th>
                  <th className="text-right px-3 py-3">العميل</th>
                  <th className="text-right px-3 py-3 hidden md:table-cell">التاريخ</th>
                  <th className="text-right px-3 py-3">الإجمالي</th>
                  <th className="text-right px-3 py-3">الحالة</th>
                  <th className="text-right px-5 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {list.map((inv) => (
                  <tr key={inv.id} className="hover:bg-bg/40 cursor-pointer" onClick={() => setOpenInvoice(inv)}>
                    <td className="px-5 py-3 font-extrabold tabular text-brand">{inv.invoice_number}</td>
                    <td className="px-3 py-3 font-bold">{inv.client_name || 'عميل عام'}</td>
                    <td className="px-3 py-3 text-ink-secondary hidden md:table-cell text-xs">
                      {new Date(inv.issue_date).toLocaleDateString('ar-SA')}
                    </td>
                    <td className="px-3 py-3 font-extrabold tabular">
                      {formatNumberAr(inv.total.toFixed(2))} ر.س
                    </td>
                    <td className="px-3 py-3">
                      <StatusBadge status={inv.zatca_status} />
                    </td>
                    <td className="px-5 py-3 text-left">
                      <button className="text-xs font-extrabold text-brand">عرض ←</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showNew && (
        <NewInvoiceModal
          onClose={() => setShowNew(false)}
          onCreated={(inv) => {
            setShowNew(false)
            setOpenInvoice(inv)
            reload()
          }}
        />
      )}
      {openInvoice && <InvoiceDetailModal invoice={openInvoice} onClose={() => setOpenInvoice(null)} />}
    </div>
  )
}
