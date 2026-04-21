'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function approveOrder(orderId: string) {
  try {
    const result = await prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id: orderId },
        include: { tickets: true }
      })

      if (!order) throw new Error('Orden no encontrada')
      if (order.status === 'APPROVED') throw new Error('La orden ya fue aprobada')

      const ticketIds = order.tickets.map(t => t.id)
      
      // Update order status
      await tx.order.update({
        where: { id: orderId },
        data: { status: 'APPROVED' }
      })

      // Update tickets status to SOLD
      await tx.ticket.updateMany({
        where: { id: { in: ticketIds } },
        data: { status: 'SOLD' }
      })

      // We don't assign secondary numbers here anymore because they are assigned during reservation
      // to allow them to be displayed in the receipt screenshot.

      return true
    })

    revalidatePath('/admin')
    revalidatePath('/')
    return { success: true }
  } catch (error: any) {
    console.error('Approval error:', error)
    return { success: false, error: error.message || 'Error al aprobar la orden.' }
  }
}
