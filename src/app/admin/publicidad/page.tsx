import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import DownloadButton from '@/components/DownloadButton'

export const dynamic = 'force-dynamic'

export default async function PublicidadPage() {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') redirect('/login')

  const activeRaffle = await prisma.raffle.findFirst({
    where: { status: 'ACTIVE' },
    include: { tickets: true }
  })

  if (!activeRaffle) {
    return (
      <main className="min-h-screen bg-gray-100 p-4 md:p-8 flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-sm text-center">
          <h2 className="text-xl font-bold mb-4">No hay rifa activa</h2>
          <Link href="/admin" className="text-blue-600 hover:underline">Volver al Panel</Link>
        </div>
      </main>
    )
  }

  // Create grid 00 to 99
  const gridNumbers = Array.from({ length: 100 }, (_, i) => i.toString().padStart(2, '0'))
  
  const soldCount = activeRaffle.tickets.filter(t => t.status === 'SOLD').length
  const reservedCount = activeRaffle.tickets.filter(t => t.status === 'RESERVED').length
  const availableCount = 100 - soldCount - reservedCount

  return (
    <main className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-xl sm:text-2xl font-black text-gray-900">Material Publicitario</h1>
          <Link href="/admin" className="text-purple-600 hover:text-purple-800 bg-purple-50 px-4 py-2 rounded-lg text-sm font-bold w-full sm:w-auto text-center transition-colors">
            &larr; Volver al Panel
          </Link>
        </div>

        {/* Controls / Info */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          <h2 className="text-xl font-bold mb-2">Promociona tu Rifa</h2>
          <p className="text-gray-500 text-sm mb-4">
            Elige el diseño que mejor se adapte a tu estrategia de hoy y descárgalo con un clic. Todos los diseños están optimizados para Historias de Instagram o WhatsApp.
          </p>
          <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 text-sm text-blue-900">
            <span className="font-bold block mb-1">💡 Tip de Marketing:</span>
            Alterna entre estos diseños. Usa el "VIP" para anunciar la rifa, "La Clásica" para mostrar qué números quedan, y "Urgencia" cuando queden pocos cupos.
          </div>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-start">
          
          {/* Card 1: La Clásica */}
          <div className="flex flex-col items-center gap-4">
            <div className="flex justify-center bg-gray-200 p-4 sm:p-6 rounded-3xl overflow-hidden shadow-inner w-full">
              <div 
                id="promo-classic" 
                className="bg-gradient-to-br from-indigo-900 via-purple-900 to-black w-full max-w-[320px] aspect-[9/16] rounded-3xl shadow-2xl overflow-hidden flex flex-col relative"
              >
                {/* Decorative elements */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                  <div className="absolute -top-20 -right-20 w-64 h-64 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-50"></div>
                  <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-50"></div>
                </div>

                <div className="relative z-10 flex flex-col h-full p-5 text-white">
                  <div className="text-center mb-4 mt-2 flex flex-col items-center">
                    <img src="/logo.png" alt="Logo" className="h-12 w-auto object-contain mb-3" crossOrigin="anonymous" />
                    <div className="inline-block bg-yellow-400 text-yellow-950 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-2 shadow-lg">
                      ¡Gran Sorteo!
                    </div>
                    <h2 className="text-2xl font-black leading-tight bg-clip-text text-transparent bg-gradient-to-r from-yellow-200 to-yellow-500">
                      {activeRaffle.name}
                    </h2>
                    <div className="text-xl font-bold mt-1 text-white/90">
                      {activeRaffle.price.toLocaleString()}
                    </div>
                  </div>

                  <div className="mb-4 bg-white/10 p-3 rounded-2xl backdrop-blur-sm border border-white/10">
                    <div className="flex justify-between text-[10px] font-bold mb-2 uppercase tracking-wide">
                      <span className="text-green-400">{soldCount} Vendidos</span>
                      <span className="text-yellow-400">{availableCount} Disponibles</span>
                    </div>
                    <div className="h-2 w-full bg-black/50 rounded-full overflow-hidden flex">
                      <div className="h-full bg-green-500" style={{ width: `${soldCount}%` }}></div>
                      <div className="h-full bg-yellow-500" style={{ width: `${reservedCount}%` }}></div>
                    </div>
                  </div>

                  <div className="flex-1 flex flex-col justify-center mb-4">
                    <div className="grid grid-cols-10 gap-1 p-2 sm:p-3 bg-white/5 rounded-xl backdrop-blur-md border border-white/10">
                      {gridNumbers.map((num) => {
                        const ticket = activeRaffle.tickets.find(t => t.number === num)
                        let isReserved = false
                        let isSold = false
                        if (ticket) {
                          if (ticket.status === 'SOLD') isSold = true
                          if (ticket.status === 'RESERVED') isReserved = true
                        }
                        let bgClass = "bg-white/20 text-white"
                        if (isSold) bgClass = "bg-green-500 text-white font-bold opacity-80"
                        else if (isReserved) bgClass = "bg-yellow-500 text-white font-bold opacity-80"

                        return (
                          <div key={num} className={`aspect-square rounded flex items-center justify-center text-[7px] ${bgClass}`}>
                            {isSold ? '✓' : isReserved ? '⏳' : num}
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  <div className="text-center mt-auto pb-2">
                    <div className="text-sm font-black text-yellow-400 mb-0.5">¡No te quedes sin el tuyo!</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="w-full text-center">
              <h3 className="font-bold mb-3 text-gray-800">1. La Clásica</h3>
              <DownloadButton targetId="promo-classic" fileName={`Clasica-${activeRaffle.name.replace(/\s+/g, '-')}.png`} />
            </div>
          </div>

          {/* Card 2: Urgencia Minimalista */}
          <div className="flex flex-col items-center gap-4">
            <div className="flex justify-center bg-gray-200 p-4 sm:p-6 rounded-3xl overflow-hidden shadow-inner w-full">
              <div 
                id="promo-fomo" 
                className="bg-gradient-to-br from-red-600 via-rose-600 to-orange-600 w-full max-w-[320px] aspect-[9/16] rounded-3xl shadow-2xl overflow-hidden flex flex-col relative"
              >
                <div className="absolute inset-0 bg-black/10 mix-blend-multiply"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-red-400 rounded-full mix-blend-screen filter blur-3xl opacity-50"></div>
                
                <div className="relative z-10 flex flex-col h-full p-6 text-white items-center justify-between text-center">
                  <div className="mt-6">
                    <img src="/logo.png" alt="Logo" className="h-16 w-auto object-contain mb-6 mx-auto drop-shadow-md" crossOrigin="anonymous" />
                    <h2 className="text-2xl font-black leading-tight drop-shadow-md">
                      {activeRaffle.name}
                    </h2>
                  </div>

                  <div className="flex flex-col items-center justify-center my-auto w-full">
                    <div className="text-yellow-300 font-black text-lg mb-3 tracking-widest uppercase drop-shadow-md">¡Últimos Cupos!</div>
                    <div className="bg-white text-red-600 rounded-full w-44 h-44 flex flex-col items-center justify-center shadow-2xl border-8 border-red-200/30">
                      <span className="text-xs font-bold uppercase text-red-400">Solo Quedan</span>
                      <span className="text-6xl font-black leading-none my-1 tracking-tighter">{availableCount}</span>
                      <span className="text-xs font-bold uppercase text-red-400">Números</span>
                    </div>
                  </div>

                  <div className="mb-6">
                    <div className="text-2xl font-black text-white drop-shadow-lg mb-4">
                      {activeRaffle.price.toLocaleString()}
                    </div>
                    <div className="text-xs text-white mt-2 font-bold uppercase bg-black/30 px-5 py-3 rounded-full inline-block backdrop-blur-sm border border-white/20">
                      ¡Asegura el tuyo ya!
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="w-full text-center">
              <h3 className="font-bold mb-3 text-gray-800">2. Urgencia (Sin Números)</h3>
              <DownloadButton targetId="promo-fomo" fileName={`Urgencia-${activeRaffle.name.replace(/\s+/g, '-')}.png`} />
            </div>
          </div>

          {/* Card 3: Ticket Dorado VIP */}
          <div className="flex flex-col items-center gap-4">
            <div className="flex justify-center bg-gray-200 p-4 sm:p-6 rounded-3xl overflow-hidden shadow-inner w-full">
              <div 
                id="promo-vip" 
                className="bg-gradient-to-tr from-yellow-900 via-neutral-900 to-yellow-800 w-full max-w-[320px] aspect-[9/16] rounded-3xl shadow-2xl overflow-hidden flex flex-col relative"
              >
                <div className="absolute inset-4 border border-yellow-500/30 rounded-2xl pointer-events-none"></div>
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 mix-blend-overlay"></div>

                <div className="relative z-10 flex flex-col h-full p-8 text-yellow-500 items-center justify-between text-center">
                  <div className="mt-6">
                    <img src="/logo.png" alt="Logo" className="h-16 w-auto object-contain mb-8 mx-auto" crossOrigin="anonymous" />
                    <div className="tracking-[0.2em] uppercase text-[10px] font-black text-yellow-600 mb-2">Sorteo Especial</div>
                    <h2 className="text-2xl font-black leading-tight bg-clip-text text-transparent bg-gradient-to-b from-yellow-200 to-yellow-600">
                      {activeRaffle.name}
                    </h2>
                  </div>

                  <div className="py-8 w-full border-y border-yellow-500/20 my-auto">
                    <div className="text-[10px] uppercase tracking-widest text-yellow-600 mb-2 font-bold">Valor del Ticket</div>
                    <div className="text-3xl font-black text-yellow-400 tracking-tight drop-shadow-[0_0_15px_rgba(250,204,21,0.2)]">
                      ${activeRaffle.price.toLocaleString()}
                    </div>
                  </div>

                  <div className="mb-6 w-full">
                    {activeRaffle.drawDate && (
                      <div className="mb-6">
                        <div className="text-[10px] uppercase tracking-widest text-yellow-700 font-bold mb-1">Fecha de Sorteo</div>
                        <div className="text-base font-bold text-yellow-300">{activeRaffle.drawDate}</div>
                      </div>
                    )}
                    <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black font-black uppercase tracking-wider py-3 px-6 rounded-xl text-xs w-full shadow-[0_4px_14px_0_rgba(234,179,8,0.39)]">
                      Comprar Boleto
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="w-full text-center">
              <h3 className="font-bold mb-3 text-gray-800">3. El Ticket VIP</h3>
              <DownloadButton targetId="promo-vip" fileName={`VIP-${activeRaffle.name.replace(/\s+/g, '-')}.png`} />
            </div>
          </div>

        </div>
      </div>
    </main>
  )
}
