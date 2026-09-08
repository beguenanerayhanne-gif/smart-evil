import { prisma } from '@/lib/prisma'
import { updateSettings } from './actions'
import AdminForm from './AdminForm'

export const metadata = {
  title: 'Paramètres - Administration Smart éveil',
}

const DEFAULT_SETTINGS = [
  { key: 'shop_name', label: 'Nom de la boutique', placeholder: 'Smart éveil' },
  { key: 'hero_title', label: 'Titre de la page d\'accueil', placeholder: 'Bienvenue dans notre boutique' },
  { key: 'hero_subtitle', label: 'Sous-titre de la page d\'accueil', placeholder: 'Des produits de qualité, livrés partout en Algérie' },
  { key: 'contact_phone', label: 'Téléphone de contact', placeholder: '0555 000 000' },
  { key: 'contact_address', label: 'Adresse', placeholder: 'Adresse de la boutique' },
]

export default async function SettingsPage() {
  const settingsFromDb = await prisma.settings.findMany()
  const settingsMap = Object.fromEntries(settingsFromDb.map(s => [s.key, s.value]))
  const admins = await prisma.admin.findMany({
    orderBy: { createdAt: 'asc' },
    select: { id: true, username: true, createdAt: true }
  })

  return (
    <div style={{ maxWidth: '800px' }}>
      <div className="page-header">
        <div>
          <h1>Paramètres</h1>
          <p>Configurez votre boutique et vos administrateurs</p>
        </div>
      </div>

      <div className="card card-body">
        <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem' }}>Configuration de la Boutique</h2>
        <form action={updateSettings}>
          {DEFAULT_SETTINGS.map(setting => (
            <div className="form-group" key={setting.key}>
              <label className="form-label" htmlFor={setting.key}>{setting.label}</label>
              <input
                id={setting.key}
                name={setting.key}
                type="text"
                className="form-input"
                defaultValue={settingsMap[setting.key] ?? ''}
                placeholder={setting.placeholder}
              />
            </div>
          ))}

          <div className="divider" />

          <button type="submit" className="btn btn-primary">Enregistrer les paramètres</button>
        </form>
      </div>

      <AdminForm admins={admins} />
    </div>
  )
}
