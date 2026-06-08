import { NavLink } from 'react-router-dom'
import { ChevronLeft, Sparkles } from 'lucide-react'
import Logo from '../Logo.jsx'
import { NAV_ITEMS } from '../../lib/nav.js'
import { getStoredStudio } from '../../lib/api.js'
import { cn } from '../../lib/utils.js'

export default function Sidebar() {
  const studio = getStoredStudio() || { name_ar: 'ستوديوهك', branch: '' }
  return (
    <aside className="hidden lg:flex flex-col fixed top-0 right-0 bottom-0 w-[260px] bg-white border-l border-border/60 z-40">
      {/* Brand */}
      <div className="h-16 flex items-center px-5 border-b border-border/60">
        <Logo />
      </div>

      {/* Studio switcher */}
      <button className="mx-3 mt-4 mb-2 flex items-center gap-3 p-3 rounded-xl bg-bg hover:bg-brand-50/50 border border-border/60 transition-colors group">
        <div className="w-10 h-10 rounded-lg bg-brand-gradient text-white flex items-center justify-center font-extrabold text-sm shadow-soft flex-shrink-0">
          {studio.logo || (studio.name_ar || 'MO').slice(0, 2)}
        </div>
        <div className="flex-1 min-w-0 text-right">
          <div className="font-extrabold text-sm truncate">{studio.name_ar}</div>
          <div className="text-[11px] text-ink-tertiary truncate">{studio.branch}</div>
        </div>
        <ChevronLeft className="w-4 h-4 text-ink-tertiary group-hover:text-brand transition-colors" />
      </button>

      {/* Nav items */}
      <nav className="flex-1 px-3 py-3 overflow-y-auto">
        <div className="mb-2 px-3 text-[10px] font-extrabold uppercase tracking-wider text-ink-tertiary">
          القائمة
        </div>
        <ul className="space-y-0.5">
          {NAV_ITEMS.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    'group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-bold transition-all relative',
                    isActive
                      ? 'bg-brand-50 text-brand'
                      : 'text-ink-secondary hover:bg-bg hover:text-ink-primary'
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <span className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-l-full bg-brand" />
                    )}
                    <item.icon
                      className={cn('w-[18px] h-[18px] flex-shrink-0', isActive && 'text-brand')}
                      strokeWidth={isActive ? 2.4 : 2}
                    />
                    <span className="flex-1">{item.label}</span>
                    {item.soon && (
                      <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700">
                        قريباً
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Upgrade card */}
      <div className="m-3 p-4 rounded-2xl bg-brand-gradient text-white relative overflow-hidden">
        <div className="absolute -top-8 -right-8 w-24 h-24 bg-accent/30 rounded-full blur-2xl" />
        <div className="relative">
          <div className="flex items-center gap-1.5 mb-1.5">
            <Sparkles className="w-4 h-4 text-accent" />
            <span className="text-[10px] font-extrabold uppercase tracking-wider">باقتك</span>
          </div>
          <div className="font-extrabold mb-0.5">الباقة الاحترافية</div>
          <div className="text-[11px] text-white/80 mb-3">١٤٧ من ٥٠٠ عميل</div>
          <div className="h-1.5 bg-white/15 rounded-full overflow-hidden mb-3">
            <div className="h-full bg-accent rounded-full" style={{ width: '29%' }} />
          </div>
          <button className="text-xs font-extrabold text-white/95 hover:text-white inline-flex items-center gap-1">
            ترقية الباقة
            <ChevronLeft className="w-3 h-3" />
          </button>
        </div>
      </div>
    </aside>
  )
}
