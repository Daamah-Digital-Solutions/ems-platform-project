// Utility helpers

export function cn(...classes) {
  return classes.filter(Boolean).join(' ')
}

// Convert Western digits to Arabic-Indic digits
export function toArabicDigits(value) {
  if (value === null || value === undefined) return ''
  const map = { 0: '٠', 1: '١', 2: '٢', 3: '٣', 4: '٤', 5: '٥', 6: '٦', 7: '٧', 8: '٨', 9: '٩' }
  return String(value).replace(/[0-9]/g, (d) => map[d])
}

export function formatNumberAr(value) {
  if (value === null || value === undefined) return ''
  return toArabicDigits(Number(value).toLocaleString('en-US'))
}

// Format SAR currency — Western numerals as spec allows
export function formatSAR(value) {
  if (value === null || value === undefined) return ''
  return `${Number(value).toLocaleString('en-US')} ر.س`
}

// Initials from Arabic name
export function initials(name = '') {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 0) return ''
  if (parts.length === 1) return parts[0].slice(0, 2)
  return parts[0][0] + parts[1][0]
}

// Stable hash → color from a string (for avatars)
const AVATAR_COLORS = [
  'bg-teal-100 text-teal-800',
  'bg-rose-100 text-rose-800',
  'bg-amber-100 text-amber-800',
  'bg-sky-100 text-sky-800',
  'bg-violet-100 text-violet-800',
  'bg-emerald-100 text-emerald-800',
  'bg-indigo-100 text-indigo-800',
  'bg-pink-100 text-pink-800',
  'bg-orange-100 text-orange-800'
]
export function avatarColor(seed = '') {
  let h = 0
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0
  return AVATAR_COLORS[h % AVATAR_COLORS.length]
}

// Today's date as a formatted Arabic string
export function todayArabic() {
  const days = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت']
  const months = [
    'يناير',
    'فبراير',
    'مارس',
    'أبريل',
    'مايو',
    'يونيو',
    'يوليو',
    'أغسطس',
    'سبتمبر',
    'أكتوبر',
    'نوفمبر',
    'ديسمبر'
  ]
  const d = new Date()
  return `${days[d.getDay()]}، ${toArabicDigits(d.getDate())} ${months[d.getMonth()]} ${toArabicDigits(d.getFullYear())}`
}

// Normalize a Saudi phone number to international digits for wa.me (e.g. 05XXXXXXXX -> 9665XXXXXXXX)
export function normalizePhone(phone = '') {
  let p = String(phone).replace(/[^\d+]/g, '')
  if (p.startsWith('+')) p = p.slice(1)
  if (p.startsWith('00')) p = p.slice(2)
  if (p.startsWith('0')) p = '966' + p.slice(1)
  else if (p.startsWith('5') && p.length === 9) p = '966' + p
  return p
}

export function telLink(phone = '') {
  return `tel:${String(phone).replace(/[^\d+]/g, '')}`
}

export function waLink(phone = '', text = '') {
  const base = `https://wa.me/${normalizePhone(phone)}`
  return text ? `${base}?text=${encodeURIComponent(text)}` : base
}

export function greetingByHour() {
  const h = new Date().getHours()
  if (h < 12) return 'صباح الخير'
  if (h < 17) return 'مساء الخير'
  return 'مساء النور'
}
