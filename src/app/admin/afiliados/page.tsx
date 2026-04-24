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
          status: 'APPROVED'
        },
        include: {
          tickets: {
            where: { 
              status: 'SOLD',
              ...(activeRaffle ? { raffleId: activeRaffle.id } : {})
            }
          }
        }
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
                https://tusitio.com/afiliados/registro
              </div>
            </div>
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
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="font-bold text-lg text-gray-900">{aff.name}</div>
                          <AdminActions action="delete-affiliate" id={aff.id} />
                        </div>
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
                          <div className="flex flex-col gap-2">
                            <div className="flex flex-wrap sm:justify-end gap-1 max-w-[200px] mb-2">
                              {soldTickets.map(num => (
                                <span key={num} className="text-[10px] bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200 font-mono text-gray-600">
                                  {num}
                                </span>
                              ))}
                            </div>
                            
                            {/* Comisiones por Orden */}
                            <div className="space-y-2 mt-2 pt-2 border-t border-gray-100">
                              <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1 text-left">Control de Comisiones</div>
                              {aff.orders.filter(o => o.tickets.length > 0).map(order => (
                                <div key={order.id} className="flex justify-between items-center bg-gray-50 p-1.5 rounded border border-gray-100">
                                  <div className="text-left">
                                    <div className="text-xs font-bold font-mono text-gray-700">{order.receiptCode}</div>
                                    <div className="text-[10px] text-gray-500">{order.tickets.map(t=>t.number).join(', ')}</div>
                                  </div>
                                  <AdminActions action="toggle-commission" id={order.id} isPaid={order.commissionPaid} />
                                </div>
                              ))}
                            </div>
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
