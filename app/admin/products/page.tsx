'use client'

import { useState, useEffect } from 'react'
import { formatINR, VALID_UNITS } from '@/lib/units'

interface Product {
  id: string
  name: string
  sku: string | null
  description: string | null
  category: string | null
  baseUnit: 'GRAM' | 'MILLILITER' | 'UNIT'
  basePrice: string
  stockQty: string
  isActive: boolean
}

const BASE_UNIT_LABELS = {
  GRAM: 'g (Grams)',
  MILLILITER: 'mL (Millilitres)',
  UNIT: 'unit (Pieces)',
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Product | null>(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    name: '', sku: '', description: '', category: '',
    baseUnit: 'GRAM', basePrice: '', stockQty: '',
  })

  async function fetchProducts() {
    const res = await fetch('/api/admin/products')
    const data = await res.json()
    setProducts(data)
    setLoading(false)
  }

  useEffect(() => { fetchProducts() }, [])

  function openAdd() {
    setEditing(null)
    setForm({ name: '', sku: '', description: '', category: '', baseUnit: 'GRAM', basePrice: '', stockQty: '' })
    setShowModal(true)
  }

  function openEdit(p: Product) {
    setEditing(p)
    setForm({
      name: p.name, sku: p.sku ?? '', description: p.description ?? '',
      category: p.category ?? '', baseUnit: p.baseUnit,
      basePrice: p.basePrice, stockQty: p.stockQty,
    })
    setShowModal(true)
  }

  async function handleSave() {
    setSaving(true)
    const payload = {
      ...form,
      basePrice: parseFloat(form.basePrice),
      stockQty: parseFloat(form.stockQty),
    }
    if (editing) {
      await fetch(`/api/admin/products/${editing.id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
      })
    } else {
      await fetch('/api/admin/products', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
      })
    }
    setSaving(false)
    setShowModal(false)
    fetchProducts()
  }

  async function toggleActive(p: Product) {
    await fetch(`/api/admin/products/${p.id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !p.isActive }),
    })
    fetchProducts()
  }

  const categories = [...new Set(products.map((p) => p.category).filter(Boolean))]
  const filtered = products.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.sku ?? '').toLowerCase().includes(search.toLowerCase())
    const matchCat = !category || p.category === category
    return matchSearch && matchCat
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Products</h1>
          <p className="text-gray-400 text-sm mt-1">{products.length} total products</p>
        </div>
        <button
          onClick={openAdd}
          id="add-product-btn"
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl flex items-center gap-2 transition-all duration-200 shadow-lg shadow-indigo-500/20"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Product
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-6">
        <input
          type="text"
          placeholder="Search by name or SKU..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c} value={c!}>{c}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-gray-500">Loading products...</div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-gray-500">No products found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">SKU</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Unit</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Base Price</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Stock</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {filtered.map((p) => {
                  const unitLabel = VALID_UNITS[p.baseUnit][0]
                  return (
                    <tr key={p.id} className="hover:bg-gray-800/50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-white">{p.name}</p>
                        {p.description && <p className="text-xs text-gray-500 mt-0.5 truncate max-w-[200px]">{p.description}</p>}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-400">{p.sku ?? '—'}</td>
                      <td className="px-6 py-4 text-sm text-gray-400">{p.category ?? '—'}</td>
                      <td className="px-6 py-4 text-sm text-gray-400">{p.baseUnit}</td>
                      <td className="px-6 py-4 text-sm text-white font-medium">{formatINR(Number(p.basePrice))}<span className="text-gray-500 text-xs">/{unitLabel}</span></td>
                      <td className="px-6 py-4 text-sm text-white">{Number(p.stockQty).toFixed(2)} {unitLabel}</td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => toggleActive(p)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${
                            p.isActive
                              ? 'bg-green-500/10 text-green-400 border-green-500/20 hover:bg-green-500/20'
                              : 'bg-gray-500/10 text-gray-400 border-gray-500/20 hover:bg-gray-500/20'
                          }`}
                        >
                          {p.isActive ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => openEdit(p)}
                          className="text-indigo-400 hover:text-indigo-300 text-sm font-medium transition-colors"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
              <h2 className="text-lg font-semibold text-white">{editing ? 'Edit Product' : 'Add Product'}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white">✕</button>
            </div>
            <div className="p-6 space-y-4">
              {[
                { label: 'Product Name *', field: 'name', type: 'text' },
                { label: 'SKU', field: 'sku', type: 'text' },
                { label: 'Category', field: 'category', type: 'text' },
                { label: 'Description', field: 'description', type: 'text' },
              ].map(({ label, field, type }) => (
                <div key={field}>
                  <label className="block text-sm text-gray-400 mb-1.5">{label}</label>
                  <input
                    type={type}
                    value={(form as Record<string, string>)[field]}
                    onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                    className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              ))}

              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Base Unit *</label>
                <select
                  value={form.baseUnit}
                  onChange={(e) => setForm({ ...form, baseUnit: e.target.value })}
                  className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {Object.entries(BASE_UNIT_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-gray-400 mb-1.5">Base Price (paise) *</label>
                  <input
                    type="number"
                    min="0"
                    step="0.000001"
                    value={form.basePrice}
                    onChange={(e) => setForm({ ...form, basePrice: e.target.value })}
                    placeholder="e.g. 100 = ₹1"
                    className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1.5">Stock Qty *</label>
                  <input
                    type="number"
                    min="0"
                    step="0.000001"
                    value={form.stockQty}
                    onChange={(e) => setForm({ ...form, stockQty: e.target.value })}
                    className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {form.basePrice && (
                <p className="text-xs text-gray-500">
                  Preview: {formatINR(parseFloat(form.basePrice))} per {VALID_UNITS[form.baseUnit as keyof typeof VALID_UNITS][0]}
                </p>
              )}
            </div>
            <div className="flex gap-3 px-6 pb-6">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-2.5 border border-gray-700 text-gray-300 rounded-xl text-sm hover:bg-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !form.name || !form.basePrice || !form.stockQty}
                id="save-product-btn"
                className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-sm font-semibold transition-all duration-200"
              >
                {saving ? 'Saving...' : editing ? 'Save Changes' : 'Add Product'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
