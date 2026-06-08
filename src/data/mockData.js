// MOVE — Mock data for the demo. All data is hardcoded.
// Studio: Fast Move Riyadh

export const studio = {
  id: 'studio-1',
  name_ar: 'Fast Move Riyadh',
  name_en: 'Fast Move Riyadh',
  owner_ar: 'أحمد العتيبي',
  city: 'الرياض',
  branch: 'حي الملقا',
  phone: '+966 11 234 5678',
  email: 'info@fastmove.sa',
  plan: 'الباقة الاحترافية',
  type: 'مختلط بأقسام منفصلة',
  vat: '300012345600003',
  cr: '1010123456',
  logo: 'FM'
}

export const user = {
  name_ar: 'أحمد العتيبي',
  name_en: 'Ahmed Al-Otaibi',
  role: 'مالك الستوديو',
  email: 'ahmed@fastmove.sa',
  initials: 'أع'
}

export const prayerTimes = [
  { name: 'الفجر', time: '٥:٢٠ ص', time24: '05:20' },
  { name: 'الظهر', time: '١٢:٠٥ م', time24: '12:05' },
  { name: 'العصر', time: '٣:٢٠ م', time24: '15:20' },
  { name: 'المغرب', time: '٦:٠٥ م', time24: '18:05' },
  { name: 'العشاء', time: '٧:٣٠ م', time24: '19:30' }
]

export const workingHours = {
  السبت: { open: '06:00', close: '23:00', closed: false },
  الأحد: { open: '06:00', close: '23:00', closed: false },
  الإثنين: { open: '06:00', close: '23:00', closed: false },
  الثلاثاء: { open: '06:00', close: '23:00', closed: false },
  الأربعاء: { open: '06:00', close: '23:00', closed: false },
  الخميس: { open: '06:00', close: '23:00', closed: false },
  الجمعة: { open: '14:00', close: '23:00', closed: false }
}

export const kpis = {
  bookingsToday: 24,
  bookingsTodayDelta: +3,
  activeClients: 147,
  activeClientsDelta: +12,
  monthlyRevenue: 62400,
  monthlyRevenueDelta: +15,
  noShowRate: 8,
  noShowDelta: -2
}

// 7-day mini chart data
export const last7DaysBookings = [
  { day: 'السبت', value: 18 },
  { day: 'الأحد', value: 22 },
  { day: 'الإثنين', value: 19 },
  { day: 'الثلاثاء', value: 25 },
  { day: 'الأربعاء', value: 21 },
  { day: 'الخميس', value: 21 },
  { day: 'الجمعة', value: 24 }
]

export const revenue6Months = [
  { month: 'أغسطس', value: 41200 },
  { month: 'سبتمبر', value: 46800 },
  { month: 'أكتوبر', value: 52100 },
  { month: 'نوفمبر', value: 54500 },
  { month: 'ديسمبر', value: 58300 },
  { month: 'يناير', value: 62400 }
]

export const noShowWeekly = [
  { week: 'أ١', value: 14 },
  { week: 'أ٢', value: 12 },
  { week: 'أ٣', value: 11 },
  { week: 'أ٤', value: 13 },
  { week: 'أ٥', value: 10 },
  { week: 'أ٦', value: 9 },
  { week: 'أ٧', value: 10 },
  { week: 'أ٨', value: 8 }
]

export const packageDistribution = [
  { name: 'باقة ٢٤ جلسة', value: 45, color: '#0D4F4E' },
  { name: 'باقة ٤٨ جلسة', value: 30, color: '#1A6E6D' },
  { name: 'باقة ١٢ جلسة', value: 15, color: '#FF6B6B' },
  { name: 'VIP', value: 10, color: '#F59E0B' }
]

export const trainerPerformance = [
  { name: 'كابتن عمر', sessions: 145 },
  { name: 'كابتن سارة', sessions: 132 },
  { name: 'كابتن أحمد', sessions: 128 },
  { name: 'كابتن ريم', sessions: 109 },
  { name: 'كابتن خالد', sessions: 94 }
]

export const funnel = [
  { stage: 'العملاء المحتملين', value: 150 },
  { stage: 'جلسات تجريبية', value: 78 },
  { stage: 'عملاء مدفوعين', value: 53 },
  { stage: 'محتفظ بهم ٦+ شهور', value: 41 }
]

// Peak hours heatmap (rows = day, cols = hour 6..23)
const HOURS = Array.from({ length: 18 }, (_, i) => 6 + i)
const DAYS = ['السبت', 'الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة']
export const peakHeatmap = {
  hours: HOURS,
  days: DAYS,
  grid: DAYS.map((d, di) =>
    HOURS.map((h) => {
      // Peak: morning 7-9, evening 18-22
      let v = 1
      if (h >= 7 && h <= 9) v = 4
      else if (h >= 17 && h <= 21) v = 5
      else if (h >= 10 && h <= 13) v = 3
      else if (h >= 14 && h <= 16) v = 2
      // Friday morning low
      if (d === 'الجمعة' && h < 14) v = 0
      // Slight day variation
      v = Math.max(0, Math.min(5, v + (di % 2 === 0 ? 0 : -1) + ((h + di) % 3 === 0 ? 1 : 0)))
      return v
    })
  )
}

export const alerts = [
  { id: 1, icon: '⚠️', tone: 'warning', text: '٥ عملاء لم يجددوا باقاتهم', cta: 'عرض' },
  { id: 2, icon: '🔄', tone: 'info', text: 'البدلة #٧ تحتاج صيانة (٥٠ غسلة)', cta: 'إدارة' },
  { id: 3, icon: '📋', tone: 'danger', text: '٣ نماذج PAR-Q انتهت صلاحيتها', cta: 'مراجعة' },
  { id: 4, icon: '💪', tone: 'warning', text: 'شهادة المدرب محمد تنتهي خلال ١٥ يوم', cta: 'تجديد' }
]

export const topPerformers = [
  { name: 'كابتن عمر السيد', sessions: 145, initials: 'عس' },
  { name: 'كابتن سارة العنزي', sessions: 132, initials: 'سع' },
  { name: 'كابتن أحمد محمد', sessions: 128, initials: 'أم' }
]

// Trainers (8)
export const trainers = [
  {
    id: 't1',
    name_ar: 'كابتن أحمد محمد',
    initials: 'أم',
    specialty: 'متخصص EMS',
    certification: 'miha bodytec',
    certExpiry: '٢٠٢٦/٠٣/١٥',
    rating: 4.8,
    monthSessions: 128,
    conversionRate: 72,
    status: 'متاح',
    gender: 'ذكر'
  },
  {
    id: 't2',
    name_ar: 'كابتن عمر السيد',
    initials: 'عس',
    specialty: 'متخصص EMS',
    certification: 'Glucker Kolleg',
    certExpiry: '٢٠٢٥/١١/٢٠',
    rating: 4.9,
    monthSessions: 145,
    conversionRate: 81,
    status: 'في جلسة',
    gender: 'ذكر'
  },
  {
    id: 't3',
    name_ar: 'كابتن سارة العنزي',
    initials: 'سع',
    specialty: 'متخصصة نسائي',
    certification: 'EMS Pro',
    certExpiry: '٢٠٢٦/٠١/١٠',
    rating: 4.9,
    monthSessions: 132,
    conversionRate: 78,
    status: 'متاح',
    gender: 'أنثى'
  },
  {
    id: 't4',
    name_ar: 'كابتن ريم القحطاني',
    initials: 'رق',
    specialty: 'متخصصة نسائي',
    certification: 'miha bodytec',
    certExpiry: '٢٠٢٥/٠٨/٠٥',
    rating: 4.7,
    monthSessions: 109,
    conversionRate: 65,
    status: 'متاح',
    gender: 'أنثى'
  },
  {
    id: 't5',
    name_ar: 'كابتن خالد الزهراني',
    initials: 'خز',
    specialty: 'لياقة + EMS',
    certification: 'XBody',
    certExpiry: '٢٠٢٦/٠٢/١٢',
    rating: 4.6,
    monthSessions: 94,
    conversionRate: 60,
    status: 'إجازة',
    gender: 'ذكر'
  },
  {
    id: 't6',
    name_ar: 'كابتن محمد الشهري',
    initials: 'مش',
    specialty: 'متخصص EMS',
    certification: 'miha bodytec',
    certExpiry: '٢٠٢٥/٠٥/٢٨',
    rating: 4.5,
    monthSessions: 86,
    conversionRate: 58,
    status: 'متاح',
    gender: 'ذكر'
  },
  {
    id: 't7',
    name_ar: 'كابتن منى الحربي',
    initials: 'مح',
    specialty: 'متخصصة نسائي',
    certification: 'EMS Pro',
    certExpiry: '٢٠٢٦/٠٤/١٨',
    rating: 4.8,
    monthSessions: 102,
    conversionRate: 69,
    status: 'في جلسة',
    gender: 'أنثى'
  },
  {
    id: 't8',
    name_ar: 'كابتن فيصل العمري',
    initials: 'فع',
    specialty: 'متخصص EMS',
    certification: 'Glucker Kolleg',
    certExpiry: '٢٠٢٦/٠٧/٠٢',
    rating: 4.7,
    monthSessions: 78,
    conversionRate: 62,
    status: 'متاح',
    gender: 'ذكر'
  }
]

// Machines (5)
export const machines = [
  {
    id: 'm1',
    label: 'الجهاز #١',
    model: 'miha bodytec II',
    status: 'متاح',
    totalSessions: 4280,
    lastService: '٢٠٢٤/١٢/١٠',
    nextService: '٢٠٢٥/٠٣/١٠'
  },
  {
    id: 'm2',
    label: 'الجهاز #٢',
    model: 'miha bodytec II',
    status: 'في جلسة',
    totalSessions: 3950,
    lastService: '٢٠٢٤/١١/٢٢',
    nextService: '٢٠٢٥/٠٢/٢٢'
  },
  {
    id: 'm3',
    label: 'الجهاز #٣',
    model: 'miha bodytec II',
    status: 'متاح',
    totalSessions: 3140,
    lastService: '٢٠٢٤/١٢/٠٥',
    nextService: '٢٠٢٥/٠٣/٠٥'
  },
  {
    id: 'm4',
    label: 'الجهاز #٤',
    model: 'miha bodytec II',
    status: 'صيانة مجدولة',
    totalSessions: 5120,
    lastService: '٢٠٢٤/١٠/١٥',
    nextService: '٢٠٢٥/٠١/١٥'
  },
  {
    id: 'm5',
    label: 'الجهاز #٥',
    model: 'XBody Newave',
    status: 'متاح',
    totalSessions: 1820,
    lastService: '٢٠٢٤/١٢/٢٠',
    nextService: '٢٠٢٥/٠٣/٢٠'
  }
]

// Suits (15)
const suitSizes = ['S', 'M', 'M', 'M', 'L', 'L', 'L', 'XL', 'S', 'M', 'L', 'M', 'L', 'XL', 'M']
const suitWashes = [25, 47, 12, 8, 33, 55, 18, 21, 4, 38, 62, 29, 14, 9, 41]
const suitStatuses = [
  'متاح',
  'في الغسيل',
  'متاح',
  'متاح',
  'في جلسة',
  'يحتاج استبدال',
  'متاح',
  'متاح',
  'متاح',
  'متاح',
  'يحتاج استبدال',
  'متاح',
  'متاح',
  'متاح',
  'في الغسيل'
]
export const suits = Array.from({ length: 15 }, (_, i) => ({
  id: `s${i + 1}`,
  label: `البدلة #${i + 1}`,
  size: suitSizes[i],
  status: suitStatuses[i],
  washes: suitWashes[i]
}))

// Package templates
export const packageTemplates = [
  {
    id: 'p1',
    name_ar: 'باقة التجربة',
    sessions: 4,
    durationMonths: 1,
    price: 799,
    activeSubs: 12,
    color: 'bg-amber-50 text-amber-700'
  },
  {
    id: 'p2',
    name_ar: 'الباقة الذهبية',
    sessions: 24,
    durationMonths: 3,
    price: 3900,
    activeSubs: 68,
    color: 'bg-brand-50 text-brand'
  },
  {
    id: 'p3',
    name_ar: 'الباقة البلاتينية',
    sessions: 48,
    durationMonths: 6,
    price: 6900,
    activeSubs: 41,
    color: 'bg-indigo-50 text-indigo-700'
  },
  {
    id: 'p4',
    name_ar: 'باقة VIP',
    sessions: 999,
    durationMonths: 1,
    price: 2500,
    activeSubs: 16,
    color: 'bg-rose-50 text-rose-700',
    unlimited: true
  }
]

// 20 clients
const clientStatusOptions = ['نشط', 'نشط', 'نشط', 'نشط', 'تجريبي', 'مجمد', 'منتهي']
const lastSessionOptions = ['اليوم', 'أمس', 'قبل يومين', 'قبل ٣ أيام', 'قبل أسبوع', 'قبل أسبوعين']

export const clients = [
  {
    id: 1,
    name_ar: 'نورة الخالدي',
    name_en: 'Noura Al-Khalidi',
    phone: '+966 50 123 4567',
    gender: 'أنثى',
    age: 32,
    status: 'نشط',
    tags: ['VIP', 'منتظم'],
    package: 'باقة ٢٤ جلسة',
    remaining: 12,
    total: 24,
    lastSession: 'قبل يومين',
    nextBooking: 'غداً ٦:٠٠ م',
    joinDate: '٢٠٢٤/٠٨/١٥',
    preferredTrainer: 'كابتن سارة',
    suitSize: 'M',
    parq: 'ساري',
    parqExpiry: '٢٠٢٥/٠٢/١٥',
    parqFlags: []
  },
  {
    id: 2,
    name_ar: 'محمد العتيبي',
    name_en: 'Mohammed Al-Otaibi',
    phone: '+966 55 987 6543',
    gender: 'ذكر',
    age: 45,
    status: 'نشط',
    tags: ['VIP'],
    package: 'باقة ٤٨ جلسة',
    remaining: 31,
    total: 48,
    lastSession: 'أمس',
    nextBooking: 'اليوم ٧:٠٠ م',
    joinDate: '٢٠٢٤/٠٦/٢٠',
    preferredTrainer: 'كابتن أحمد',
    suitSize: 'L',
    parq: 'ساري',
    parqExpiry: '٢٠٢٥/٠٣/٢٠',
    parqFlags: ['ضغط دم']
  },
  {
    id: 3,
    name_ar: 'سارة المطيري',
    name_en: 'Sara Al-Mutairi',
    phone: '+966 56 444 8899',
    gender: 'أنثى',
    age: 28,
    status: 'نشط',
    tags: ['منتظم'],
    package: 'باقة ٢٤ جلسة',
    remaining: 5,
    total: 24,
    lastSession: 'اليوم',
    nextBooking: 'الأحد ٥:٠٠ م',
    joinDate: '٢٠٢٤/٠٩/١٠',
    preferredTrainer: 'كابتن ريم',
    suitSize: 'S',
    parq: 'ساري',
    parqExpiry: '٢٠٢٥/٠٤/١٠',
    parqFlags: []
  },
  {
    id: 4,
    name_ar: 'عبدالله السبيعي',
    name_en: 'Abdullah Al-Sebai',
    phone: '+966 53 222 1144',
    gender: 'ذكر',
    age: 38,
    status: 'تجريبي',
    tags: ['جديد'],
    package: 'باقة التجربة',
    remaining: 3,
    total: 4,
    lastSession: 'قبل ٣ أيام',
    nextBooking: 'لا يوجد',
    joinDate: '٢٠٢٥/٠١/٠٢',
    preferredTrainer: 'كابتن عمر',
    suitSize: 'L',
    parq: 'ساري',
    parqExpiry: '٢٠٢٥/٠٧/٠٢',
    parqFlags: []
  },
  {
    id: 5,
    name_ar: 'ريم الدوسري',
    name_en: 'Reem Al-Dosari',
    phone: '+966 50 333 9988',
    gender: 'أنثى',
    age: 34,
    status: 'نشط',
    tags: ['VIP', 'منتظم'],
    package: 'باقة VIP',
    remaining: '∞',
    total: 999,
    lastSession: 'أمس',
    nextBooking: 'غداً ٥:٣٠ م',
    joinDate: '٢٠٢٤/٠٥/١٢',
    preferredTrainer: 'كابتن منى',
    suitSize: 'M',
    parq: 'ساري',
    parqExpiry: '٢٠٢٥/٠٥/١٢',
    parqFlags: []
  },
  {
    id: 6,
    name_ar: 'خالد القحطاني',
    name_en: 'Khalid Al-Qahtani',
    phone: '+966 55 666 1212',
    gender: 'ذكر',
    age: 42,
    status: 'مجمد',
    tags: ['متعثر'],
    package: 'باقة ٢٤ جلسة',
    remaining: 8,
    total: 24,
    lastSession: 'قبل أسبوعين',
    nextBooking: 'لا يوجد',
    joinDate: '٢٠٢٤/٠٧/٢٢',
    preferredTrainer: 'كابتن خالد',
    suitSize: 'XL',
    parq: 'منتهي',
    parqExpiry: '٢٠٢٥/٠١/٠٥',
    parqFlags: ['سكري']
  },
  {
    id: 7,
    name_ar: 'منى الشمري',
    name_en: 'Mona Al-Shammari',
    phone: '+966 56 778 9090',
    gender: 'أنثى',
    age: 30,
    status: 'نشط',
    tags: ['منتظم'],
    package: 'باقة ٤٨ جلسة',
    remaining: 22,
    total: 48,
    lastSession: 'قبل يومين',
    nextBooking: 'الإثنين ٧:٠٠ م',
    joinDate: '٢٠٢٤/٠٤/١٨',
    preferredTrainer: 'كابتن سارة',
    suitSize: 'M',
    parq: 'ساري',
    parqExpiry: '٢٠٢٥/٠٤/١٨',
    parqFlags: []
  },
  {
    id: 8,
    name_ar: 'فيصل الغامدي',
    name_en: 'Faisal Al-Ghamdi',
    phone: '+966 50 121 3434',
    gender: 'ذكر',
    age: 50,
    status: 'نشط',
    tags: ['VIP'],
    package: 'باقة ٤٨ جلسة',
    remaining: 12,
    total: 48,
    lastSession: 'اليوم',
    nextBooking: 'بعد غد ٨:٠٠ م',
    joinDate: '٢٠٢٤/٠٣/٠٥',
    preferredTrainer: 'كابتن فيصل',
    suitSize: 'L',
    parq: 'ساري',
    parqExpiry: '٢٠٢٥/٠٣/٠٥',
    parqFlags: ['ضغط دم', 'القلب']
  },
  {
    id: 9,
    name_ar: 'هند الحربي',
    name_en: 'Hind Al-Harbi',
    phone: '+966 55 909 1010',
    gender: 'أنثى',
    age: 27,
    status: 'تجريبي',
    tags: ['جديد'],
    package: 'باقة التجربة',
    remaining: 2,
    total: 4,
    lastSession: 'أمس',
    nextBooking: 'الأربعاء ٦:٣٠ م',
    joinDate: '٢٠٢٥/٠١/٠٥',
    preferredTrainer: 'كابتن ريم',
    suitSize: 'S',
    parq: 'ساري',
    parqExpiry: '٢٠٢٥/٠٧/٠٥',
    parqFlags: []
  },
  {
    id: 10,
    name_ar: 'سلطان الزهراني',
    name_en: 'Sultan Al-Zahrani',
    phone: '+966 53 808 7676',
    gender: 'ذكر',
    age: 36,
    status: 'نشط',
    tags: ['منتظم'],
    package: 'باقة ٢٤ جلسة',
    remaining: 18,
    total: 24,
    lastSession: 'قبل ٣ أيام',
    nextBooking: 'الخميس ٧:٣٠ م',
    joinDate: '٢٠٢٤/١٠/١٢',
    preferredTrainer: 'كابتن عمر',
    suitSize: 'L',
    parq: 'ساري',
    parqExpiry: '٢٠٢٥/٠٤/١٢',
    parqFlags: []
  },
  {
    id: 11,
    name_ar: 'الجوهرة العنزي',
    name_en: 'Aljawhara Al-Anazi',
    phone: '+966 56 234 5678',
    gender: 'أنثى',
    age: 41,
    status: 'نشط',
    tags: ['VIP'],
    package: 'باقة VIP',
    remaining: '∞',
    total: 999,
    lastSession: 'اليوم',
    nextBooking: 'غداً ٤:٠٠ م',
    joinDate: '٢٠٢٤/٠٢/٢٨',
    preferredTrainer: 'كابتن منى',
    suitSize: 'M',
    parq: 'ساري',
    parqExpiry: '٢٠٢٥/٠٢/٢٨',
    parqFlags: []
  },
  {
    id: 12,
    name_ar: 'تركي الفهد',
    name_en: 'Turki Al-Fahad',
    phone: '+966 55 545 8989',
    gender: 'ذكر',
    age: 33,
    status: 'منتهي',
    tags: ['متعثر'],
    package: 'باقة ٢٤ جلسة',
    remaining: 0,
    total: 24,
    lastSession: 'قبل شهر',
    nextBooking: 'لا يوجد',
    joinDate: '٢٠٢٤/٠٧/٠١',
    preferredTrainer: 'كابتن أحمد',
    suitSize: 'L',
    parq: 'منتهي',
    parqExpiry: '٢٠٢٤/١٢/٢٠',
    parqFlags: []
  },
  {
    id: 13,
    name_ar: 'لطيفة الصالح',
    name_en: 'Latifa Al-Saleh',
    phone: '+966 50 191 7474',
    gender: 'أنثى',
    age: 39,
    status: 'نشط',
    tags: ['منتظم'],
    package: 'باقة ٢٤ جلسة',
    remaining: 14,
    total: 24,
    lastSession: 'أمس',
    nextBooking: 'الأحد ٦:٠٠ م',
    joinDate: '٢٠٢٤/٠٩/٢٢',
    preferredTrainer: 'كابتن سارة',
    suitSize: 'M',
    parq: 'ساري',
    parqExpiry: '٢٠٢٥/٠٣/٢٢',
    parqFlags: ['حمل سابق']
  },
  {
    id: 14,
    name_ar: 'بدر العتيبي',
    name_en: 'Bader Al-Otaibi',
    phone: '+966 53 838 4747',
    gender: 'ذكر',
    age: 29,
    status: 'نشط',
    tags: ['جديد', 'منتظم'],
    package: 'باقة ٢٤ جلسة',
    remaining: 20,
    total: 24,
    lastSession: 'قبل يومين',
    nextBooking: 'الثلاثاء ٨:٠٠ م',
    joinDate: '٢٠٢٤/١٢/٠١',
    preferredTrainer: 'كابتن خالد',
    suitSize: 'M',
    parq: 'ساري',
    parqExpiry: '٢٠٢٥/٠٦/٠١',
    parqFlags: []
  },
  {
    id: 15,
    name_ar: 'عائشة البلوي',
    name_en: 'Aisha Al-Balwi',
    phone: '+966 56 161 5252',
    gender: 'أنثى',
    age: 35,
    status: 'نشط',
    tags: ['منتظم'],
    package: 'باقة ٤٨ جلسة',
    remaining: 28,
    total: 48,
    lastSession: 'اليوم',
    nextBooking: 'بعد غد ٧:٠٠ م',
    joinDate: '٢٠٢٤/٠٥/٢٦',
    preferredTrainer: 'كابتن ريم',
    suitSize: 'M',
    parq: 'ساري',
    parqExpiry: '٢٠٢٥/٠٥/٢٦',
    parqFlags: []
  },
  {
    id: 16,
    name_ar: 'نواف الرشيد',
    name_en: 'Nawaf Al-Rasheed',
    phone: '+966 55 717 6363',
    gender: 'ذكر',
    age: 47,
    status: 'نشط',
    tags: ['VIP'],
    package: 'باقة ٤٨ جلسة',
    remaining: 9,
    total: 48,
    lastSession: 'أمس',
    nextBooking: 'الإثنين ٨:٠٠ م',
    joinDate: '٢٠٢٤/٠٤/٠٢',
    preferredTrainer: 'كابتن عمر',
    suitSize: 'XL',
    parq: 'ساري',
    parqExpiry: '٢٠٢٥/٠٤/٠٢',
    parqFlags: []
  },
  {
    id: 17,
    name_ar: 'شهد البقمي',
    name_en: 'Shahad Al-Buqami',
    phone: '+966 50 525 9292',
    gender: 'أنثى',
    age: 26,
    status: 'تجريبي',
    tags: ['جديد'],
    package: 'باقة التجربة',
    remaining: 1,
    total: 4,
    lastSession: 'اليوم',
    nextBooking: 'الجمعة ٤:٠٠ م',
    joinDate: '٢٠٢٥/٠١/٠٨',
    preferredTrainer: 'كابتن منى',
    suitSize: 'S',
    parq: 'ساري',
    parqExpiry: '٢٠٢٥/٠٧/٠٨',
    parqFlags: []
  },
  {
    id: 18,
    name_ar: 'عبدالعزيز السهلي',
    name_en: 'Abdulaziz Al-Sahli',
    phone: '+966 53 393 8181',
    gender: 'ذكر',
    age: 40,
    status: 'نشط',
    tags: ['منتظم'],
    package: 'باقة ٢٤ جلسة',
    remaining: 17,
    total: 24,
    lastSession: 'قبل يومين',
    nextBooking: 'الأربعاء ٧:٠٠ م',
    joinDate: '٢٠٢٤/٠٨/٣٠',
    preferredTrainer: 'كابتن فيصل',
    suitSize: 'L',
    parq: 'ساري',
    parqExpiry: '٢٠٢٥/٠٢/٢٨',
    parqFlags: []
  },
  {
    id: 19,
    name_ar: 'العنود الحارثي',
    name_en: 'Alanoud Al-Harthi',
    phone: '+966 56 222 6464',
    gender: 'أنثى',
    age: 31,
    status: 'نشط',
    tags: ['VIP', 'منتظم'],
    package: 'باقة ٤٨ جلسة',
    remaining: 35,
    total: 48,
    lastSession: 'أمس',
    nextBooking: 'الأحد ٥:٣٠ م',
    joinDate: '٢٠٢٤/٠٣/١٨',
    preferredTrainer: 'كابتن سارة',
    suitSize: 'M',
    parq: 'ساري',
    parqExpiry: '٢٠٢٥/٠٣/١٨',
    parqFlags: []
  },
  {
    id: 20,
    name_ar: 'سعد المالكي',
    name_en: 'Saad Al-Maliki',
    phone: '+966 55 818 3535',
    gender: 'ذكر',
    age: 52,
    status: 'نشط',
    tags: ['VIP'],
    package: 'باقة VIP',
    remaining: '∞',
    total: 999,
    lastSession: 'اليوم',
    nextBooking: 'غداً ٧:٣٠ م',
    joinDate: '٢٠٢٣/١١/١٥',
    preferredTrainer: 'كابتن أحمد',
    suitSize: 'XL',
    parq: 'ساري',
    parqExpiry: '٢٠٢٥/٠٥/١٥',
    parqFlags: ['ضغط دم']
  }
]

// Today's schedule — 24 bookings
const TIME_LABELS = [
  '6:00 ص',
  '6:30 ص',
  '7:00 ص',
  '7:30 ص',
  '8:00 ص',
  '8:30 ص',
  '9:00 ص',
  '10:00 ص',
  '10:30 ص',
  '11:00 ص',
  '11:30 ص',
  '1:00 م',
  '2:00 م',
  '3:00 م',
  '4:00 م',
  '4:30 م',
  '5:00 م',
  '5:30 م',
  '6:00 م',
  '6:30 م',
  '7:00 م',
  '8:00 م',
  '8:30 م',
  '9:00 م'
]

const STATUSES = ['مكتمل', 'مكتمل', 'مكتمل', 'مكتمل', 'مكتمل', 'مكتمل', 'مكتمل', 'مكتمل', 'مكتمل', 'مكتمل', 'مكتمل', 'لم يحضر', 'مكتمل', 'مكتمل', 'جاري', 'مؤكد', 'مؤكد', 'مؤكد', 'مؤكد', 'مؤكد', 'مؤكد', 'مؤكد', 'مؤكد', 'مؤكد']

export const todaySchedule = TIME_LABELS.map((time, i) => {
  const client = clients[i % clients.length]
  const trainer = trainers[i % trainers.length]
  const machine = machines[i % machines.length]
  return {
    id: `b-${i}`,
    time,
    timeIndex: i,
    clientId: client.id,
    clientName: client.name_ar,
    trainerName: trainer.name_ar,
    machine: machine.label,
    status: STATUSES[i]
  }
})

// Testimonials for landing page
export const testimonials = [
  {
    quote:
      'MOVE غيّر طريقتنا في إدارة الستوديو. توفير ساعات يومياً والعملاء صاروا أكثر التزاماً بمواعيدهم.',
    name: 'أحمد العتيبي',
    role: 'مالك Fast Move Riyadh',
    initials: 'أع'
  },
  {
    quote:
      'الفواتير المتوافقة مع ZATCA كانت كابوس قبل MOVE. الآن كل شيء تلقائي ومتوافق ١٠٠٪.',
    name: 'سارة المطيري',
    role: 'مديرة Pulse Studio Jeddah',
    initials: 'سم'
  },
  {
    quote:
      'تذكيرات واتساب التلقائية قللت الـ no-shows عندنا من ١٨٪ إلى ٥٪ في شهرين فقط.',
    name: 'فهد الدوسري',
    role: 'مالك EMSPro Khobar',
    initials: 'فد'
  }
]

// Featured fictional studios for the trust bar
export const trustedStudios = [
  { name: 'Fast Move Riyadh', short: 'FM' },
  { name: 'Pulse Studio', short: 'PS' },
  { name: 'EMS Pro Khobar', short: 'EP' },
  { name: 'Body Lab', short: 'BL' },
  { name: 'Move 360', short: 'M3' }
]

// Pricing tiers
export const pricingTiers = [
  {
    id: 'basic',
    name: 'الباقة الأساسية',
    price: 800,
    cap: 'حتى ١٠٠ عميل',
    features: ['نظام الحجوزات', 'إدارة العملاء', 'إدارة الباقات', 'تقارير أساسية'],
    cta: 'ابدأ الآن',
    highlight: false
  },
  {
    id: 'pro',
    name: 'الباقة الاحترافية',
    price: 1500,
    cap: 'حتى ٥٠٠ عميل',
    features: [
      'كل مميزات الباقة الأساسية',
      'فواتير ZATCA متوافقة',
      'تذكيرات واتساب تلقائية',
      'تقارير متقدمة',
      'إدارة الموارد والصيانة'
    ],
    cta: 'ابدأ الآن',
    highlight: true,
    badge: 'الأكثر شعبية'
  },
  {
    id: 'enterprise',
    name: 'باقة المؤسسات',
    price: null,
    cap: 'فروع متعددة',
    features: ['كل مميزات الباقة الاحترافية', 'فروع متعددة', 'مدير حساب مخصص', 'تكاملات مخصصة', 'تدريب فريق العمل'],
    cta: 'تواصل معنا',
    highlight: false
  }
]
