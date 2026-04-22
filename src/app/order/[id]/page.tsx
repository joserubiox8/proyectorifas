import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import DownloadButton from '@/components/DownloadButton'

export const dynamic = 'force-dynamic'

export default async function OrderPage(props: { params: Promise<{ id: string }> }) {
  // Await the params according to Next.js 15+ dynamic APIs (it's best practice even in 14 sometimes)
  const orderId = (await props.params).id

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      tickets: {
        include: { secondaries: true }
      }
    }
  })

  if (!order) return notFound()

  const numbers = order.tickets.map(t => t.number).join(', ')
  const secondaryNumbersList = order.tickets.map(t => t.secondaries.map(s => s.number).join(', ')).join(' | ')
  const message = `Hola, mi nombre es ${order.customerName} y reservé los números ${numbers}. Mis números adicionales son: ${secondaryNumbersList}. Mi comprobante es ${order.receiptCode}`
  const encodedMessage = encodeURIComponent(message)
  
  // Use environment variables for admin contact
  const adminWhatsApp = process.env.NEXT_PUBLIC_ADMIN_WHATSAPP || '573000000000' 
  const waLink = `https://wa.me/${adminWhatsApp}?text=${encodedMessage}`

  const nequi = process.env.NEXT_PUBLIC_NEQUI || '300 000 0000'
  const bancolombia = process.env.NEXT_PUBLIC_BANCOLOMBIA_AHORROS || '123-456789-00'

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl overflow-hidden flex flex-col gap-4 bg-transparent shadow-none pb-8">
        
        {/* Receipt Card to Capture */}
        <div id="receipt-card" className="bg-white rounded-3xl overflow-hidden shadow-xl border border-gray-100">
          <div className="bg-yellow-400 p-6 text-center">
            <h1 className="text-2xl font-black text-yellow-900 mb-2">¡Reserva Exitosa!</h1>
            <p className="text-yellow-800 text-sm">Transfiere ahora para asegurar tus números.</p>
          </div>

          <div className="p-6 pb-2">
          <div className="mb-6 bg-gray-50 rounded-xl p-4 border border-gray-100">
            <div className="flex justify-between mb-2">
              <span className="text-gray-500">Comprobante</span>
              <span className="font-mono font-bold">{order.receiptCode}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-500">Números</span>
              <span className="font-bold">{numbers}</span>
            </div>
            
            <div className="mb-2 pt-2 border-t border-gray-100">
              <span className="text-gray-500 block mb-1">Tus 10 números adicionales por cada principal:</span>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {order.tickets.map(ticket => (
                  <div key={ticket.id} className="bg-white p-2 rounded border border-gray-200">
                    <span className="font-black text-red-600 block mb-1">#{ticket.number}</span>
                    <span className="font-mono text-xs text-gray-600 break-words">
                      {ticket.secondaries.map(s => s.number).join(', ')}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-between pt-2 border-t border-gray-200 mt-2">
              <span className="text-gray-500">Total a pagar</span>
              <span className="font-black text-xl">{order.totalAmount.toLocaleString('es-CO')} COP</span>
            </div>
          </div>

          <div className="mb-6 space-y-3">
            <h3 className="font-bold text-gray-900">Instrucciones de Pago:</h3>
            <div className="bg-blue-50 text-blue-900 p-4 rounded-xl text-sm space-y-2">
              <p>1. Realiza la transferencia a cualquiera de estas cuentas:</p>
              <ul className="list-disc pl-5 font-medium">
                <li>Nequi: {nequi}</li>
                <li>Bancolombia (Ahorros): {bancolombia}</li>
              </ul>
              <p>2. Guarda el comprobante de la transferencia.</p>
              <p>3. Envíanos el comprobante por WhatsApp presionando el botón abajo.</p>
            </div>
            </div>
          </div>
        </div>

        <div className="px-1 flex flex-col gap-3">
          <DownloadButton targetId="receipt-card" fileName={`Comprobante-${order.receiptCode}.png`} />
          
          <a 
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 bg-[#25D366] text-white font-bold py-4 px-4 rounded-xl hover:bg-[#128C7E] transition-colors shadow-lg shadow-green-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
              <path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.729.729 0 0 0-.529.247c-.182.198-.691.677-.691 1.654 0 .977.71 1.916.81 2.049.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z"/>
            </svg>
            Enviar Comprobante
          </a>

          <div className="mt-2 text-center">
             <Link href="/" className="text-gray-500 hover:text-gray-800 text-sm font-medium">
               Volver al inicio
             </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
