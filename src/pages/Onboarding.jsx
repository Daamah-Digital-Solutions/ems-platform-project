import { useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Upload,
  MapPin,
  Phone,
  Users,
  GitBranch,
  Clock,
  Sun,
  Moon,
  ChevronDown,
  Check,
  Dumbbell,
  Layers,
  Sparkles,
  PartyPopper,
  Calendar,
  ShieldCheck
} from 'lucide-react'
import Logo from '../components/Logo.jsx'
import { prayerTimes } from '../data/mockData.js'
import { auth, setSession } from '../lib/api.js'
import { cn, formatNumberAr, toArabicDigits } from '../lib/utils.js'

const TOTAL_STEPS = 6
const CITIES = ['الرياض', 'جدة', 'الخبر', 'الدمام', 'مكة المكرمة', 'المدينة المنورة', 'الطائف', 'القصيم']
const DAYS = ['السبت', 'الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة']
const DEFAULT_HOURS = {
  السبت: { open: '06:00', close: '23:00', closed: false },
  الأحد: { open: '06:00', close: '23:00', closed: false },
  الإثنين: { open: '06:00', close: '23:00', closed: false },
  الثلاثاء: { open: '06:00', close: '23:00', closed: false },
  الأربعاء: { open: '06:00', close: '23:00', closed: false },
  الخميس: { open: '06:00', close: '23:00', closed: false },
  الجمعة: { open: '14:00', close: '23:00', closed: false }
}

// ============== shared components ==============
function ProgressBar({ step }) {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-3">
        <div className="text-xs font-bold text-ink-secondary">
          الخطوة <span className="text-brand tabular">{toArabicDigits(step)}</span> من{' '}
          <span className="tabular">{toArabicDigits(TOTAL_STEPS)}</span>
        </div>
        <div className="text-xs font-bold text-ink-tertiary tabular">
          {toArabicDigits(Math.round(((step - 1) / (TOTAL_STEPS - 1)) * 100))}٪
        </div>
      </div>
      <div className="h-1.5 bg-bg rounded-full overflow-hidden">
        <div
          className="h-full bg-brand-gradient transition-all duration-500 ease-out rounded-full"
          style={{ width: `${((step - 1) / (TOTAL_STEPS - 1)) * 100}%` }}
        />
      </div>
    </div>
  )
}

function StepShell({ children, side, eyebrow, title, subtitle }) {
  return (
    <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-start">
      <div className="lg:col-span-7 order-2 lg:order-1 animate-slide-up">
        {eyebrow && <div className="eyebrow-brand mb-4">{eyebrow}</div>}
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-ink-primary tracking-tight leading-tight">
          {title}
        </h1>
        {subtitle && <p className="mt-3 text-base text-ink-secondary leading-relaxed">{subtitle}</p>}
        <div className="mt-8">{children}</div>
      </div>
      {side && (
        <div className="lg:col-span-5 order-1 lg:order-2 lg:sticky lg:top-28">{side}</div>
      )}
    </div>
  )
}

function SideCard({ children }) {
  return (
    <div className="relative">
      <div className="absolute -inset-6 bg-brand/8 blur-3xl rounded-3xl -z-10" />
      <div className="bg-white rounded-2xl border border-border/60 shadow-premium p-5 sm:p-6">{children}</div>
    </div>
  )
}

function FieldLabel({ children, required }) {
  return (
    <label className="block text-sm font-bold text-ink-primary mb-2">
      {children} {required && <span className="text-accent">*</span>}
    </label>
  )
}

function HelperText({ children, tone = 'default' }) {
  return (
    <p
      className={cn(
        'text-xs mt-1.5',
        tone === 'success' && 'text-emerald-600 font-bold',
        tone === 'danger' && 'text-danger font-bold',
        tone === 'default' && 'text-ink-tertiary'
      )}
    >
      {children}
    </p>
  )
}

function NavButtons({ onBack, onNext, nextLabel = 'متابعة', backDisabled, nextDisabled, last }) {
  return (
    <div className="mt-10 flex items-center justify-between gap-3">
      <button
        type="button"
        onClick={onBack}
        disabled={backDisabled}
        className="btn-ghost btn-lg disabled:opacity-30"
      >
        <ArrowRight className="w-4 h-4" />
        <span>السابق</span>
      </button>
      <button
        type="button"
        onClick={onNext}
        disabled={nextDisabled}
        className={cn(last ? 'btn-accent' : 'btn-primary', 'btn-lg group min-w-[160px]')}
      >
        <span>{nextLabel}</span>
        {last ? (
          <Sparkles className="w-4 h-4" />
        ) : (
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        )}
      </button>
    </div>
  )
}

// ============== STEP 1 — Studio info ==============
function Step1({ data, set, onNext, onBack }) {
  const valid =
    data.nameAr.trim().length >= 2 &&
    data.city &&
    data.phone.trim().length >= 9 &&
    data.userNameAr.trim().length >= 2 &&
    /\S+@\S+\.\S+/.test(data.userEmail) &&
    data.userPassword.length >= 4
  return (
    <StepShell
      eyebrow="الخطوة ١"
      title="معلومات الستوديو"
      subtitle="فلنبدأ بمعرفة ستوديوهك. ستظهر هذه المعلومات في الفواتير ولوحة التحكم."
      side={
        <SideCard>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-14 h-14 rounded-2xl bg-brand-gradient text-white flex items-center justify-center font-extrabold text-xl shadow-glow">
              {data.nameAr.trim().slice(0, 2) || 'مو'}
            </div>
            <div>
              <div className="text-xs text-ink-tertiary">معاينة مباشرة</div>
              <div className="font-extrabold text-ink-primary">
                {data.nameAr || 'اسم ستوديوهك'}
              </div>
              <div className="text-xs text-ink-secondary">
                {data.city || 'المدينة'} {data.phone && '•'} {data.phone}
              </div>
            </div>
          </div>
          <div className="bg-bg rounded-xl p-4 border border-border/60">
            <div className="flex items-center gap-2 text-xs text-ink-secondary mb-2">
              <MapPin className="w-3.5 h-3.5" />
              <span className="font-bold">العنوان على الفاتورة</span>
            </div>
            <div className="text-sm text-ink-primary font-bold">
              {data.nameAr || '________'}
            </div>
            <div className="text-xs text-ink-tertiary mt-0.5">
              {data.city || '________'} • {data.phone || '+966 ________'}
            </div>
          </div>
        </SideCard>
      }
    >
      <div className="space-y-5">
        <div>
          <FieldLabel required>اسم الستوديو بالعربي</FieldLabel>
          <div className="input-icon-wrap">
            <Building2 className="icon w-4 h-4" />
            <input
              type="text"
              value={data.nameAr}
              onChange={(e) => set({ nameAr: e.target.value })}
              className="input"
              placeholder="مثلاً: Fast Move Riyadh"
              autoFocus
            />
          </div>
        </div>

        <div>
          <FieldLabel>اسم الستوديو بالإنجليزي</FieldLabel>
          <div className="input-icon-wrap">
            <Building2 className="icon w-4 h-4" />
            <input
              type="text"
              value={data.nameEn}
              onChange={(e) => set({ nameEn: e.target.value })}
              className="input ltr text-right"
              placeholder="Fast Move Riyadh"
              dir="ltr"
            />
          </div>
          <HelperText>سيظهر في الفواتير الإلكترونية المتوافقة مع ZATCA.</HelperText>
        </div>

        <div>
          <FieldLabel>شعار الستوديو</FieldLabel>
          <label className="flex items-center gap-3 p-4 border-2 border-dashed border-border rounded-xl hover:border-brand-300 hover:bg-brand-50/30 cursor-pointer transition-all">
            <div className="w-14 h-14 rounded-xl bg-brand-50 text-brand flex items-center justify-center">
              <Upload className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <div className="font-bold text-ink-primary text-sm">اسحب الصورة هنا أو اضغط للاختيار</div>
              <div className="text-xs text-ink-tertiary">PNG / JPG / SVG • مقاس مفضّل ٥١٢×٥١٢</div>
            </div>
            <input type="file" className="hidden" />
          </label>
        </div>

        <div className="pt-2 border-t border-border/60">
          <div className="text-xs font-extrabold uppercase tracking-wider text-ink-tertiary mb-3 mt-3">حساب المالك</div>
          <div className="grid sm:grid-cols-2 gap-5">
            <div>
              <FieldLabel required>اسمك</FieldLabel>
              <input
                type="text"
                value={data.userNameAr}
                onChange={(e) => set({ userNameAr: e.target.value })}
                className="input"
                placeholder="مثلاً: أحمد العتيبي"
              />
            </div>
            <div>
              <FieldLabel required>البريد الإلكتروني</FieldLabel>
              <input
                type="email"
                value={data.userEmail}
                onChange={(e) => set({ userEmail: e.target.value })}
                className="input ltr text-right"
                placeholder="you@studio.sa"
                dir="ltr"
              />
            </div>
          </div>
          <div className="mt-5">
            <FieldLabel required>كلمة المرور</FieldLabel>
            <input
              type="password"
              value={data.userPassword}
              onChange={(e) => set({ userPassword: e.target.value })}
              className="input ltr text-right"
              placeholder="٤ أحرف على الأقل"
              dir="ltr"
            />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-5">
          <div>
            <FieldLabel required>المدينة</FieldLabel>
            <div className="relative">
              <select
                value={data.city}
                onChange={(e) => set({ city: e.target.value })}
                className="input appearance-none pl-10"
              >
                <option value="">اختر المدينة...</option>
                {CITIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-ink-tertiary absolute top-1/2 -translate-y-1/2 left-3 pointer-events-none" />
              <MapPin className="w-4 h-4 text-ink-tertiary absolute top-1/2 -translate-y-1/2 right-4 pointer-events-none" />
            </div>
          </div>

          <div>
            <FieldLabel required>رقم الجوال</FieldLabel>
            <div className="relative">
              <span className="absolute right-3 top-1/2 -translate-y-1/2 inline-flex items-center gap-1 px-2 py-1 rounded-md bg-bg text-xs font-bold text-ink-secondary border border-border">
                <Phone className="w-3 h-3" />
                +966
              </span>
              <input
                type="tel"
                value={data.phone}
                onChange={(e) => set({ phone: e.target.value.replace(/[^\d ]/g, '') })}
                className="input ltr text-right"
                style={{ paddingInlineStart: '4.5rem' }}
                placeholder="50 123 4567"
                dir="ltr"
              />
            </div>
          </div>
        </div>
      </div>
      <NavButtons onBack={onBack} onNext={onNext} backDisabled={true} nextDisabled={!valid} />
    </StepShell>
  )
}

// ============== STEP 2 — Studio type ==============
function Step2({ data, set, onNext, onBack }) {
  const types = [
    { v: 'men', t: 'ستوديو للرجال فقط', d: 'مدربين رجال • قسم واحد', emoji: '💪' },
    { v: 'women', t: 'ستوديو للنساء فقط', d: 'مدربات نساء • قسم واحد', emoji: '🌸' },
    { v: 'mixed', t: 'ستوديو مختلط بأقسام منفصلة', d: 'قسم رجال + قسم نساء • مدربين منفصلين', emoji: '🤝' }
  ]
  const branches = ['1', '2-3', '4-5', '6+']
  const valid = data.studioType && data.branches
  return (
    <StepShell
      eyebrow="الخطوة ٢"
      title="نوع الستوديو"
      subtitle="هذا يساعدنا في تخصيص النظام لاحتياجاتك — من المدربين إلى التقارير."
      side={
        <SideCard>
          <div className="text-xs text-ink-tertiary mb-3">معاينة مباشرة</div>
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <span className="w-7 h-7 rounded-lg bg-brand-50 text-brand flex items-center justify-center text-lg">
                {types.find((t) => t.v === data.studioType)?.emoji || '🏢'}
              </span>
              <span className="font-bold">
                {types.find((t) => t.v === data.studioType)?.t || 'لم يتم الاختيار'}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="w-7 h-7 rounded-lg bg-brand-50 text-brand flex items-center justify-center">
                <GitBranch className="w-3.5 h-3.5" />
              </span>
              <span className="font-bold">{data.branches ? `${data.branches} فرع` : 'لم يتم الاختيار'}</span>
            </div>
          </div>
          <div className="mt-5 pt-5 border-t border-border/60">
            <div className="flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 rounded-lg p-3">
              <ShieldCheck className="w-4 h-4 flex-shrink-0" />
              <span>سنُجهّز لك المدربين والأجهزة المناسبة لكل قسم تلقائياً.</span>
            </div>
          </div>
        </SideCard>
      }
    >
      <div className="space-y-3">
        {types.map((t) => (
          <label
            key={t.v}
            className={cn(
              'group flex items-center gap-4 p-4 sm:p-5 rounded-2xl border-2 cursor-pointer transition-all',
              data.studioType === t.v
                ? 'border-brand bg-brand-50/40 shadow-card'
                : 'border-border hover:border-brand-200 hover:bg-bg'
            )}
          >
            <input
              type="radio"
              name="type"
              checked={data.studioType === t.v}
              onChange={() => set({ studioType: t.v })}
              className="sr-only"
            />
            <span
              className={cn(
                'w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0',
                data.studioType === t.v
                  ? 'bg-brand text-white shadow-glow'
                  : 'bg-bg group-hover:bg-brand-50'
              )}
            >
              {t.emoji}
            </span>
            <div className="flex-1">
              <div className="font-extrabold text-ink-primary">{t.t}</div>
              <div className="text-xs text-ink-tertiary mt-0.5">{t.d}</div>
            </div>
            <span
              className={cn(
                'w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all',
                data.studioType === t.v ? 'border-brand bg-brand' : 'border-border bg-white'
              )}
            >
              {data.studioType === t.v && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
            </span>
          </label>
        ))}
      </div>

      <div className="mt-8">
        <FieldLabel>عدد الفروع</FieldLabel>
        <div className="grid grid-cols-4 gap-2">
          {branches.map((b) => (
            <button
              key={b}
              type="button"
              onClick={() => set({ branches: b })}
              className={cn(
                'h-14 rounded-xl border-2 font-extrabold text-base transition-all tabular',
                data.branches === b
                  ? 'border-brand bg-brand text-white shadow-glow'
                  : 'border-border bg-white text-ink-primary hover:border-brand-200'
              )}
            >
              {toArabicDigits(b)}
            </button>
          ))}
        </div>
        <HelperText>الفروع المتعددة متاحة في باقة المؤسسات.</HelperText>
      </div>

      <NavButtons onBack={onBack} onNext={onNext} nextDisabled={!valid} />
    </StepShell>
  )
}

// ============== STEP 3 — Working hours ==============
function Step3({ data, set, onNext, onBack }) {
  function updateDay(day, patch) {
    set({ hours: { ...data.hours, [day]: { ...data.hours[day], ...patch } } })
  }
  function applyToAll() {
    const ref = data.hours.السبت
    const next = {}
    DAYS.forEach((d) => (next[d] = { ...ref }))
    set({ hours: next })
  }
  return (
    <StepShell
      eyebrow="الخطوة ٣"
      title="ساعات العمل"
      subtitle="حدّد متى يفتح ستوديوهك. تستطيع التعديل لاحقاً من الإعدادات."
      side={
        <SideCard>
          <div className="text-xs text-ink-tertiary mb-3">معاينة الجدول</div>
          <div className="space-y-1.5">
            {DAYS.map((d) => {
              const h = data.hours[d]
              return (
                <div key={d} className="flex items-center justify-between text-sm py-1">
                  <span className="font-bold text-ink-primary">{d}</span>
                  <span
                    className={cn(
                      'tabular text-xs font-bold',
                      h.closed ? 'text-ink-tertiary' : 'text-emerald-600'
                    )}
                  >
                    {h.closed ? 'مغلق' : `${h.open} — ${h.close}`}
                  </span>
                </div>
              )
            })}
          </div>
          <div className="mt-5 pt-5 border-t border-border/60">
            <label className="flex items-center justify-between gap-3 cursor-pointer">
              <div className="flex items-center gap-2">
                <Moon className="w-4 h-4 text-amber-500" />
                <div>
                  <div className="font-bold text-sm">وضع رمضان</div>
                  <div className="text-xs text-ink-tertiary">تغيير الجدول تلقائياً</div>
                </div>
              </div>
              <Toggle checked={data.ramadan} onChange={(v) => set({ ramadan: v })} />
            </label>
          </div>
        </SideCard>
      }
    >
      <div className="card p-2 sm:p-4">
        <div className="flex items-center justify-between px-2 sm:px-3 py-2 mb-2">
          <div className="text-sm font-bold text-ink-secondary">أيام الأسبوع</div>
          <button
            type="button"
            onClick={applyToAll}
            className="text-xs font-extrabold text-brand hover:text-brand-light"
          >
            تطبيق على كل الأيام
          </button>
        </div>
        <div className="divide-y divide-border/60">
          {DAYS.map((day) => {
            const h = data.hours[day]
            return (
              <div key={day} className="flex flex-wrap items-center gap-3 p-3">
                <div className="w-20 sm:w-24 font-extrabold text-ink-primary">{day}</div>
                {h.closed ? (
                  <div className="flex-1 text-sm text-ink-tertiary">— مغلق —</div>
                ) : (
                  <div className="flex-1 grid grid-cols-2 gap-2">
                    <div className="relative">
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-ink-tertiary font-bold">
                        من
                      </span>
                      <input
                        type="time"
                        value={h.open}
                        onChange={(e) => updateDay(day, { open: e.target.value })}
                        className="input ltr text-center tabular font-bold"
                        style={{ minHeight: '44px' }}
                      />
                    </div>
                    <div className="relative">
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-ink-tertiary font-bold">
                        إلى
                      </span>
                      <input
                        type="time"
                        value={h.close}
                        onChange={(e) => updateDay(day, { close: e.target.value })}
                        className="input ltr text-center tabular font-bold"
                        style={{ minHeight: '44px' }}
                      />
                    </div>
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => updateDay(day, { closed: !h.closed })}
                  className={cn(
                    'btn-sm rounded-md font-bold text-xs',
                    h.closed
                      ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                      : 'bg-bg text-ink-secondary hover:bg-gray-100'
                  )}
                >
                  {h.closed ? 'فتح' : 'إغلاق'}
                </button>
              </div>
            )
          })}
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between p-4 sm:p-5 rounded-2xl bg-gradient-to-bl from-amber-50 to-white border border-amber-200/60">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
            <Moon className="w-5 h-5" />
          </div>
          <div>
            <div className="font-extrabold text-ink-primary">وضع رمضان</div>
            <div className="text-xs text-ink-secondary">تغيير الجدول تلقائياً في شهر رمضان</div>
          </div>
        </div>
        <Toggle checked={data.ramadan} onChange={(v) => set({ ramadan: v })} />
      </div>

      <NavButtons onBack={onBack} onNext={onNext} />
    </StepShell>
  )
}

function Toggle({ checked, onChange }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={cn(
        'relative inline-flex items-center w-11 h-6 rounded-full transition-colors flex-shrink-0',
        checked ? 'bg-brand' : 'bg-gray-300'
      )}
    >
      <span
        className={cn(
          'inline-block w-5 h-5 rounded-full bg-white shadow-sm transform transition-transform',
          checked ? '-translate-x-0.5' : '-translate-x-5'
        )}
      />
    </button>
  )
}

// ============== STEP 4 — Prayer times ==============
function Step4({ data, set, onNext, onBack }) {
  return (
    <StepShell
      eyebrow="الخطوة ٤"
      title="أوقات الصلاة"
      subtitle="حجب الحجوزات تلقائياً وقت الصلاة — يحافظ على راحة عملاءك وأقسام الستوديو."
      side={
        <SideCard>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xl">🕌</span>
            <div>
              <div className="text-xs text-ink-tertiary">أوقات صلاة الرياض</div>
              <div className="font-extrabold">اليوم</div>
            </div>
          </div>
          <div className="space-y-2">
            {prayerTimes.map((p) => (
              <div
                key={p.name}
                className="flex items-center justify-between p-2.5 rounded-lg bg-bg border border-border/60"
              >
                <span className="font-bold text-sm">{p.name}</span>
                <span className="tabular font-extrabold text-brand">{p.time}</span>
              </div>
            ))}
          </div>
          {data.blockPrayer && (
            <div className="mt-4 p-3 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-bold flex items-start gap-2">
              <Check className="w-4 h-4 flex-shrink-0 mt-0.5" strokeWidth={3} />
              <span>سيتم حجب {toArabicDigits(data.bufferMins * 2)} دقيقة حول كل صلاة تلقائياً.</span>
            </div>
          )}
        </SideCard>
      }
    >
      <div className="space-y-5">
        <div className="flex items-center justify-between p-5 rounded-2xl bg-gradient-to-bl from-brand-50/50 to-white border border-brand-100/80">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-brand text-white flex items-center justify-center shadow-glow">
              <Sun className="w-5 h-5" />
            </div>
            <div>
              <div className="font-extrabold text-ink-primary">حجب الحجوزات وقت الصلاة</div>
              <div className="text-xs text-ink-secondary">ينطبق على كل أوقات الصلوات الخمس</div>
            </div>
          </div>
          <Toggle checked={data.blockPrayer} onChange={(v) => set({ blockPrayer: v })} />
        </div>

        <div className={cn('card p-5 transition-opacity', !data.blockPrayer && 'opacity-50 pointer-events-none')}>
          <FieldLabel>كم دقيقة قبل/بعد الصلاة؟</FieldLabel>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min="0"
              max="30"
              step="5"
              value={data.bufferMins}
              onChange={(e) => set({ bufferMins: Number(e.target.value) })}
              className="flex-1 accent-brand"
            />
            <div className="w-20 text-center">
              <div className="text-2xl font-extrabold text-brand tabular">{toArabicDigits(data.bufferMins)}</div>
              <div className="text-[10px] text-ink-tertiary">دقيقة</div>
            </div>
          </div>
          <div className="flex justify-between text-[10px] text-ink-tertiary mt-1 tabular">
            <span>٠</span>
            <span>١٠</span>
            <span>٢٠</span>
            <span>٣٠</span>
          </div>
          <HelperText>الموصى به: ١٠ دقائق قبل ١٠ دقائق بعد.</HelperText>
        </div>
      </div>

      <NavButtons onBack={onBack} onNext={onNext} />
    </StepShell>
  )
}

// ============== STEP 5 — Resources ==============
function Step5({ data, set, onNext, onBack }) {
  const items = [
    {
      k: 'machines',
      t: 'عدد أجهزة EMS',
      i: Dumbbell,
      min: 1,
      max: 10,
      help: 'كل جهاز يخدّم عميل واحد في نفس الوقت'
    },
    {
      k: 'trainers',
      t: 'عدد المدربين',
      i: Users,
      min: 1,
      max: 20,
      help: 'تقدر تضيف أو تحذف لاحقاً من قسم المدربين'
    },
    {
      k: 'suits',
      t: 'عدد البدلات',
      i: Layers,
      min: 5,
      max: 30,
      help: 'الموصى به: ضعف عدد الأجهزة لتوفير وقت الغسيل'
    }
  ]
  return (
    <StepShell
      eyebrow="الخطوة ٥"
      title="الموارد"
      subtitle="كم عندك من المعدات والمدربين؟ هذا يحدد عدد الحجوزات الممكنة في نفس الوقت."
      side={
        <SideCard>
          <div className="text-xs text-ink-tertiary mb-3">السعة المتوقعة</div>
          <div className="bg-brand-gradient text-white rounded-xl p-5 relative overflow-hidden">
            <div className="absolute -top-12 -right-12 w-40 h-40 bg-accent/30 rounded-full blur-2xl" />
            <div className="relative">
              <div className="text-xs font-bold text-white/80">جلسات/يوم (تقديري)</div>
              <div className="text-4xl font-extrabold tabular mt-1">
                {toArabicDigits(data.machines * 30)}
              </div>
              <div className="text-xs text-white/80 mt-1">
                {toArabicDigits(data.machines)} جهاز × ٣٠ جلسة
              </div>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2 text-center">
            {items.map((it) => (
              <div key={it.k} className="bg-bg rounded-lg p-2.5">
                <it.i className="w-4 h-4 mx-auto text-brand mb-1" />
                <div className="text-lg font-extrabold tabular">
                  {toArabicDigits(data[it.k])}
                </div>
                <div className="text-[10px] text-ink-tertiary">{it.k === 'machines' ? 'أجهزة' : it.k === 'trainers' ? 'مدربين' : 'بدلات'}</div>
              </div>
            ))}
          </div>
        </SideCard>
      }
    >
      <div className="space-y-5">
        {items.map((it) => (
          <div key={it.k} className="card p-5 sm:p-6">
            <div className="flex items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-brand-50 text-brand flex items-center justify-center">
                  <it.i className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-extrabold text-ink-primary">{it.t}</div>
                  <div className="text-xs text-ink-tertiary">{it.help}</div>
                </div>
              </div>
              <div className="text-3xl font-extrabold text-brand-gradient tabular min-w-[60px] text-center">
                {toArabicDigits(data[it.k])}
              </div>
            </div>
            <input
              type="range"
              min={it.min}
              max={it.max}
              value={data[it.k]}
              onChange={(e) => set({ [it.k]: Number(e.target.value) })}
              className="w-full accent-brand"
            />
            <div className="flex justify-between text-[10px] text-ink-tertiary mt-1 tabular">
              <span>{toArabicDigits(it.min)}</span>
              <span>{toArabicDigits(it.max)}</span>
            </div>
          </div>
        ))}
      </div>
      <NavButtons onBack={onBack} onNext={onNext} nextLabel="مراجعة الإعدادات" />
    </StepShell>
  )
}

// ============== STEP 6 — Review ==============
function Step6({ data, onBack, onFinish }) {
  const summary = [
    { i: Building2, k: 'الستوديو', v: data.nameAr || '—' },
    { i: MapPin, k: 'المدينة', v: data.city || '—' },
    { i: Phone, k: 'الجوال', v: data.phone ? `+966 ${data.phone}` : '—' },
    {
      i: Users,
      k: 'النوع',
      v: data.studioType === 'men' ? 'رجال' : data.studioType === 'women' ? 'نساء' : 'مختلط'
    },
    { i: GitBranch, k: 'الفروع', v: data.branches ? toArabicDigits(data.branches) : '—' },
    { i: Dumbbell, k: 'الأجهزة', v: toArabicDigits(data.machines) },
    { i: Users, k: 'المدربين', v: toArabicDigits(data.trainers) },
    { i: Layers, k: 'البدلات', v: toArabicDigits(data.suits) }
  ]
  return (
    <StepShell
      eyebrow="الخطوة الأخيرة"
      title="مراجعة الإعدادات"
      subtitle="تأكد من المعلومات قبل الدخول إلى لوحة التحكم. تقدر تعدّل أي شيء من الإعدادات لاحقاً."
      side={
        <SideCard>
          <div className="text-center">
            <div className="w-20 h-20 mx-auto rounded-3xl bg-brand-gradient text-white flex items-center justify-center font-extrabold text-2xl shadow-glow-lg mb-4">
              {data.nameAr.trim().slice(0, 2) || 'مو'}
            </div>
            <div className="text-xs text-ink-tertiary">جاهز للإطلاق</div>
            <div className="font-extrabold text-lg text-ink-primary">
              {data.nameAr || 'ستوديوهك'}
            </div>
            <div className="text-sm text-ink-secondary">{data.city}</div>
            <div className="mt-5 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-extrabold">
              <Check className="w-3.5 h-3.5" strokeWidth={3} />
              ١٤ يوم تجربة مجانية
            </div>
          </div>
        </SideCard>
      }
    >
      <div className="card divide-y divide-border/60">
        {summary.map((s) => (
          <div key={s.k} className="flex items-center gap-3 p-4">
            <span className="w-9 h-9 rounded-lg bg-brand-50 text-brand flex items-center justify-center">
              <s.i className="w-4 h-4" />
            </span>
            <span className="text-sm font-bold text-ink-secondary flex-1">{s.k}</span>
            <span className="text-sm font-extrabold text-ink-primary">{s.v}</span>
          </div>
        ))}
      </div>

      <div className="mt-5 p-4 rounded-2xl bg-emerald-50 border border-emerald-200/60 flex items-start gap-3">
        <Check className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" strokeWidth={3} />
        <div>
          <div className="font-extrabold text-emerald-900">كل شيء جاهز للإطلاق!</div>
          <p className="text-sm text-emerald-800 mt-0.5">
            بمجرد الضغط، نُنشئ ستوديوهك ونضيف بيانات تجريبية لتجربة سريعة.
          </p>
        </div>
      </div>

      <NavButtons onBack={onBack} onNext={onFinish} nextLabel="ادخل إلى لوحة التحكم" last />
    </StepShell>
  )
}

// ============== SUCCESS SCREEN ==============
function Success({ name, onGo }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-mesh-1 pointer-events-none" />
      <div className="absolute -top-32 -right-32 w-96 h-96 bg-brand/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-accent/15 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative max-w-md text-center animate-slide-up">
        <div className="relative inline-block">
          <div className="w-28 h-28 mx-auto rounded-[32px] bg-brand-gradient flex items-center justify-center shadow-glow-lg mb-8 relative animate-bounce-subtle">
            <PartyPopper className="w-14 h-14 text-white" strokeWidth={1.8} />
            <span className="absolute -top-2 -right-2 w-8 h-8 bg-accent rounded-full flex items-center justify-center shadow-glow-accent animate-pulse">
              <Sparkles className="w-4 h-4 text-white" />
            </span>
            <span className="absolute -bottom-2 -left-2 w-6 h-6 bg-amber-400 rounded-full flex items-center justify-center animate-pulse-slow">
              <span className="text-xs">✨</span>
            </span>
          </div>
        </div>

        <div className="eyebrow-brand mb-4 mx-auto">نجاح</div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-ink-primary tracking-tight leading-tight">
          كل شيء جاهز،<br />
          <span className="text-brand-gradient">يا {name || 'بطل'}!</span>
        </h1>
        <p className="mt-5 text-ink-secondary leading-relaxed">
          تم إنشاء ستوديوهك بنجاح. تعال نعطيك جولة سريعة على لوحة التحكم.
        </p>

        <button onClick={onGo} className="mt-8 btn-primary btn-xl group">
          <span>ادخل إلى لوحة التحكم</span>
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
        </button>

        <div className="mt-8 flex items-center justify-center gap-4 text-xs text-ink-tertiary">
          {['تم إنشاء الحساب', 'بيانات تجريبية مُحمّلة', 'جاهز للاستخدام'].map((t) => (
            <div key={t} className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-emerald-500" strokeWidth={3} />
              <span className="font-bold">{t}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ============== MAIN ==============
export default function Onboarding() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [finished, setFinished] = useState(false)
  const [data, setData] = useState({
    nameAr: '',
    nameEn: '',
    city: '',
    phone: '',
    studioType: '',
    branches: '',
    hours: DEFAULT_HOURS,
    ramadan: true,
    blockPrayer: true,
    bufferMins: 10,
    machines: 5,
    trainers: 8,
    suits: 15,
    userNameAr: '',
    userEmail: '',
    userPassword: ''
  })
  const [submitError, setSubmitError] = useState('')

  const set = (patch) => setData((d) => ({ ...d, ...patch }))
  const next = () => setStep((s) => Math.min(TOTAL_STEPS, s + 1))
  const back = () => setStep((s) => Math.max(1, s - 1))
  const finish = async () => {
    setSubmitError('')
    try {
      const res = await auth.register({
        studio_name_ar: data.nameAr,
        studio_name_en: data.nameEn || undefined,
        city: data.city,
        phone: data.phone,
        studio_type: data.studioType,
        branches: data.branches,
        user_name_ar: data.userNameAr,
        user_email: data.userEmail,
        user_password: data.userPassword,
        working_hours: data.hours,
        ramadan_mode: data.ramadan,
        block_prayer: data.blockPrayer,
        prayer_buffer_min: data.bufferMins,
        machines: data.machines,
        trainers: data.trainers,
        suits: data.suits,
      })
      setSession(res)
      setFinished(true)
    } catch (e) {
      setSubmitError(e.message || 'فشل التسجيل')
    }
  }

  if (finished) return <Success name={data.nameAr.trim().split(' ')[0]} onGo={() => navigate('/dashboard')} />

  return (
    <div className="min-h-screen bg-bg">
      {/* Top bar */}
      <header className="sticky top-0 z-30 bg-white/85 glass border-b border-border/60">
        <div className="container-app flex items-center justify-between h-16">
          <Logo />
          <div className="flex items-center gap-2 text-xs text-ink-tertiary">
            <span className="hidden sm:inline">عندك حساب؟</span>
            <Link to="/login" className="font-extrabold text-brand hover:text-brand-light">
              تسجيل الدخول
            </Link>
          </div>
        </div>
      </header>

      {/* Progress */}
      <div className="bg-white border-b border-border/60">
        <div className="container-app py-4">
          <ProgressBar step={step} />
        </div>
      </div>

      {/* Step */}
      <main className="container-app py-10 sm:py-14">
        {step === 1 && <Step1 data={data} set={set} onNext={next} onBack={back} />}
        {step === 2 && <Step2 data={data} set={set} onNext={next} onBack={back} />}
        {step === 3 && <Step3 data={data} set={set} onNext={next} onBack={back} />}
        {step === 4 && <Step4 data={data} set={set} onNext={next} onBack={back} />}
        {step === 5 && <Step5 data={data} set={set} onNext={next} onBack={back} />}
        {step === 6 && (
          <>
            {submitError && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-800 text-sm font-bold">
                {submitError}
              </div>
            )}
            <Step6 data={data} onBack={back} onFinish={finish} />
          </>
        )}
      </main>
    </div>
  )
}
