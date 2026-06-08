// Tiny dependency-free toast utility. Usable from anywhere (not just React).
let container = null

function ensureContainer() {
  if (container && document.body.contains(container)) return container
  container = document.createElement('div')
  container.setAttribute('dir', 'rtl')
  container.style.cssText = [
    'position:fixed',
    'bottom:24px',
    'left:50%',
    'transform:translateX(-50%)',
    'z-index:9999',
    'display:flex',
    'flex-direction:column',
    'gap:8px',
    'align-items:center',
    'pointer-events:none',
    'font-family:Tajawal, sans-serif',
  ].join(';')
  document.body.appendChild(container)
  return container
}

const TONES = {
  success: { bg: '#0D4F4E', icon: '✓' },
  error: { bg: '#DC2626', icon: '✕' },
  info: { bg: '#1F2937', icon: 'ℹ' },
}

export function toast(message, tone = 'info') {
  const c = ensureContainer()
  const t = TONES[tone] || TONES.info
  const el = document.createElement('div')
  el.style.cssText = [
    `background:${t.bg}`,
    'color:#fff',
    'padding:10px 18px',
    'border-radius:12px',
    'font-size:14px',
    'font-weight:800',
    'box-shadow:0 8px 24px rgba(0,0,0,.18)',
    'display:flex',
    'align-items:center',
    'gap:8px',
    'opacity:0',
    'transform:translateY(8px)',
    'transition:all .2s ease',
    'max-width:90vw',
  ].join(';')
  el.innerHTML = `<span style="font-size:15px">${t.icon}</span><span>${message}</span>`
  c.appendChild(el)
  requestAnimationFrame(() => { el.style.opacity = '1'; el.style.transform = 'translateY(0)' })
  setTimeout(() => {
    el.style.opacity = '0'
    el.style.transform = 'translateY(8px)'
    setTimeout(() => el.remove(), 220)
  }, 2600)
}

export const comingSoon = (feature = 'هذه الميزة') => toast(`${feature} — قريباً 🚧`, 'info')
