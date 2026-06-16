import { Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import Landing from './pages/Landing.jsx'
import Login from './pages/Login.jsx'
import Onboarding from './pages/Onboarding.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Clients from './pages/Clients.jsx'
import ClientDetail from './pages/ClientDetail.jsx'
import Bookings from './pages/Bookings.jsx'
import NewBooking from './pages/NewBooking.jsx'
import Packages from './pages/Packages.jsx'
import Trainers from './pages/Trainers.jsx'
import Resources from './pages/Resources.jsx'
import Reports from './pages/Reports.jsx'
import Settings from './pages/Settings.jsx'
import ComingSoon from './pages/ComingSoon.jsx'
import Invoices from './pages/Invoices.jsx'
import Payments from './pages/Payments.jsx'
import PayResult from './pages/PayResult.jsx'
import AppLayout from './components/layout/AppLayout.jsx'

export default function App() {
  // Force RTL on load
  useEffect(() => {
    document.documentElement.dir = 'rtl'
    document.documentElement.lang = 'ar'
  }, [])

  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/onboarding" element={<Onboarding />} />
      {/* Public payment result page (client-facing, after Tap redirect) */}
      <Route path="/pay/result" element={<PayResult />} />

      {/* App shell routes */}
      <Route element={<AppLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/clients" element={<Clients />} />
        <Route path="/clients/:id" element={<ClientDetail />} />
        <Route path="/bookings" element={<Bookings />} />
        <Route path="/bookings/new" element={<NewBooking />} />
        <Route path="/packages" element={<Packages />} />
        <Route path="/trainers" element={<Trainers />} />
        <Route path="/resources" element={<Resources />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/payments" element={<Payments />} />
        {/* Invoices temporarily hidden — redirect to dashboard */}
        <Route path="/invoices" element={<Navigate to="/dashboard" replace />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
