import { auth } from '@/auth'
import prisma from '@/lib/prisma'
import { formatINR } from '@/lib/units'
import Link from 'next/link'

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  CONFIRMED: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  REJECTED: 'bg-red-500/10 text-red-400 border-red-500/20',
  FULFILLED: 'bg-green-500/10 text-green-400 border-green-500/20',
}

export default async function SellerOrdersPage() {
  const session = await auth()
  const userId = session!.user.id

  const orders = await prisma.order.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    include: {
      items: {
        include: { product: { select: { name: true } } },
      },
    },
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">My Orders</h1>
          <p className="text-gray-400 text-sm mt-1">{orders.length} orders placed</p>
        </div>
        <Link
          href="/dashboard/orders/new"
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl flex items-center gap-2 transition-all duration-200 shadow-lg shadow-indigo-500/20"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Order
        </Link>
      </div>

      <div className="space-y-4">
        {orders.length === 0 ? (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl py-16 text-center">
            <p className="text-gray-500 mb-4">No orders yet</p>
            <Link href="/dashboard/orders/new" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm rounded-xl transition-colors">
              Place your first order
            </Link>
          </div>
        ) : (
          orders.map((order) => (
            <div key={order.id} className="bg-gray-900 border border-gray-800 rounded-2xl p-6 hover:border-gray-700 transition-colors">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-mono text-gray-500">#{order.id.slice(-8).toUpperCase()}</p>
                    <span className={`px-2.5 py-0.5 rounded-lg text-xs font-medium border ${statusColors[order.status]}`}>
                      {order.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{new Date(order.createdAt).toLocaleString('en-IN')}</p>
                  {order.notes && <p className="text-sm text-gray-400 mt-2 italic">"{order.notes}"</p>}
                </div>
                <p className="text-lg font-bold text-white">{formatINR(Number(order.totalPaise))}</p>
              </div>

              <div className="space-y-1.5 border-t border-gray-800 pt-4">
                {order.items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-gray-400">{item.product.name}</span>
                    <span className="text-gray-300">{Number(item.orderedQty)} {item.orderedUnit}</span>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
