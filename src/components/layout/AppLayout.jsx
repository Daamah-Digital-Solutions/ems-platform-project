import { Outlet, Navigate } from 'react-router-dom'
import Sidebar from './Sidebar.jsx'
import TopBar from './TopBar.jsx'
import BottomNav from './BottomNav.jsx'
import { getToken } from '../../lib/api.js'

export default function AppLayout() {
  if (!getToken()) {
    return <Navigate to="/login" replace />
  }
  return (
    <div className="min-h-screen bg-bg">
      <Sidebar />
      <div className="lg:pr-[260px]">
        <TopBar />
        <main className="px-4 sm:px-6 lg:px-8 py-6 pb-28 lg:pb-12">
          <Outlet />
        </main>
      </div>
      <BottomNav />
    </div>
  )
}
