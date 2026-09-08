import { prisma } from '../src/lib/prisma.js';
import { hashPassword } from '../src/lib/auth.js';

async function main() {
  const adminUsername = 'admin';
  const adminPassword = 'Admin@2024!';

  try {
    const existingAdmin = await prisma.admin.findUnique({
      where: { username: adminUsername },
    });

    if (existingAdmin) {
      console.log("✓ L'administrateur par défaut existe déjà.");
      return;
    }

    const hashedPassword = await hashPassword(adminPassword);

    await prisma.admin.create({
      data: {
        username: adminUsername,
        password_hash: hashedPassword,
      },
    });

    console.log('✅ Compte administrateur créé avec succès !');
    console.log(`   Username: ${adminUsername}`);
    console.log('   ⚠️  Changez le mot de passe par défaut depuis le panneau admin.');

  } catch (error) {
    console.error("❌ Erreur lors de la création de l'administrateur:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
