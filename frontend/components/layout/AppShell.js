import Sidebar from './Sidebar'
import TopBar from './TopBar'

export default function AppShell({ children, breadcrumbs = [] }) {
  return (
    <div className="min-h-screen bg-xebia-bg">
      <Sidebar />
      <div className="pl-60">
        <TopBar breadcrumbs={breadcrumbs} />
        <main className="p-6">{children}</main>
      </div>
    </div>
  )
}
