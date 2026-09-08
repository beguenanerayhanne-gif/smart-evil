'use client'

import React from 'react'

interface DecProps {
  style?: React.CSSProperties
  className?: string
}

/* ─── Nuage ─────────────────────────────────────────────── */
export function CloudDecoration({ style, className }: DecProps) {
  return (
    <svg
      width="160" height="90"
      viewBox="0 0 160 90"
      fill="none"
      className={className}
      style={{ pointerEvents: 'none', ...style }}
      aria-hidden="true"
    >
      <ellipse cx="80" cy="68" rx="70" ry="22" fill="white" fillOpacity="0.95" />
      <ellipse cx="55" cy="55" rx="38" ry="30" fill="white" fillOpacity="0.95" />
      <ellipse cx="95" cy="50" rx="44" ry="34" fill="white" fillOpacity="0.95" />
      <ellipse cx="125" cy="62" rx="30" ry="22" fill="white" fillOpacity="0.95" />
      <ellipse cx="32" cy="65" rx="22" ry="18" fill="white" fillOpacity="0.95" />
    </svg>
  )
}

/* ─── Petit nuage ──────────────────────────────────────── */
export function SmallCloudDecoration({ style, className }: DecProps) {
  return (
    <svg
      width="90" height="52"
      viewBox="0 0 90 52"
      fill="none"
      className={className}
      style={{ pointerEvents: 'none', ...style }}
      aria-hidden="true"
    >
      <ellipse cx="45" cy="40" rx="40" ry="13" fill="white" fillOpacity="0.9" />
      <ellipse cx="30" cy="30" rx="22" ry="18" fill="white" fillOpacity="0.9" />
      <ellipse cx="55" cy="26" rx="26" ry="20" fill="white" fillOpacity="0.9" />
      <ellipse cx="72" cy="36" rx="18" ry="14" fill="white" fillOpacity="0.9" />
    </svg>
  )
}

/* ─── Étoile à 4 branches ────────────────────────────── */
export function StarDecoration({ style, className, color = '#f59e0b' }: DecProps & { color?: string }) {
  return (
    <svg
      width="48" height="48"
      viewBox="0 0 48 48"
      fill="none"
      className={className}
      style={{ pointerEvents: 'none', ...style }}
      aria-hidden="true"
    >
      <path
        d="M24 2 L26.5 21.5 L46 24 L26.5 26.5 L24 46 L21.5 26.5 L2 24 L21.5 21.5 Z"
        fill={color}
        fillOpacity="0.9"
      />
    </svg>
  )
}

/* ─── Petite étoile ronde ─────────────────────────────── */
export function SparkleDecoration({ style, className, color = '#fde047' }: DecProps & { color?: string }) {
  return (
    <svg
      width="28" height="28"
      viewBox="0 0 28 28"
      fill="none"
      className={className}
      style={{ pointerEvents: 'none', ...style }}
      aria-hidden="true"
    >
      <path
        d="M14 1 L15.5 12.5 L27 14 L15.5 15.5 L14 27 L12.5 15.5 L1 14 L12.5 12.5 Z"
        fill={color}
      />
    </svg>
  )
}

/* ─── Voiture jouet ────────────────────────────────────── */
export function ToyCarDecoration({ style, className }: DecProps) {
  return (
    <svg
      width="120" height="72"
      viewBox="0 0 120 72"
      fill="none"
      className={className}
      style={{ pointerEvents: 'none', ...style }}
      aria-hidden="true"
    >
      {/* Carrosserie */}
      <rect x="8" y="38" width="104" height="22" rx="8" fill="#f97316" />
      {/* Toit */}
      <path d="M28 38 L40 14 L82 14 L96 38 Z" fill="#ea580c" />
      {/* Pare-brise avant */}
      <path d="M76 18 L90 36 L70 36 Z" fill="#bae6fd" fillOpacity="0.85" />
      {/* Pare-brise arrière */}
      <path d="M44 18 L32 36 L52 36 Z" fill="#bae6fd" fillOpacity="0.85" />
      {/* Roues */}
      <circle cx="32" cy="60" r="12" fill="#1e293b" />
      <circle cx="32" cy="60" r="6" fill="#94a3b8" />
      <circle cx="88" cy="60" r="12" fill="#1e293b" />
      <circle cx="88" cy="60" r="6" fill="#94a3b8" />
      {/* Phare */}
      <circle cx="108" cy="46" r="5" fill="#fef9c3" />
      {/* Bande décorative */}
      <rect x="8" y="46" width="104" height="4" rx="2" fill="#c2410c" />
    </svg>
  )
}

/* ─── Ours en peluche ────────────────────────────────── */
export function TeddyBearDecoration({ style, className }: DecProps) {
  return (
    <svg
      width="90" height="110"
      viewBox="0 0 90 110"
      fill="none"
      className={className}
      style={{ pointerEvents: 'none', ...style }}
      aria-hidden="true"
    >
      {/* Corps */}
      <ellipse cx="45" cy="75" rx="28" ry="32" fill="#d97706" />
      {/* Ventre */}
      <ellipse cx="45" cy="82" rx="16" ry="18" fill="#fde68a" fillOpacity="0.8" />
      {/* Tête */}
      <circle cx="45" cy="36" r="28" fill="#d97706" />
      {/* Oreilles */}
      <circle cx="20" cy="16" r="11" fill="#d97706" />
      <circle cx="20" cy="16" r="6" fill="#fde68a" />
      <circle cx="70" cy="16" r="11" fill="#d97706" />
      <circle cx="70" cy="16" r="6" fill="#fde68a" />
      {/* Museau */}
      <ellipse cx="45" cy="46" rx="12" ry="9" fill="#fde68a" />
      {/* Nez */}
      <ellipse cx="45" cy="41" rx="5" ry="3.5" fill="#92400e" />
      {/* Yeux */}
      <circle cx="34" cy="30" r="4" fill="#1e293b" />
      <circle cx="56" cy="30" r="4" fill="#1e293b" />
      <circle cx="35.5" cy="28.5" r="1.5" fill="white" />
      <circle cx="57.5" cy="28.5" r="1.5" fill="white" />
      {/* Sourire */}
      <path d="M39 50 Q45 56 51 50" stroke="#92400e" strokeWidth="2" strokeLinecap="round" fill="none" />
      {/* Bras */}
      <ellipse cx="17" cy="72" rx="9" ry="20" fill="#d97706" transform="rotate(-15 17 72)" />
      <ellipse cx="73" cy="72" rx="9" ry="20" fill="#d97706" transform="rotate(15 73 72)" />
      {/* Jambes */}
      <ellipse cx="33" cy="103" rx="10" ry="8" fill="#b45309" />
      <ellipse cx="57" cy="103" rx="10" ry="8" fill="#b45309" />
      {/* Nœud */}
      <path d="M38 60 Q45 65 52 60 Q45 55 38 60Z" fill="#ef4444" />
    </svg>
  )
}

/* ─── Blocs de construction ──────────────────────────── */
export function ToyBlockDecoration({ style, className }: DecProps) {
  return (
    <svg
      width="100" height="100"
      viewBox="0 0 100 100"
      fill="none"
      className={className}
      style={{ pointerEvents: 'none', ...style }}
      aria-hidden="true"
    >
      {/* Bloc rouge (haut gauche) */}
      <rect x="4" y="4" width="42" height="42" rx="10" fill="#ef4444" />
      <text x="25" y="33" textAnchor="middle" fill="white" fontSize="22" fontWeight="900" fontFamily="system-ui">A</text>
      {/* Bloc bleu (haut droite) */}
      <rect x="54" y="4" width="42" height="42" rx="10" fill="#3b82f6" />
      <text x="75" y="33" textAnchor="middle" fill="white" fontSize="22" fontWeight="900" fontFamily="system-ui">B</text>
      {/* Bloc vert (bas gauche) */}
      <rect x="4" y="54" width="42" height="42" rx="10" fill="#22c55e" />
      <text x="25" y="83" textAnchor="middle" fill="white" fontSize="22" fontWeight="900" fontFamily="system-ui">C</text>
      {/* Bloc jaune (bas droite) */}
      <rect x="54" y="54" width="42" height="42" rx="10" fill="#eab308" />
      <text x="75" y="83" textAnchor="middle" fill="white" fontSize="22" fontWeight="900" fontFamily="system-ui">D</text>
    </svg>
  )
}

/* ─── Pièce de puzzle ──────────────────────────────── */
export function PuzzleDecoration({ style, className }: DecProps) {
  return (
    <svg
      width="88" height="88"
      viewBox="0 0 88 88"
      fill="none"
      className={className}
      style={{ pointerEvents: 'none', ...style }}
      aria-hidden="true"
    >
      {/* Pièce 1 — bleue */}
      <path d="M8 8 h28 v8 a8 8 0 0 1 0 16 v8 H8 v-8 a8 8 0 0 1 0-16 Z" fill="#38bdf8" />
      {/* Pièce 2 — rose */}
      <path d="M44 8 h28 v28 h-8 a8 8 0 0 1-16 0 H44 Z" fill="#f472b6" />
      {/* Pièce 3 — verte */}
      <path d="M8 44 h8 a8 8 0 0 1 16 0 h8 v28 H8 Z" fill="#4ade80" />
      {/* Pièce 4 — orange */}
      <path d="M44 44 h28 v28 H44 v-8 a8 8 0 0 1 0-16 Z" fill="#fb923c" />
    </svg>
  )
}

/* ─── Poupée ──────────────────────────────────────── */
export function DollDecoration({ style, className }: DecProps) {
  return (
    <svg
      width="72" height="110"
      viewBox="0 0 72 110"
      fill="none"
      className={className}
      style={{ pointerEvents: 'none', ...style }}
      aria-hidden="true"
    >
      {/* Cheveux */}
      <ellipse cx="36" cy="18" rx="22" ry="18" fill="#92400e" />
      <path d="M14 22 Q10 42 16 52" stroke="#92400e" strokeWidth="8" strokeLinecap="round" />
      <path d="M58 22 Q62 42 56 52" stroke="#92400e" strokeWidth="8" strokeLinecap="round" />
      {/* Visage */}
      <circle cx="36" cy="22" r="18" fill="#fde68a" />
      {/* Yeux */}
      <circle cx="28" cy="19" r="3" fill="#1e293b" />
      <circle cx="44" cy="19" r="3" fill="#1e293b" />
      <circle cx="29" cy="17.5" r="1.2" fill="white" />
      <circle cx="45" cy="17.5" r="1.2" fill="white" />
      {/* Joues */}
      <circle cx="22" cy="25" r="5" fill="#fca5a5" fillOpacity="0.7" />
      <circle cx="50" cy="25" r="5" fill="#fca5a5" fillOpacity="0.7" />
      {/* Sourire */}
      <path d="M29 28 Q36 34 43 28" stroke="#b45309" strokeWidth="1.8" strokeLinecap="round" fill="none" />
      {/* Corps — robe */}
      <path d="M18 42 Q10 50 12 72 h48 Q62 50 54 42 Q45 48 36 48 Q27 48 18 42Z" fill="#ec4899" />
      {/* Col */}
      <path d="M24 42 Q36 50 48 42" stroke="#be185d" strokeWidth="2" fill="none" />
      {/* Jupe évasée */}
      <path d="M12 72 Q8 90 10 104 h52 Q62 90 60 72 Z" fill="#f472b6" />
      {/* Décoration robe */}
      <circle cx="36" cy="62" r="4" fill="white" fillOpacity="0.7" />
      {/* Bras */}
      <ellipse cx="8" cy="58" rx="6" ry="18" fill="#ec4899" transform="rotate(-10 8 58)" />
      <ellipse cx="64" cy="58" rx="6" ry="18" fill="#ec4899" transform="rotate(10 64 58)" />
      {/* Mains */}
      <circle cx="5" cy="74" r="5" fill="#fde68a" />
      <circle cx="67" cy="74" r="5" fill="#fde68a" />
    </svg>
  )
}

/* ─── Ballon ───────────────────────────────────────── */
export function BalloonDecoration({ style, className, color = '#ef4444' }: DecProps & { color?: string }) {
  return (
    <svg
      width="56" height="80"
      viewBox="0 0 56 80"
      fill="none"
      className={className}
      style={{ pointerEvents: 'none', ...style }}
      aria-hidden="true"
    >
      <ellipse cx="28" cy="28" rx="24" ry="26" fill={color} />
      <ellipse cx="20" cy="18" rx="8" ry="6" fill="white" fillOpacity="0.3" />
      <path d="M28 54 Q26 62 30 68 Q26 70 28 75" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <path d="M24 54 L32 54 L30 58 L26 58 Z" fill={color} />
    </svg>
  )
}
