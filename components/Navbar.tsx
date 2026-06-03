'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'

interface NavbarProps {
  role: 'ADMIN' | 'SELLER'
  name: string
}

const adminLinks = [
  { href: '/admin', label: 'Dashboard', icon: '📊' },
  { href: '/admin/products', label: 'Products', icon: '📦' },
  { href: '/admin/orders', label: 'Orders', icon: '🛒' },
]

const sellerLinks = [
  { href: '/dashboard', label: 'Dashboard', icon: '📊' },
  { href: '/dashboard/orders', label: 'My Orders', icon: '🛒' },
  { href: '/dashboard/orders/new', label: 'New Order', icon: '➕' },
]

export default function Navbar({ role, name }: NavbarProps) {
  const pathname = usePathname()
  const links = role === 'ADMIN' ? adminLinks : sellerLinks

  return (
    <nav className="bg-gray-900 border-b border-gray-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <div className="flex items-center gap-4">
            <Link href={role === 'ADMIN' ? '/admin' : '/dashboard'} className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <span className="font-bold text-white text-lg hidden sm:block">Inventra</span>
            </Link>

            {/* Nav Links */}
            <div className="hidden md:flex items-center gap-1 ml-4">
              {links.map((link) => {
                const isActive = pathname === link.href
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-1.5 ${
                      isActive
                        ? 'bg-indigo-600 text-white'
                        : 'text-gray-400 hover:text-white hover:bg-gray-800'
                    }`}
                  >
                    <span>{link.icon}</span>
                    {link.label}
                  </Link>
                )
              })}
            </div>
          </div>

          {/* User info + logout */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-sm font-semibold text-indigo-400">
                {name.charAt(0).toUpperCase()}
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-white leading-none">{name}</p>
                <p className="text-xs text-gray-500 mt-0.5">{role}</p>
              </div>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              id="logout-btn"
              className="px-3 py-1.5 text-sm text-gray-400 hover:text-white border border-gray-700 hover:border-gray-600 rounded-lg transition-all duration-200"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        <div className="md:hidden flex gap-1 pb-2 overflow-x-auto">
          {links.map((link) => {
            const isActive = pathname === link.href
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap flex items-center gap-1 transition-all ${
                  isActive ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white bg-gray-800'
                }`}
              >
                <span>{link.icon}</span>
                {link.label}
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
