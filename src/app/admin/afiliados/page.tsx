import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import AdminActions from '../AdminActions'
import AffiliateTable from '@/components/AffiliateTable'

export const dynamic = 'force-dynamic'

export default async function AdminAffiliates() {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') redirect('/login')

  const activeRaffle = await prisma.raffle.findFirst({
    where: { status: 'ACTIVE' },
  })

  // Fetch affiliates with their orders for the active raffle
  const affiliates = await prisma.affiliate.findMany({
    include: {
      orders: {
        where: { 
          status: { in: ['APPROVED', 'PENDING'] }
        },
        include: {
          tickets: {
            where: { 
              ...(activeRaffle ? { raffleId: activeRaffle.id } : {})
            },
            include: { raffle: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      }
    }
  })

  return (
    <main className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-xl sm:text-2xl font-black text-gray-900">Gestión de Afiliados</h1>
          <Link href="/admin" className="text-blue-600 hover:text-blue-800 bg-blue-50 px-4 py-2 rounded-lg text-sm font-bold w-full sm:w-auto text-center transition-colors">
            &larr; Volver al Panel
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Create Affiliate Form */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 md:col-span-1 h-fit">
            <h3 className="text-sm font-bold text-gray-400 mb-4 uppercase tracking-wider">Registrar Nuevo Afiliado</h3>
            <AdminActions action="create-affiliate" />
            
            <div className="mt-8 pt-6 border-t border-gray-100">
              <h3 className="text-sm font-bold text-gray-400 mb-2 uppercase tracking-wider">Enlace de Auto-Registro</h3>
              <p className="text-xs text-gray-500 mb-3">Comparte este enlace para que los afiliados se registren por sí mismos:</p>
              <div className="bg-gray-50 p-2 rounded border border-gray-200 text-xs font-mono overflow-x-auto select-all">
                https://jrifas.com/afiliados/registro
              </div>
            </div>
          </div>
          
          {/* Affiliates List */}
          <div className="md:col-span-2">
            <AffiliateTable affiliates={affiliates} />
          </div>
        </div>

      </div>
    </main>
  )
}
