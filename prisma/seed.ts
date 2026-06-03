import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create admin user
  const adminPassword = await bcrypt.hash('Admin@123', 12)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@aasa.dev' },
    update: {},
    create: {
      email: 'admin@aasa.dev',
      password: adminPassword,
      name: 'Admin User',
      role: 'ADMIN',
    },
  })
  console.log(`✅ Admin user: ${admin.email}`)

  // Create seller user
  const sellerPassword = await bcrypt.hash('Seller@123', 12)
  const seller = await prisma.user.upsert({
    where: { email: 'seller@aasa.dev' },
    update: {},
    create: {
      email: 'seller@aasa.dev',
      password: sellerPassword,
      name: 'Seller User',
      role: 'SELLER',
    },
  })
  console.log(`✅ Seller user: ${seller.email}`)

  // Create sample products
  const products = [
    {
      name: 'Basmati Rice',
      sku: 'RICE-BASMATI-001',
      description: 'Premium long-grain basmati rice',
      category: 'Grains',
      baseUnit: 'GRAM' as const,
      basePrice: 8.5,     // 8.5 paise per gram = ₹85 per kg
      stockQty: 50000,    // 50 kg in grams
    },
    {
      name: 'Sunflower Oil',
      sku: 'OIL-SUN-001',
      description: 'Refined sunflower cooking oil',
      category: 'Oils',
      baseUnit: 'MILLILITER' as const,
      basePrice: 0.14,    // 0.14 paise per mL = ₹140 per L
      stockQty: 100000,   // 100 litres in mL
    },
    {
      name: 'Wheat Flour',
      sku: 'FLOUR-WHEAT-001',
      description: 'Whole wheat atta',
      category: 'Grains',
      baseUnit: 'GRAM' as const,
      basePrice: 4.5,     // ₹45 per kg
      stockQty: 100000,   // 100 kg
    },
    {
      name: 'Turmeric Powder',
      sku: 'SPICE-TUR-001',
      description: 'Pure organic turmeric powder',
      category: 'Spices',
      baseUnit: 'GRAM' as const,
      basePrice: 25,      // ₹250 per kg
      stockQty: 5000,     // 5 kg
    },
    {
      name: 'Mineral Water Bottle',
      sku: 'WATER-MIN-001',
      description: '500mL mineral water bottle',
      category: 'Beverages',
      baseUnit: 'UNIT' as const,
      basePrice: 2000,    // ₹20 per unit
      stockQty: 500,
    },
    {
      name: 'Mustard Oil',
      sku: 'OIL-MUS-001',
      description: 'Cold-pressed mustard oil',
      category: 'Oils',
      baseUnit: 'MILLILITER' as const,
      basePrice: 0.18,    // ₹180 per L
      stockQty: 50000,
    },
    {
      name: 'Green Cardamom',
      sku: 'SPICE-CARD-001',
      description: 'Premium green cardamom pods',
      category: 'Spices',
      baseUnit: 'GRAM' as const,
      basePrice: 350,     // ₹3500 per kg
      stockQty: 2000,
    },
    {
      name: 'Stainless Steel Glass',
      sku: 'UTENSIL-SSG-001',
      description: '200ml stainless steel drinking glass',
      category: 'Utensils',
      baseUnit: 'UNIT' as const,
      basePrice: 8500,    // ₹85 per piece
      stockQty: 200,
    },
  ]

  for (const product of products) {
    const p = await prisma.product.upsert({
      where: { sku: product.sku },
      update: {},
      create: product,
    })
    console.log(`✅ Product: ${p.name}`)
  }

  console.log('\n🎉 Seed complete!')
  console.log('Test credentials:')
  console.log('  Admin: admin@aasa.dev / Admin@123')
  console.log('  Seller: seller@aasa.dev / Seller@123')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
