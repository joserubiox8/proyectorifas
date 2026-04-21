'use client'

import { useState } from 'react'
import { approveOrder } from '@/app/actions/approval'
import { createRaffle } from '@/app/actions/raffle'

export default function AdminActions({ action, id }: { action: string, id?: string }) {
  const [loading, setLoading] = useState(false)

  const handleApprove = async () => {
    if (!id || !confirm('¿Estás seguro de aprobar este pago? Esto asignará los números secundarios.')) return
    setLoading(true)
    const res = await approveOrder(id)
    if (!res.success) {
      alert(res.error)
    }
    setLoading(false)
  }

  const handleCreate = async () => {
    const name = prompt('Nombre de la Rifa (ej. Rifa Semanal 1):')
    if (!name) return
    const priceStr = prompt('Precio de cada número (COP):', '50000')
    if (!priceStr) return
    const commStr = prompt('Porcentaje de comisión (%):', '20')
    if (!commStr) return

    setLoading(true)
    const res = await createRaffle({
      name,
      price: parseInt(priceStr, 10),
      commissionPct: parseInt(commStr, 10)
    })
    if (!res.success) alert(res.error)
    setLoading(false)
  }

  if (action === 'approve-order') {
    return (
      <button 
        onClick={handleApprove}
        disabled={loading}
        className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-bold text-sm disabled:opacity-50 transition-colors shadow-sm shadow-green-200"
      >
        {loading ? 'Aprobando...' : 'Aprobar Pago'}
      </button>
    )
  }

  if (action === 'create-raffle') {
    return (
      <button 
        onClick={handleCreate}
        disabled={loading}
        className="bg-black hover:bg-gray-800 text-white px-6 py-3 rounded-xl font-bold transition-colors shadow-lg"
      >
        {loading ? 'Creando...' : 'Crear Nueva Rifa'}
      </button>
    )
  }

  return null
}
