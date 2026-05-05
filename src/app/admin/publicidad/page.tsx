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

  const soldCount = activeRaffle.tickets.filter(t => t.status === 'SOLD' || t.status === 'LOCKED').length
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
          <p className="text-gray-500 text-sm">
            Elige el diseño que mejor se adapte a tu estrategia de hoy y descárgalo con un clic. Todos los diseños están optimizados para Historias de Instagram o WhatsApp.
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-start">

          {/* Card 0: Estilo Página Principal */}
          <div className="flex flex-col items-center gap-4 md:col-span-2 lg:col-span-3">
            <div className="w-full bg-white p-4 rounded-2xl shadow-sm border border-gray-200">
              <h3 className="font-bold text-gray-800 mb-1">0. Estilo Página Principal</h3>
              <p className="text-gray-500 text-xs mb-4">El diseño limpio de la web, con los colores originales y todos los números visibles.</p>
              <div className="flex flex-col sm:flex-row gap-6 items-start">
                {/* Card preview */}
                <div className="flex justify-center bg-gray-50 p-6 rounded-2xl border border-gray-100 shadow-inner flex-shrink-0 mx-auto sm:mx-0">
                  <div
                    id="promo-main"
                    className="bg-[#F5F2EE] w-full max-w-[340px] aspect-[9/16] rounded-2xl overflow-hidden flex flex-col relative shadow-xl"
                  >
                    {/* Header */}
                    <div className="flex flex-col items-center pt-5 pb-3 px-4 bg-[#F5F2EE]">
                      <img src="/logo.png" alt="Logo" className="h-8 w-auto object-contain mb-2" crossOrigin="anonymous" />
                      <h2 className="text-lg font-black text-gray-900 text-center leading-tight">
                        {activeRaffle.name}
                      </h2>
                      {activeRaffle.drawDate && (
                        <div className="mt-1 bg-gray-200 px-2 py-0.5 rounded-full text-[10px] font-semibold text-gray-600">
                          Sorteo: {activeRaffle.drawDate}
                        </div>
                      )}
                    </div>

                    {/* Number grid */}
                    <div className="flex-1 px-4 pb-4">
                      <div className="grid grid-cols-10 gap-1">
                        {Array.from({ length: 100 }, (_, i) => i.toString().padStart(2, '0')).map((num) => {
                          const ticket = activeRaffle.tickets.find(t => t.number === num)
                          let cellClass = 'bg-[#E9E5E0] text-gray-800'
                          const isSoldOrReserved = ticket?.status === 'SOLD' || ticket?.status === 'RESERVED'
                          if (isSoldOrReserved) cellClass = 'bg-red-500 text-white'
                          return (
                            <div
                              key={num}
                              className={`aspect-square rounded flex items-center justify-center font-bold text-[8px] ${cellClass}`}
                            >
                              {isSoldOrReserved ? '×' : num}
                            </div>
                          )
                        })}
                      </div>

                      {/* Progress bar */}
                      <div className="mt-4 mb-1">
                        <div className="flex justify-between text-[9px] font-bold mb-1 text-gray-600 uppercase tracking-wide">
                          <span className="text-red-500">{soldCount + reservedCount} Vendidos</span>
                          <span className="text-gray-500">{availableCount} Libres</span>
                        </div>
                        <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden flex">
                          <div className="h-full bg-red-500 transition-all" style={{ width: `${soldCount + reservedCount}%` }}></div>
                        </div>
                      </div>

                      {/* Price */}
                      <div className="text-center mt-3">
                        <div className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">Precio por número</div>
                        <div className="text-xl font-black text-gray-900">${activeRaffle.price.toLocaleString()}</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex-1 flex flex-col gap-3 w-full">
                  <p className="text-gray-600 text-sm">
                    Este diseño replica exactamente la página principal de la rifa.
                    Es ideal para publicarlo tal cual — el cliente ve los números disponibles de un vistazo y entiende perfectamente el sistema.
                  </p>
                  <DownloadButton targetId="promo-main" fileName={`Principal-${activeRaffle.name.replace(/\s+/g, '-')}.png`} />
                </div>
              </div>
            </div>
          </div>


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
                    <h2 className="text-xl font-black leading-tight bg-clip-text text-transparent bg-gradient-to-r from-yellow-200 to-yellow-500">
                      {activeRaffle.name}
                    </h2>
                    <div className="text-xl font-bold mt-1 text-white/90">
                      ${activeRaffle.price.toLocaleString()}
                    </div>
                  </div>

                  <div className="mb-4 bg-white/10 p-3 rounded-2xl backdrop-blur-sm border border-white/10">
                    <div className="flex justify-between text-[10px] font-bold mb-2 uppercase tracking-wide">
                      <span className="text-green-400">{soldCount + reservedCount} Vendidos</span>
                      <span className="text-yellow-400">{availableCount} Disponibles</span>
                    </div>
                    <div className="h-2 w-full bg-black/50 rounded-full overflow-hidden flex">
                      <div className="h-full bg-green-500" style={{ width: `${soldCount + reservedCount}%` }}></div>
                    </div>
                  </div>

                  <div className="flex-1 flex flex-col justify-center mb-4">
                    <div className="grid grid-cols-10 gap-1 p-2 sm:p-3 bg-white/5 rounded-xl backdrop-blur-md border border-white/10">
                      {gridNumbers.map((num) => {
                        const ticket = activeRaffle.tickets.find(t => t.number === num)
                        let isSoldOrReserved = false
                        if (ticket) {
                          if (ticket.status === 'SOLD' || ticket.status === 'RESERVED') isSoldOrReserved = true
                        }
                        let bgClass = "bg-white/20 text-white"
                        if (isSoldOrReserved) bgClass = "bg-green-500 text-white font-bold opacity-80"

                        return (
                          <div key={num} className={`aspect-square rounded flex items-center justify-center text-[7px] ${bgClass}`}>
                            {isSoldOrReserved ? '✓' : num}
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
                      ${activeRaffle.price.toLocaleString()}
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

        {/* Affiliate Recruitment Section */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 mt-12">
          <h2 className="text-xl font-bold mb-2">Recluta Afiliados</h2>
          <p className="text-gray-500 text-sm mb-6">
            Usa estas imágenes para invitar a otras personas a vender por ti y ganar comisiones.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            
            {/* Affiliate Promo 1: Dinero Extra */}
            <div className="flex flex-col items-center gap-4">
              <div className="flex justify-center bg-gray-200 p-4 sm:p-6 rounded-3xl overflow-hidden shadow-inner w-full">
                <div
                  id="promo-aff-1"
                  className="bg-gradient-to-br from-emerald-600 via-green-500 to-teal-700 w-full max-w-[320px] aspect-[9/16] rounded-3xl shadow-2xl overflow-hidden flex flex-col relative"
                >
                  <div className="absolute inset-0 bg-black/10 mix-blend-multiply"></div>
                  <div className="relative z-10 flex flex-col h-full p-6 text-white items-center justify-center text-center">
                    <div className="mb-8">
                      <div className="bg-white text-emerald-600 font-black px-4 py-1 rounded-full text-sm uppercase tracking-widest shadow-lg inline-block mb-6">Oportunidad</div>
                      <h2 className="text-4xl font-black leading-tight drop-shadow-md mb-2">
                        ¿Quieres<br/>ganar dinero<br/>extra?
                      </h2>
                    </div>
                    
                    <div className="bg-white/20 p-6 rounded-2xl backdrop-blur-sm border border-white/30 w-full my-4">
                      <div className="text-sm font-bold uppercase tracking-wider mb-2 text-green-100">Gana el</div>
                      <div className="text-6xl font-black text-white drop-shadow-lg mb-1">{activeRaffle.commissionPct}%</div>
                      <div className="text-sm font-bold text-green-100 uppercase tracking-widest">De Comisión</div>
                    </div>

                    <div className="mt-8 text-center">
                      <p className="text-lg font-bold mb-2">Por cada número que vendas</p>
                      <p className="text-sm text-green-100 font-medium">Vende desde tu celular sin invertir nada.</p>
                      <div className="mt-6 bg-black text-white px-6 py-3 rounded-xl font-bold uppercase tracking-wider text-sm shadow-xl inline-block">
                        ¡Escríbeme!
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="w-full text-center">
                <h3 className="font-bold mb-3 text-gray-800">Gana Dinero</h3>
                <DownloadButton targetId="promo-aff-1" fileName={`Afiliado-Gana-${activeRaffle.name.replace(/\s+/g, '-')}.png`} />
              </div>
            </div>

            {/* Affiliate Promo 2: Equipo */}
            <div className="flex flex-col items-center gap-4">
              <div className="flex justify-center bg-gray-200 p-4 sm:p-6 rounded-3xl overflow-hidden shadow-inner w-full">
                <div
                  id="promo-aff-2"
                  className="bg-white w-full max-w-[320px] aspect-[9/16] rounded-3xl shadow-2xl overflow-hidden flex flex-col relative"
                >
                  <div className="absolute top-0 right-0 w-40 h-40 bg-blue-100 rounded-bl-full -mr-10 -mt-10"></div>
                  <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-600 rounded-tr-full mix-blend-multiply opacity-5"></div>
                  
                  <div className="relative z-10 flex flex-col h-full p-8 text-gray-800 items-center justify-between text-center">
                    <div className="mt-4">
                      <img src="/logo.png" alt="Logo" className="h-12 w-auto object-contain mb-6 mx-auto" crossOrigin="anonymous" />
                      <h2 className="text-3xl font-black leading-tight text-gray-900">
                        Únete a<br/><span className="text-blue-600">nuestro<br/>equipo</span>
                      </h2>
                    </div>

                    <div className="w-full text-left space-y-4 my-8">
                      <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl border border-gray-100">
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-lg">📱</div>
                        <div className="text-sm font-bold text-gray-700">Vende desde tu WhatsApp</div>
                      </div>
                      <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl border border-gray-100">
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-lg">💸</div>
                        <div className="text-sm font-bold text-gray-700">Gana {activeRaffle.commissionPct}% de comisión</div>
                      </div>
                      <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl border border-gray-100">
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-lg">🔗</div>
                        <div className="text-sm font-bold text-gray-700">Tu propio enlace de ventas</div>
                      </div>
                    </div>

                    <div className="mb-4">
                      <div className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-3">Requisitos</div>
                      <div className="flex gap-2 justify-center">
                        <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-semibold">Tener WhatsApp</span>
                        <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-semibold">Cero Inversión</span>
                      </div>
                    </div>

                    <div className="mt-4 w-full bg-blue-600 text-white py-3 rounded-xl font-bold uppercase tracking-wider text-sm shadow-lg">
                      Solicitar Ingreso
                    </div>
                  </div>
                </div>
              </div>
              <div className="w-full text-center">
                <h3 className="font-bold mb-3 text-gray-800">Únete al Equipo</h3>
                <DownloadButton targetId="promo-aff-2" fileName={`Afiliado-Unete-${activeRaffle.name.replace(/\s+/g, '-')}.png`} />
              </div>
            </div>

          </div>
        </div>
      </div>
    </main>
  )
}
