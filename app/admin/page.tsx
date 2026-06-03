import { auth } from '@/auth'
import prisma from '@/lib/prisma'
import { formatINR } from '@/lib/units'
import Link from 'next/link'

export default async function AdminDashboard() {
  const session = await auth()

  const [totalProducts, pendingOrders, revenueResult] = await Promise.all([
    prisma.product.count({ where: { isActive: true } }),
    prisma.order.count({ where: { status: 'PENDING' } }),
    prisma.order.aggregate({
      where: { status: { in: ['CONFIRMED', 'FULFILLED'] } },
      _sum: { totalPaise: true },
    }),
  ])

  const totalRevenuePaise = Number(revenueResult._sum.totalPaise ?? 0)

  const recentOrders = await prisma.order.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: { user: { select: { name: true, email: true } } },
  })

  const statusColors: Record<string, string> = {
    PENDING: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    CONFIRMED: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    REJECTED: 'bg-red-500/10 text-red-400 border-red-500/20',
    FULFILLED: 'bg-green-500/10 text-green-400 border-green-500/20',
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
        <p className="text-gray-400 mt-1">Welcome back, {session?.user.name}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 hover:border-indigo-500/30 transition-all duration-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2.5 bg-indigo-500/10 rounded-xl">
              <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <Link href="/admin/products" className="text-xs text-indigo-400 hover:text-indigo-300">View all →</Link>
          </div>
          <p className="text-3xl font-bold text-white">{totalProducts}</p>
          <p className="text-sm text-gray-400 mt-1">Active Products</p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 hover:border-yellow-500/30 transition-all duration-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2.5 bg-yellow-500/10 rounded-xl">
              <svg className="w-5 h-5 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <Link href="/admin/orders" className="text-xs text-yellow-400 hover:text-yellow-300">Review →</Link>
          </div>
          <p className="text-3xl font-bold text-white">{pendingOrders}</p>
          <p className="text-sm text-gray-400 mt-1">Pending Orders</p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 hover:border-green-500/30 transition-all duration-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2.5 bg-green-500/10 rounded-xl">
              <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p className="text-3xl font-bold text-white">{formatINR(totalRevenuePaise)}</p>
          <p className="text-sm text-gray-400 mt-1">Total Revenue</p>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
          <h2 className="text-lg font-semibold text-white">Recent Orders</h2>
          <Link href="/admin/orders" className="text-sm text-indigo-400 hover:text-indigo-300">View all →</Link>
        </div>
        <div className="divide-y divide-gray-800">
          {recentOrders.length === 0 ? (
            <p className="px-6 py-8 text-center text-gray-500">No orders yet</p>
          ) : (
            recentOrders.map((order) => (
              <div key={order.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-800/50 transition-colors">
                <div>
                  <p className="text-sm font-medium text-white">{order.user.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{order.user.email} · {new Date(order.createdAt).toLocaleDateString('en-IN')}</p>
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
