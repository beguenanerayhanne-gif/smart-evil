import React from 'react'

interface CategoryIconProps {
  slug?: string
  icon?: string | null
  size?: number
  className?: string
  style?: React.CSSProperties
}

export default function CategoryIcon({
  slug = '',
  icon = '',
  size = 20,
  className = '',
  style,
}: CategoryIconProps) {
  const normalizedKey = (slug || icon || '').toLowerCase()

  // 1. Bébé & Premier Âge
  if (normalizedKey.includes('bebe') || normalizedKey.includes('baby') || normalizedKey.includes('premier-age')) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
        <circle cx="12" cy="12" r="8" />
        <path d="M12 2v2" />
        <path d="M9 10h.01" />
        <path d="M15 10h.01" />
        <path d="M9.5 15a3.5 3.5 0 0 0 5 0" />
      </svg>
    )
  }

  // 2. Fille
  if (normalizedKey.includes('fille') || normalizedKey.includes('girl') || normalizedKey.includes('poupee')) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
        <path d="M2 4l3 12h14l3-12-6 7-4-5-4 5-6-7z" />
        <circle cx="12" cy="19" r="2" />
      </svg>
    )
  }

  // 3. Garçon / Action
  if (normalizedKey.includes('garcon') || normalizedKey.includes('boy') || normalizedKey.includes('voiture') || normalizedKey.includes('action')) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
        <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.71.79-1.81.79-1.81s-1.98-.08-2.79-.79c-.71-.71-.79-2.79-.79-2.79s-1.1.08-1.81.79z" />
        <path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-3.05 11a22.35 22.35 0 0 1-3.95 2z" />
        <path d="M9 12l-2 2" />
      </svg>
    )
  }

  // 4. Jeux de Construction
  if (normalizedKey.includes('construction') || normalizedKey.includes('brique') || normalizedKey.includes('block')) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
        <rect x="2" y="12" width="9" height="9" rx="1" />
        <rect x="13" y="12" width="9" height="9" rx="1" />
        <rect x="7" y="3" width="10" height="8" rx="1" />
      </svg>
    )
  }

  // 5. Jeux de Société
  if (normalizedKey.includes('societe') || normalizedKey.includes('dice') || normalizedKey.includes('carte')) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
        <rect x="3" y="3" width="18" height="18" rx="3" />
        <circle cx="8.5" cy="8.5" r="1.25" fill="currentColor" />
        <circle cx="15.5" cy="8.5" r="1.25" fill="currentColor" />
        <circle cx="12" cy="12" r="1.25" fill="currentColor" />
        <circle cx="8.5" cy="15.5" r="1.25" fill="currentColor" />
        <circle cx="15.5" cy="15.5" r="1.25" fill="currentColor" />
      </svg>
    )
  }

  // 6. Puzzles
  if (normalizedKey.includes('puzzle')) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
        <path d="M19.439 7.85c-.049-.322.059-.648.289-.878l1.568-1.568a2.41 2.41 0 0 0-3.408-3.408l-1.568 1.568c-.23.23-.556.338-.878.289a4.832 4.832 0 0 0-5.594 4.542H6A3 3 0 0 0 3 11v3.85a4.832 4.832 0 0 0 4.542 5.594c.322.049.648-.059.878-.289l1.568-1.568a2.41 2.41 0 0 0 3.408-3.408l-1.568-1.568c-.23-.23-.338-.556-.289-.878a4.832 4.832 0 0 0 4.542-5.594z" />
      </svg>
    )
  }

  // 7. Activités Créatives
  if (normalizedKey.includes('creative') || normalizedKey.includes('dessin') || normalizedKey.includes('peinture')) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
        <circle cx="13.5" cy="6.5" r=".5" fill="currentColor" />
        <circle cx="17.5" cy="10.5" r=".5" fill="currentColor" />
        <circle cx="8.5" cy="7.5" r=".5" fill="currentColor" />
        <circle cx="6.5" cy="12.5" r=".5" fill="currentColor" />
        <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.92 0 1.67-.75 1.67-1.67 0-.42-.16-.8-.42-1.08-.26-.28-.42-.66-.42-1.08 0-.92.75-1.67 1.67-1.67H16c3.31 0 6-2.69 6-6 0-4.97-4.48-9-10-9z" />
      </svg>
    )
  }

  // 8. Jouets en Bois
  if (normalizedKey.includes('bois') || normalizedKey.includes('wood') || normalizedKey.includes('arbre')) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
        <path d="M12 2L4 9h3v5H4l8 8 8-8h-3V9h3L12 2z" />
        <path d="M12 14v8" />
      </svg>
    )
  }

  // 9. Outdoor & Jardin
  if (normalizedKey.includes('outdoor') || normalizedKey.includes('jardin') || normalizedKey.includes('velo') || normalizedKey.includes('plage')) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
        <circle cx="5.5" cy="17.5" r="3.5" />
        <circle cx="18.5" cy="17.5" r="3.5" />
        <path d="M15 6a1 1 0 1 0 0-2 1 1 0 0 0 0 2z" />
        <path d="M12 17.5V14l-3-3 4-3 2 3h3" />
      </svg>
    )
  }

  // 10. Impression 3D
  if (normalizedKey.includes('3d') || normalizedKey.includes('impression')) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
        <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
        <line x1="12" y1="22.08" x2="12" y2="12" />
      </svg>
    )
  }

  // 11. Multimédia & High-Tech
  if (normalizedKey.includes('multimedia') || normalizedKey.includes('tech') || normalizedKey.includes('video') || normalizedKey.includes('console')) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
        <line x1="6" y1="12" x2="10" y2="12" />
        <line x1="8" y1="10" x2="8" y2="14" />
        <circle cx="15" cy="13" r="1" fill="currentColor" />
        <circle cx="17.5" cy="10.5" r="1" fill="currentColor" />
        <rect x="2" y="6" width="20" height="12" rx="4" />
      </svg>
    )
  }

  // 12. Promotions & Déstockage
  if (normalizedKey.includes('promotion') || normalizedKey.includes('destockage') || normalizedKey.includes('solde') || normalizedKey.includes('plan')) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
        <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
        <line x1="7" y1="7" x2="7.01" y2="7" />
      </svg>
    )
  }

  // 13. Nouveautés
  if (normalizedKey.includes('nouveaute') || normalizedKey.includes('new') || normalizedKey.includes('tendance')) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
        <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
        <path d="M5 3v4" />
        <path d="M19 17v4" />
      </svg>
    )
  }

  // Tous les jouets / Default Fallback
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  )
}
