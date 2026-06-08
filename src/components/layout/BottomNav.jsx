import { useState } from 'react'
import { NavLink, Link } from 'react-router-dom'
import { Plus, Calendar, UserPlus, CreditCard, X } from 'lucide-react'
import { BOTTOM_NAV } from '../../lib/nav.js'
import { cn } from '../../lib/utils.js'

export default function BottomNav() {
  const [fabOpen, setFabOpen] = useState(false)
  return (
    <>
      {/* FAB menu */}
      {fabOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div
            className="absolute inset-0 bg-ink-primary/30 backdrop-blur-sm animate-fade-in"
            onClick={() => setFabOpen(false)}
          />
          <div className="absolute bottom-24 left-4 right-4 space-y-2 animate-slide-up">
            {[
              { to: '/bookings/new', i: Calendar, t: 'حجز جديد', c: 'bg-brand text-white' },
              { to: '/clients', i: UserPlus, t: 'عميل جديد', c: 'bg-white text-ink-primary' }
            ].map((it) => (
              <Link
                key={it.t}
                to={it.to}
                onClick={() => setFabOpen(false)}
                className={cn(
                  'flex items-center gap-3 p-3.5 rounded-2xl shadow-premium font-extrabold text-sm',
                  it.c
                )}
              >
                <span className={cn('w-9 h-9 rounded-lg flex items-center justify-center', it.c.includes('text-white') ? 'bg-white/15' : 'bg-brand-50 text-brand')}>
                  <it.i className="w-4 h-4" />
                </span>
                {it.t}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Bottom nav bar */}
      <nav className="lg:hidden fixed bottom-0 right-0 left-0 z-30 bg-white/95 glass border-t border-border/60 px-2 pb-safe">
        <div className="flex items-center justify-around h-16 relative">
          {BOTTOM_NAV.slice(0, 2).map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'flex flex-col items-center gap-0.5 flex-1 py-2 text-[10px] font-bold transition-colors',
                  isActive ? 'text-brand' : 'text-ink-tertiary'
                )
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 2} />
                  <span>{item.label}</span>
                </>
              )}
            </NavLink>
          ))}

          {/* FAB in center */}
          <div className="flex-1 flex items-center justify-center relative">
            <button
              onClick={() => setFabOpen((v) => !v)}
              className={cn(
                'absolute -top-5 w-14 h-14 rounded-2xl bg-brand-gradient text-white flex items-center justify-center shadow-glow-lg transition-transform',
                fabOpen && 'rotate-45 scale-95'
              )}
            >
              {fabOpen ? <X className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
            </button>
          </div>

          {BOTTOM_NAV.slice(3, 5).map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'flex flex-col items-center gap-0.5 flex-1 py-2 text-[10px] font-bold transition-colors',
                  isActive ? 'text-brand' : 'text-ink-tertiary'
                )
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 2} />
                  <span>{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </>
  )
}
