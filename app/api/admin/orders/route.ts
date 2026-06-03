import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import prisma from '@/lib/prisma'

export async function GET() {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const orders = await prisma.order.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      user: { select: { name: true, email: true } },
      items: { include: { product: { select: { name: true, baseUnit: true } } } },
    },
  })
  return NextResponse.json(orders)
}

export async function PATCH(req: NextRequest) {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { orderId, status } = await req.json()

  if (!['CONFIRMED', 'REJECTED', 'FULFILLED'].includes(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
  }

  // When fulfilling, deduct stock for each order item
  if (status === 'FULFILLED') {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    })
    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    if (order.status !== 'CONFIRMED') {
      return NextResponse.json({ error: 'Only CONFIRMED orders can be fulfilled' }, { status: 400 })
    }

    // Deduct stock in a transaction
    await prisma.$transaction([
      ...order.items.map((item) =>
        prisma.product.update({
          where: { id: item.productId },
          data: { stockQty: { decrement: item.baseQty } },
        })
      ),
      prisma.order.update({ where: { id: orderId }, data: { status: 'FULFILLED' } }),
    ])

    return NextResponse.json({ success: true })
  }

  const updated = await prisma.order.update({
    where: { id: orderId },
    data: { status },
  })
  return NextResponse.json(updated)
}
