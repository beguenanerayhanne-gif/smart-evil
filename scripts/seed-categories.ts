import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface SubCategorySeed {
  name: string;
  slug: string;
  icon?: string;
}

interface CategorySeed {
  name: string;
  slug: string;
  icon: string;
  order: number;
  children: SubCategorySeed[];
}

const CATEGORIES_DATA: CategorySeed[] = [
  {
    name: 'Bébé & Premier Âge',
    slug: 'bebe-premier-age',
    icon: 'baby',
    order: 1,
    children: [
      { name: 'Éveil & Découverte', slug: 'eveil-decouverte', icon: 'baby' },
      { name: 'Doudous & Peluches', slug: 'doudous-peluches', icon: 'baby' },
      { name: 'Jouets à tirer & pousser', slug: 'jouets-tirer-pousser', icon: 'baby' },
      { name: 'Porteurs & Chariots', slug: 'porteurs-chariots', icon: 'baby' },
      { name: 'Tapis d\'éveil & Hochets', slug: 'tapis-eveil-hochets', icon: 'baby' },
      { name: 'Jouets de bain', slug: 'jouets-de-bain', icon: 'baby' },
    ],
  },
  {
    name: 'Fille',
    slug: 'fille',
    icon: 'girl',
    order: 2,
    children: [
      { name: 'Poupées & Accessoires', slug: 'poupees-accessoires', icon: 'girl' },
      { name: 'Maisons de poupées', slug: 'maisons-de-poupees', icon: 'girl' },
      { name: 'Dînette & Cuisine', slug: 'dinette-cuisine', icon: 'girl' },
      { name: 'Bijoux & Cosmétique enfant', slug: 'bijoux-cosmetique-enfant', icon: 'girl' },
      { name: 'Jeux d\'imitation fille', slug: 'jeux-imitation-fille', icon: 'girl' },
    ],
  },
  {
    name: 'Garçon',
    slug: 'garcon',
    icon: 'boy',
    order: 3,
    children: [
      { name: 'Voitures & Circuits', slug: 'voitures-circuits', icon: 'boy' },
      { name: 'Figurines & Super-héros', slug: 'figurines-super-heros', icon: 'boy' },
      { name: 'Bricolage & Outils', slug: 'bricolage-outils', icon: 'boy' },
      { name: 'Robots & Radiocommandés', slug: 'robots-radiocommandes', icon: 'boy' },
      { name: 'Univers d\'action & Aventure', slug: 'univers-action-aventure', icon: 'boy' },
    ],
  },
  {
    name: 'Jeux de Construction',
    slug: 'jeux-de-construction',
    icon: 'blocks',
    order: 4,
    children: [
      { name: 'Briques & Blocs de construction', slug: 'briques-blocs-construction', icon: 'blocks' },
      { name: 'Jeux en bois à assembler', slug: 'jeux-bois-assembler', icon: 'blocks' },
      { name: 'Circuits à billes', slug: 'circuits-a-billes', icon: 'blocks' },
      { name: 'Maquettes & Bricolage technique', slug: 'maquettes-bricolage-technique', icon: 'blocks' },
    ],
  },
  {
    name: 'Jeux de Société',
    slug: 'jeux-de-societe',
    icon: 'dice',
    order: 5,
    children: [
      { name: 'Premiers jeux (2-5 ans)', slug: 'premiers-jeux-2-5-ans', icon: 'dice' },
      { name: 'Jeux en famille', slug: 'jeux-en-famille', icon: 'dice' },
      { name: 'Jeux de stratégie & réflexion', slug: 'jeux-de-strategie', icon: 'dice' },
      { name: 'Jeux de cartes & ambiance', slug: 'jeux-de-cartes-ambiance', icon: 'dice' },
    ],
  },
  {
    name: 'Puzzles',
    slug: 'puzzles',
    icon: 'puzzle',
    order: 6,
    children: [
      { name: 'Puzzles encastrement (1-3 ans)', slug: 'puzzles-1-3-ans', icon: 'puzzle' },
      { name: 'Puzzles enfants (24-100 pièces)', slug: 'puzzles-enfants', icon: 'puzzle' },
      { name: 'Puzzles ados & adultes (500+ pcs)', slug: 'puzzles-ados-adultes', icon: 'puzzle' },
      { name: 'Puzzles 3D & Relief', slug: 'puzzles-3d-relief', icon: 'puzzle' },
    ],
  },
  {
    name: 'Activités Créatives',
    slug: 'activites-creatives',
    icon: 'palette',
    order: 7,
    children: [
      { name: 'Dessin, Peinture & Coloriage', slug: 'dessin-peinture-coloriage', icon: 'palette' },
      { name: 'Pâte à modeler & Sculptures', slug: 'pate-a-modeler-sculptures', icon: 'palette' },
      { name: 'Perles, Bijoux & Couture', slug: 'perles-bijoux-couture', icon: 'palette' },
      { name: 'Origamis & Kits créatifs', slug: 'origamis-kits-creatifs', icon: 'palette' },
    ],
  },
  {
    name: 'Jouets en Bois',
    slug: 'jouets-en-bois',
    icon: 'wood',
    order: 8,
    children: [
      { name: 'Éveil & Découverte en bois', slug: 'eveil-bois', icon: 'wood' },
      { name: 'Instruments de musique en bois', slug: 'instruments-musique-bois', icon: 'wood' },
      { name: 'Véhicules & Trains en bois', slug: 'vehicules-trains-bois', icon: 'wood' },
      { name: 'Jeux d\'adresse en bois', slug: 'jeux-adresse-bois', icon: 'wood' },
    ],
  },
  {
    name: 'Outdoor & Jardin',
    slug: 'outdoor-jardin',
    icon: 'bike',
    order: 9,
    children: [
      { name: 'Draisiennes, Vélos & Trottinettes', slug: 'draisiennes-velos-trottinettes', icon: 'bike' },
      { name: 'Jeux de plage & d\'eau', slug: 'jeux-plage-eau', icon: 'bike' },
      { name: 'Trampolines & Toboggans', slug: 'trampolines-toboggans', icon: 'bike' },
      { name: 'Sport & Ballons', slug: 'sport-ballons', icon: 'bike' },
    ],
  },
  {
    name: 'Impression 3D',
    slug: 'impression-3d',
    icon: 'printer',
    order: 10,
    children: [
      { name: 'Jouets articulés 3D', slug: 'jouets-articules-3d', icon: 'printer' },
      { name: 'Figurines personnalisées 3D', slug: 'figurines-personnalisees-3d', icon: 'printer' },
      { name: 'Accessoires & Gadgets 3D', slug: 'accessoires-gadgets-3d', icon: 'printer' },
      { name: 'Décor & Modélisme 3D', slug: 'decor-modelisme-3d', icon: 'printer' },
    ],
  },
  {
    name: 'Multimédia & High-Tech',
    slug: 'multimedia-high-tech',
    icon: 'gamepad',
    order: 11,
    children: [
      { name: 'Consoles & Jeux vidéo', slug: 'consoles-jeux-video', icon: 'gamepad' },
      { name: 'Montres & Tablettes enfants', slug: 'montres-tablettes-enfants', icon: 'gamepad' },
      { name: 'Robots éducatifs', slug: 'robots-educatifs', icon: 'gamepad' },
      { name: 'Casques & Audio enfant', slug: 'casques-audio-enfant', icon: 'gamepad' },
    ],
  },
  {
    name: 'Promotions & Déstockage',
    slug: 'promotions-destockage',
    icon: 'tag',
    order: 12,
    children: [
      { name: 'Bons plans & Réductions', slug: 'bons-plans-reductions', icon: 'tag' },
      { name: 'Fin de série', slug: 'fin-de-serie', icon: 'tag' },
      { name: 'Ventes Flash', slug: 'ventes-flash', icon: 'tag' },
    ],
  },
  {
    name: 'Nouveautés',
    slug: 'nouveautes',
    icon: 'sparkles',
    order: 13,
    children: [
      { name: 'Dernières arrivées', slug: 'dernieres-arrivees', icon: 'sparkles' },
      { name: 'Tendances du moment', slug: 'tendances-du-moment', icon: 'sparkles' },
    ],
  },
];

async function seed() {
  console.log('🌱 Starting Categories Seed with vector SVG icon keys...');

  for (const parentData of CATEGORIES_DATA) {
    const parent = await prisma.category.upsert({
      where: { slug: parentData.slug },
      update: {
        name: parentData.name,
        icon: parentData.icon,
        order: parentData.order,
        active: true,
      },
      create: {
        name: parentData.name,
        slug: parentData.slug,
        icon: parentData.icon,
        order: parentData.order,
        active: true,
      },
    });

    console.log(`✅ Main category: ${parent.name} (${parent.slug}) -> icon: ${parent.icon}`);

    let subOrder = 1;
    for (const childData of parentData.children) {
      await prisma.category.upsert({
        where: { slug: childData.slug },
        update: {
          name: childData.name,
          icon: childData.icon || 'tag',
          order: subOrder++,
          parentId: parent.id,
          active: true,
        },
        create: {
          name: childData.name,
          slug: childData.slug,
          icon: childData.icon || 'tag',
          order: subOrder++,
          parentId: parent.id,
          active: true,
        },
      });
    }
  }

  console.log('🎉 Category seed with vector icon keys completed!');
}

seed()
  .catch((e) => {
    console.error('❌ Error during category seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
