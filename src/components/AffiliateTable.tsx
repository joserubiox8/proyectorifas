'use client'

import React, { useState } from 'react'
import AdminActions from '@/app/admin/AdminActions'

type Ticket = {
  number: string
  raffle: { price: number; commissionPct: number } | null
}

type Order = {
  id: string
  customerName: string
  customerPhone: string
  receiptCode: string
  status: string
  commissionPaid: boolean
  createdAt: Date
  tickets: Ticket[]
}

type Affiliate = {
  id: string
  name: string
  whatsapp: string
  idNumber: string
  refCode: string
  orders: Order[]
}

export default function AffiliateTable({ affiliates }: { affiliates: Affiliate[] }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const filteredAffiliates = affiliates.filter(aff => {
    const term = searchTerm.toLowerCase()
    return aff.name.toLowerCase().includes(term) ||
           aff.whatsapp.includes(term) ||
           aff.idNumber.includes(term)
  })

  const toggleExpand = (id: string) => {
    if (expandedId === id) setExpandedId(null)
    else setExpandedId(id)
  }

  return (
    <div>
      {/* Search Bar */}
      <div className="mb-6">
        <input 
          type="text" 
          placeholder="Buscar afiliado por nombre, cédula o WhatsApp..." 
          className="w-full p-4 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 focus:bg-white transition-all shadow-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {filteredAffiliates.length === 0 ? (
        <p className="text-gray-500 italic text-sm">No se encontraron afiliados.</p>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase tracking-wider text-xs">
                <tr>
                  <th className="p-4 font-bold">Afiliado</th>
                  <th className="p-4 font-bold text-center">Ventas Confirmadas</th>
                  <th className="p-4 font-bold text-right text-green-600">Total Pagado</th>
                  <th className="p-4 font-bold text-right text-yellow-600">Saldo Pendiente</th>
                  <th className="p-4 font-bold text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredAffiliates.map(aff => {
                  let confirmedSales = 0
                  let paidCommissions = 0
                  let pendingCommissions = 0

                  const approvedOrders = aff.orders.filter(o => o.status === 'APPROVED')
                  const pendingOrders = aff.orders.filter(o => o.status === 'PENDING')

                  for (const order of approvedOrders) {
                    confirmedSales += order.tickets.length
                    let orderCom = 0
                    for (const ticket of order.tickets) {
                      if (ticket.raffle) {
                        orderCom += ticket.raffle.price * (ticket.raffle.commissionPct / 100)
                      }
                    }
                    if (order.commissionPaid) {
                      paidCommissions += orderCom
                    } else {
                      pendingCommissions += orderCom
                    }
                  }

                  const isExpanded = expandedId === aff.id

                  return (
                    <React.Fragment key={aff.id}>
                      <tr className="hover:bg-gray-50 transition-colors cursor-pointer group" onClick={() => toggleExpand(aff.id)}>
                        <td className="p-4">
                          <div className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{aff.name}</div>
                          <div className="text-xs text-gray-500 mt-1">WA: {aff.whatsapp} | CC: {aff.idNumber}</div>
                        </td>
                        <td className="p-4 text-center font-bold text-gray-700">
                          {confirmedSales} <span className="text-[10px] text-gray-400 font-normal">números</span>
                        </td>
                        <td className="p-4 text-right font-black text-green-600">
                          ${paidCommissions.toLocaleString('es-CO')}
                        </td>
                        <td className="p-4 text-right font-black text-yellow-600">
                          ${pendingCommissions.toLocaleString('es-CO')}
                        </td>
                        <td className="p-4 text-center">
                          <button className="text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors">
                            {isExpanded ? 'Ocultar Detalle' : 'Ver Detalle'}
                          </button>
                        </td>
                      </tr>

                      {/* Expanded Details */}
                      {isExpanded && (
                        <tr className="bg-gray-50 border-b border-gray-200">
                          <td colSpan={5} className="p-0">
                            <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6 shadow-inner border-y border-gray-100">
                              
                              {/* Left side: Affiliate Info & Actions */}
                              <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between">
                                <div>
                                  <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                                    Información del Afiliado
                                  </h4>
                                  <div className="space-y-2 text-sm text-gray-600">
                                    <p><strong className="text-gray-900">Enlace de referido:</strong> <code className="bg-gray-100 px-1 py-0.5 rounded text-blue-600 break-all">https://jrifas.com/?ref={aff.refCode}</code></p>
                                    <p><strong className="text-gray-900">Total Reservas Pendientes:</strong> {pendingOrders.length}</p>
                                    <p><strong className="text-gray-900">Total Órdenes Aprobadas:</strong> {approvedOrders.length}</p>
                                  </div>
                                </div>
                                <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
                                  <span className="text-xs text-red-500 font-medium">Zona de peligro:</span>
                                  <AdminActions action="delete-affiliate" id={aff.id} />
                                </div>
                              </div>

                              {/* Right side: Orders List */}
                              <div className="flex flex-col gap-4">
                                
                                {/* Aprobadas (Commissions) */}
                                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                                  <h4 className="font-bold text-gray-800 mb-3 text-sm flex justify-between items-center">
                                    <span>Ventas Aprobadas (Control de Pagos)</span>
                                    <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full">{approvedOrders.length}</span>
                                  </h4>
                                  {approvedOrders.length === 0 ? (
                                    <p className="text-xs text-gray-400 italic">No hay ventas aprobadas.</p>
                                  ) : (
                                    <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2">
                                      {approvedOrders.map(order => {
                                        let orderCom = 0
                                        for (const t of order.tickets) {
                                          if (t.raffle) orderCom += t.raffle.price * (t.raffle.commissionPct / 100)
                                        }
                                        return (
                                          <div key={order.id} className="flex justify-between items-center bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                                            <div className="text-left">
                                              <div className="text-xs font-bold font-mono text-gray-800">{order.receiptCode} <span className="font-sans font-normal text-gray-500">| {order.customerName}</span></div>
                                              <div className="text-[10px] text-gray-500 mt-0.5">Comisión: <strong className="text-green-600">${orderCom.toLocaleString('es-CO')}</strong> | Nums: {order.tickets.map(t=>t.number).join(', ')}</div>
                                            </div>
                                            <AdminActions action="toggle-commission" id={order.id} isPaid={order.commissionPaid} />
                                          </div>
                                        )
                                      })}
                                    </div>
                                  )}
                                </div>

                                {/* Pendientes */}
                                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                                  <h4 className="font-bold text-gray-800 mb-3 text-sm flex justify-between items-center">
                                    <span>Reservas Pendientes de Pago</span>
                                    <span className="bg-yellow-100 text-yellow-700 text-xs px-2 py-0.5 rounded-full">{pendingOrders.length}</span>
                                  </h4>
                                  {pendingOrders.length === 0 ? (
                                    <p className="text-xs text-gray-400 italic">No hay reservas pendientes.</p>
                                  ) : (
                                    <div className="space-y-2 max-h-[150px] overflow-y-auto pr-2">
                                      {pendingOrders.map(order => (
                                        <div key={order.id} className="flex justify-between items-center bg-yellow-50/50 p-2.5 rounded-lg border border-yellow-100">
                                          <div className="text-left">
                                            <div className="text-xs font-bold text-gray-800">{order.customerName}</div>
                                            <div className="text-[10px] text-gray-500 mt-0.5">WA: {order.customerPhone} | Nums: {order.tickets.map(t=>t.number).join(', ')}</div>
                                          </div>
                                          <div className="text-[10px] font-bold text-yellow-600 uppercase tracking-wider">Esperando Pago</div>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>

                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
