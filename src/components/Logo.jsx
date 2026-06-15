import { cn } from '../lib/utils.js'

export default function Logo({ className = '', invert = false, mark = false, size = 'md', label = 'MOVE' }) {
  const sizes = {
    sm: { box: 'w-7 h-7', text: 'text-lg', svg: 'w-4 h-4', dot: 'w-1.5 h-1.5' },
    md: { box: 'w-9 h-9', text: 'text-2xl', svg: 'w-5 h-5', dot: 'w-2 h-2' },
    lg: { box: 'w-12 h-12', text: 'text-3xl', svg: 'w-7 h-7', dot: 'w-2.5 h-2.5' }
  }
  const s = sizes[size] || sizes.md

  return (
    <div
      className={cn(
        'inline-flex items-center gap-2.5 font-extrabold tracking-tight',
        className
      )}
    >
      <span
        className={cn(
          'relative inline-flex items-center justify-center rounded-xl shadow-sm',
          s.box,
          invert ? 'bg-white text-brand' : 'bg-brand-gradient text-white'
        )}
      >
        {/* Custom M mark with motion lines */}
        <svg
          viewBox="0 0 32 32"
          className={s.svg}
          fill="none"
          stroke="currentColor"
          strokeWidth="2.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M5 25 L5 7 L11.5 15 L16 11 L20.5 15 L27 7 L27 25" />
        </svg>
        {/* Accent dot */}
        <span
          className={cn(
            'absolute -top-0.5 -right-0.5 rounded-full bg-accent ring-2',
            s.dot,
            invert ? 'ring-white' : 'ring-brand-700'
          )}
        />
      </span>
      {!mark && (
        <span
          className={cn(
            s.text,
            'leading-none',
            invert ? 'text-white' : 'text-ink-primary'
          )}
          style={{ letterSpacing: '-0.04em' }}
        >
          {label}
        </span>
      )}
    </div>
  )
}
