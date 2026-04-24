import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import AdminSearch from '@/components/AdminSearch'

export const dynamic = 'force-dynamic'

export default async function AdminReceipts({
  searchParams
}: {
  searchParams: { q?: string }
}) {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') redirect('/login')

  const q = searchParams.q || ''

  // Search logic: by customer name, phone, or receipt code
  const whereClause = q ? {
    OR: [
      { customerName: { contains: q, mode: 'insensitive' as const } },
      { customerPhone: { contains: q } },
      { receiptCode: { contains: q, mode: 'insensitive' as const } }
    ]
  } : {}

  const orders = await prisma.order.findMany({
    where: whereClause,
    orderBy: { createdAt: 'desc' },
    include: {
      tickets: true,
      affiliate: true
    }
  })

  return (
    <main className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-200 flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h1 className="text-xl sm:text-2xl font-black text-gray-900">Historial de Recibos</h1>
            <Link href="/admin" className="text-emerald-600 hover:text-emerald-800 bg-emerald-50 px-4 py-2 rounded-lg text-sm font-bold w-full sm:w-auto text-center transition-colors">
              &larr; Volver al Panel
            </Link>
          </div>
          <div className="w-full">
            <AdminSearch />
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          {orders.length === 0 ? (
            <div className="p-8 text-center text-gray-500 italic">
              {q ? 'No se encontraron recibos con esa búsqueda.' : 'No hay recibos registrados aún.'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Recibo / Fecha</th>
                    <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Cliente</th>
                    <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Total / Estado</th>
                    <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {orders.map(order => (
                    <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-4">
                        <div className="font-mono font-bold text-sm">{order.receiptCode}</div>
                        <div className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleString('es-CO')}</div>
                      </td>
                      <td className="p-4">
                        <div className="font-bold text-sm text-gray-900">{order.customerName}</div>
                        <div className="text-xs text-gray-500">{order.customerPhone}</div>
                      </td>
                      <td className="p-4">
                        <div className="font-bold text-sm">{order.totalAmount.toLocaleString('es-CO')}</div>
                        <div className="text-xs mt-1">
                          {order.status === 'APPROVED' && <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded font-bold">APROBADO</span>}
                          {order.status === 'PENDING' && <span className="bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded font-bold">PENDIENTE</span>}
                          {order.status === 'REJECTED' && <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded font-bold">RECHAZADO</span>}
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        <Link 
                          href={`/order/${order.id}`} 
                          target="_blank"
                          className="inline-block bg-blue-50 text-blue-600 hover:bg-blue-100 px-4 py-2 rounded-lg text-sm font-bold transition-colors"
                        >
                          Ver Recibo
                        </Link>
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
