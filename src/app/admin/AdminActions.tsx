'use client'

import { useState } from 'react'
import { approveOrder } from '@/app/actions/approval'
import { createRaffle } from '@/app/actions/raffle'
import { createAffiliate } from '@/app/actions/affiliate'

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

  const [affName, setAffName] = useState('')
  const [affWA, setAffWA] = useState('')
  const [affID, setAffID] = useState('')

  const handleCreateAffiliate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const res = await createAffiliate({
      name: affName,
      whatsapp: affWA,
      idNumber: affID,
      bank: 'Nequi', // Default for now
      account: affWA
    })
    if (res.success) {
      setAffName('')
      setAffWA('')
      setAffID('')
    } else {
      alert(res.error)
    }
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

    )
  }

  if (action === 'create-affiliate') {
    return (
      <form onSubmit={handleCreateAffiliate} className="space-y-3 text-sm">
        <input 
          placeholder="Nombre Completo" 
          className="w-full p-2 border rounded-lg outline-none focus:ring-1 focus:ring-black"
          value={affName}
          onChange={e => setAffName(e.target.value)}
          required
        />
        <input 
          placeholder="WhatsApp (ej. 3001234567)" 
          className="w-full p-2 border rounded-lg outline-none focus:ring-1 focus:ring-black"
          value={affWA}
          onChange={e => setAffWA(e.target.value)}
          required
        />
        <input 
          placeholder="Cédula" 
          className="w-full p-2 border rounded-lg outline-none focus:ring-1 focus:ring-black"
          value={affID}
          onChange={e => setAffID(e.target.value)}
          required
        />
        <button 
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded-lg font-bold hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {loading ? 'Registrando...' : 'Registrar Afiliado'}
        </button>
      </form>
    )
  }

  return null
}
