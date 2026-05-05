'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function toggleFakeSold(raffleId: string, number: string) {
  try {
    const existingTicket = await prisma.ticket.findUnique({
      where: {
        raffleId_number: { raffleId, number }
      }
    })

    if (existingTicket) {
      if (existingTicket.status === 'SOLD' || existingTicket.status === 'RESERVED') {
        return { success: false, error: 'El número ya está vendido o reservado por un cliente real.' }
      }

      if (existingTicket.status === 'LOCKED') {
        // Unlock it
        if (existingTicket.orderId) {
          await prisma.ticket.update({
            where: { id: existingTicket.id },
            data: { status: 'AVAILABLE' }
          })
        } else {
          await prisma.ticket.delete({
            where: { id: existingTicket.id }
          })
        }
      } else if (existingTicket.status === 'AVAILABLE') {
        // Lock it
        await prisma.ticket.update({
          where: { id: existingTicket.id },
          data: { status: 'LOCKED' }
        })
      }
    } else {
      // Lock it
      await prisma.ticket.create({
        data: {
          raffleId,
          number,
          status: 'LOCKED'
        }
      })
    }

    revalidatePath('/')
    revalidatePath('/admin')
    revalidatePath('/admin/grilla')
    return { success: true }
  } catch (error) {
    console.error('Error toggling fake sold status:', error)
    return { success: false, error: 'Error al cambiar el estado del número.' }
  }
}
