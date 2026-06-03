import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import prisma from '@/lib/prisma'

export async function GET() {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const products = await prisma.product.findMany({
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(products)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const { name, sku, description, category, baseUnit, basePrice, stockQty } = body

  if (!name || !baseUnit || basePrice == null || stockQty == null) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const product = await prisma.product.create({
    data: { name, sku, description, category, baseUnit, basePrice, stockQty },
  })
  return NextResponse.json(product, { status: 201 })
}
