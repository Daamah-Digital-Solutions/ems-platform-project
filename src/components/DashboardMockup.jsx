import { Calendar, MessageCircle, Users } from 'lucide-react'

// Inline SVG mockup of the product — used in the hero
export default function DashboardMockup() {
  return (
    <div className="relative w-full max-w-[640px]">
      {/* Glow */}
      <div className="absolute -inset-8 bg-brand/10 blur-3xl rounded-[40px] -z-10" />
      <div className="absolute -inset-12 bg-accent/10 blur-3xl rounded-[40px] -z-10" />

      {/* Laptop frame */}
      <div className="relative bg-gray-900 rounded-[20px] p-2.5 shadow-2xl">
        <div className="bg-bg rounded-[12px] overflow-hidden">
          {/* Window chrome */}
          <div className="flex items-center gap-1.5 px-3 py-2 bg-gray-100">
            <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            <div className="mx-auto px-4 py-0.5 rounded-md bg-white text-[10px] text-ink-tertiary tabular">
              move.sa/dashboard
            </div>
          </div>

          {/* App body */}
          <div className="flex h-[340px] sm:h-[400px]">
            {/* Sidebar */}
            <aside className="w-[140px] bg-white border-l border-border p-3 hidden sm:block">
              <div className="flex items-center gap-1.5 mb-4">
                <span className="w-6 h-6 rounded-md bg-brand-gradient" />
                <span className="text-xs font-bold">MOVE</span>
              </div>
              {['الرئيسية', 'العملاء', 'الحجوزات', 'الباقات', 'التقارير'].map((label, i) => (
                <div
                  key={label}
                  className={`px-2 py-1.5 rounded-md mb-1 text-[10px] ${
                    i === 0 ? 'bg-brand-50 text-brand font-bold' : 'text-ink-secondary'
                  }`}
                >
                  {label}
                </div>
              ))}
            </aside>
            {/* Main */}
            <main className="flex-1 p-3 bg-bg overflow-hidden">
              <div className="text-[10px] text-ink-tertiary mb-1">صباح الخير، أحمد</div>
              <div className="text-sm font-extrabold mb-2.5">جدول اليوم</div>
              {/* KPI row */}
              <div className="grid grid-cols-4 gap-1.5 mb-2.5">
                {[
                  ['٢٤', 'حجوزات'],
                  ['١٤٧', 'عملاء'],
                  ['62K', 'إيراد'],
                  ['8٪', 'No-show']
                ].map(([n, label]) => (
                  <div key={label} className="bg-white rounded-md p-1.5 border border-border/70">
                    <div className="text-[11px] font-extrabold text-brand">{n}</div>
                    <div className="text-[8px] text-ink-tertiary">{label}</div>
                  </div>
                ))}
              </div>
              {/* Bookings list */}
              <div className="space-y-1.5">
                {[
                  { time: '٦:٠٠', name: 'نورة الخالدي', t: 'سارة', tone: 'success' },
                  { time: '٦:٣٠', name: 'محمد العتيبي', t: 'أحمد', tone: 'brand' },
                  { time: '٧:٠٠', name: 'ريم الدوسري', t: 'منى', tone: 'brand' },
                  { time: '٧:٣٠', name: 'فيصل الغامدي', t: 'عمر', tone: 'accent' }
                ].map((b, i) => (
                  <div key={i} className="flex items-center gap-2 bg-white rounded-md p-1.5 border border-border/70">
                    <span className="text-[9px] tabular font-bold text-ink-secondary w-8">{b.time}</span>
                    <span
                      className={`w-1 h-6 rounded-full ${
                        b.tone === 'success'
                          ? 'bg-emerald-500'
                          : b.tone === 'accent'
                          ? 'bg-accent'
                          : 'bg-brand'
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-[10px] font-bold truncate">{b.name}</div>
                      <div className="text-[8px] text-ink-tertiary">كابتن {b.t}</div>
                    </div>
                    <span className="text-[8px] text-ink-tertiary">جهاز #{i + 1}</span>
                  </div>
                ))}
              </div>
            </main>
          </div>
        </div>
        {/* Laptop base */}
        <div className="h-2.5 mx-auto w-1/2 bg-gray-800 rounded-b-xl mt-1" />
      </div>

      {/* Floating phone */}
      <div className="absolute -bottom-6 -left-6 sm:-left-10 w-[120px] sm:w-[160px] hidden xs:block">
        <div className="bg-gray-900 rounded-[22px] p-1.5 shadow-2xl rotate-[-6deg]">
          <div className="bg-white rounded-[16px] overflow-hidden">
            <div className="h-3 bg-gray-900" />
            <div className="p-2">
              <div className="text-[8px] text-ink-tertiary">حجز جديد</div>
              <div className="text-[10px] font-extrabold mb-1.5">نورة الخالدي</div>
              <div className="space-y-1">
                <div className="flex items-center gap-1 text-[8px]">
                  <Calendar className="w-2.5 h-2.5 text-brand" />
                  <span>اليوم ٦:٠٠ م</span>
                </div>
                <div className="flex items-center gap-1 text-[8px]">
                  <Users className="w-2.5 h-2.5 text-brand" />
                  <span>كابتن سارة</span>
                </div>
                <div className="flex items-center gap-1 text-[8px]">
                  <MessageCircle className="w-2.5 h-2.5 text-emerald-500" />
                  <span className="text-emerald-600 font-bold">تم تأكيد واتساب</span>
                </div>
              </div>
              <div className="mt-2 h-6 bg-brand-gradient rounded-md flex items-center justify-center text-[9px] text-white font-bold">
                تأكيد الحجز
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating stat card */}
      <div className="absolute -top-4 -right-4 sm:-right-8 bg-white rounded-xl shadow-card-hover border border-border/60 p-3 w-[140px] hidden xs:block">
        <div className="text-[10px] text-ink-tertiary mb-0.5">معدل no-show</div>
        <div className="flex items-end gap-1">
          <div className="text-xl font-extrabold text-emerald-600">٨٪</div>
          <div className="text-[10px] font-bold text-emerald-600 mb-1">▼ ٦٠٪</div>
        </div>
        <div className="mt-1.5 flex items-end gap-0.5 h-5">
          {[40, 35, 32, 28, 22, 18, 14, 8].map((h, i) => (
            <div
              key={i}
              className={`flex-1 rounded-sm ${i === 7 ? 'bg-emerald-500' : 'bg-emerald-200'}`}
              style={{ height: `${h * 0.6}px` }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
