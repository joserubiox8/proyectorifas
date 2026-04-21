'use server'

import { prisma } from '@/lib/prisma'
import { encrypt } from '@/lib/auth'
import { cookies } from 'next/headers'

export async function login(whatsapp: string, idNumber: string) {
  // Hardcoded Admin
  if (whatsapp === 'admin' && idNumber === 'admin') {
    const session = await encrypt({ id: 'admin-1', role: 'ADMIN', name: 'Administrador' })
    const cookieStore = await cookies()
    cookieStore.set('session', session, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax' })
    return { success: true, redirect: '/admin' }
  }

  // Check Affiliates
  const affiliate = await prisma.affiliate.findUnique({
    where: { whatsapp }
  })

  if (!affiliate || affiliate.idNumber !== idNumber) {
    return { success: false, error: 'Credenciales inválidas' }
  }

  const session = await encrypt({ id: affiliate.id, role: 'AFFILIATE', name: affiliate.name })
  const cookieStore = await cookies()
  cookieStore.set('session', session, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax' })
  
  return { success: true, redirect: '/afiliados' }
}
