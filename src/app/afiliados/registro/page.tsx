'use client'

import { useState } from 'react'
import { createAffiliate } from '@/app/actions/affiliate'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function AffiliateRegistration() {
  const [name, setName] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [idNumber, setIdNumber] = useState('')
  const [bank, setBank] = useState('Nequi')
  const [account, setAccount] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    // Auto-fill account with WhatsApp if not provided (common for Nequi/Daviplata)
    const finalAccount = account || whatsapp

    const res = await createAffiliate({ name, whatsapp, idNumber, bank, account: finalAccount })
    
    if (res.success) {
      setSuccess(true)
      setTimeout(() => {
        router.push('/afiliados')
      }, 3000)
    } else {
      setError(res.error || 'Ocurrió un error. Verifica tus datos.')
    }
    setLoading(false)
  }

  if (success) {
    return (
      <main className="min-h-screen bg-gray-50 py-12 px-4 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl overflow-hidden p-8 text-center border border-gray-100">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600 text-3xl">
            ✓
          </div>
          <h1 className="text-2xl font-black text-gray-900 mb-2">¡Registro Exitoso!</h1>
          <p className="text-gray-500 mb-6">Tu cuenta de afiliado ha sido creada. Ya puedes comenzar a ganar comisiones.</p>
          <p className="text-sm font-bold text-gray-400">Redirigiendo al panel...</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
        
        <div className="bg-black p-8 text-center">
          <h1 className="text-2xl font-black text-white mb-2">Únete como Afiliado</h1>
          <p className="text-gray-400 text-sm">Gana comisiones por cada boleta vendida con tu enlace único.</p>
        </div>

        <div className="p-8">
          {error && (
            <div className="mb-6 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 text-center font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Nombre Completo</label>
              <input 
                type="text" 
                required
                className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-black transition-all bg-gray-50 focus:bg-white"
                placeholder="Ej. Juan Pérez"
                value={name}
                onChange={e => setName(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Cédula</label>
              <input 
                type="number" 
                required
                className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-black transition-all bg-gray-50 focus:bg-white"
                placeholder="Esta será tu contraseña"
                value={idNumber}
                onChange={e => setIdNumber(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">WhatsApp</label>
              <input 
                type="number" 
                required
                className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-black transition-all bg-gray-50 focus:bg-white"
                placeholder="Este será tu usuario"
                value={whatsapp}
                onChange={e => setWhatsapp(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Banco</label>
                <select 
                  className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-black transition-all bg-gray-50 focus:bg-white"
                  value={bank}
                  onChange={e => setBank(e.target.value)}
                >
                  <option value="Nequi">Nequi</option>
                  <option value="Daviplata">Daviplata</option>
                  <option value="Bancolombia">Bancolombia</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Número de Cuenta</label>
                <input 
                  type="text" 
                  className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-black transition-all bg-gray-50 focus:bg-white"
                  placeholder="Igual a WhatsApp"
                  value={account}
                  onChange={e => setAccount(e.target.value)}
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white font-bold py-4 rounded-xl hover:bg-gray-800 transition-colors shadow-lg mt-6 disabled:opacity-50"
            >
              {loading ? 'Procesando...' : 'Registrarme Ahora'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">¿Ya eres afiliado?</p>
            <Link href="/afiliados" className="text-black font-bold text-sm hover:underline">
              Iniciar Sesión
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
