'use client'

import { useState, useEffect } from 'react'
import { formatINR } from '@/lib/units'

interface OrderItem {
  id: string
  orderedQty: string
  orderedUnit: string
  lineTotalPaise: string
  product: { name: string; baseUnit: string }
}

interface Order {
  id: string
  status: 'PENDING' | 'CONFIRMED' | 'REJECTED' | 'FULFILLED'
  totalPaise: string
  notes: string | null
  createdAt: string
  user: { name: string; email: string }
  items: OrderItem[]
}

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  CONFIRMED: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  REJECTED: 'bg-red-500/10 text-red-400 border-red-500/20',
  FULFILLED: 'bg-green-500/10 text-green-400 border-green-500/20',
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [updating, setUpdating] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState('')

  async function fetchOrders() {
    const res = await fetch('/api/admin/orders')
    const data = await res.json()
    setOrders(data)
    setLoading(false)
  }

  useEffect(() => { fetchOrders() }, [])

  async function updateStatus(orderId: string, status: string) {
    setUpdating(orderId)
    await fetch('/api/admin/orders', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId, status }),
    })
    setUpdating(null)
    fetchOrders()
  }

  const filtered = statusFilter ? orders.filter((o) => o.status === statusFilter) : orders

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Orders</h1>
          <p className="text-gray-400 text-sm mt-1">{orders.length} total orders</p>
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">All statuses</option>
          {['PENDING', 'CONFIRMED', 'REJECTED', 'FULFILLED'].map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="py-16 text-center text-gray-500">Loading orders...</div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-gray-500">No orders found</div>
        ) : (
          filtered.map((order) => (
            <div key={order.id} className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
              {/* Order header */}
              <div
                className="flex items-center justify-between px-6 py-4 cursor-pointer hover:bg-gray-800/40 transition-colors"
                onClick={() => setExpanded(expanded === order.id ? null : order.id)}
              >
                <div className="flex items-center gap-4">
                  <div>
                    <p className="text-sm font-semibold text-white">{order.user.name}</p>
                    <p className="text-xs text-gray-500">{order.user.email}</p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-medium border ${statusColors[order.status]}`}>
                    {order.status}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm font-bold text-white">{formatINR(Number(order.totalPaise))}</p>
                    <p className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleDateString('en-IN')}</p>
                  </div>
                  {/* Action buttons */}
                  <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                    {order.status === 'PENDING' && (
                      <>
                        <button
                          onClick={() => updateStatus(order.id, 'CONFIRMED')}
                          disabled={updating === order.id}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-semibold rounded-lg transition-all"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => updateStatus(order.id, 'REJECTED')}
                          disabled={updating === order.id}
                          className="px-3 py-1.5 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white text-xs font-semibold rounded-lg transition-all"
                        >
                          Reject
                        </button>
                      </>
                    )}
                    {order.status === 'CONFIRMED' && (
                      <button
                        onClick={() => updateStatus(order.id, 'FULFILLED')}
                        disabled={updating === order.id}
                        className="px-3 py-1.5 bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white text-xs font-semibold rounded-lg transition-all"
                      >
                        {updating === order.id ? 'Processing...' : 'Fulfill'}
                      </button>
                    )}
                  </div>
                  <svg
                    className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${expanded === order.id ? 'rotate-180' : ''}`}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              {/* Expanded items */}
              {expanded === order.id && (
                <div className="border-t border-gray-800 px-6 py-4">
                  {order.notes && (
                    <p className="text-sm text-gray-400 mb-3 italic">"{order.notes}"</p>
                  )}
                  <div className="space-y-2">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span className="text-gray-300">{item.product.name} — {Number(item.orderedQty).toFixed(2)} {item.orderedUnit}</span>
                        <span className="text-white font-medium">{formatINR(Number(item.lineTotalPaise))}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
