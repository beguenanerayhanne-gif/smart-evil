import AdminLayoutClient from '@/components/AdminLayoutClient'

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <AdminLayoutClient>{children}</AdminLayoutClient>
}
