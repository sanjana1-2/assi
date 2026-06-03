import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import Navbar from '@/components/Navbar'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') redirect('/login')

  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar role="ADMIN" name={session.user.name} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  )
}
