'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useTranslation } from '@/lib/i18n/LanguageContext'
import { PackageIcon, TagIcon, StarIcon, SparklesIcon } from '@/components/Icons'
import {
  CloudDecoration,
  SmallCloudDecoration,
  StarDecoration,
  SparkleDecoration,
  ToyCarDecoration,
  TeddyBearDecoration,
  ToyBlockDecoration,
  PuzzleDecoration,
  DollDecoration,
  BalloonDecoration,
} from '@/components/HeroDecorations'

interface CategoryItem {
  id: string
  name: string
  slug: string
  children?: { id: string; name: string; slug: string }[]
}

export default function HeroSection({ categories = [] }: { categories?: CategoryItem[] }) {
  const { t } = useTranslation()
  const sectionRef = useRef<HTMLElement>(null)
  const [parallax, setParallax] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    const handleMouseMove = (e: MouseEvent) => {
      const rect = section.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2
      const x = (e.clientX - centerX) / (rect.width / 2)
      const y = (e.clientY - centerY) / (rect.height / 2)
      setParallax({ x, y })
    }

    const handleMouseLeave = () => {
      setParallax({ x: 0, y: 0 })
    }

    section.addEventListener('mousemove', handleMouseMove)
    section.addEventListener('mouseleave', handleMouseLeave)
    return () => {
      section.removeEventListener('mousemove', handleMouseMove)
      section.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [])

  return (
    <section
      ref={sectionRef}
      className="hero-section"
      aria-label="Accueil Smart Éveil"
      style={{ perspective: '1000px' }}
    >
      {/* ── Arrière-plan : hero-bg.jpg avec overlay léger ── */}
      <div className="hero-bg-layer" aria-hidden="true" />

      {/* ── Dégradé coloré léger par-dessus ── */}
      <div className="hero-color-overlay" aria-hidden="true" />

      {/* ── Orbes de lumière Aurora pulsants en arrière-plan ── */}
      <div
        className="glow-aurora-orb"
        style={{
          width: '320px',
          height: '320px',
          background: 'radial-gradient(circle, rgba(239, 68, 68, 0.35) 0%, rgba(245, 158, 11, 0) 70%)',
          top: '10%',
          left: '15%',
          transform: `translate3d(${parallax.x * -30}px, ${parallax.y * -20}px, 0)`,
          transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      />
      <div
        className="glow-aurora-orb"
        style={{
          width: '380px',
          height: '380px',
          background: 'radial-gradient(circle, rgba(2, 132, 199, 0.3) 0%, rgba(139, 92, 246, 0) 70%)',
          bottom: '5%',
          right: '12%',
          animationDelay: '3s',
          transform: `translate3d(${parallax.x * 25}px, ${parallax.y * 30}px, 0)`,
          transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      />

      {/* ═══════════════════════════════════════════
          DÉCORATIONS FLOTTANTES AVEC PARALLAXE SOURIS
          ═══════════════════════════════════════════ */}

      {/* Nuages */}
      <div style={{ transform: `translate3d(${parallax.x * -12}px, ${parallax.y * -8}px, 0)`, transition: 'transform 0.2s ease-out' }}>
        <CloudDecoration className="hero-deco hero-cloud-tl" />
        <CloudDecoration className="hero-deco hero-cloud-tr" />
        <SmallCloudDecoration className="hero-deco hero-cloud-bl" />
        <SmallCloudDecoration className="hero-deco hero-cloud-br" />
      </div>

      {/* Étoiles & Sparkles */}
      <div style={{ transform: `translate3d(${parallax.x * 15}px, ${parallax.y * 12}px, 0)`, transition: 'transform 0.2s ease-out' }}>
        <StarDecoration className="hero-deco hero-star-1" color="#f59e0b" />
        <StarDecoration className="hero-deco hero-star-2" color="#ec4899" />
        <SparkleDecoration className="hero-deco hero-sparkle-1" color="#fde047" />
        <SparkleDecoration className="hero-deco hero-sparkle-2" color="#c084fc" />
        <SparkleDecoration className="hero-deco hero-sparkle-3" color="#34d399" />
        <SparkleDecoration className="hero-deco hero-sparkle-4" color="#f97316" />
      </div>

      {/* Jouets — côté gauche */}
      <div style={{ transform: `translate3d(${parallax.x * -25}px, ${parallax.y * -18}px, 0)`, transition: 'transform 0.2s ease-out' }}>
        <TeddyBearDecoration className="hero-deco hero-toy hero-bear" />
        <ToyBlockDecoration className="hero-deco hero-toy hero-blocks" />
      </div>

      {/* Jouets — côté droit */}
      <div style={{ transform: `translate3d(${parallax.x * 28}px, ${parallax.y * 22}px, 0)`, transition: 'transform 0.2s ease-out' }}>
        <ToyCarDecoration className="hero-deco hero-toy hero-car" />
        <DollDecoration className="hero-deco hero-toy hero-doll" />
      </div>

      {/* Jouets — bas */}
      <div style={{ transform: `translate3d(${parallax.x * -18}px, ${parallax.y * 20}px, 0)`, transition: 'transform 0.2s ease-out' }}>
        <PuzzleDecoration className="hero-deco hero-toy hero-puzzle" />
        <BalloonDecoration className="hero-deco hero-toy hero-balloon" color="#ef4444" />
        <BalloonDecoration className="hero-deco hero-toy hero-balloon-2" color="#3b82f6" />
      </div>

      {/* ═══════════════════════════════════════════
          CONTENU CENTRAL
          ═══════════════════════════════════════════ */}
      <div
        className="container hero-inner"
        style={{
          transform: `rotateY(${parallax.x * 3}deg) rotateX(${parallax.y * -3}deg)`,
          transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >

        {/* Badge livraison */}
        <div className="hero-badge-wrap">
          <div className="hero-badge shimmer-container">
            <div className="shimmer-overlay" />
            <SparklesIcon size={16} style={{ color: '#eab308' }} className="animate-wobble" />
            <span>{t('hero.badge')}</span>
          </div>
        </div>

        {/* Logo */}
        <div className="hero-logo-wrap" style={{ transition: 'transform 0.3s ease' }}>
          <img
            src="/logo.png"
            alt="Smart Éveil"
            className="hero-logo"
            style={{
              filter: 'drop-shadow(0 10px 24px rgba(220, 38, 38, 0.2))',
              transition: 'transform 0.3s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.06) rotate(-2deg)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1) rotate(0deg)')}
          />
        </div>

        {/* Titre principal */}
        <h1 className="hero-title">
          <span className="text-animated-gradient">{t('hero.title')}</span>
        </h1>

        {/* Sous-titre */}
        <p className="hero-subtitle">
          {t('hero.subtitle')}
        </p>

        {/* Boutons CTA */}
        <div className="hero-cta-row">
          <Link
            href="/produits"
            className="btn hero-btn-primary shimmer-container"
            style={{ position: 'relative', overflow: 'hidden' }}
          >
            <div className="shimmer-overlay" />
            <PackageIcon size={20} />
            <span>{t('hero.explore')}</span>
          </Link>
          <Link
            href="/categories"
            className="btn hero-btn-secondary shimmer-container"
            style={{ position: 'relative', overflow: 'hidden' }}
          >
            <div className="shimmer-overlay" />
            <TagIcon size={20} />
            <span>{t('hero.our_categories')}</span>
          </Link>
        </div>

      </div>
    </section>
  )
}

