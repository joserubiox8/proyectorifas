'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function createAffiliate(data: { name: string, whatsapp: string, idNumber: string, bank: string, account: string }) {
  try {
    // Generate a unique 4-5 char referral code
    const refCode = Math.random().toString(36).substring(7).toUpperCase()

    await prisma.affiliate.create({
      data: {
        ...data,
        refCode
      }
    })

    revalidatePath('/admin')
    return { success: true }
  } catch (error: any) {
    console.error('Error creating affiliate:', error)
    return { success: false, error: 'Error al crear afiliado. ¿Quizás el WhatsApp ya existe?' }
  }
}
