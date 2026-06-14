import { useState } from 'react'
import { Plus, Search, Copy, MessageCircle, RefreshCw, CreditCard } from 'lucide-react'
import { paymentsApi } from '../lib/api.js'
import { useApi } from '../lib/useApi.js'
import { cn, toArabicDigits, formatNumberAr, waLink } from '../lib/utils.js'
import { toast } from '../lib/toast.js'
import PaymentLinkModal from '../components/PaymentLinkModal.jsx'

const STATUS = {
  paid: { l: 'مدفوع', c: 'bg-emerald-50 text-emerald-700', dot: 'bg-emerald-500' },
  pending: { l: 'بانتظار الدفع', c: 'bg-amber-50 text-amber-700', dot: 'bg-amber-500' },
  failed: { l: 'فشل', c: 'bg-red-50 text-red-700', dot: 'bg-red-500' },
  expired: { l: 'منتهي', c: 'bg-gray-100 text-gray-600', dot: 'bg-gray-400' },
}

export default function Payments() {
  const { data: payments = [], reload } = useApi(() => paymentsApi.list())
  const [search, setSearch] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [busyId, setBusyId] = useState(null)

  const list = (payments || []).filter((p) =>
    !search || (p.client_name || '').includes(search) || (p.package_name || '').includes(search)
  )
  const totalPaid = (payments || []).filter((p) => p.status === 'paid').reduce((s, p) => s + p.amount, 0)
  const paidCount = (payments || []).filter((p) => p.status === 'paid').length
  const pendingCount = (payments || []).filter((p) => p.status === 'pending').length

  function copy(p) {
    if (p.payment_url) { navigator.clipboard?.writeText(p.payment_url); toast('تم نسخ الرابط', 'success') }
  }
  function whatsapp(p) {
    const msg = `مرحباً ${p.client_name || ''}،\nرابط دفع باقة "${p.package_name}" بمبلغ ${formatNumberAr(p.amount)} ر.س:\n${p.payment_url}`
    window.open(waLink(p.client_phone, msg), '_blank')
  }
  async function refresh(p) {
    setBusyId(p.id)
    try { await paymentsApi.refresh(p.id); toast('تم تحديث الحالة', 'success'); reload() }
    catch (e) { toast(e.message || 'تعذّر التحديث', 'error') }
    finally { setBusyId(null) }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="page-title">المدفوعات</h1>
          <p className="page-subtitle">روابط الدفع وحالتها.</p>
        </div>
        <button onClick={() => setFormOpen(true)} className="btn-primary btn-sm">
          <Plus className="w-4 h-4" /> رابط دفع جديد
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { v: toArabicDigits((payments || []).length), l: 'إجمالي الروابط', c: 'text-brand' },
          { v: toArabicDigits(paidCount), l: 'مدفوعة', c: 'text-emerald-600' },
          { v: toArabicDigits(pendingCount), l: 'بانتظار الدفع', c: 'text-amber-600' },
          { v: formatNumberAr(totalPaid.toFixed(0)), l: 'محصّل (ر.س)', c: 'text-indigo-600' },
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
            placeholder="ابحث باسم العميل أو الباقة..."
            className="w-full bg-bg border border-border rounded-lg pr-10 pl-3 h-10 text-sm focus:outline-none focus:border-brand"
          />
        </div>
      </div>

      {list.length === 0 ? (
        <div className="card p-12 text-center">
          <span className="w-14 h-14 mx-auto rounded-2xl bg-brand-50 text-brand flex items-center justify-center mb-4">
            <CreditCard className="w-7 h-7" />
          </span>
          <h3 className="font-extrabold text-ink-primary">لا توجد روابط دفع بعد</h3>
          <p className="text-sm text-ink-secondary mt-1">أنشئ أول رابط دفع وابعته للعميل.</p>
          <button onClick={() => setFormOpen(true)} className="btn-primary btn-sm mt-5">
            <Plus className="w-4 h-4" /> رابط دفع جديد
          </button>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-bg/60 text-[10px] font-extrabold uppercase tracking-wider text-ink-tertiary">
                <tr>
                  <th className="text-right px-5 py-3">العميل</th>
                  <th className="text-right px-3 py-3">الباقة</th>
                  <th className="text-right px-3 py-3">المبلغ</th>
                  <th className="text-right px-3 py-3 hidden md:table-cell">الطريقة</th>
                  <th className="text-right px-3 py-3">الحالة</th>
                  <th className="text-right px-3 py-3 hidden lg:table-cell">التاريخ</th>
                  <th className="text-right px-5 py-3">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {list.map((p) => {
                  const s = STATUS[p.status] || STATUS.pending
                  return (
                    <tr key={p.id} className="hover:bg-bg/40">
                      <td className="px-5 py-3 font-bold">{p.client_name}</td>
                      <td className="px-3 py-3">{p.package_name}</td>
                      <td className="px-3 py-3 font-extrabold tabular">{formatNumberAr(p.amount)} ر.س</td>
                      <td className="px-3 py-3 text-ink-secondary hidden md:table-cell">{p.method || '—'}</td>
                      <td className="px-3 py-3">
                        <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-extrabold', s.c)}>
                          <span className={cn('w-1.5 h-1.5 rounded-full', s.dot)} />
                          {s.l}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-ink-tertiary text-xs hidden lg:table-cell">
                        {new Date(p.created_at).toLocaleDateString('ar-SA')}
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-1">
                          <button onClick={() => whatsapp(p)} title="واتساب" disabled={!p.payment_url} className="w-8 h-8 rounded-lg hover:bg-emerald-50 text-emerald-600 flex items-center justify-center disabled:opacity-30">
                            <MessageCircle className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => copy(p)} title="نسخ الرابط" disabled={!p.payment_url} className="w-8 h-8 rounded-lg hover:bg-bg text-ink-secondary flex items-center justify-center disabled:opacity-30">
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => refresh(p)} title="تحديث الحالة" disabled={busyId === p.id} className="w-8 h-8 rounded-lg hover:bg-bg text-ink-secondary flex items-center justify-center disabled:opacity-30">
                            <RefreshCw className={cn('w-3.5 h-3.5', busyId === p.id && 'animate-spin')} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <PaymentLinkModal open={formOpen} onClose={() => setFormOpen(false)} onCreated={reload} />
    </div>
  )
}
