import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import AdminActions from './AdminActions'

export const dynamic = 'force-dynamic'

export default async function AdminDashboard() {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') redirect('/login')

  const activeRaffle = await prisma.raffle.findFirst({
    where: { status: 'ACTIVE' },
    include: {
      tickets: {
        include: { secondaries: true }
      }
    }
  })

  const pendingOrders = await prisma.order.findMany({
    where: { status: 'PENDING' },
    include: { tickets: true, affiliate: true },
    orderBy: { createdAt: 'desc' }
  })

  const affiliates = await prisma.affiliate.findMany()

  return (
    <main className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-black text-gray-900">Panel Administrativo</h1>
          </div>
          <form action={async () => {
            'use server'
            const { logout } = await import('@/lib/auth')
            await logout()
            redirect('/login')
          }}>
            <button className="text-red-500 font-medium hover:text-red-700">Cerrar Sesión</button>
          </form>
        </div>

        {/* Create Raffle or Status */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          {activeRaffle ? (
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h2 className="text-xl font-bold">Rifa Activa: {activeRaffle.name}</h2>
                <p className="text-gray-500">Precio: {activeRaffle.price.toLocaleString()} COP | Comisión: {activeRaffle.commissionPct}%</p>
                <div className="mt-2 text-sm">
                  <span className="font-medium">Números Vendidos: </span> 
                  {activeRaffle.tickets.filter(t => t.status === 'SOLD').length} / 100
                </div>
              </div>
              <AdminActions action="close-raffle" id={activeRaffle.id} />
            </div>
          ) : (
            <div>
              <h2 className="text-xl font-bold mb-4">No hay rifa activa</h2>
              <AdminActions action="create-raffle" />
            </div>
          )}
        </div>

        {/* Pending Orders */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          <h2 className="text-xl font-bold mb-4">Reservas Pendientes de Pago</h2>
          {pendingOrders.length === 0 ? (
            <p className="text-gray-500 italic">No hay reservas pendientes.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="pb-3 text-gray-500 font-medium">Comprobante</th>
                    <th className="pb-3 text-gray-500 font-medium">Cliente</th>
                    <th className="pb-3 text-gray-500 font-medium">Números</th>
                    <th className="pb-3 text-gray-500 font-medium">Total</th>
                    <th className="pb-3 text-gray-500 font-medium">Afiliado</th>
                    <th className="pb-3 text-gray-500 font-medium text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {pendingOrders.map(order => (
                    <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-3 font-mono font-bold text-blue-600">{order.receiptCode}</td>
                      <td className="py-3">
                        <div className="font-medium">{order.customerName}</div>
                        <div className="text-xs text-gray-500">{order.customerPhone}</div>
                      </td>
                      <td className="py-3 font-medium">{order.tickets.map(t => t.number).join(', ')}</td>
                      <td className="py-3 font-bold">{order.totalAmount.toLocaleString()} COP</td>
                      <td className="py-3 text-gray-600">{order.affiliate ? order.affiliate.name : '-'}</td>
                      <td className="py-3 text-right">
                        <AdminActions action="approve-order" id={order.id} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Sold Numbers & Secondaries */}
        {activeRaffle && (
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
            <h2 className="text-xl font-bold mb-4">Números Asignados</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {activeRaffle.tickets.filter(t => t.status === 'SOLD').map(ticket => (
                <div key={ticket.id} className="border border-gray-200 rounded-xl p-3 bg-gray-50">
                  <div className="font-black text-xl mb-1 text-red-600">{ticket.number}</div>
                  <div className="text-xs text-gray-500 mb-2">Secundarios:</div>
                  <div className="flex flex-wrap gap-1">
                    {ticket.secondaries.map(sec => (
                      <span key={sec.id} className="text-xs bg-white border border-gray-200 px-1 py-0.5 rounded font-mono">
                        {sec.number}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </main>
  )
}
