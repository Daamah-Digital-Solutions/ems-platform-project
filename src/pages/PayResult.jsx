import { useSearchParams } from 'react-router-dom'
import { CheckCircle2, XCircle, Clock } from 'lucide-react'

const VARIANTS = {
  paid: {
    icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-50',
    title: 'تم الدفع بنجاح 🎉', body: 'تم استلام دفعتك وتفعيل اشتراكك. هنتواصل معك لتأكيد موعدك.',
  },
  failed: {
    icon: XCircle, color: 'text-red-500', bg: 'bg-red-50',
    title: 'لم تكتمل عملية الدفع', body: 'حصلت مشكلة أثناء الدفع. حاول مرة أخرى أو تواصل مع الستوديو.',
  },
  pending: {
    icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50',
    title: 'الدفع قيد المعالجة', body: 'لو تم خصم المبلغ، سيتم تأكيد اشتراكك تلقائياً خلال لحظات.',
  },
}

export default function PayResult() {
  const [params] = useSearchParams()
  const status = params.get('status')
  const v = VARIANTS[status] || VARIANTS.pending
  const Icon = v.icon
  return (
    <div className="min-h-screen flex items-center justify-center bg-bg p-6" dir="rtl">
      <div className="bg-white rounded-2xl shadow-card-hover border border-border/60 max-w-md w-full p-8 text-center">
        <div className={`w-20 h-20 mx-auto rounded-full ${v.bg} flex items-center justify-center mb-5`}>
          <Icon className={`w-11 h-11 ${v.color}`} />
        </div>
        <h1 className="text-2xl font-extrabold text-ink-primary">{v.title}</h1>
        <p className="text-sm text-ink-secondary mt-3 leading-relaxed">{v.body}</p>
        <div className="mt-6 text-xs text-ink-tertiary font-bold">EMS ElRiyadh</div>
      </div>
    </div>
  )
}
