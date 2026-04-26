import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import AdminActions from './AdminActions'
import AdminSearch from '@/components/AdminSearch'

export const dynamic = 'force-dynamic'

export default async function AdminDashboard(props: { searchParams?: Promise<{ q?: string }> }) {
  const params = await props.searchParams
  const q = params?.q?.toLowerCase() || ''
  
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') redirect('/login')

  const activeRaffle = await prisma.raffle.findFirst({
    where: { status: 'ACTIVE' },
    include: {
      tickets: {
        include: { 
          secondaries: true,
          order: true 
        }
      }
    }
  })

  let pendingOrders = await prisma.order.findMany({
    where: { status: 'PENDING' },
    include: { tickets: true, affiliate: true },
    orderBy: { createdAt: 'desc' }
  })

  // Client-side filtering because there usually aren't thousands of pending orders
  if (q) {
    pendingOrders = pendingOrders.filter(o => 
      o.customerName.toLowerCase().includes(q) || 
      o.customerPhone.includes(q) || 
      o.receiptCode.toLowerCase().includes(q) ||
      o.tickets.some(t => t.number.includes(q))
    )
  }

  return (
    <main className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-200">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-xl sm:text-2xl font-black text-gray-900">Panel Admin</h1>
            <form action={async () => {
              'use server'
              const { logout } = await import('@/lib/auth')
              await logout()
              redirect('/login')
            }}>
              <button className="text-xs sm:text-sm bg-red-50 text-red-600 px-3 py-1.5 rounded-lg font-bold hover:bg-red-100 transition-colors">
                Salir
              </button>
            </form>
          </div>
          
          <div className="grid grid-cols-3 gap-2 sm:gap-4">
            <Link href="/admin/afiliados" className="flex flex-col items-center justify-center p-3 sm:p-4 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl transition-colors border border-blue-100 text-center gap-1">
              <span className="text-xl sm:text-2xl">👥</span>
              <span className="text-[10px] sm:text-sm font-bold leading-tight">Afiliados</span>
            </Link>
            <Link href="/admin/recibos" className="flex flex-col items-center justify-center p-3 sm:p-4 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl transition-colors border border-emerald-100 text-center gap-1">
              <span className="text-xl sm:text-2xl">🧾</span>
              <span className="text-[10px] sm:text-sm font-bold leading-tight">Recibos</span>
            </Link>
            <Link href="/admin/publicidad" className="flex flex-col items-center justify-center p-3 sm:p-4 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-xl transition-colors border border-purple-100 text-center gap-1">
              <span className="text-xl sm:text-2xl">📸</span>
              <span className="text-[10px] sm:text-sm font-bold leading-tight">Publicidad</span>
            </Link>
          </div>
        </div>

        {/* Create Raffle or Status */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          {activeRaffle ? (
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h2 className="text-xl font-bold flex items-center">
                  Rifa Activa: {activeRaffle.name}
                  <AdminActions action="edit-raffle-name" id={activeRaffle.id} />
                </h2>
                <p className="text-gray-500">Precio: {activeRaffle.price.toLocaleString()} | Comisión: {activeRaffle.commissionPct}%</p>
                <p className="text-gray-500 flex items-center gap-1 mt-0.5">
                  <span>Sorteo:</span>
                  <span
                    id={`draw-date-${activeRaffle.id}`}
                    data-date={activeRaffle.drawDate || ''}
                    className={activeRaffle.drawDate ? 'font-medium text-gray-700' : 'italic text-gray-400'}
                  >
                    {activeRaffle.drawDate || 'Sin fecha definida'}
                  </span>
                  <AdminActions action="edit-draw-date" id={activeRaffle.id} />
                </p>
                <div className="mt-2 text-sm">
                  <span className="font-medium">Números Vendidos: </span> 
                  {activeRaffle.tickets.filter(t => t.status === 'SOLD').length} / 100
                </div>
              </div>
              <div className="flex gap-2">
                <AdminActions action="close-raffle" id={activeRaffle.id} />
                <AdminActions action="delete-raffle" id={activeRaffle.id} />
              </div>
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
                    <th className="pb-3 text-gray-500 font-medium">Contacto</th>
                    <th className="pb-3 text-gray-500 font-medium text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {pendingOrders.map(order => (
                    <tr key={order.id} className={`transition-colors ${
                      order.contacted
                        ? 'bg-green-50 hover:bg-green-100'
                        : 'bg-red-50 hover:bg-red-100'
                    }`}>
                      <td className="py-3 px-1 font-mono font-bold text-blue-600">{order.receiptCode}</td>
                      <td className="py-3 px-1">
                        <div className="font-medium">{order.customerName}</div>
                        <div className="text-xs text-gray-500">{order.customerPhone}</div>
                      </td>
                      <td className="py-3 px-1 font-medium">{order.tickets.map(t => t.number).join(', ')}</td>
                      <td className="py-3 px-1 font-bold">{order.totalAmount.toLocaleString()}</td>
                      <td className="py-3 px-1 text-gray-600">{order.affiliate ? order.affiliate.name : '-'}</td>
                      <td className="py-3 px-1">
                        <AdminActions action="toggle-contacted" id={order.id} isContacted={order.contacted} />
                      </td>
                      <td className="py-3 text-right">
                        <div className="flex flex-col items-end gap-1">
                          <AdminActions action="approve-order" id={order.id} />
                          <AdminActions action="cancel-order" id={order.id} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Removed Affiliates Management - Moved to /admin/afiliados */}

        {/* Search Bar for Assigned Numbers */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h2 className="text-lg font-bold text-gray-700">Buscar Número/Cliente</h2>
            <AdminSearch />
          </div>
        </div>

        {/* Sold Numbers & Secondaries */}
        {activeRaffle && (
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
            <h2 className="text-xl font-bold mb-4">Números Asignados</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {activeRaffle.tickets
                .filter(t => t.status === 'SOLD')
                .filter(t => {
                  if (!q) return true
                  return (
                    t.number.includes(q) || 
                    (t.order?.customerName.toLowerCase().includes(q)) || 
                    (t.order?.customerPhone.includes(q))
                  )
                })
                .sort((a, b) => parseInt(a.number, 10) - parseInt(b.number, 10))
                .map(ticket => (
                <div key={ticket.id} className="border border-gray-200 rounded-xl p-3 bg-gray-50 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-black text-2xl text-red-600 leading-none">{ticket.number}</span>
                    </div>
                    {ticket.order && (
                      <div className="mb-3 text-sm bg-white p-2 border border-gray-100 rounded">
                        <div className="font-bold text-gray-800 line-clamp-1" title={ticket.order.customerName}>
                          {ticket.order.customerName}
                        </div>
                        <div className="text-xs text-gray-500">
                          {ticket.order.customerPhone}
                        </div>
                      </div>
                    )}
                    <div className="text-xs text-gray-500 mb-1">Secundarios:</div>
                    <div className="flex flex-wrap gap-1">
                      {ticket.secondaries.map(sec => (
                        <span key={sec.id} className="text-[10px] bg-white border border-gray-200 px-1 py-0.5 rounded font-mono">
                          {sec.number}
                        </span>
                      ))}
                    </div>
                    {ticket.order && (
                      <AdminActions action="cancel-order" id={ticket.order.id} />
                    )}
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
