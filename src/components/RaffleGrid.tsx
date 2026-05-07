'use client'

import { useState, useEffect } from 'react'
import { reserveTickets } from '@/app/actions/reservation'
import { toggleFakeSold } from '@/app/actions/grid'
import { useRouter } from 'next/navigation'

type TicketData = {
  number: string
  status: string
  expiresAt: Date | null
}

export default function RaffleGrid({
  raffleId,
  price,
  tickets,
  isAdminView
}: {
  raffleId: string
  price: number
  tickets: TicketData[]
  isAdminView?: boolean
}) {
  const [selected, setSelected] = useState<string[]>([])
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const ref = urlParams.get('ref')
    if (ref) {
      localStorage.setItem('affiliate_ref', ref)
    }
  }, [])

  // Generate 00 to 99
  const gridNumbers = Array.from({ length: 100 }, (_, i) => i.toString().padStart(2, '0'))

  const handleSelect = async (num: string, status: string) => {
    if (isAdminView) {
      if (status === 'AVAILABLE' || status === 'LOCKED') {
        // Toggle locked status
        await toggleFakeSold(raffleId, num)
      }
      return
    }

    if (status === 'SOLD' || status === 'LOCKED') return
    if (status === 'RESERVED') return

    if (selected.includes(num)) {
      setSelected(selected.filter(n => n !== num))
    } else {
      if (selected.length >= 3) {
        setError('Máximo 3 números por compra')
        return
      }
      setError('')
      setSelected([...selected, num])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (selected.length === 0) {
      setError('Debes seleccionar al menos un número.')
      return
    }
    if (!name.trim() || !phone.trim()) {
      setError('Por favor, ingresa tu nombre y WhatsApp.')
      return
    }

    setLoading(true)
    setError('')

    // Check for refCode in URL or localStorage
    const urlParams = new URLSearchParams(window.location.search)
    let ref = urlParams.get('ref')
    if (!ref) {
      ref = localStorage.getItem('affiliate_ref')
    }

    const res = await reserveTickets({
      raffleId,
      numbers: selected,
      customerName: name,
      customerPhone: phone,
      affiliateRefCode: ref || undefined
    })

    if (res.success && res.order) {
      router.push(`/order/${res.order.id}`)
    } else {
      setError(res.error || 'Error desconocido.')
      setLoading(false)
    }
  }

  const now = new Date()

  return (
    <div className="w-full max-w-4xl mx-auto p-4 flex flex-col md:flex-row gap-8">
      {/* Grid */}
      <div className="flex-1">
        <h2 className="text-2xl font-bold mb-3 text-center">Selecciona tus números</h2>
        {/* Color legend */}
        <div className="flex justify-center gap-4 mb-4 text-xs font-semibold text-gray-600">
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded bg-[#E9E5E0] border border-gray-300"></div>
            Disponible
          </div>
          {isAdminView && (
            <>
              <div className="flex items-center gap-1.5">
                <div className="w-4 h-4 rounded bg-yellow-400"></div>
                Reservado
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-4 h-4 rounded bg-purple-500"></div>
                Bloqueado
              </div>
            </>
          )}
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded bg-red-500"></div>
            {isAdminView ? 'Pagado' : 'Vendido'}
          </div>
        </div>
        <div className="grid grid-cols-10 gap-2 sm:gap-3">
          {gridNumbers.map((num) => {
            const ticket = tickets.find(t => t.number === num)
            let isReserved = false
            let isSold = false
            let isLocked = false
            let isSelected = selected.includes(num)

            if (ticket) {
              if (ticket.status === 'SOLD') isSold = true
              if (ticket.status === 'RESERVED') isReserved = true
              if (ticket.status === 'LOCKED') isLocked = true
            }

            let bgClass = "bg-[#E9E5E0] hover:bg-gray-300 text-gray-800"
            if (isSold || (!isAdminView && (isReserved || isLocked))) {
              bgClass = "bg-red-500 text-white cursor-not-allowed relative"
            } else if (isAdminView && isReserved) {
              bgClass = "bg-yellow-400 text-yellow-900 cursor-not-allowed"
            } else if (isAdminView && isLocked) {
              bgClass = "bg-purple-500 text-white cursor-pointer hover:bg-purple-600 transition-colors"
            } else if (isSelected) {
              bgClass = "bg-blue-600 text-white ring-2 ring-blue-300 shadow-lg scale-110 transition-transform"
            }

            return (
              <button
                key={num}
                onClick={() => handleSelect(num, ticket?.status || 'AVAILABLE')}
                className={`
                  aspect-square rounded-lg flex items-center justify-center font-bold text-sm sm:text-lg 
                  transition-all duration-200
                  ${bgClass}
                `}
                disabled={isAdminView ? (isSold || isReserved) : (isSold || isReserved || isLocked)}
              >
                {(isSold || (!isAdminView && (isReserved || isLocked))) && (
                  <span className="absolute text-4xl text-white/50">&times;</span>
                )}
                <span className="relative z-10">{num}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Form */}
      {!isAdminView && (
        <div className="w-full md:w-80 bg-white p-6 rounded-2xl shadow-lg border border-gray-100 h-fit sticky top-4">
          <h3 className="text-xl font-bold mb-4">Tu Reserva</h3>

          <div className="mb-6">
            <p className="text-sm text-gray-500 mb-2">Números seleccionados:</p>
          <div className="flex flex-wrap gap-2 mb-2">
            {selected.length === 0 ? (
              <span className="text-gray-400 italic">Ninguno</span>
            ) : (
              selected.map(n => (
                <span key={n} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-bold">
                  {n}
                </span>
              ))
            )}
          </div>
          {selected.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex justify-between items-center text-lg font-bold">
                <span>Total:</span>
                <span>{(price * selected.length).toLocaleString('es-CO')}</span>
              </div>
            </div>
          )}
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo</label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              placeholder="Juan Pérez"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp</label>
            <input
              type="tel"
              required
              maxLength={10}
              pattern="[0-9]*"
              value={phone}
              onChange={e => setPhone(e.target.value.replace(/\D/g, ''))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              placeholder="3001234567"
            />
          </div>
          <button
            type="submit"
            disabled={selected.length === 0 || loading}
            className="w-full bg-black text-white font-bold py-3 px-4 rounded-xl hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Procesando...' : 'Reservar y Pagar'}
          </button>
          <p className="text-xs text-center text-gray-500 mt-2">
            Tus números quedarán reservados hasta que confirmemos tu pago.
          </p>
        </form>
        </div>
      )}
    </div>
  )
}
