import { auth } from '@/auth'
import prisma from '@/lib/prisma'
import { formatINR } from '@/lib/units'
import Link from 'next/link'

export default async function SellerDashboard() {
  const session = await auth()
  const userId = session!.user.id

  const [totalOrders, pendingOrders, revenueResult, recentOrders] = await Promise.all([
    prisma.order.count({ where: { userId } }),
    prisma.order.count({ where: { userId, status: 'PENDING' } }),
    prisma.order.aggregate({
      where: { userId, status: { in: ['CONFIRMED', 'FULFILLED'] } },
      _sum: { totalPaise: true },
    }),
    prisma.order.findMany({
      where: { userId },
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { items: { include: { product: { select: { name: true } } } } },
    }),
  ])

  const totalSpent = Number(revenueResult._sum.totalPaise ?? 0)

  const statusColors: Record<string, string> = {
    PENDING: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    CONFIRMED: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    REJECTED: 'bg-red-500/10 text-red-400 border-red-500/20',
    FULFILLED: 'bg-green-500/10 text-green-400 border-green-500/20',
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">My Dashboard</h1>
          <p className="text-gray-400 mt-1">Welcome back, {session?.user.name}</p>
        </div>
        <Link
          href="/dashboard/orders/new"
          id="new-order-btn"
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl flex items-center gap-2 transition-all duration-200 shadow-lg shadow-indigo-500/20"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Order
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <div className="p-2.5 bg-indigo-500/10 rounded-xl w-fit mb-4">
            <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <p className="text-3xl font-bold text-white">{totalOrders}</p>
          <p className="text-sm text-gray-400 mt-1">Total Orders</p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <div className="p-2.5 bg-yellow-500/10 rounded-xl w-fit mb-4">
            <svg className="w-5 h-5 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-3xl font-bold text-white">{pendingOrders}</p>
          <p className="text-sm text-gray-400 mt-1">Pending Orders</p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <div className="p-2.5 bg-green-500/10 rounded-xl w-fit mb-4">
            <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-3xl font-bold text-white">{formatINR(totalSpent)}</p>
          <p className="text-sm text-gray-400 mt-1">Total Spent</p>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
          <h2 className="text-lg font-semibold text-white">Recent Orders</h2>
          <Link href="/dashboard/orders" className="text-sm text-indigo-400 hover:text-indigo-300">View all →</Link>
        </div>
        <div className="divide-y divide-gray-800">
          {recentOrders.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-gray-500 mb-4">No orders yet</p>
              <Link href="/dashboard/orders/new" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm rounded-xl transition-colors">
                Place your first order
              </Link>
            </div>
          ) : (
            recentOrders.map((order) => (
              <div key={order.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-800/50 transition-colors">
                <div>
                  <p className="text-sm font-medium text-white">
                    {order.items.map((i) => i.product.name).join(', ')}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {order.items.length} item{order.items.length !== 1 ? 's' : ''} · {new Date(order.createdAt).toLocaleDateString('en-IN')}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <p className="text-sm font-semibold text-white">{formatINR(Number(order.totalPaise))}</p>
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-medium border ${statusColors[order.status]}`}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
