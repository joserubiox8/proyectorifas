'use client'

import { useState } from 'react'
import { login } from '@/app/actions/auth'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [whatsapp, setWhatsapp] = useState('')
  const [idNumber, setIdNumber] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    const res = await login(whatsapp, idNumber)
    if (res.success && res.redirect) {
      router.push(res.redirect)
    } else {
      setError(res.error || 'Error al iniciar sesión')
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-xl">
        <div className="text-center mb-6">
          <img src="/logo.png" alt="Logo" className="h-20 w-auto mx-auto mb-4 object-contain" />
          <h1 className="text-2xl font-bold">Iniciar Sesión</h1>
        </div>
        
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp (Usuario)</label>
            <input 
              type="text" 
              required
              value={whatsapp}
              onChange={e => setWhatsapp(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              placeholder="3001234567"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cédula (Contraseña)</label>
            <input 
              type="password" 
              required
              value={idNumber}
              onChange={e => setIdNumber(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              placeholder="1234567890"
            />
          </div>
          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white font-bold py-3 px-4 rounded-xl hover:bg-gray-800 disabled:opacity-50 transition-colors mt-4"
          >
            {loading ? 'Ingresando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </main>
  )
}
