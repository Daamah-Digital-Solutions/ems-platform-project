import { useState } from 'react'
import { Plus, Search, FileText, Trash2, Eye, CreditCard, Receipt } from 'lucide-react'
import { manualPaymentsApi, fetchBlob } from '../lib/api.js'
import { useApi } from '../lib/useApi.js'
import { cn, toArabicDigits, formatNumberAr } from '../lib/utils.js'
import { toast } from '../lib/toast.js'
import ManualPaymentModal from '../components/ManualPaymentModal.jsx'
import PaymentLinkModal from '../components/PaymentLinkModal.jsx'

const KIND_STYLE = {
  'اشتراك': 'bg-brand-50 text-brand',
  'جلسة تجريبية': 'bg-amber-50 text-amber-700',
  'أخرى': 'bg-gray-100 text-gray-600',
}
const thisMonth = () => new Date().toISOString().slice(0, 7)
function fmtDate(iso) {
  if (!iso) return '—'
  const [y, m, d] = iso.split('-')
  return `${toArabicDigits(d)}/${toArabicDigits(m)}/${toArabicDigits(y)}`
}

export default function Payments() {
  const [month, setMonth] = useState(thisMonth())
  const [search, setSearch] = useState('')
  const [recordOpen, setRecordOpen] = useState(false)
  const [linkOpen, setLinkOpen] = useState(false)

  const { data: payments = [], reload } = useApi(() => manualPaymentsApi.list({ month }), [month])
  const { data: summary, reload: reloadSummary } = useApi(() => manualPaymentsApi.summary({ month }), [month])

  const reloadAll = () => { reload(); reloadSummary() }
  const list = (payments || []).filter((p) => !search || (p.client_name || '').includes(search))
  const byKind = summary?.by_kind || {}

  async function viewInvoice(p) {
    try {
      const blob = await fetchBlob(`/api/manual-payments/${p.id}/attachment`)
      window.open(URL.createObjectURL(blob), '_blank')
    } catch (e) {
      toast(e.message || 'تعذّر فتح الفاتورة', 'error')
    }
  }
  async function del(p) {
    if (!window.confirm(`حذف دفعة ${p.client_name} بمبلغ ${formatNumberAr(p.amount)} ر.س؟`)) return
    try {
      await manualPaymentsApi.remove(p.id)
      toast('تم حذف الدفعة', 'success')
      reloadAll()
    } catch (e) {
      toast(e.message || 'تعذّر الحذف', 'error')
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="page-title">المدفوعات</h1>
          <p className="page-subtitle">سجّل مدفوعات العملاء وفواتيرهم — والإجمالي يُحسب تلقائيًا شهريًا.</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setLinkOpen(true)} className="btn-secondary btn-sm">
            <CreditCard className="w-4 h-4" /> رابط دفع أونلاين
          </button>
          <button onClick={() => setRecordOpen(true)} className="btn-primary btn-sm">
            <Plus className="w-4 h-4" /> تسجيل دفعة
          </button>
        </div>
      </div>

      {/* Month + summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="card p-4">
          <div className="text-[10px] text-ink-tertiary font-bold mb-1">الشهر</div>
          <input type="month" value={month} onChange={(e) => setMonth(e.target.value)}
            className="w-full bg-bg border border-border rounded-lg px-2 h-9 text-sm font-bold tabular focus:outline-none focus:border-brand" />
        </div>
        <div className="card p-4">
          <div className="text-2xl font-extrabold tabular text-emerald-600">{formatNumberAr((summary?.total || 0).toFixed(0))}</div>
          <div className="text-[10px] text-ink-tertiary font-bold mt-0.5">إجمالي الشهر (ر.س)</div>
        </div>
        <div className="card p-4">
          <div className="text-2xl font-extrabold tabular text-brand">{toArabicDigits(summary?.count || 0)}</div>
          <div className="text-[10px] text-ink-tertiary font-bold mt-0.5">عدد الدفعات</div>
        </div>
        <div className="card p-4">
          <div className="text-2xl font-extrabold tabular text-indigo-600">{formatNumberAr(((byKind['اشتراك'] || 0)).toFixed(0))}</div>
          <div className="text-[10px] text-ink-tertiary font-bold mt-0.5">اشتراكات (ر.س)</div>
        </div>
      </div>

      {/* Search */}
      <div className="card p-3 flex items-center gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-ink-tertiary" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="ابحث باسم العميل..."
            className="w-full bg-bg border border-border rounded-lg pr-10 pl-3 h-10 text-sm focus:outline-none focus:border-brand" />
        </div>
      </div>

      {list.length === 0 ? (
        <div className="card p-12 text-center">
          <span className="w-14 h-14 mx-auto rounded-2xl bg-brand-50 text-brand flex items-center justify-center mb-4">
            <Receipt className="w-7 h-7" />
          </span>
          <h3 className="font-extrabold text-ink-primary">لا توجد مدفوعات في هذا الشهر</h3>
          <p className="text-sm text-ink-secondary mt-1">سجّل أول دفعة لعميل وارفق فاتورتها.</p>
          <button onClick={() => setRecordOpen(true)} className="btn-primary btn-sm mt-5">
            <Plus className="w-4 h-4" /> تسجيل دفعة
          </button>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-bg/60 text-[10px] font-extrabold uppercase tracking-wider text-ink-tertiary">
                <tr>
                  <th className="text-right px-5 py-3">التاريخ</th>
                  <th className="text-right px-3 py-3">العميل</th>
                  <th className="text-right px-3 py-3">النوع</th>
                  <th className="text-right px-3 py-3">المبلغ</th>
                  <th className="text-right px-3 py-3 hidden md:table-cell">الطريقة</th>
                  <th className="text-right px-3 py-3">الفاتورة</th>
                  <th className="text-right px-5 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {list.map((p) => (
                  <tr key={p.id} className="hover:bg-bg/40">
                    <td className="px-5 py-3 tabular text-ink-secondary">{fmtDate(p.paid_at)}</td>
                    <td className="px-3 py-3 font-bold">{p.client_name}</td>
                    <td className="px-3 py-3">
                      <span className={cn('px-2 py-0.5 rounded-full text-[10px] font-extrabold', KIND_STYLE[p.kind] || KIND_STYLE['أخرى'])}>{p.kind}</span>
                    </td>
                    <td className="px-3 py-3 font-extrabold tabular">{formatNumberAr(p.amount)} ر.س</td>
                    <td className="px-3 py-3 text-ink-secondary hidden md:table-cell">{p.method || '—'}</td>
                    <td className="px-3 py-3">
                      {p.has_attachment ? (
                        <button onClick={() => viewInvoice(p)} className="inline-flex items-center gap-1 text-brand font-bold hover:text-brand-light text-xs">
                          <Eye className="w-3.5 h-3.5" /> عرض
                        </button>
                      ) : (
                        <span className="text-ink-tertiary text-xs">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-left">
                      <button onClick={() => del(p)} title="حذف" className="w-8 h-8 rounded-lg hover:bg-red-50 text-red-500 flex items-center justify-center">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <ManualPaymentModal open={recordOpen} onClose={() => setRecordOpen(false)} onSaved={reloadAll} />
      <PaymentLinkModal open={linkOpen} onClose={() => setLinkOpen(false)} />
    </div>
  )
}
