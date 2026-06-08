import { useEffect } from 'react'
import { X } from 'lucide-react'

/**
 * Reusable centered modal dialog.
 * Props: open, onClose, title, children, footer, size ('md' | 'lg')
 */
export default function Modal({ open, onClose, title, children, footer, size = 'md' }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e) => { if (e.key === 'Escape') onClose?.() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  const widths = { md: 'max-w-md', lg: 'max-w-2xl' }

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/40 animate-fade-in" onClick={onClose} />
      <div
        className={`relative bg-white w-full ${widths[size]} rounded-t-2xl sm:rounded-2xl shadow-card-hover animate-slide-up max-h-[92vh] flex flex-col`}
        role="dialog"
        aria-modal="true"
      >
        <header className="flex items-center justify-between px-5 h-16 border-b border-border/60 flex-shrink-0">
          <h3 className="font-extrabold text-ink-primary">{title}</h3>
          <button onClick={onClose} className="p-2 -ml-2 rounded-lg hover:bg-bg text-ink-secondary">
            <X className="w-5 h-5" />
          </button>
        </header>
        <div className="p-5 overflow-y-auto">{children}</div>
        {footer && (
          <footer className="border-t border-border/60 p-4 flex gap-2 flex-shrink-0">{footer}</footer>
        )}
      </div>
    </div>
  )
}
