import {
  LayoutDashboard,
  Users,
  Calendar,
  Package,
  Dumbbell,
  Boxes,
  BarChart3,
  CreditCard,
  Receipt,
  Settings
} from 'lucide-react'

export const NAV_ITEMS = [
  { to: '/dashboard', label: 'الرئيسية', icon: LayoutDashboard },
  { to: '/clients', label: 'العملاء', icon: Users },
  { to: '/bookings', label: 'الحجوزات', icon: Calendar },
  { to: '/packages', label: 'الباقات', icon: Package },
  { to: '/trainers', label: 'المدربين', icon: Dumbbell },
  { to: '/resources', label: 'الموارد', icon: Boxes },
  { to: '/reports', label: 'التقارير', icon: BarChart3 },
  { to: '/payments', label: 'المدفوعات', icon: CreditCard },
  // Invoices temporarily hidden.
  { to: '/settings', label: 'الإعدادات', icon: Settings }
]

export const BOTTOM_NAV = [
  { to: '/dashboard', label: 'الرئيسية', icon: LayoutDashboard },
  { to: '/clients', label: 'العملاء', icon: Users },
  { to: '/bookings', label: 'الحجوزات', icon: Calendar },
  { to: '/reports', label: 'التقارير', icon: BarChart3 },
  { to: '/settings', label: 'الإعدادات', icon: Settings }
]
