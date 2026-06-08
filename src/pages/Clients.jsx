import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import {
  Search,
  Filter,
  Plus,
  Phone,
  MessageCircle,
  Calendar as CalIcon,
  Grid,
  List,
  ChevronLeft,
  X,
  Star,
  Edit,
  AlertTriangle
} from 'lucide-react'
import { clientsApi } from '../lib/api.js'
import { useApi } from '../lib/useApi.js'
import { cn, toArabicDigits, initials, avatarColor, telLink, waLink } from '../lib/utils.js'
import ClientFormModal from '../components/ClientFormModal.jsx'

const STATUS_COLORS = {
  نشط: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  تجريبي: 'bg-amber-50 text-amber-700 ring-amber-200',
  مجمد: 'bg-blue-50 text-blue-700 ring-blue-200',
  منتهي: 'bg-gray-100 text-gray-700 ring-gray-200'
}

function ClientAvatar({ name, size = 'md', gender }) {
  const sizes = { sm: 'w-9 h-9 text-xs', md: 'w-11 h-11 text-sm', lg: 'w-16 h-16 text-lg' }
  return (
    <div
      className={cn(
        'rounded-full flex items-center justify-center font-extrabold flex-shrink-0',
        avatarColor(name),
        sizes[size]
      )}
    >
      {initials(name)}
    </div>
  )
}

function Tag({ children, tone = 'gray' }) {
  const tones = {
    VIP: 'bg-gradient-to-l from-amber-400 to-amber-500 text-white',
    منتظم: 'bg-emerald-50 text-emerald-700',
    جديد: 'bg-blue-50 text-blue-700',
    متعثر: 'bg-rose-50 text-rose-700',
    gray: 'bg-gray-100 text-gray-700'
  }
  return (
    <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold', tones[children] || tones.gray)}>
      {children === 'VIP' && <Star className="w-2.5 h-2.5 fill-white" />}
      {children}
    </span>
  )
}

function ClientCard({ c, onEdit }) {
  const navigate = useNavigate()
  const pkg = c.active_package || c.package
  const remaining = c.remaining ?? 0
  const total = c.total ?? 0
  const lastSession = c.last_session || c.lastSession || '—'
  const preferredTrainer = c.preferred_trainer_name || c.preferredTrainer || '—'
  const tags = c.tags || []
  const stop = (e) => { e.preventDefault(); e.stopPropagation() }
  return (
    <Link
      to={`/clients/${c.id}`}
      className="card-hover p-5 group flex flex-col gap-4"
    >
      <div className="flex items-start gap-3">
        <ClientAvatar name={c.name_ar} />
        <div className="flex-1 min-w-0">
          <div className="font-extrabold text-ink-primary truncate">{c.name_ar}</div>
          <div className="text-xs text-ink-tertiary ltr text-right tabular truncate">{c.phone}</div>
          <div className="mt-1.5 flex flex-wrap gap-1">
            {tags.map((t) => (
              <Tag key={t}>{t}</Tag>
            ))}
          </div>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <span className={cn('px-2 py-0.5 rounded-full text-[10px] font-extrabold ring-1', STATUS_COLORS[c.status])}>
            {c.status}
          </span>
          <button
            onClick={(e) => { stop(e); onEdit?.(c) }}
            title="تعديل"
            className="w-7 h-7 rounded-lg hover:bg-bg flex items-center justify-center text-ink-tertiary hover:text-brand"
          >
            <Edit className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {pkg && (
        <div className="bg-bg/60 rounded-xl p-3 border border-border/50">
          <div className="text-[10px] text-ink-tertiary font-bold mb-1">الباقة الحالية</div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-sm font-extrabold text-ink-primary">{pkg}</span>
            <span className="text-xs font-extrabold text-brand tabular">
              {typeof remaining === 'string' ? remaining : toArabicDigits(remaining)} متبقي
            </span>
          </div>
          <div className="h-1.5 bg-white rounded-full overflow-hidden">
            <div
              className="h-full bg-brand-gradient rounded-full"
              style={{
                width:
                  typeof remaining === 'string'
                    ? '100%'
                    : `${Math.max(5, (remaining / (total || 1)) * 100)}%`
              }}
            />
          </div>
        </div>
      )}

      <div className="flex items-center justify-between text-[11px] text-ink-tertiary">
        <span>آخر جلسة: <span className="font-bold text-ink-secondary">{lastSession}</span></span>
        <span className="font-bold text-ink-secondary">{preferredTrainer}</span>
      </div>

      <div className="flex items-center gap-2 -mb-1">
        <button
          onClick={(e) => { stop(e); window.location.href = telLink(c.phone) }}
          className="flex-1 h-9 rounded-lg bg-bg hover:bg-brand-50 text-ink-secondary hover:text-brand flex items-center justify-center gap-1.5 text-xs font-extrabold transition-colors"
        >
          <Phone className="w-3.5 h-3.5" />
          اتصال
        </button>
        <button
          onClick={(e) => { stop(e); window.open(waLink(c.phone, `مرحباً ${c.name_ar.split(' ')[0]}،`), '_blank') }}
          className="flex-1 h-9 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 flex items-center justify-center gap-1.5 text-xs font-extrabold transition-colors"
        >
          <MessageCircle className="w-3.5 h-3.5" />
          واتساب
        </button>
        <button
          onClick={(e) => { stop(e); navigate(`/bookings/new?client=${c.id}`) }}
          className="flex-1 h-9 rounded-lg bg-brand text-white hover:bg-brand-light flex items-center justify-center gap-1.5 text-xs font-extrabold transition-colors"
        >
          <CalIcon className="w-3.5 h-3.5" />
          حجز
        </button>
      </div>
    </Link>
  )
}

function ClientRow({ c }) {
  const navigate = useNavigate()
  const pkg = c.active_package || c.package || '—'
  const remaining = c.remaining ?? 0
  const total = c.total ?? 0
  const lastSession = c.last_session || c.lastSession || '—'
  return (
    <Link
      to={`/clients/${c.id}`}
      className="grid grid-cols-12 items-center gap-3 px-4 py-3 hover:bg-bg/60 transition-colors group"
    >
      <div className="col-span-4 sm:col-span-3 flex items-center gap-3 min-w-0">
        <ClientAvatar name={c.name_ar} size="sm" />
        <div className="min-w-0">
          <div className="font-extrabold text-sm truncate">{c.name_ar}</div>
          <div className="text-[10px] text-ink-tertiary ltr text-right tabular">{c.phone}</div>
        </div>
      </div>
      <div className="hidden sm:block col-span-2">
        <span className={cn('px-2 py-0.5 rounded-full text-[10px] font-extrabold ring-1', STATUS_COLORS[c.status])}>
          {c.status}
        </span>
      </div>
      <div className="hidden md:block col-span-3 text-xs">
        <div className="font-bold text-ink-primary truncate">{pkg}</div>
        <div className="text-[10px] text-ink-tertiary">
          {typeof remaining === 'string' ? remaining : toArabicDigits(remaining)} من {total === 999 ? '∞' : toArabicDigits(total)} جلسة
        </div>
      </div>
      <div className="col-span-5 sm:col-span-3 md:col-span-2 text-xs text-ink-secondary">
        {lastSession}
      </div>
      <div className="col-span-3 sm:col-span-4 md:col-span-2 flex items-center justify-end gap-1">
        <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); window.location.href = telLink(c.phone) }} className="w-8 h-8 rounded-lg hover:bg-bg flex items-center justify-center text-ink-secondary">
          <Phone className="w-3.5 h-3.5" />
        </button>
        <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); window.open(waLink(c.phone), '_blank') }} className="w-8 h-8 rounded-lg hover:bg-emerald-50 text-emerald-600 flex items-center justify-center">
          <MessageCircle className="w-3.5 h-3.5" />
        </button>
        <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); navigate(`/bookings/new?client=${c.id}`) }} title="حجز" className="w-8 h-8 rounded-lg hover:bg-brand-50 text-brand flex items-center justify-center">
          <CalIcon className="w-3.5 h-3.5" />
        </button>
        <ChevronLeft className="w-4 h-4 text-ink-tertiary group-hover:text-brand transition-colors" />
      </div>
    </Link>
  )
}

export default function Clients() {
  const [searchParams] = useSearchParams()
  const [view, setView] = useState('grid')
  const [search, setSearch] = useState(searchParams.get('q') || '')
  const [filters, setFilters] = useState({ status: 'all', gender: 'all', tag: 'all' })
  const [filterOpen, setFilterOpen] = useState(false)
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState(null)

  const { data: clients = [], loading, reload } = useApi(
    () => clientsApi.list({
      q: search || undefined,
      status: filters.status !== 'all' ? filters.status : undefined,
      gender: filters.gender !== 'all' ? filters.gender : undefined,
      tag: filters.tag !== 'all' ? filters.tag : undefined,
    }),
    [search, filters.status, filters.gender, filters.tag]
  )

  function openNew() { setEditing(null); setFormOpen(true) }
  function openEdit(c) { setEditing(c); setFormOpen(true) }

  const filtered = clients || []
  const activeCount = filtered.filter((c) => c.status === 'نشط').length

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="page-title">
            العملاء <span className="text-ink-tertiary font-bold">({toArabicDigits(activeCount)} نشط)</span>
          </h1>
          <p className="page-subtitle">إدارة قاعدة عملاءك وباقاتهم وحجوزاتهم.</p>
        </div>
        <button onClick={openNew} className="btn-primary btn-sm">
          <Plus className="w-4 h-4" />
          عميل جديد
        </button>
      </div>

      {/* Toolbar */}
      <div className="card p-3 sm:p-4 flex flex-wrap items-center gap-2.5">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-ink-tertiary pointer-events-none" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ابحث بالاسم أو رقم الجوال..."
            className="w-full bg-bg border border-border rounded-lg pr-10 pl-3 h-10 text-sm focus:outline-none focus:border-brand focus:bg-white transition-colors"
          />
        </div>
        <button
          onClick={() => setFilterOpen(true)}
          className="btn-secondary btn-sm relative"
        >
          <Filter className="w-3.5 h-3.5" />
          فلتر
          {(filters.status !== 'all' || filters.gender !== 'all' || filters.tag !== 'all') && (
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-accent ring-2 ring-white" />
          )}
        </button>
        <div className="inline-flex items-center gap-0.5 p-1 rounded-lg bg-bg border border-border/60">
          <button
            onClick={() => setView('grid')}
            className={cn(
              'w-8 h-8 rounded-md flex items-center justify-center transition-colors',
              view === 'grid' ? 'bg-white text-brand shadow-sm' : 'text-ink-tertiary'
            )}
          >
            <Grid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setView('list')}
            className={cn(
              'w-8 h-8 rounded-md flex items-center justify-center transition-colors',
              view === 'list' ? 'bg-white text-brand shadow-sm' : 'text-ink-tertiary'
            )}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="card p-12 text-center">
          <div className="text-5xl mb-3">🔍</div>
          <h3 className="text-lg font-extrabold text-ink-primary">لا يوجد عملاء يطابقون البحث</h3>
          <p className="text-sm text-ink-secondary mt-1">جرب تغيير الفلاتر أو ابحث باسم آخر.</p>
          <button
            onClick={() => {
              setSearch('')
              setFilters({ status: 'all', gender: 'all', tag: 'all' })
            }}
            className="btn-secondary btn-sm mt-5"
          >
            مسح الفلاتر
          </button>
        </div>
      )}

      {/* Results */}
      {view === 'grid' && filtered.length > 0 && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((c) => (
            <ClientCard key={c.id} c={c} onEdit={openEdit} />
          ))}
        </div>
      )}

      {view === 'list' && filtered.length > 0 && (
        <div className="card overflow-hidden">
          <div className="hidden sm:grid grid-cols-12 gap-3 px-4 py-3 bg-bg/60 border-b border-border/60 text-[10px] font-extrabold uppercase tracking-wider text-ink-tertiary">
            <div className="col-span-3">العميل</div>
            <div className="col-span-2">الحالة</div>
            <div className="hidden md:block col-span-3">الباقة</div>
            <div className="col-span-3 md:col-span-2">آخر زيارة</div>
            <div className="col-span-2 text-left">إجراءات</div>
          </div>
          <div className="divide-y divide-border/40">
            {filtered.map((c) => (
              <ClientRow key={c.id} c={c} />
            ))}
          </div>
        </div>
      )}

      {/* Filter Drawer */}
      {filterOpen && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40 animate-fade-in" onClick={() => setFilterOpen(false)} />
          <aside className="absolute top-0 left-0 bottom-0 w-[320px] sm:w-[380px] bg-white animate-slide-down overflow-y-auto">
            <header className="flex items-center justify-between px-5 h-16 border-b border-border/60 sticky top-0 bg-white">
              <h3 className="font-extrabold">الفلاتر</h3>
              <button onClick={() => setFilterOpen(false)} className="p-2 -ml-2 rounded-lg hover:bg-bg">
                <X className="w-5 h-5" />
              </button>
            </header>
            <div className="p-5 space-y-6">
              <FilterGroup
                title="الحالة"
                options={['all', 'نشط', 'تجريبي', 'مجمد', 'منتهي']}
                value={filters.status}
                onChange={(v) => setFilters({ ...filters, status: v })}
                renderLabel={(v) => (v === 'all' ? 'الكل' : v)}
              />
              <FilterGroup
                title="الجنس"
                options={['all', 'ذكر', 'أنثى']}
                value={filters.gender}
                onChange={(v) => setFilters({ ...filters, gender: v })}
                renderLabel={(v) => (v === 'all' ? 'الكل' : v)}
              />
              <FilterGroup
                title="التصنيف"
                options={['all', 'VIP', 'منتظم', 'جديد', 'متعثر']}
                value={filters.tag}
                onChange={(v) => setFilters({ ...filters, tag: v })}
                renderLabel={(v) => (v === 'all' ? 'الكل' : v)}
              />
            </div>
            <footer className="sticky bottom-0 bg-white border-t border-border/60 p-4 flex gap-2">
              <button
                onClick={() => setFilters({ status: 'all', gender: 'all', tag: 'all' })}
                className="btn-secondary flex-1"
              >
                مسح
              </button>
              <button onClick={() => setFilterOpen(false)} className="btn-primary flex-1">
                تطبيق
              </button>
            </footer>
          </aside>
        </div>
      )}

      <ClientFormModal
        open={formOpen}
        client={editing}
        onClose={() => setFormOpen(false)}
        onSaved={() => { setFormOpen(false); reload() }}
      />
    </div>
  )
}

function FilterGroup({ title, options, value, onChange, renderLabel }) {
  return (
    <div>
      <h4 className="text-xs font-extrabold uppercase tracking-wider text-ink-tertiary mb-2.5">
        {title}
      </h4>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <button
            key={o}
            onClick={() => onChange(o)}
            className={cn(
              'px-3 py-1.5 rounded-full text-xs font-bold border transition-all',
              value === o
                ? 'bg-brand text-white border-brand'
                : 'bg-white text-ink-secondary border-border hover:border-brand-200'
            )}
          >
            {renderLabel(o)}
          </button>
        ))}
      </div>
    </div>
  )
}
