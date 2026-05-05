import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import CopyButton from '@/components/CopyButton'

export const dynamic = 'force-dynamic'

export default async function AffiliateDashboard() {
  const session = await getSession()
  if (!session || session.role !== 'AFFILIATE') redirect('/login')

  const affiliate = await prisma.affiliate.findUnique({
    where: { id: session.id },
    include: {
      orders: {
        where: { status: { in: ['APPROVED', 'PENDING'] } },
        include: { tickets: { include: { raffle: true } } },
        orderBy: { createdAt: 'desc' }
      }
    }
  })

  if (!affiliate) redirect('/login')

  // Calculate stats
  let totalCommissions = 0
  let paidCommissions = 0
  let pendingCommissions = 0
  let confirmedSales = 0

  const approvedOrders = affiliate.orders.filter(o => o.status === 'APPROVED')
  const pendingOrders = affiliate.orders.filter(o => o.status === 'PENDING')

  for (const order of approvedOrders) {
    confirmedSales++
    let orderCom = 0
    for (const ticket of order.tickets) {
      if (ticket.raffle) {
        orderCom += ticket.raffle.price * (ticket.raffle.commissionPct / 100)
      }
    }
    totalCommissions += orderCom
    if (order.commissionPaid) {
      paidCommissions += orderCom
    } else {
      pendingCommissions += orderCom
    }
  }

  // Get current host for the referral link
  // Since we don't have request headers in server components easily without next/headers sometimes, we'll construct a relative URL or use a client component for the copy button.
  
  return (
    <main className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Hola, {affiliate.name}</h1>
            <p className="text-gray-500">Panel de Afiliado</p>
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

        {/* Onboarding Instructions */}
        <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
          <h2 className="text-blue-900 font-bold text-lg mb-2">🚀 ¿Cómo empezar a ganar?</h2>
          <div className="text-blue-800 text-sm space-y-2">
            <p>1. <strong>Comparte tu enlace:</strong> Copia tu enlace personalizado de abajo y compártelo por WhatsApp, Facebook o Instagram.</p>
            <p>2. <strong>Tus clientes compran:</strong> Cuando alguien compra usando tu enlace, el sistema registra la venta a tu nombre.</p>
            <p>3. <strong>Pídeles el comprobante:</strong> Asegúrate de que tus clientes envíen el comprobante de pago al administrador.</p>
            <p>4. <strong>Gana comisiones:</strong> Una vez que la venta sea aprobada, verás tu comisión reflejada aquí mismo.</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
            <div>
              <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">💰 Ganancias Totales</h3>
              <p className="text-[10px] text-gray-400 mb-2 leading-tight">De reservas confirmadas y pagadas por el cliente.</p>
            </div>
            <p className="text-xl sm:text-2xl font-black text-gray-900">${totalCommissions.toLocaleString('es-CO')}</p>
          </div>
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
            <div>
              <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">💸 Pagos Recibidos</h3>
              <p className="text-[10px] text-gray-400 mb-2 leading-tight">Comisiones que el admin ya te ha pagado.</p>
            </div>
            <p className="text-xl sm:text-2xl font-black text-green-600">${paidCommissions.toLocaleString('es-CO')}</p>
          </div>
          <div className="bg-yellow-50 p-5 rounded-2xl shadow-sm border border-yellow-100 flex flex-col justify-between">
            <div>
              <h3 className="text-yellow-800 text-xs font-bold uppercase tracking-wider mb-1">⏳ Saldo Pendiente</h3>
              <p className="text-[10px] text-yellow-600 mb-2 leading-tight">Comisiones por reservas pagadas que el admin te debe.</p>
            </div>
            <p className="text-xl sm:text-2xl font-black text-yellow-600">${pendingCommissions.toLocaleString('es-CO')}</p>
          </div>
          <div className="bg-blue-50 p-5 rounded-2xl shadow-sm border border-blue-100 flex flex-col justify-between">
            <div>
              <h3 className="text-blue-800 text-xs font-bold uppercase tracking-wider mb-1">🎟️ Ventas Confirmadas</h3>
              <p className="text-[10px] text-blue-600 mb-2 leading-tight">Reservas que el cliente ya pagó exitosamente.</p>
            </div>
            <p className="text-xl sm:text-2xl font-black text-blue-600">{confirmedSales}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold mb-4">Tu Enlace de Referido</h2>
          <p className="text-sm text-gray-500 mb-4">
            Comparte este enlace. Todas las compras realizadas a través de él te generarán comisión.
          </p>
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 flex items-center justify-between">
            <code className="text-sm font-bold text-blue-600 break-all">
              https://jrifas.com/?ref={affiliate.refCode}
            </code>
            <CopyButton textToCopy={`https://jrifas.com/?ref=${affiliate.refCode}`} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-green-500"></span>
            Tus Ventas Aprobadas
          </h2>
          {approvedOrders.length === 0 ? (
            <p className="text-gray-500 italic text-sm">Aún no tienes ventas aprobadas.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="pb-3 text-gray-500 font-medium">Recibo</th>
                    <th className="pb-3 text-gray-500 font-medium">Cliente</th>
                    <th className="pb-3 text-gray-500 font-medium">Números</th>
                    <th className="pb-3 text-gray-500 font-medium">Comisión</th>
                    <th className="pb-3 text-gray-500 font-medium">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {approvedOrders.map(order => {
                    let orderCom = 0
                    for (const t of order.tickets) {
                      if (t.raffle) orderCom += t.raffle.price * (t.raffle.commissionPct / 100)
                    }
                    return (
                      <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                        <td className="py-3 font-mono font-bold text-gray-800">{order.receiptCode}</td>
                        <td className="py-3 font-medium text-gray-900">{order.customerName}</td>
                        <td className="py-3">
                          <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs font-mono">
                            {order.tickets.map(t => t.number).join(', ')}
                          </span>
                        </td>
                        <td className="py-3 text-gray-900 font-bold">${orderCom.toLocaleString('es-CO')}</td>
                        <td className="py-3">
                          {order.commissionPaid ? (
                            <span className="text-xs font-bold text-green-700 bg-green-100 px-2 py-1 rounded">Pagado</span>
                          ) : (
                            <span className="text-xs font-bold text-yellow-700 bg-yellow-100 px-2 py-1 rounded">Pendiente</span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-yellow-400"></span>
            Reservas Pendientes
          </h2>
          <p className="text-sm text-gray-500 mb-4">Estos clientes se registraron con tu enlace pero aún no han sido aprobados por el administrador. ¡Puedes contactarlos para recordarles el pago!</p>
          {pendingOrders.length === 0 ? (
            <p className="text-gray-500 italic text-sm">No hay reservas pendientes en este momento.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="pb-3 text-gray-500 font-medium">Recibo</th>
                    <th className="pb-3 text-gray-500 font-medium">Cliente</th>
                    <th className="pb-3 text-gray-500 font-medium">WhatsApp</th>
                    <th className="pb-3 text-gray-500 font-medium">Números</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {pendingOrders.map(order => (
                    <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-3 font-mono font-bold text-gray-800">{order.receiptCode}</td>
                      <td className="py-3 font-medium text-gray-900">{order.customerName}</td>
                      <td className="py-3">
                        <a href={`https://wa.me/${order.customerPhone}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                          {order.customerPhone}
                        </a>
                      </td>
                      <td className="py-3">
                        <span className="bg-yellow-50 text-yellow-800 px-2 py-1 rounded text-xs font-mono border border-yellow-200">
                          {order.tickets.map(t => t.number).join(', ')}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
