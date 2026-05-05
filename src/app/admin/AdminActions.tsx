'use client'

import { useState } from 'react'
import { approveOrder, cancelOrder, toggleContacted } from '@/app/actions/approval'
import { createRaffle, deleteRaffle, updateRaffleName, updateRaffleDrawDate } from '@/app/actions/raffle'
import { createAffiliate, deleteAffiliate, toggleCommissionPaid, updateAffiliateBank } from '@/app/actions/affiliate'

export default function AdminActions({ action, id, isPaid, isContacted }: { action: string, id?: string, isPaid?: boolean, isContacted?: boolean }) {
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

  const handleCancel = async () => {
    if (!id || !confirm('¿Estás seguro de declinar esta reserva? Esto liberará los números y los pondrá disponibles nuevamente.')) return
    setLoading(true)
    const res = await cancelOrder(id)
    if (!res.success) {
      alert(res.error)
    }
    setLoading(false)
  }

  const handleToggleContacted = async () => {
    if (!id) return
    setLoading(true)
    const res = await toggleContacted(id, !isContacted)
    if (!res.success) alert(res.error)
    setLoading(false)
  }

  const handleEditDrawDate = async () => {
    if (!id) return
    const current = (document.getElementById(`draw-date-${id}`) as HTMLElement | null)?.dataset.date || ''
    const newDate = prompt('Ingresa la fecha del sorteo (ej. Sábado 10 de Mayo):\nDejar vacío para eliminar la fecha.', current)
    if (newDate === null) return // cancelled
    setLoading(true)
    const res = await updateRaffleDrawDate(id, newDate.trim() || null)
    if (!res.success) alert(res.error)
    setLoading(false)
  }

  const handleCreate = async () => {
    const name = prompt('Nombre de la Rifa (ej. Rifa Semanal 1):')
    if (!name) return
    const priceStr = prompt('Precio de cada número (COP):', '50000')
    if (!priceStr) return
    const commStr = prompt('Porcentaje de comisión (%):', '20')
    if (!commStr) return
    const drawDateStr = prompt('Fecha del sorteo (Opcional, ej. Sábado 25 de Octubre):', '')

    setLoading(true)
    const res = await createRaffle({
      name,
      price: parseInt(priceStr, 10),
      commissionPct: parseInt(commStr, 10),
      drawDate: drawDateStr || undefined
    })
    if (!res.success) alert(res.error)
    setLoading(false)
  }

  const handleDeleteRaffle = async () => {
    if (!id || !confirm('¿Estás seguro de ELIMINAR esta rifa por completo? Esta acción es irreversible y borrará los números generados.')) return
    setLoading(true)
    const res = await deleteRaffle(id)
    if (!res.success) alert(res.error)
    setLoading(false)
  }

  const handleEditRaffleName = async () => {
    if (!id) return
    const newName = prompt('Ingresa el nuevo nombre para la rifa:')
    if (!newName) return
    setLoading(true)
    const res = await updateRaffleName(id, newName)
    if (!res.success) alert(res.error)
    setLoading(false)
  }


  const [affName, setAffName] = useState('')
  const [affWA, setAffWA] = useState('')
  const [affID, setAffID] = useState('')
  const [affBank, setAffBank] = useState('Nequi')
  const [affAccount, setAffAccount] = useState('')

  const handleCreateAffiliate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const res = await createAffiliate({
      name: affName,
      whatsapp: affWA,
      idNumber: affID,
      bank: affBank,
      account: affAccount
    })
    if (res.success) {
      setAffName('')
      setAffWA('')
      setAffID('')
      setAffBank('Nequi')
      setAffAccount('')
    } else {
      alert(res.error)
    }
    setLoading(false)
  }

  const handleEditBank = async () => {
    if (!id) return
    const bank = prompt('Ingresa el nuevo banco (ej. Nequi, Daviplata, Bancolombia):')
    if (!bank) return
    const account = prompt('Ingresa el nuevo número de cuenta:')
    if (!account) return
    
    setLoading(true)
    const res = await updateAffiliateBank(id, bank, account)
    if (!res.success) alert(res.error)
    setLoading(false)
  }

  const handleDeleteAffiliate = async () => {
    if (!id || !confirm('¿Estás seguro de ELIMINAR este afiliado? Sus ventas se mantendrán pero perderán el vínculo.')) return
    setLoading(true)
    const res = await deleteAffiliate(id)
    if (!res.success) alert(res.error)
    setLoading(false)
  }

  const handleToggleCommission = async () => {
    if (!id || isPaid === undefined) return
    setLoading(true)
    const res = await toggleCommissionPaid(id, !isPaid)
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
        {loading ? 'Aprobando...' : 'Aprobar'}
      </button>
    )
  }

  if (action === 'cancel-order') {
    return (
      <button
        onClick={handleCancel}
        disabled={loading}
        title="Cancelar venta y liberar números"
        className="text-xs bg-red-50 text-red-600 hover:bg-red-100 px-3 py-1.5 rounded-lg font-bold transition-colors disabled:opacity-50 w-full text-center border border-red-100"
      >
        {loading ? 'Rechazando...' : 'Rechazar'}
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

  if (action === 'delete-raffle') {
    return (
      <button
        onClick={handleDeleteRaffle}
        disabled={loading}
        className="bg-red-100 hover:bg-red-200 text-red-700 px-4 py-2 rounded-lg font-bold text-sm disabled:opacity-50 transition-colors"
      >
        {loading ? '...' : 'Eliminar Rifa'}
      </button>
    )
  }

  if (action === 'edit-draw-date') {
    return (
      <button
        onClick={handleEditDrawDate}
        disabled={loading}
        className="text-gray-400 hover:text-blue-600 transition-colors ml-1 text-sm"
        title="Editar fecha del sorteo"
      >
        {loading ? '⏳' : '🗓️'}
      </button>
    )
  }

  if (action === 'edit-raffle-name') {
    return (
      <button
        onClick={handleEditRaffleName}
        disabled={loading}
        className="text-gray-400 hover:text-gray-800 transition-colors ml-2"
        title="Editar nombre"
      >
        ✏️
      </button>
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
        <div className="grid grid-cols-2 gap-2">
          <select 
            className="w-full p-2 border rounded-lg outline-none focus:ring-1 focus:ring-black bg-white"
            value={affBank}
            onChange={e => setAffBank(e.target.value)}
          >
            <option value="Nequi">Nequi</option>
            <option value="Daviplata">Daviplata</option>
            <option value="Bancolombia">Bancolombia</option>
          </select>
          <input
            placeholder="Número de Cuenta"
            className="w-full p-2 border rounded-lg outline-none focus:ring-1 focus:ring-black"
            value={affAccount}
            onChange={e => setAffAccount(e.target.value)}
            required
          />
        </div>
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

  if (action === 'delete-affiliate') {
    return (
      <button
        onClick={handleDeleteAffiliate}
        disabled={loading}
        className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-full transition-colors"
        title="Eliminar Afiliado"
      >
        🗑️
      </button>
    )
  }

  if (action === 'edit-affiliate-bank') {
    return (
      <button
        onClick={handleEditBank}
        disabled={loading}
        className="text-blue-500 hover:text-blue-700 hover:bg-blue-50 p-2 rounded-full transition-colors text-xs"
        title="Editar Banco"
      >
        ✏️ Banco
      </button>
    )
  }

  if (action === 'toggle-contacted') {
    return (
      <button
        onClick={handleToggleContacted}
        disabled={loading}
        title={isContacted ? 'Marcar como NO contactado' : 'Marcar como contactado'}
        className={`text-xs px-3 py-1.5 rounded-lg font-bold transition-colors border w-full text-center ${
          isContacted
            ? 'bg-green-100 text-green-700 border-green-200 hover:bg-green-200'
            : 'bg-red-50 text-red-600 border-red-100 hover:bg-red-100'
        }`}
      >
        {loading ? '...' : isContacted ? '✅ Contactado' : '❌ Sin contacto'}
      </button>
    )
  }

  if (action === 'toggle-commission') {
    return (
      <button
        onClick={handleToggleCommission}
        disabled={loading}
        className={`text-xs px-2 py-1 rounded font-bold transition-colors ${isPaid
          ? 'bg-green-100 text-green-700 hover:bg-green-200'
          : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
          }`}
        title={isPaid ? "Marcar como pendiente" : "Marcar como pagada"}
      >
        {loading ? '...' : isPaid ? '✅ Pagada' : '⏳ Pendiente'}
      </button>
    )
  }

  return null
}
