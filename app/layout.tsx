import type { Metadata } from 'next'
import Script from 'next/script'
import './globals.css'

export const metadata: Metadata = {
  title: 'Inventory & Order Management',
  description: 'Full-stack inventory and order management system built with Next.js 14',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <Script src="https://cdn.tailwindcss.com" strategy="beforeInteractive" />
      </head>
      <body className="bg-gray-950 text-gray-100 min-h-screen antialiased">
        {children}
      </body>
    </html>
  )
}
