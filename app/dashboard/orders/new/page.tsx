'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { VALID_UNITS, pricePerUnit, formatINR } from '@/lib/units'
import type { DisplayUnit, BaseUnit } from '@/lib/units'

interface Product {
  id: string
  name: string
  sku: string | null
  category: string | null
  baseUnit: BaseUnit
  basePrice: string
  stockQty: string
}

interface CartItem {
  productId: string
  productName: string
  baseUnit: BaseUnit
  basePricePaise: number
  orderedUnit: DisplayUnit
  orderedQty: number
}

export default function NewOrderPage() {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [cart, setCart] = useState<CartItem[]>([])
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  // Product selector state
  const [selectedProductId, setSelectedProductId] = useState('')
  const [selectedUnit, setSelectedUnit] = useState<DisplayUnit>('unit')
  const [qty, setQty] = useState('')
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetch('/api/products')
      .then((r) => r.json())
      .then((data) => { setProducts(data); setLoading(false) })
  }, [])

  const selectedProduct = products.find((p) => p.id === selectedProductId)

  useEffect(() => {
    if (selectedProduct) {
      setSelectedUnit(VALID_UNITS[selectedProduct.baseUnit][0])
    }
  }, [selectedProductId])

  const validUnits = selectedProduct ? VALID_UNITS[selectedProduct.baseUnit] : []
  const unitPrice = selectedProduct
    ? pricePerUnit(Number(selectedProduct.basePrice), selectedUnit)
    : 0
  const lineTotal = qty && unitPrice ? parseFloat(qty) * unitPrice : 0

  function addToCart() {
    if (!selectedProduct || !qty || parseFloat(qty) <= 0) return
    setCart((prev) => [
      ...prev,
      {
        productId: selectedProduct.id,
        productName: selectedProduct.name,
        baseUnit: selectedProduct.baseUnit,
        basePricePaise: Number(selectedProduct.basePrice),
        orderedUnit: selectedUnit,
        orderedQty: parseFloat(qty),
      },
    ])
    setSelectedProductId('')
    setQty('')
    setSearch('')
  }

  function removeFromCart(idx: number) {
    setCart((prev) => prev.filter((_, i) => i !== idx))
  }

  function updateCartQty(idx: number, newQty: string) {
    setCart((prev) =>
      prev.map((item, i) => i === idx ? { ...item, orderedQty: parseFloat(newQty) || 0 } : item)
    )
  }

  const cartTotal = cart.reduce((sum, item) => {
    const up = pricePerUnit(item.basePricePaise, item.orderedUnit)
    return sum + item.orderedQty * up
  }, 0)

  async function handleSubmit() {
    if (cart.length === 0) return
    setSubmitting(true)
    setError('')
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        notes,
        items: cart.map((item) => ({
          productId: item.productId,
          orderedUnit: item.orderedUnit,
          orderedQty: item.orderedQty,
        })),
      }),
    })
    setSubmitting(false)
    if (!res.ok) {
      const data = await res.json()
      setError(data.error || 'Failed to place order')
      return
    }
    router.push('/dashboard/orders')
  }

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.sku ?? '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">New Order</h1>
        <p className="text-gray-400 text-sm mt-1">Add products to your order</p>
      </div>

      {/* Product Selector */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-6">
        <h2 className="text-base font-semibold text-white mb-4">Add Product</h2>

        {loading ? (
          <p className="text-gray-500 text-sm">Loading products...</p>
        ) : (
          <div className="space-y-4">
            {/* Search */}
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Search Product</label>
              <input
                type="text"
                placeholder="Type product name or SKU..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setSelectedProductId('') }}
                className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              {search && !selectedProductId && (
                <div className="mt-1 bg-gray-800 border border-gray-700 rounded-xl overflow-hidden max-h-48 overflow-y-auto">
                  {filteredProducts.length === 0 ? (
                    <p className="px-4 py-3 text-sm text-gray-500">No products found</p>
                  ) : (
                    filteredProducts.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => { setSelectedProductId(p.id); setSearch(p.name) }}
                        className="w-full text-left px-4 py-3 hover:bg-gray-700 transition-colors"
                      >
                        <p className="text-sm text-white">{p.name}</p>
                        <p className="text-xs text-gray-500">{p.sku && `SKU: ${p.sku} · `}{p.category} · Stock: {Number(p.stockQty).toFixed(2)} {VALID_UNITS[p.baseUnit][0]}</p>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>

            {selectedProduct && (
              <>
                <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-sm">
                  <p className="text-indigo-300 font-medium">{selectedProduct.name}</p>
                  <p className="text-gray-400 text-xs mt-0.5">
                    Base price: {formatINR(Number(selectedProduct.basePrice))}/{VALID_UNITS[selectedProduct.baseUnit][0]} · Stock: {Number(selectedProduct.stockQty).toFixed(2)} {VALID_UNITS[selectedProduct.baseUnit][0]}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1.5">Unit</label>
                    <select
                      value={selectedUnit}
                      onChange={(e) => setSelectedUnit(e.target.value as DisplayUnit)}
                      className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      {validUnits.map((u) => (
                        <option key={u} value={u}>{u}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1.5">Quantity</label>
                    <input
                      type="number"
                      min="0.000001"
                      step="any"
                      value={qty}
                      onChange={(e) => setQty(e.target.value)}
                      placeholder="0"
                      className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                {qty && parseFloat(qty) > 0 && (
                  <div className="flex justify-between text-sm text-gray-400 bg-gray-800 rounded-xl px-4 py-2.5">
                    <span>{formatINR(unitPrice)} × {qty} {selectedUnit}</span>
                    <span className="text-white font-semibold">{formatINR(lineTotal)}</span>
                  </div>
                )}

                <button
                  onClick={addToCart}
                  disabled={!qty || parseFloat(qty) <= 0}
                  id="add-to-cart-btn"
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-all duration-200"
                >
                  Add to Order
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Cart */}
      {cart.length > 0 && (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl mb-6">
          <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between">
            <h2 className="text-base font-semibold text-white">Order Items</h2>
            <p className="text-sm text-gray-400">{cart.length} item{cart.length !== 1 ? 's' : ''}</p>
          </div>
          <div className="divide-y divide-gray-800">
            {cart.map((item, idx) => {
              const up = pricePerUnit(item.basePricePaise, item.orderedUnit)
              const lt = item.orderedQty * up
              return (
                <div key={idx} className="px-6 py-4 flex items-center gap-4">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">{item.productName}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{formatINR(up)}/{item.orderedUnit}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="0.000001"
                      step="any"
                      value={item.orderedQty}
                      onChange={(e) => updateCartQty(idx, e.target.value)}
                      className="w-24 px-2.5 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-center"
                    />
                    <span className="text-sm text-gray-400 w-8">{item.orderedUnit}</span>
                  </div>
                  <div className="text-right min-w-[80px]">
                    <p className="text-sm font-semibold text-white">{formatINR(lt)}</p>
                  </div>
                  <button
                    onClick={() => removeFromCart(idx)}
                    className="text-gray-600 hover:text-red-400 transition-colors ml-1"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )
            })}
          </div>
          <div className="px-6 py-4 border-t border-gray-800 flex justify-between items-center">
            <p className="text-sm text-gray-400">Order Total</p>
            <p className="text-xl font-bold text-white">{formatINR(cartTotal)}</p>
          </div>
        </div>
      )}

      {/* Notes + Submit */}
      {cart.length > 0 && (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <div className="mb-4">
            <label className="block text-sm text-gray-400 mb-1.5" htmlFor="order-notes">Order Notes (optional)</label>
            <textarea
              id="order-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any special instructions..."
              rows={3}
              className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={() => router.back()}
              className="flex-1 py-3 border border-gray-700 text-gray-300 rounded-xl text-sm hover:bg-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting || cart.length === 0}
              id="place-order-btn"
              className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl text-sm transition-all duration-200 shadow-lg shadow-indigo-500/20"
            >
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Placing order...
                </span>
              ) : `Place Order — ${formatINR(cartTotal)}`}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
