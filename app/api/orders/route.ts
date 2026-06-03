import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import prisma from '@/lib/prisma'
import { toBase, pricePerUnit, DisplayUnit } from '@/lib/units'

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const orders = await prisma.order.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
    include: {
      items: { include: { product: { select: { name: true, baseUnit: true } } } },
    },
  })
  return NextResponse.json(orders)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { notes, items } = await req.json()

  if (!items || items.length === 0) {
    return NextResponse.json({ error: 'Order must have at least one item' }, { status: 400 })
  }

  // Fetch products for all items
  const productIds = items.map((i: { productId: string }) => i.productId)
  const products = await prisma.product.findMany({
    where: { id: { in: productIds }, isActive: true },
  })

  const productMap = new Map(products.map((p) => [p.id, p]))

  let totalPaise = 0
  const orderItems = []

  for (const item of items) {
    const product = productMap.get(item.productId)
    if (!product) {
      return NextResponse.json({ error: `Product ${item.productId} not found or inactive` }, { status: 400 })
    }

    const orderedQty = parseFloat(item.orderedQty)
    const orderedUnit = item.orderedUnit as DisplayUnit
    const basePricePaise = Number(product.basePrice)

    const baseQty = toBase(orderedQty, orderedUnit)
    const unitPricePaise = pricePerUnit(basePricePaise, orderedUnit)
    const lineTotalPaise = orderedQty * unitPricePaise

    totalPaise += lineTotalPaise

    orderItems.push({
      productId: product.id,
      orderedUnit,
      orderedQty,
      baseQty,
      unitPricePaise,
      lineTotalPaise,
    })
  }

  const order = await prisma.order.create({
    data: {
      userId: session.user.id,
      notes,
      totalPaise,
      items: { create: orderItems },
    },
    include: { items: true },
  })

  return NextResponse.json(order, { status: 201 })
}
