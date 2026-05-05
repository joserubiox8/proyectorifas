import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import RaffleGrid from '@/components/RaffleGrid'

export const dynamic = 'force-dynamic'

export default async function AdminGridPage() {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') redirect('/login')

  const activeRaffle = await prisma.raffle.findFirst({
    where: { status: 'ACTIVE' },
    include: { tickets: true }
  })

  if (!activeRaffle) {
    return (
      <main className="min-h-screen bg-gray-100 p-4 md:p-8">
        <div className="max-w-4xl mx-auto text-center py-20">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">No hay rifas activas</h1>
          <Link href="/admin" className="text-blue-600 hover:underline">Volver al panel</Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8 flex justify-between items-center">
          <h1 className="text-2xl font-black text-gray-900">Grilla Detallada (Vista Admin)</h1>
          <Link href="/admin" className="text-sm bg-white border border-gray-200 px-4 py-2 rounded-xl font-bold hover:bg-gray-50">
            Volver
          </Link>
        </div>
        
        {/* We reuse the grid, but without the form logic or we can just render the grid without the form by making RaffleGrid not show the form if isAdminView is true. But currently RaffleGrid shows the form. Let's see if we can hide the form or just leave it. The user said "ver en detalle el grid con sus tres colores". We'll just pass isAdminView to RaffleGrid. */}
        <RaffleGrid
          raffleId={activeRaffle.id}
          price={activeRaffle.price}
          tickets={activeRaffle.tickets}
          isAdminView={true}
        />
      </div>
    </main>
  )
}
