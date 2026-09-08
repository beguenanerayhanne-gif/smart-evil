// prisma/scripts/create_default_variants.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const products = await prisma.product.findMany({
    include: { images: true, variants: true },
  });

  for (const product of products) {
    if (product.variants.length > 0) continue; // already has variants

    // Create a default variant copying relevant fields
    const variant = await prisma.productVariant.create({
      data: {
        productId: product.id,
        color: "Default",
        reference: product.reference ?? undefined,
        price: product.price ?? undefined,
        oldPrice: product.oldPrice ?? undefined,
        purchasePrice: product.purchasePrice ?? undefined,
        stock: product.stock ?? 0,
        stockThreshold: product.stockThreshold ?? undefined,
        barcode: product.barcode ?? undefined,
        supplierReference: product.supplierReference ?? undefined,
        weight: product.weight ?? undefined,
      },
    });

    // Re‑link existing images to the newly created variant
    const imageUpdates = product.images.map((img) =>
      prisma.productImage.update({
        where: { id: img.id },
        data: { variantId: variant.id },
      })
    );
    await Promise.all(imageUpdates);

    console.log(`✅ Product ${product.id} → default variant ${variant.id}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
