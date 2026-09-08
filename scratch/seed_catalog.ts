import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()

// Ensure public/uploads directory exists
const uploadsDir = path.resolve('public/uploads')
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
}

async function seedRealCatalog() {
  console.log('=== DEBUT SEED DU CATALOGUE REEL (10 PRODUITS) ===')

  // Helper to ensure category exists
  async function getOrCreateCategory(name: string, parentName?: string) {
    const slug = name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    let cat = await prisma.category.findFirst({ where: { OR: [{ slug }, { name }] } })
    if (!cat) {
      cat = await prisma.category.create({
        data: { name, slug, active: true }
      })
      console.log(`📁 Catégorie créée : "${name}"`)
    }
    return cat
  }

  // 1. Categories setup
  const catTrottinettes = await getOrCreateCategory('Trottinettes')
  const catVehicules = await getOrCreateCategory('Voitures & Véhicules')
  const catPoupees = await getOrCreateCategory('Poupées')
  const catMaisons = await getOrCreateCategory('Maisons de poupées')
  const catEducatifs = await getOrCreateCategory('Jeux éducatifs')
  const catSlime = await getOrCreateCategory('Slime & Squishy')
  const catPeluches = await getOrCreateCategory('Peluches')
  const catConstruction = await getOrCreateCategory('Construction')
  const catPuzzles = await getOrCreateCategory('Puzzles')
  const catSociete = await getOrCreateCategory('Jeux de société')

  console.log('✅ Catégories préparées.')

  // Clean up any test products created previously with the same names to avoid duplicate slug conflicts
  const targetProductNames = [
    'Trottinette enfant',
    'Voiture télécommandée',
    'Poupée enfant',
    'Maison de poupée',
    'Robot éducatif',
    'Kit de slime',
    'Peluche licorne',
    'Jeu de construction',
    'Puzzle enfant',
    'Jeu de société famille',
  ]

  for (const name of targetProductNames) {
    const prods = await prisma.product.findMany({ where: { name } })
    for (const p of prods) {
      await prisma.product.delete({ where: { id: p.id } })
    }
  }
  console.log('🧹 Ancien catalogue de test nettoyé.')

  // Helper to copy/create local SVG/WebP placeholder image files with distinct colors
  function createLocalProductImage(filename: string, colorHex: string, label: string): string {
    const filePath = path.join(uploadsDir, filename)
    const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600">
      <rect width="600" height="600" fill="${colorHex}" rx="30"/>
      <circle cx="300" cy="260" r="140" fill="white" opacity="0.2"/>
      <text x="300" y="270" font-family="Arial, sans-serif" font-size="32" font-weight="bold" fill="white" text-anchor="middle">${label}</text>
      <text x="300" y="320" font-family="Arial, sans-serif" font-size="20" fill="white" opacity="0.8" text-anchor="middle">Smart Éveil</text>
    </svg>`
    fs.writeFileSync(filePath, svgContent, 'utf8')
    return `/uploads/${filename}`
  }

  // ── PRODUIT 1 : Trottinette enfant (AVEC VARIANTES ROSE ET BLEU) ─────────────
  const p1 = await prisma.product.create({
    data: {
      name: 'Trottinette enfant',
      slug: 'trottinette-enfant',
      shortDescription: 'Trottinette évolutive à 3 roues lumineuses LED pour enfants.',
      description: 'Superbe trottinette évolutive à 3 roues équipées de LED brillantes qui s’allument lors du mouvement sans piles. Guidon réglable en hauteur sur 4 niveaux (63cm à 80cm) et système de pliage sécurisé en un clic. Idéale de 2 à 8 ans.',
      categoryId: catTrottinettes.id,
      brand: 'Globber',
      purchasePrice: 3200,
      price: 5000,
      stock: 17,
      stockThreshold: 3,
      reference: 'TRO-PARENT',
      barcode: '6970123456701',
      ageMin: 2,
      ageMax: 8,
      active: true,
    }
  })

  // Variante Rose (3 images)
  const v1Rose = await prisma.productVariant.create({
    data: {
      productId: p1.id,
      color: 'Rose',
      colorHex: '#FF69B4',
      reference: 'TRO-ROSE',
      price: 5000,
      oldPrice: 5900,
      purchasePrice: 3200,
      stock: 10,
      stockThreshold: 2,
      barcode: '6970123456702',
    }
  })
  const imgRose1 = createLocalProductImage('trottinette_rose_1.svg', '#E91E63', 'Trottinette Rose - Vue Face')
  const imgRose2 = createLocalProductImage('trottinette_rose_2.svg', '#F06292', 'Trottinette Rose - Vue Profil')
  const imgRose3 = createLocalProductImage('trottinette_rose_3.svg', '#F8BBD0', 'Trottinette Rose - Pliée')

  await prisma.productImage.createMany({
    data: [
      { productId: p1.id, variantId: v1Rose.id, url: imgRose1, isMain: true, position: 0 },
      { productId: p1.id, variantId: v1Rose.id, url: imgRose2, isMain: false, position: 1 },
      { productId: p1.id, variantId: v1Rose.id, url: imgRose3, isMain: false, position: 2 },
    ]
  })

  // Variante Bleu (3 images)
  const v1Bleu = await prisma.productVariant.create({
    data: {
      productId: p1.id,
      color: 'Bleu',
      colorHex: '#1E90FF',
      reference: 'TRO-BLEU',
      price: 5200,
      oldPrice: 6000,
      purchasePrice: 3300,
      stock: 7,
      stockThreshold: 2,
      barcode: '6970123456703',
    }
  })
  const imgBleu1 = createLocalProductImage('trottinette_bleu_1.svg', '#1E88E5', 'Trottinette Bleu - Vue Face')
  const imgBleu2 = createLocalProductImage('trottinette_bleu_2.svg', '#42A5F5', 'Trottinette Bleu - Vue Profil')
  const imgBleu3 = createLocalProductImage('trottinette_bleu_3.svg', '#90CAF9', 'Trottinette Bleu - Pliée')

  await prisma.productImage.createMany({
    data: [
      { productId: p1.id, variantId: v1Bleu.id, url: imgBleu1, isMain: true, position: 0 },
      { productId: p1.id, variantId: v1Bleu.id, url: imgBleu2, isMain: false, position: 1 },
      { productId: p1.id, variantId: v1Bleu.id, url: imgBleu3, isMain: false, position: 2 },
    ]
  })

  // ── PRODUIT 2 : Voiture télécommandée ──────────────────────────────────────
  const p2 = await prisma.product.create({
    data: {
      name: 'Voiture télécommandée',
      slug: 'voiture-telecommandee',
      shortDescription: 'Voiture tout-terrain 4x4 radiocommandée haute vitesse.',
      description: 'Véhicule tout-terrain radiocommandé à échelle 1/16, équipé de suspensions indépendantes, pneus en caoutchouc antidérapants et batterie rechargeable USB. Vitesse maximale 20 km/h, portée 50 mètres.',
      categoryId: catVehicules.id,
      brand: 'HotWheels',
      purchasePrice: 2800,
      price: 4500,
      oldPrice: 5200,
      stock: 12,
      stockThreshold: 3,
      reference: 'VOIT-RED-01',
      barcode: '6970123456704',
      ageMin: 6,
      ageMax: 14,
      active: true,
    }
  })
  const imgV2_1 = createLocalProductImage('voiture_rouge_1.svg', '#D32F2F', 'Voiture Télécommandée Rouge')
  const imgV2_2 = createLocalProductImage('voiture_rouge_2.svg', '#E53935', 'Voiture Rouge - Avec Télécommande')
  const imgV2_3 = createLocalProductImage('voiture_rouge_3.svg', '#FF5252', 'Voiture Rouge - Emballage')

  await prisma.productImage.createMany({
    data: [
      { productId: p2.id, url: imgV2_1, isMain: true, position: 0 },
      { productId: p2.id, url: imgV2_2, isMain: false, position: 1 },
      { productId: p2.id, url: imgV2_3, isMain: false, position: 2 },
    ]
  })

  // ── PRODUIT 3 : Poupée enfant ──────────────────────────────────────────────
  const p3 = await prisma.product.create({
    data: {
      name: 'Poupée enfant',
      slug: 'poupee-enfant',
      shortDescription: 'Poupée articulée 30cm avec robe rose et accessoires.',
      description: 'Superbe poupée articulée de 30 cm vêtue d’une magnifique robe de princesse rose et fournie avec un peigne, un miroir et 2 paires de chaussures assorties. Cheveux doux faciles à coiffer.',
      categoryId: catPoupees.id,
      brand: 'Barbie',
      purchasePrice: 2100,
      price: 3500,
      stock: 15,
      stockThreshold: 4,
      reference: 'POUP-ROSE-01',
      barcode: '6970123456705',
      ageMin: 3,
      ageMax: 10,
      active: true,
    }
  })
  const imgV3_1 = createLocalProductImage('poupee_rose_1.svg', '#EC407A', 'Poupée Princesse Rose')
  const imgV3_2 = createLocalProductImage('poupee_rose_2.svg', '#F48FB1', 'Poupée avec Accessoires')

  await prisma.productImage.createMany({
    data: [
      { productId: p3.id, url: imgV3_1, isMain: true, position: 0 },
      { productId: p3.id, url: imgV3_2, isMain: false, position: 1 },
    ]
  })

  // ── PRODUIT 4 : Maison de poupée ───────────────────────────────────────────
  const p4 = await prisma.product.create({
    data: {
      name: 'Maison de poupée',
      slug: 'maison-de-poupee',
      shortDescription: 'Grande maison de poupée en bois 3 étages meublée.',
      description: 'Magnifique maison de poupée en bois naturel sur 3 niveaux comprenant 5 pièces meublées : salon, cuisine, salle de bain, chambre et balcon. Inclut 15 mini-meubles en bois peint.',
      categoryId: catMaisons.id,
      brand: 'KidKraft',
      purchasePrice: 7500,
      price: 12500,
      oldPrice: 14000,
      stock: 5,
      stockThreshold: 1,
      reference: 'MAIS-BOIS-01',
      barcode: '6970123456706',
      ageMin: 3,
      ageMax: 12,
      active: true,
    }
  })
  const imgV4_1 = createLocalProductImage('maison_poupee_1.svg', '#8D6E63', 'Maison de Poupée en Bois')
  const imgV4_2 = createLocalProductImage('maison_poupee_2.svg', '#A1887F', 'Vue Intérieure Meublée')

  await prisma.productImage.createMany({
    data: [
      { productId: p4.id, url: imgV4_1, isMain: true, position: 0 },
      { productId: p4.id, url: imgV4_2, isMain: false, position: 1 },
    ]
  })

  // ── PRODUIT 5 : Robot éducatif ──────────────────────────────────────────────
  const p5 = await prisma.product.create({
    data: {
      name: 'Robot éducatif',
      slug: 'robot-educatif',
      shortDescription: 'Robot interactif programmable pour l’initiation au codage.',
      description: 'Robot intelligent bleu interactif avec écran d’expression faciales à LED, reconnaissance vocale et télécommande infrarouge. Enseigne les bases de la logique et de la programmation en s’amusant.',
      categoryId: catEducatifs.id,
      brand: 'VTech',
      purchasePrice: 4200,
      price: 6800,
      stock: 8,
      stockThreshold: 2,
      reference: 'ROB-ED-01',
      barcode: '6970123456707',
      ageMin: 5,
      ageMax: 12,
      active: true,
    }
  })
  const imgV5_1 = createLocalProductImage('robot_educatif_1.svg', '#0288D1', 'Robot Éducatif Bleu')
  const imgV5_2 = createLocalProductImage('robot_educatif_2.svg', '#039BE5', 'Robot avec Télécommande')
  const imgV5_3 = createLocalProductImage('robot_educatif_3.svg', '#29B6F6', 'Mode Programmation')

  await prisma.productImage.createMany({
    data: [
      { productId: p5.id, url: imgV5_1, isMain: true, position: 0 },
      { productId: p5.id, url: imgV5_2, isMain: false, position: 1 },
      { productId: p5.id, url: imgV5_3, isMain: false, position: 2 },
    ]
  })

  // ── PRODUIT 6 : Kit de slime ───────────────────────────────────────────────
  const p6 = await prisma.product.create({
    data: {
      name: 'Kit de slime',
      slug: 'kit-de-slime',
      shortDescription: 'Coffret créatif de fabrique de slime magique pailleté.',
      description: 'Kit de création de slime complet contenant 6 pots de colle colorée, activateur sécurisé sans borax, paillettes, confettis et perles parfumées. 100% lavable et non toxique.',
      categoryId: catSlime.id,
      brand: 'Elmer',
      purchasePrice: 1400,
      price: 2400,
      oldPrice: 2900,
      stock: 20,
      stockThreshold: 5,
      reference: 'SLIM-KIT-01',
      barcode: '6970123456708',
      ageMin: 6,
      ageMax: 14,
      active: true,
    }
  })
  const imgV6_1 = createLocalProductImage('kit_slime_1.svg', '#AB47BC', 'Kit de Slime Magique')
  const imgV6_2 = createLocalProductImage('kit_slime_2.svg', '#BA68C8', 'Pot de Slime Pailleté')

  await prisma.productImage.createMany({
    data: [
      { productId: p6.id, url: imgV6_1, isMain: true, position: 0 },
      { productId: p6.id, url: imgV6_2, isMain: false, position: 1 },
    ]
  })

  // ── PRODUIT 7 : Peluche licorne ────────────────────────────────────────────
  const p7 = await prisma.product.create({
    data: {
      name: 'Peluche licorne',
      slug: 'peluche-licorne',
      shortDescription: 'Grande peluche licorne géante extra douce 50cm.',
      description: 'Adorable peluche licorne rose de 50 cm de haut, fabriquée en coton doux ultra-moelleux hypoallergénique. Corne dorée et crinière arc-en-ciel scintillante.',
      categoryId: catPeluches.id,
      brand: 'Ty',
      purchasePrice: 1800,
      price: 3200,
      stock: 14,
      stockThreshold: 3,
      reference: 'PEL-LIC-01',
      barcode: '6970123456709',
      ageMin: 1,
      ageMax: 10,
      active: true,
    }
  })
  const imgV7_1 = createLocalProductImage('peluche_licorne_1.svg', '#F06292', 'Peluche Licorne Rose 50cm')
  const imgV7_2 = createLocalProductImage('peluche_licorne_2.svg', '#F48FB1', 'Détail Corne Dorée')

  await prisma.productImage.createMany({
    data: [
      { productId: p7.id, url: imgV7_1, isMain: true, position: 0 },
      { productId: p7.id, url: imgV7_2, isMain: false, position: 1 },
    ]
  })

  // ── PRODUIT 8 : Jeu de construction ────────────────────────────────────────
  const p8 = await prisma.product.create({
    data: {
      name: 'Jeu de construction',
      slug: 'jeu-de-construction',
      shortDescription: 'Boîte de 500 briques de construction colorées.',
      description: 'Ensemble complet de 500 briques d’interconnexion universelles compatibles avec toutes les grandes marques. Comprend des roues, fenêtres, portes et plaques de base pour des créations infinies.',
      categoryId: catConstruction.id,
      brand: 'LEGO',
      purchasePrice: 3500,
      price: 5800,
      oldPrice: 6500,
      stock: 9,
      stockThreshold: 2,
      reference: 'CONST-BRIQ-500',
      barcode: '6970123456710',
      ageMin: 4,
      ageMax: 99,
      active: true,
    }
  })
  const imgV8_1 = createLocalProductImage('jeu_construction_1.svg', '#FB8C00', 'Jeu de Construction 500 Pièces')
  const imgV8_2 = createLocalProductImage('jeu_construction_2.svg', '#FFA726', 'Exemple de Château Construit')

  await prisma.productImage.createMany({
    data: [
      { productId: p8.id, url: imgV8_1, isMain: true, position: 0 },
      { productId: p8.id, url: imgV8_2, isMain: false, position: 1 },
    ]
  })

  // ── PRODUIT 9 : Puzzle enfant ──────────────────────────────────────────────
  const p9 = await prisma.product.create({
    data: {
      name: 'Puzzle enfant',
      slug: 'puzzle-enfant',
      shortDescription: 'Puzzle 100 pièces thème animaux de la jungle.',
      description: 'Puzzle illustré de 100 grandes pièces en carton épais haute résistance représentant les animaux sauvages de la savane et de la jungle. Taille du puzzle assemblé : 48x34 cm.',
      categoryId: catPuzzles.id,
      brand: 'Ravensburger',
      purchasePrice: 1100,
      price: 1900,
      stock: 18,
      stockThreshold: 5,
      reference: 'PUZZ-JUNGLE-100',
      barcode: '6970123456711',
      ageMin: 5,
      ageMax: 10,
      active: true,
    }
  })
  const imgV9_1 = createLocalProductImage('puzzle_enfant_1.svg', '#43A047', 'Puzzle Jungle 100 Pièces')
  const imgV9_2 = createLocalProductImage('puzzle_enfant_2.svg', '#66BB6A', 'Puzzle Assemblé 48x34cm')

  await prisma.productImage.createMany({
    data: [
      { productId: p9.id, url: imgV9_1, isMain: true, position: 0 },
      { productId: p9.id, url: imgV9_2, isMain: false, position: 1 },
    ]
  })

  // ── PRODUIT 10 : Jeu de société famille ─────────────────────────────────────
  const p10 = await prisma.product.create({
    data: {
      name: 'Jeu de société famille',
      slug: 'jeu-de-societe-famille',
      shortDescription: 'Jeu de plateau stratégique et amusant pour toute la famille.',
      description: 'Jeu d’aventure captivant se jouant de 2 à 6 joueurs. Durée d’une partie : 30 minutes. Contient 1 plateau illustré, 6 pion bois, 110 cartes aventures et 2 dés de jeu.',
      categoryId: catSociete.id,
      brand: 'Hasbro',
      purchasePrice: 2200,
      price: 3900,
      oldPrice: 4500,
      stock: 11,
      stockThreshold: 3,
      reference: 'JEU-SOC-FAM-01',
      barcode: '6970123456712',
      ageMin: 7,
      ageMax: 99,
      active: true,
    }
  })
  const imgV10_1 = createLocalProductImage('jeu_societe_1.svg', '#3F51B5', 'Jeu de Société Famille')
  const imgV10_2 = createLocalProductImage('jeu_societe_2.svg', '#5C6BC0', 'Plateau de Jeu & Cartes')

  await prisma.productImage.createMany({
    data: [
      { productId: p10.id, url: imgV10_1, isMain: true, position: 0 },
      { productId: p10.id, url: imgV10_2, isMain: false, position: 1 },
    ]
  })

  console.log('\n=== RECAPITULATIF DU CATALOGUE CRÉE ===')
  const allProducts = await prisma.product.findMany({
    include: {
      category: true,
      images: true,
      variants: {
        include: { images: true }
      }
    }
  })

  for (const prod of allProducts) {
    const totalImages = prod.images.length + prod.variants.reduce((sum, v) => sum + (v.images ? v.images.length : 0), 0)
    console.log(`- ${prod.name} | Catégorie: ${prod.category.name} | Variantes: ${prod.variants.length > 0 ? prod.variants.map(v => v.color).join(', ') : 'Aucune'} | Photos: ${totalImages} | Stock: ${prod.stock} | Statut: ${prod.active ? 'Actif' : 'Inactif'}`)
  }

  console.log('=== SEED DU CATALOGUE TERMINE AVEC SUCCÈS ===')
}

seedRealCatalog()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
