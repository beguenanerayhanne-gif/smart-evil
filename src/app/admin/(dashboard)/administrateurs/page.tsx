import { prisma } from '@/lib/prisma'
import AdminForm from '../parametres/AdminForm'

export const metadata = {
  title: 'Administrateurs - Administration Smart éveil',
}

export default async function AdministrateursPage() {
  const admins = await prisma.admin.findMany({
    orderBy: { createdAt: 'asc' },
    select: { id: true, username: true, createdAt: true }
  })

  return (
    <div style={{ maxWidth: '800px' }}>
      <div className="page-header">
        <div>
          <h1>Administrateurs</h1>
          <p>Gérez les comptes d'accès au back-office</p>
        </div>
      </div>

      <AdminForm admins={admins} />
    </div>
  )
}
