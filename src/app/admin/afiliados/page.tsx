import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import AdminActions from '../AdminActions'

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
          status: 'APPROVED',
          ...(activeRaffle ? { raffleId: activeRaffle.id } : {})
        },
        include: {
          tickets: {
            where: { status: 'SOLD' }
          }
        }
      }
    }
  })

  return (
    <main className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex justify-between items-center">
          <div className="flex items-center gap-6">
            <h1 className="text-2xl font-black text-gray-900">Gestión de Afiliados</h1>
            <Link href="/admin" className="text-gray-500 hover:text-black hover:underline text-sm font-medium">
              &larr; Volver al Panel
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Create Affiliate Form */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 md:col-span-1 h-fit">
            <h3 className="text-sm font-bold text-gray-400 mb-4 uppercase tracking-wider">Registrar Nuevo Afiliado</h3>
            <AdminActions action="create-affiliate" />
          </div>
          
          {/* Affiliates List */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 md:col-span-2">
            <div className="flex justify-between items-end mb-6">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">
                Afiliados Registrados ({affiliates.length})
              </h3>
              {activeRaffle && (
                <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded font-medium border border-blue-100">
                  Ventas de: {activeRaffle.name}
                </span>
              )}
            </div>

            {affiliates.length === 0 ? (
              <p className="text-gray-500 italic text-sm">No hay afiliados registrados.</p>
            ) : (
              <div className="space-y-4">
                {affiliates.map(aff => {
                  // Calculate sold tickets for active raffle
                  let soldTickets: string[] = []
                  for (const order of aff.orders) {
                    for (const ticket of order.tickets) {
                      soldTickets.push(ticket.number)
                    }
                  }
                  
                  // Sort tickets numerically
                  soldTickets.sort((a, b) => parseInt(a, 10) - parseInt(b, 10))

                  return (
                    <div key={aff.id} className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div>
                        <div className="font-bold text-lg text-gray-900">{aff.name}</div>
                        <div className="text-sm text-gray-500 mb-2">
                          <span className="font-medium text-gray-700">WhatsApp:</span> {aff.whatsapp} | <span className="font-medium text-gray-700">Cédula:</span> {aff.idNumber}
                        </div>
                        <div className="inline-block bg-white border border-gray-200 px-2 py-1 rounded text-xs font-mono font-bold text-blue-600">
                          Enlace: ?ref={aff.refCode}
                        </div>
                      </div>

                      <div className="sm:text-right bg-white p-3 rounded-lg border border-gray-100 shadow-sm min-w-[140px]">
                        <div className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Números Vendidos</div>
                        <div className="text-2xl font-black text-green-600 leading-none mb-2">
                          {soldTickets.length}
                        </div>
                        {soldTickets.length > 0 ? (
                          <div className="flex flex-wrap sm:justify-end gap-1 max-w-[200px]">
                            {soldTickets.map(num => (
                              <span key={num} className="text-[10px] bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200 font-mono text-gray-600">
                                {num}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <div className="text-xs text-gray-400 italic">Sin ventas aún</div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

      </div>
    </main>
  )
}
