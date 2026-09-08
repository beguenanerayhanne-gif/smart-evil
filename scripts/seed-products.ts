/**
 * Seed script — 10 produits réels pour la boutique Smart Éveil
 *
 * Usage:
 *   npx ts-node --project tsconfig.json -e "require('ts-node').register(); require('./scripts/seed-products.ts')"
 * ou:
 *   npx tsx scripts/seed-products.ts
 */

import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'

const prisma = new PrismaClient()

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/** Lit un fichier image local (dans /public/uploads/toys/) et le copie dans /public/uploads/ avec un nom unique.
 *  Retourne l'URL relative /uploads/xxx.ext */
async function copyLocalImage(filename: string): Promise<string> {
  const srcDir = path.join(process.cwd(), 'public', 'uploads', 'toys')
  const destDir = path.join(process.cwd(), 'public', 'uploads')

  const src = path.join(srcDir, filename)
  const ext = path.extname(filename)
  const uniqueName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`
  const dest = path.join(destDir, uniqueName)

  if (!fs.existsSync(src)) {
    console.warn(`⚠️  Image non trouvée: ${src}`)
    return ''
  }

  fs.copyFileSync(src, dest)
  return `/uploads/${uniqueName}`
}

// ---------------------------------------------------------------------------
// Catalogue des 10 produits
// ---------------------------------------------------------------------------

interface VariantDef {
  color: string
  colorHex: string
  reference: string
  price: number
  oldPrice?: number
  stock: number
  images: string[] // noms de fichiers dans /public/uploads/toys/
}

interface ProductDef {
  name: string
  slug?: string
  description: string
  shortDescription: string
  brand: string
  ageMin: number
  ageMax: number
  tags: string
  categorySlug: string
  price: number       // prix de base (utilisé si pas de variantes)
  oldPrice?: number
  stock?: number
  variants?: VariantDef[]
  images?: string[]   // si pas de variantes
}

// Images disponibles dans public/uploads/toys/
// trottinette-rose.png, voiture-rc-rouge.png, poupee-rose.png, maison-poupees.png, peluche-ourson.png

const PRODUCTS: ProductDef[] = [
  // ──────────────────────────────────────────────────────────────────────────
  // 1. Trottinette enfant — 3 variantes
  // ──────────────────────────────────────────────────────────────────────────
  {
    name: 'Trottinette Enfant Pliable',
    description:
      'La trottinette idéale pour les petits aventuriers de 3 à 8 ans ! Dotée d\'un guidon réglable en hauteur, de grandes roues anti-crevaison en polyuréthane et d\'un frein arrière intuitif au pied, elle offre sécurité et confort à chaque sortie. Le système de pliage rapide permet de la ranger ou de la transporter facilement. Sa conception robuste en aluminium léger supporte jusqu\'à 50 kg.\n\n✔ Guidon réglable 3 positions\n✔ Roues 200 mm ultra-lisses\n✔ Frein arrière sécurisé\n✔ Poids : 2,8 kg\n✔ Charge max : 50 kg',
    shortDescription: 'Trottinette pliable légère avec guidon réglable, idéale de 3 à 8 ans.',
    brand: 'SmartRide',
    ageMin: 3,
    ageMax: 8,
    tags: 'trottinette,outdoor,sport,enfant',
    categorySlug: 'draisiennes-velos-trottinettes',
    price: 4500,
    variants: [
      {
        color: 'Rose',
        colorHex: '#FF6B9D',
        reference: 'TRO-ROSE-001',
        price: 4500,
        oldPrice: 5500,
        stock: 10,
        images: ['trottinette-rose.png', 'trottinette-rose.png'],
      },
      {
        color: 'Bleu',
        colorHex: '#4A90D9',
        reference: 'TRO-BLEU-001',
        price: 4500,
        oldPrice: 5500,
        stock: 7,
        images: ['trottinette-rose.png'],
      },
      {
        color: 'Noir',
        colorHex: '#2D2D2D',
        reference: 'TRO-NOIR-001',
        price: 4800,
        stock: 5,
        images: ['trottinette-rose.png'],
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 2. Voiture télécommandée — 2 variantes
  // ──────────────────────────────────────────────────────────────────────────
  {
    name: 'Voiture Télécommandée Racing Pro',
    description:
      'Préparez-vous pour des courses effrénées ! Cette voiture télécommandée haute performance peut atteindre jusqu\'à 20 km/h sur surfaces lisses. Équipée d\'une batterie rechargeable Li-ion et d\'une télécommande 2,4 GHz, elle garantit une portée jusqu\'à 30 mètres sans interférence. La suspension indépendante 4 roues lui permet de rouler sur toutes les surfaces.\n\n✔ Vitesse max : 20 km/h\n✔ Portée : 30 mètres\n✔ Batterie : Li-ion 600 mAh (charge via USB)\n✔ Autonomie : ~20 minutes\n✔ Échelle : 1/20',
    shortDescription: 'Voiture RC rapide 20 km/h, batterie Li-ion rechargeable, portée 30 m.',
    brand: 'TurboKids',
    ageMin: 6,
    ageMax: 14,
    tags: 'voiture,telecommandee,rc,garcon,vitesse',
    categorySlug: 'robots-radiocommandes',
    price: 3200,
    variants: [
      {
        color: 'Rouge',
        colorHex: '#E53E3E',
        reference: 'VRC-ROUGE-001',
        price: 3200,
        oldPrice: 4000,
        stock: 15,
        images: ['voiture-rc-rouge.png', 'voiture-rc-rouge.png'],
      },
      {
        color: 'Bleu',
        colorHex: '#3182CE',
        reference: 'VRC-BLEU-001',
        price: 3200,
        oldPrice: 4000,
        stock: 8,
        images: ['voiture-rc-rouge.png'],
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 3. Poupée enfant — 1 variante
  // ──────────────────────────────────────────────────────────────────────────
  {
    name: 'Poupée Chérie avec Accessoires',
    description:
      'Rencontrez Chérie, la poupée que votre petite fille adorera ! Avec ses grands yeux lumineux, ses cheveux doux coiffables et sa robe de princesse brodée, Chérie est la compagne idéale pour les jeux d\'imagination. Le coffret include une brosse, un serre-tête, une paire de chaussures et un sac à main miniature.\n\n✔ Hauteur : 40 cm\n✔ Cheveux coiffables en fibres douces\n✔ Yeux qui s\'ouvrent et se ferment\n✔ Corps souple articulé\n✔ Coffret includes 5 accessoires',
    shortDescription: 'Poupée 40 cm avec cheveux coiffables, yeux mobiles et 5 accessoires.',
    brand: 'DreamDolls',
    ageMin: 3,
    ageMax: 10,
    tags: 'poupee,fille,princesse,jeu-imagination',
    categorySlug: 'poupees-accessoires',
    price: 2800,
    oldPrice: 3500,
    variants: [
      {
        color: 'Rose',
        colorHex: '#FF6B9D',
        reference: 'POU-ROSE-001',
        price: 2800,
        oldPrice: 3500,
        stock: 20,
        images: ['poupee-rose.png', 'poupee-rose.png'],
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 4. Maison de poupées
  // ──────────────────────────────────────────────────────────────────────────
  {
    name: 'Maison de Poupées Deluxe 3 Étages',
    description:
      'Cette splendide maison de poupées en bois et MDF dispose de 3 étages, 6 pièces aménagées et une terrasse. Entièrement meublée avec 28 meubles miniatures (canapé, lits, cuisine, salle de bain, tables et chaises), elle est prête à l\'emploi dès l\'ouverture de la boîte. Les murs imprimés et les planchers de couleur offrent un rendu réaliste et coloré.\n\n✔ Dimensions : 58 cm × 30 cm × 74 cm\n✔ 6 pièces + terrasse\n✔ 28 meubles inclus\n✔ Bois MDF résistant\n✔ Porte et fenêtres fonctionnelles',
    shortDescription: 'Grande maison de poupées 3 étages entièrement meublée, 28 accessoires.',
    brand: 'WoodWorld',
    ageMin: 4,
    ageMax: 12,
    tags: 'maison-poupees,fille,bois,jeu-imitation',
    categorySlug: 'maisons-de-poupees',
    price: 8500,
    oldPrice: 10000,
    images: ['maison-poupees.png'],
    stock: 6,
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 5. Jeu de construction
  // ──────────────────────────────────────────────────────────────────────────
  {
    name: 'Mega Blocs Construction 120 Pièces',
    description:
      'Stimulez la créativité et la motricité fine de votre enfant avec ce coffret de 120 blocs colorés compatibles avec les grandes marques. Construisez des maisons, des ponts, des voitures et bien plus encore ! Les briques de grande taille sont parfaites pour les petites mains (3 ans+) et ne présentent aucun risque d\'ingestion. Le coffret de rangement robuste facilite le rangement.\n\n✔ 120 blocs multicolores\n✔ Compatible grandes marques\n✔ Grande taille anti-ingestion\n✔ Coffret de rangement inclus\n✔ Plastique ABS non toxique',
    shortDescription: '120 blocs de construction colorés, compatibles grandes marques, coffret inclus.',
    brand: 'BuildKids',
    ageMin: 3,
    ageMax: 10,
    tags: 'construction,blocs,creatif,garcon,fille',
    categorySlug: 'briques-blocs-construction',
    price: 3500,
    oldPrice: 4200,
    images: [],  // utilisera une image placeholder car quota épuisé
    stock: 25,
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 6. Peluche ourson
  // ──────────────────────────────────────────────────────────────────────────
  {
    name: 'Peluche Ourson Doudou Géant',
    description:
      'Le doudou ourson préféré de tous les bébés ! Réalisé en peluche ultra-douce et hypoallergénique, ce grand ours brun de 50 cm est le compagnon idéal pour le sommeil et les câlins. Rembourrage en fibres recyclées douces et certifiées OEKO-TEX. Lavable en machine à 30°C pour une hygiène optimale.\n\n✔ Hauteur : 50 cm\n✔ Matière : Peluche 100% polyester certifiée OEKO-TEX\n✔ Hypoallergénique\n✔ Lavable en machine 30°C\n✔ Yeux en plastique sécurisés (soudés, non démontables)',
    shortDescription: 'Grand ourson doudou 50 cm hypoallergénique, lavable en machine.',
    brand: 'BabyDream',
    ageMin: 0,
    ageMax: 5,
    tags: 'peluche,doudou,bebe,ourson,naissance',
    categorySlug: 'doudous-peluches',
    price: 2200,
    variants: [
      {
        color: 'Brun',
        colorHex: '#8B5E3C',
        reference: 'PEL-BRUN-001',
        price: 2200,
        stock: 30,
        images: ['peluche-ourson.png', 'peluche-ourson.png'],
      },
      {
        color: 'Beige',
        colorHex: '#D4B896',
        reference: 'PEL-BEIGE-001',
        price: 2200,
        stock: 18,
        images: ['peluche-ourson.png'],
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 7. Puzzle éducatif animaux
  // ──────────────────────────────────────────────────────────────────────────
  {
    name: 'Puzzle Éducatif Animaux de la Ferme',
    description:
      'Ce superbe puzzle en bois massif de 9 pièces encastrables présente les animaux de la ferme que les enfants adorent : vache, cochon, mouton, cheval, poule et plus encore. Chaque pièce en bois épais (6 mm) est peinte avec des couleurs vives et non toxiques. Un excellent outil pédagogique pour apprendre les animaux et développer la coordination main-œil.\n\n✔ 9 pièces d\'encastrement\n✔ Bois massif éco-certifié FSC\n✔ Peinture non toxique et résistante\n✔ Dimensions plateau : 30 × 22 cm\n✔ Recommandé dès 18 mois',
    shortDescription: 'Puzzle bois 9 pièces animaux de la ferme, certifié FSC, dès 18 mois.',
    brand: 'EcoLearn',
    ageMin: 1,
    ageMax: 5,
    tags: 'puzzle,bois,animaux,educatif,bebe',
    categorySlug: 'puzzles-1-3-ans',
    price: 1800,
    oldPrice: 2200,
    images: [],
    stock: 40,
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 8. Cuisine jouet
  // ──────────────────────────────────────────────────────────────────────────
  {
    name: 'Cuisine Jouet Complète Chef Junior',
    description:
      'Devenez un vrai chef cuisinier avec cette cuisine jouet réaliste ! Equipée de 4 feux avec effets lumineux et sonores, d\'un four ouvrant, d\'un réfrigérateur et d\'un évier avec robinet qui s\'oriente. Le set inclut 22 accessoires de cuisine miniatures (casseroles, poêles, ustensiles, légumes et fruits en plastique rigide).\n\n✔ Dimensions : 80 cm × 30 cm × 95 cm\n✔ Sons et lumières réalistes\n✔ 22 accessoires inclus\n✔ Légumes et fruits jouet inclus\n✔ Matière ABS robuste et sans BPA',
    shortDescription: 'Grande cuisine jouet avec sons, lumières et 22 accessoires, dès 3 ans.',
    brand: 'ChefKids',
    ageMin: 3,
    ageMax: 8,
    tags: 'cuisine,fille,garcon,imitation,chef',
    categorySlug: 'dinette-cuisine',
    price: 7200,
    oldPrice: 8500,
    variants: [
      {
        color: 'Rose',
        colorHex: '#FF6B9D',
        reference: 'CUI-ROSE-001',
        price: 7200,
        oldPrice: 8500,
        stock: 5,
        images: [],
      },
      {
        color: 'Blanc',
        colorHex: '#F5F5F5',
        reference: 'CUI-BLANC-001',
        price: 7500,
        oldPrice: 9000,
        stock: 4,
        images: [],
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 9. Circuit de voitures
  // ──────────────────────────────────────────────────────────────────────────
  {
    name: 'Circuit Voitures Looping Turbo 450 cm',
    description:
      'Adrenaline garantie avec ce circuit de voitures de 450 cm de longueur totale ! Comprend un looping spectaculaire, un saut de rampe, 3 tunnels et une zone de ravitaillement. Les 2 voitures à ressort incluses peuvent atteindre des vitesses impressionnantes sans batterie. Montage intuitif en 10 minutes sans outils.\n\n✔ Longueur totale : 450 cm\n✔ 2 voitures propulsion à ressort incluses\n✔ Looping + rampe de saut + 3 tunnels\n✔ Montage sans outils\n✔ Compatible avec voitures Hot Wheels® et Matchbox®',
    shortDescription: 'Circuit 450 cm avec looping, 2 voitures, compatible Hot Wheels et Matchbox.',
    brand: 'TurboKids',
    ageMin: 4,
    ageMax: 12,
    tags: 'circuit,voitures,looping,garcon,course',
    categorySlug: 'voitures-circuits',
    price: 5500,
    oldPrice: 6800,
    images: [],
    stock: 8,
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 10. Robot éducatif
  // ──────────────────────────────────────────────────────────────────────────
  {
    name: 'Robot Codeur Smart Explorer',
    description:
      'Initiez votre enfant à la programmation de façon amusante avec Smart Explorer ! Ce robot interactif s\'apprend à coder via une séquence de touches colorées sur son dos — aucune application ni tablette requise. Il parle, chante, danse et restitue les commandes programmées. Parfait pour développer la logique et la pensée computationnelle dès 4 ans.\n\n✔ Codage par séquence de touches (sans écran)\n✔ 3 modes : Démo, Apprendre, Libre\n✔ Effets LED multicolores\n✔ Moteur ultra-silencieux\n✔ Fonctionne avec 3 piles AA (incluses)',
    shortDescription: 'Robot codeur interactif sans tablette, LED, sons et danses, dès 4 ans.',
    brand: 'SmartLearn',
    ageMin: 4,
    ageMax: 10,
    tags: 'robot,educatif,codage,STEM,technologie',
    categorySlug: 'robots-educatifs',
    price: 5800,
    oldPrice: 7000,
    variants: [
      {
        color: 'Bleu',
        colorHex: '#4A90D9',
        reference: 'ROB-BLEU-001',
        price: 5800,
        oldPrice: 7000,
        stock: 12,
        images: [],
      },
      {
        color: 'Orange',
        colorHex: '#F97316',
        reference: 'ROB-ORANGE-001',
        price: 5800,
        oldPrice: 7000,
        stock: 9,
        images: [],
      },
    ],
  },
]

// ---------------------------------------------------------------------------
// Seed function
// ---------------------------------------------------------------------------

async function seed() {
  console.log('🌱 Démarrage du seed — 10 produits de jouets réels\n')

  for (const [idx, productDef] of PRODUCTS.entries()) {
    console.log(`\n[${idx + 1}/10] → ${productDef.name}`)

    // Trouver la catégorie
    const category = await prisma.category.findUnique({
      where: { slug: productDef.categorySlug },
    })

    if (!category) {
      console.error(`  ❌ Catégorie "${productDef.categorySlug}" introuvable — produit ignoré.`)
      continue
    }

    const slug = productDef.slug || slugify(productDef.name)

    // Vérifier si produit existe déjà
    const existing = await prisma.product.findUnique({ where: { slug } })
    if (existing) {
      console.log(`  ⏭️  Produit "${productDef.name}" déjà existant (slug: ${slug}) — ignoré.`)
      continue
    }

    // Créer le produit
    const product = await prisma.product.create({
      data: {
        name: productDef.name,
        slug,
        description: productDef.description,
        shortDescription: productDef.shortDescription,
        brand: productDef.brand,
        ageMin: productDef.ageMin,
        ageMax: productDef.ageMax,
        tags: productDef.tags,
        categoryId: category.id,
        price: productDef.price,
        oldPrice: productDef.oldPrice ?? null,
        stock: productDef.stock ?? null,
        active: true,
      },
    })

    console.log(`  ✅ Produit créé: ${product.id}`)

    // ── Cas 1 : produit AVEC variantes ──
    if (productDef.variants && productDef.variants.length > 0) {
      let isFirstVariant = true
      for (const varDef of productDef.variants) {
        const variant = await prisma.productVariant.create({
          data: {
            productId: product.id,
            color: varDef.color,
            colorHex: varDef.colorHex,
            reference: varDef.reference,
            price: varDef.price,
            oldPrice: varDef.oldPrice ?? null,
            stock: varDef.stock,
          },
        })

        console.log(`     ↳ Variante "${varDef.color}" créée: ${variant.id}`)

        // Upload des images de la variante
        let imgPos = 0
        let firstImg = true
        for (const imgFile of varDef.images) {
          if (!imgFile) continue
          const url = await copyLocalImage(imgFile)
          if (!url) continue

          await prisma.productImage.create({
            data: {
              productId: product.id,
              variantId: variant.id,
              url,
              isMain: firstImg,
              position: imgPos++,
            },
          })
          firstImg = false
          console.log(`        📸 Image ajoutée: ${url}`)
        }
        isFirstVariant = false
      }
    }
    // ── Cas 2 : produit SANS variantes — images directes ──
    else if (productDef.images && productDef.images.length > 0) {
      let imgPos = 0
      let isFirst = true
      for (const imgFile of productDef.images) {
        if (!imgFile) continue
        const url = await copyLocalImage(imgFile)
        if (!url) continue

        await prisma.productImage.create({
          data: {
            productId: product.id,
            variantId: null,
            url,
            isMain: isFirst,
            position: imgPos++,
          },
        })
        isFirst = false
        console.log(`     📸 Image ajoutée: ${url}`)
      }
    }
  }

  console.log('\n\n🎉 Seed terminé avec succès !')
  console.log('   → Ouvrez http://localhost:3000/admin/produits pour voir les produits créés.')
  console.log('   → Ouvrez http://localhost:3000/produits pour voir la vitrine client.\n')
}

// ---------------------------------------------------------------------------
// Run
// ---------------------------------------------------------------------------

seed()
  .catch((e) => {
    console.error('\n❌ Erreur lors du seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
