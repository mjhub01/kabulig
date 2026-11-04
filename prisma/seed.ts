import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Create product categories
  const vegetables = await prisma.productCategory.create({
    data: {
      name: 'Vegetables',
      description: 'Fresh vegetables from local farms',
    },
  })

  const fruits = await prisma.productCategory.create({
    data: {
      name: 'Fruits',
      description: 'Fresh fruits from local farms',
    },
  })

  const grains = await prisma.productCategory.create({
    data: {
      name: 'Grains',
      description: 'Rice, corn, and other grains',
    },
  })

  const livestock = await prisma.productCategory.create({
    data: {
      name: 'Livestock',
      description: 'Poultry, pork, beef, and other livestock products',
    },
  })

  const processed = await prisma.productCategory.create({
    data: {
      name: 'Processed Foods',
      description: 'Value-added processed agricultural products',
    },
  })

  // Create superadmin user
  const hashedPassword = await bcrypt.hash('admin123', 10)
  const superadmin = await prisma.user.create({
    data: {
      email: 'admin@kabulig.net',
      password: hashedPassword,
      name: 'Super Admin',
      role: 'SUPERADMIN',
    },
  })

  // Create sample early warnings
  await prisma.earlyWarning.create({
    data: {
      warningType: 'WEATHER',
      severity: 'HIGH',
      title: 'Typhoon Warning',
      description: 'Typhoon approaching, expect heavy rainfall and strong winds. Secure crops and livestock.',
      affectedRegions: ['Bicol', 'Eastern Visayas'],
      sourceApi: 'PAGASA',
      issuedAt: new Date(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    },
  })

  await prisma.earlyWarning.create({
    data: {
      warningType: 'PEST',
      severity: 'MEDIUM',
      title: 'Rice Black Bug Alert',
      description: 'Reports of rice black bug infestation in certain areas. Monitor crops regularly.',
      affectedRegions: ['Central Luzon'],
      sourceApi: 'DA',
      issuedAt: new Date(),
      expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
    },
  })

  console.log('Seed data created successfully!')
  console.log('Superadmin credentials: admin@kabulig.net / admin123')
  console.log('Please change the password after first login.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
