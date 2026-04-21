import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function AffiliateDashboard() {
  const session = await getSession()
  if (!session || session.role !== 'AFFILIATE') redirect('/login')

  const affiliate = await prisma.affiliate.findUnique({
    where: { id: session.id },
    include: {
      orders: {
        where: { status: 'APPROVED' },
        include: { tickets: { include: { raffle: true } } }
      }
    }
  })

  if (!affiliate) redirect('/login')

  // Calculate stats
  let totalSales = 0
  let totalCommissions = 0

  for (const order of affiliate.orders) {
    for (const ticket of order.tickets) {
      if (ticket.raffle) {
        totalSales += ticket.raffle.price
        totalCommissions += ticket.raffle.price * (ticket.raffle.commissionPct / 100)
      }
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-gray-500 text-sm font-medium mb-1">Ventas Totales</h3>
            <p className="text-3xl font-black">{totalSales.toLocaleString('es-CO')} COP</p>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-2xl shadow-sm">
            <h3 className="text-green-100 text-sm font-medium mb-1">Comisiones Generadas (20%)</h3>
            <p className="text-3xl font-black">{totalCommissions.toLocaleString('es-CO')} COP</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold mb-4">Tu Enlace de Referido</h2>
          <p className="text-sm text-gray-500 mb-4">
            Comparte este enlace. Todas las compras realizadas a través de él te generarán comisión.
          </p>
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 flex items-center justify-between">
            <code className="text-sm font-bold text-blue-600 break-all">
              https://tu-dominio.com/?ref={affiliate.refCode}
            </code>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold mb-4">Tus Ventas Aprobadas</h2>
          {affiliate.orders.length === 0 ? (
            <p className="text-gray-500 italic text-sm">Aún no tienes ventas aprobadas.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="pb-3 text-gray-500 font-medium">Fecha</th>
                    <th className="pb-3 text-gray-500 font-medium">Cliente</th>
                    <th className="pb-3 text-gray-500 font-medium">Números</th>
                    <th className="pb-3 text-gray-500 font-medium">Comisión</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {affiliate.orders.map(order => {
                    let orderCom = 0
                    for (const t of order.tickets) {
                      if (t.raffle) orderCom += t.raffle.price * (t.raffle.commissionPct / 100)
                    }
                    return (
                      <tr key={order.id}>
                        <td className="py-3">{new Date(order.createdAt).toLocaleDateString('es-CO')}</td>
                        <td className="py-3 font-medium">{order.customerName}</td>
                        <td className="py-3">{order.tickets.map(t => t.number).join(', ')}</td>
                        <td className="py-3 text-green-600 font-bold">+{orderCom.toLocaleString('es-CO')}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
