import { useState } from 'react'
import { Search, Menu, X, Plus, LogOut, User } from 'lucide-react'
import { NavLink, Link, useNavigate } from 'react-router-dom'
import { getStoredUser, clearSession } from '../../lib/api.js'
import { NAV_ITEMS } from '../../lib/nav.js'
import { cn } from '../../lib/utils.js'
import { toast } from '../../lib/toast.js'
import Logo from '../Logo.jsx'

export default function TopBar() {
  const navigate = useNavigate()
  const [mobileMenu, setMobileMenu] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const user = getStoredUser() || { name_ar: 'مستخدم', role: '', initials: 'MO' }

  function doSearch(q) {
    const term = (q ?? search).trim()
    setSearchOpen(false)
    navigate(term ? `/clients?q=${encodeURIComponent(term)}` : '/clients')
  }
  function logout() {
    clearSession()
    toast('تم تسجيل الخروج', 'success')
    navigate('/login')
  }
  return (
    <>
      <header className="sticky top-0 z-30 bg-white/85 glass border-b border-border/60 h-16">
        <div className="h-full px-4 sm:px-6 lg:pr-[280px] lg:pl-8 flex items-center gap-3">
          {/* Mobile logo + menu button */}
          <div className="lg:hidden flex items-center gap-2 flex-1">
            <button
              onClick={() => setMobileMenu(true)}
              className="p-2 -mr-2 text-ink-primary hover:bg-bg rounded-lg"
            >
              <Menu className="w-5 h-5" />
            </button>
            <Logo size="sm" />
          </div>

          {/* Search — desktop */}
          <div className="hidden lg:block flex-1 max-w-md">
            <div className="relative">
              <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-ink-tertiary pointer-events-none" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && doSearch()}
                placeholder="ابحث عن عميل، حجز، مدرب..."
                className="w-full bg-bg border border-border rounded-lg pr-10 pl-3 py-2 text-sm placeholder:text-ink-tertiary focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/10 transition-all"
              />
              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-ink-tertiary bg-white border border-border rounded px-1.5 py-0.5 font-bold">
                ⌘ K
              </span>
            </div>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={() => setSearchOpen(true)}
              className="lg:hidden w-9 h-9 rounded-lg hover:bg-bg flex items-center justify-center text-ink-secondary"
            >
              <Search className="w-[18px] h-[18px]" />
            </button>

            <Link
              to="/bookings/new"
              className="hidden sm:inline-flex items-center gap-1.5 h-9 px-3.5 rounded-lg bg-brand-gradient text-white text-xs font-extrabold shadow-soft hover:shadow-card-hover transition-shadow"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>حجز جديد</span>
            </Link>

            {/* Profile */}
            <div className="relative">
              <button onClick={() => setMenuOpen((v) => !v)} className="flex items-center gap-2 pr-1 pl-2 py-1 rounded-lg hover:bg-bg">
                <span className="w-8 h-8 rounded-full bg-brand-gradient text-white flex items-center justify-center text-xs font-extrabold shadow-soft">
                  {user.initials}
                </span>
                <div className="hidden xl:block text-right">
                  <div className="text-xs font-extrabold leading-tight">{user.name_ar}</div>
                  <div className="text-[10px] text-ink-tertiary leading-tight">{user.role}</div>
                </div>
              </button>
              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-[60]" onClick={() => setMenuOpen(false)} />
                  <div className="absolute left-0 mt-2 w-52 bg-white rounded-xl shadow-card-hover border border-border/60 p-1.5 z-[70] animate-fade-in">
                    <div className="px-3 py-2 border-b border-border/40 mb-1">
                      <div className="text-sm font-extrabold">{user.name_ar}</div>
                      <div className="text-[10px] text-ink-tertiary">{user.role}</div>
                    </div>
                    <button onClick={() => { setMenuOpen(false); navigate('/settings') }} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-bold text-ink-secondary hover:bg-bg text-right">
                      <User className="w-4 h-4" /> الملف الشخصي
                    </button>
                    <button onClick={logout} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-bold text-red-600 hover:bg-red-50 text-right">
                      <LogOut className="w-4 h-4" /> تسجيل الخروج
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile menu drawer */}
      {mobileMenu && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40 animate-fade-in" onClick={() => setMobileMenu(false)} />
          <aside className="absolute top-0 right-0 bottom-0 w-[290px] bg-white animate-slide-down">
            <div className="h-16 flex items-center justify-between px-5 border-b border-border/60">
              <Logo />
              <button onClick={() => setMobileMenu(false)} className="p-2 -ml-2 rounded-lg hover:bg-bg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="p-3">
              <ul className="space-y-0.5">
                {NAV_ITEMS.map((item) => (
                  <li key={item.to}>
                    <NavLink
                      to={item.to}
                      onClick={() => setMobileMenu(false)}
                      className={({ isActive }) =>
                        cn(
                          'flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-bold transition-all',
                          isActive
                            ? 'bg-brand-50 text-brand'
                            : 'text-ink-secondary hover:bg-bg'
                        )
                      }
                    >
                      <item.icon className="w-5 h-5" strokeWidth={2} />
                      <span className="flex-1">{item.label}</span>
                      {item.soon && (
                        <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700">
                          قريباً
                        </span>
                      )}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </nav>
          </aside>
        </div>
      )}

      {/* Mobile search overlay */}
      {searchOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-white animate-fade-in">
          <div className="h-16 px-4 flex items-center gap-2 border-b border-border/60">
            <button onClick={() => setSearchOpen(false)} className="p-2 -mr-2">
              <X className="w-5 h-5" />
            </button>
            <input
              autoFocus
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && doSearch()}
              placeholder="ابحث..."
              className="flex-1 bg-transparent text-base focus:outline-none"
            />
          </div>
        </div>
      )}
    </>
  )
}
