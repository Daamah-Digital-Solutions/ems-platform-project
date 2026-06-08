import { Calendar, MessageCircle, TrendingUp, Check, Bell, Search, ChevronDown, Sparkles, Users } from 'lucide-react'

// Premium hero visual — full dashboard preview with floating cards & layers
export default function HeroVisual() {
  return (
    <div className="relative w-full max-w-[680px] mx-auto" dir="rtl">
      {/* Ambient glows */}
      <div className="absolute -inset-12 bg-brand/20 blur-[80px] rounded-[60px] -z-10 animate-glow" />
      <div className="absolute -inset-16 bg-accent/10 blur-[100px] rounded-[60px] -z-20" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-mesh-2 opacity-60 -z-10" />

      {/* Browser window frame */}
      <div className="relative bg-ink-primary rounded-[24px] p-2.5 shadow-premium">
        <div className="bg-bg rounded-[16px] overflow-hidden ring-1 ring-white/5">
          {/* Window chrome */}
          <div className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-b from-gray-50 to-gray-100 border-b border-border/60">
            <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            <div className="mx-auto px-4 py-1 rounded-md bg-white border border-border/60 text-[10px] text-ink-tertiary tabular flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              app.move.sa/dashboard
            </div>
          </div>

          {/* App body */}
          <div className="flex h-[400px] sm:h-[460px]">
            {/* Sidebar */}
            <aside className="w-[150px] sm:w-[170px] bg-white border-l border-border/60 p-3 hidden sm:flex flex-col">
              <div className="flex items-center gap-2 mb-5 pb-3 border-b border-border/60">
                <span className="w-7 h-7 rounded-lg bg-brand-gradient flex items-center justify-center">
                  <svg viewBox="0 0 32 32" className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 25 L5 7 L11.5 15 L16 11 L20.5 15 L27 7 L27 25" />
                  </svg>
                </span>
                <div>
                  <div className="text-[11px] font-extrabold tracking-tight">MOVE</div>
                  <div className="text-[8px] text-ink-tertiary">Fast Move</div>
                </div>
              </div>
              {[
                ['🏠', 'الرئيسية', true],
                ['👥', 'العملاء', false],
                ['📅', 'الحجوزات', false],
                ['📦', 'الباقات', false],
                ['💪', 'المدربين', false],
                ['📊', 'التقارير', false],
                ['⚙️', 'الإعدادات', false]
              ].map(([icon, label, active]) => (
                <div
                  key={label}
                  className={`flex items-center gap-2 px-2 py-1.5 rounded-md mb-0.5 text-[10px] transition-colors ${
                    active
                      ? 'bg-brand-50 text-brand font-extrabold'
                      : 'text-ink-secondary hover:bg-gray-50'
                  }`}
                >
                  <span className="text-[11px]">{icon}</span>
                  <span>{label}</span>
                </div>
              ))}
              <div className="mt-auto pt-3 border-t border-border/60">
                <div className="flex items-center gap-2 p-1.5 rounded-md hover:bg-gray-50">
                  <span className="w-6 h-6 rounded-full bg-brand-gradient text-white flex items-center justify-center text-[9px] font-extrabold">
                    أع
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-[9px] font-bold truncate">أحمد العتيبي</div>
                    <div className="text-[7px] text-ink-tertiary">المالك</div>
                  </div>
                </div>
              </div>
            </aside>

            {/* Main */}
            <main className="flex-1 p-3 sm:p-4 bg-bg overflow-hidden">
              {/* Top bar */}
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-[9px] text-ink-tertiary">صباح الخير 👋</div>
                  <div className="text-xs sm:text-sm font-extrabold">جدول اليوم</div>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="relative w-20 sm:w-28 h-6 bg-white rounded-md border border-border/60 flex items-center px-2 gap-1">
                    <Search className="w-2.5 h-2.5 text-ink-tertiary" />
                    <span className="text-[8px] text-ink-tertiary">ابحث...</span>
                  </div>
                  <div className="relative w-6 h-6 bg-white rounded-md border border-border/60 flex items-center justify-center">
                    <Bell className="w-3 h-3 text-ink-secondary" />
                    <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-accent ring-2 ring-bg" />
                  </div>
                </div>
              </div>

              {/* KPI grid */}
              <div className="grid grid-cols-4 gap-2 mb-3">
                {[
                  { v: '٢٤', l: 'حجوزات اليوم', t: 'text-brand', d: '+٣' },
                  { v: '١٤٧', l: 'عملاء نشطين', t: 'text-brand', d: '+١٢' },
                  { v: '62K', l: 'الإيراد', t: 'text-emerald-600', d: '+١٥٪' },
                  { v: '8٪', l: 'No-show', t: 'text-emerald-600', d: '-٢٪' }
                ].map((k) => (
                  <div
                    key={k.l}
                    className="bg-white rounded-lg p-2 border border-border/60 shadow-card"
                  >
                    <div className="text-[7px] text-ink-tertiary mb-0.5">{k.l}</div>
                    <div className={`text-sm font-extrabold ${k.t}`}>{k.v}</div>
                    <div className="text-[7px] text-emerald-600 font-bold mt-0.5">▲ {k.d}</div>
                  </div>
                ))}
              </div>

              {/* Bookings list with timeline */}
              <div className="bg-white rounded-lg border border-border/60 overflow-hidden">
                <div className="px-3 py-2 border-b border-border/60 flex items-center justify-between">
                  <div className="text-[10px] font-extrabold">الجلسات القادمة</div>
                  <div className="flex gap-1">
                    {['الكل', 'مؤكد', 'مكتمل'].map((t, i) => (
                      <span
                        key={t}
                        className={`px-1.5 py-0.5 rounded text-[8px] font-bold ${
                          i === 0 ? 'bg-brand text-white' : 'bg-gray-100 text-ink-secondary'
                        }`}
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                {[
                  { time: '٦:٠٠', name: 'نورة الخالدي', trainer: 'سارة', machine: '#١', tone: 'live', initials: 'نخ' },
                  { time: '٦:٣٠', name: 'محمد العتيبي', trainer: 'أحمد', machine: '#٢', tone: 'confirmed', initials: 'مع' },
                  { time: '٧:٠٠', name: 'ريم الدوسري', trainer: 'منى', machine: '#٣', tone: 'confirmed', initials: 'رد' },
                  { time: '٧:٣٠', name: 'فيصل الغامدي', trainer: 'عمر', machine: '#٤', tone: 'confirmed', initials: 'فغ' }
                ].map((b, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 px-3 py-2 border-b border-border/40 last:border-0 hover:bg-bg/50"
                  >
                    <div className="text-[9px] tabular font-extrabold text-ink-secondary w-8 leading-tight">
                      {b.time}
                      <div className="text-[7px] font-normal text-ink-tertiary">ص</div>
                    </div>
                    <span
                      className={`w-1 h-7 rounded-full ${
                        b.tone === 'live' ? 'bg-emerald-500' : 'bg-brand'
                      } ${b.tone === 'live' ? 'animate-pulse' : ''}`}
                    />
                    <span className="w-6 h-6 rounded-full bg-gradient-to-br from-brand-100 to-brand-50 text-brand flex items-center justify-center text-[8px] font-extrabold border border-brand-200/60">
                      {b.initials}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="text-[10px] font-extrabold truncate">{b.name}</div>
                      <div className="text-[7px] text-ink-tertiary">
                        كابتن {b.trainer} • جهاز {b.machine}
                      </div>
                    </div>
                    {b.tone === 'live' ? (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[8px] font-extrabold">
                        <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                        جاري
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[8px] font-extrabold">
                        مؤكد
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </main>
          </div>
        </div>
        {/* Laptop base */}
        <div className="h-1 mx-auto w-1/3 bg-gradient-to-b from-gray-800 to-gray-700 rounded-b-xl mt-1.5" />
      </div>

      {/* Floating: WhatsApp notification card */}
      <div className="absolute -top-6 -right-4 sm:-right-12 w-[200px] sm:w-[240px] animate-float">
        <div className="bg-white rounded-2xl shadow-premium border border-border/60 p-3.5 backdrop-blur">
          <div className="flex items-start gap-2.5">
            <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-emerald-500 flex items-center justify-center shadow-glow-lg">
              <MessageCircle className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="text-[10px] font-extrabold text-ink-primary">واتساب</span>
                <span className="text-[8px] text-emerald-600 font-bold">● مرسل</span>
              </div>
              <p className="text-[10px] text-ink-secondary leading-snug">
                "تذكير: جلستك مع كابتن سارة اليوم الساعة ٦:٠٠ م 💪"
              </p>
              <div className="flex items-center gap-1 mt-1.5">
                <Check className="w-2.5 h-2.5 text-emerald-500" strokeWidth={3} />
                <Check className="w-2.5 h-2.5 text-emerald-500 -mr-1" strokeWidth={3} />
                <span className="text-[8px] text-emerald-600 font-bold mr-1">تم القراءة</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating: Revenue stat card */}
      <div className="absolute top-1/3 -left-4 sm:-left-12 w-[170px] sm:w-[190px] animate-float-delay">
        <div className="bg-white rounded-2xl shadow-premium border border-border/60 p-3.5">
          <div className="flex items-center justify-between mb-1.5">
            <div>
              <div className="text-[9px] text-ink-tertiary font-bold">إيراد هذا الشهر</div>
              <div className="text-xl font-extrabold text-ink-primary tabular">
                62,400 <span className="text-[9px] font-bold text-ink-secondary">ر.س</span>
              </div>
            </div>
            <div className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700">
              <TrendingUp className="w-2.5 h-2.5" />
              <span className="text-[9px] font-extrabold">+١٥٪</span>
            </div>
          </div>
          {/* Chart */}
          <div className="flex items-end gap-0.5 h-8">
            {[30, 38, 35, 42, 48, 52, 58, 62].map((h, i) => (
              <div
                key={i}
                className={`flex-1 rounded-sm ${
                  i === 7 ? 'bg-brand' : 'bg-brand-100'
                }`}
                style={{ height: `${h}%` }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Floating: New booking card */}
      <div className="absolute -bottom-6 -left-2 sm:-left-8 w-[200px] sm:w-[230px] animate-float-slow">
        <div className="bg-white rounded-2xl shadow-premium border border-border/60 p-3.5">
          <div className="flex items-center gap-2 mb-2">
            <span className="flex-shrink-0 w-8 h-8 rounded-xl bg-accent-gradient text-white flex items-center justify-center shadow-glow-accent">
              <Sparkles className="w-4 h-4" />
            </span>
            <div>
              <div className="text-[10px] font-extrabold">حجز جديد</div>
              <div className="text-[8px] text-ink-tertiary">قبل ٢ دقيقة</div>
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-[9px]">
              <Users className="w-2.5 h-2.5 text-brand" />
              <span className="font-bold">عبدالله السبيعي</span>
            </div>
            <div className="flex items-center gap-1.5 text-[9px]">
              <Calendar className="w-2.5 h-2.5 text-brand" />
              <span className="text-ink-secondary">الغد ٧:٠٠ م</span>
            </div>
            <div className="flex items-center gap-1.5 text-[9px]">
              <Check className="w-2.5 h-2.5 text-emerald-500" strokeWidth={3} />
              <span className="text-emerald-600 font-bold">تم تأكيد واتساب تلقائياً</span>
            </div>
          </div>
        </div>
      </div>

      {/* Floating: Star rating chip */}
      <div className="hidden lg:block absolute -bottom-4 right-8 animate-float">
        <div className="flex items-center gap-1.5 bg-white rounded-full shadow-premium border border-border/60 px-3 py-1.5">
          <div className="flex">
            {[0, 1, 2, 3, 4].map((i) => (
              <svg key={i} className="w-3 h-3 text-amber-400 fill-amber-400" viewBox="0 0 24 24">
                <polygon points="12,2 15,9 22,9 17,14 19,21 12,17 5,21 7,14 2,9 9,9" />
              </svg>
            ))}
          </div>
          <span className="text-[10px] font-extrabold text-ink-primary">٤.٩</span>
          <span className="text-[9px] text-ink-tertiary">من ٥٠+ ستوديو</span>
        </div>
      </div>
    </div>
  )
}
