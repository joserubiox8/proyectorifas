import RaffleGrid from '@/components/RaffleGrid'
import { getActiveRaffle } from '@/app/actions/raffle'

export const dynamic = 'force-dynamic'

export default async function Home() {
  const raffle = await getActiveRaffle()

  if (!raffle) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 bg-white rounded-2xl shadow-xl">
          <h1 className="text-3xl font-bold mb-4">No hay rifas activas</h1>
          <p className="text-gray-500">Por favor, vuelve más tarde.</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <img src="/logo.png" alt="Logo de la Rifa" className="h-24 md:h-32 w-auto mx-auto mb-6 object-contain" />
          <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight text-gray-900">
            {raffle.name}
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Con cada número principal, te llevas <span className="font-bold text-black">10 números adicionales de 3 cifras</span>. ¡Reserva ya tu número!
          </p>
        </div>

        <RaffleGrid
          raffleId={raffle.id}
          price={raffle.price}
          tickets={raffle.tickets}
        />
      </div>
    </main>
  )
}
