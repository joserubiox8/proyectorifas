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

export async function cancelOrder(orderId: string) {
  try {
    await prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id: orderId },
        include: { tickets: { include: { secondaries: true } } }
      })

      if (!order) throw new Error('Orden no encontrada')

      const ticketIds = order.tickets.map(t => t.id)
      
      // Get all secondary numbers used in this order
      const secondaryNumbers = order.tickets.flatMap(t => t.secondaries.map(s => s.number))

      // 1. Delete secondary tickets
      await tx.secondaryTicket.deleteMany({
        where: { ticketId: { in: ticketIds } }
      })

      // 2. Free up the secondary number pool
      if (secondaryNumbers.length > 0 && order.tickets.length > 0) {
        // We assume all tickets in the order belong to the same raffle
        const raffleId = order.tickets[0].raffleId
        await tx.secondaryNumberPool.updateMany({
          where: { 
            raffleId,
            number: { in: secondaryNumbers }
          },
          data: { isUsed: false }
        })
      }

      // 3. Reset main tickets
      await tx.ticket.updateMany({
        where: { id: { in: ticketIds } },
        data: { 
          status: 'AVAILABLE',
          orderId: null,
          expiresAt: null
        }
      })

      // 4. Update order status
      await tx.order.update({
        where: { id: orderId },
        data: { status: 'REJECTED' }
      })
    })

    revalidatePath('/admin')
    revalidatePath('/')
    return { success: true }
  } catch (error: any) {
    console.error('Cancel error:', error)
    return { success: false, error: error.message || 'Error al cancelar la orden.' }
  }
}
