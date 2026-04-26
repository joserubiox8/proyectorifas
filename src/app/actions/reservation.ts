'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

function generateReceiptCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''
  for (let i = 0; i < 4; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export async function reserveTickets(data: {
  raffleId: string
  numbers: string[] // '00' to '99'
  customerName: string
  customerPhone: string
  affiliateRefCode?: string
}) {
  if (data.numbers.length < 1 || data.numbers.length > 5) {
    return { success: false, error: 'Debe seleccionar entre 1 y 5 números.' }
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const raffle = await tx.raffle.findUnique({ where: { id: data.raffleId } })
      if (!raffle || raffle.status !== 'ACTIVE') {
        throw new Error('La rifa no está activa.')
      }

      // Check if numbers are already taken or reserved by someone else
      // We read the existing tickets for these numbers
      const existingTickets = await tx.ticket.findMany({
        where: {
          raffleId: data.raffleId,
          number: { in: data.numbers }
        }
      })

      const now = new Date()

      for (const num of data.numbers) {
        const ticket = existingTickets.find((t) => t.number === num)
        if (ticket) {
          if (ticket.status === 'SOLD') {
            throw new Error(`El número ${num} ya fue vendido.`)
          }
          if (ticket.status === 'RESERVED') {
            throw new Error(`El número ${num} se encuentra reservado por otro usuario.`)
          }
        }
      }

      let affiliateId = null
      if (data.affiliateRefCode) {
        const affiliate = await tx.affiliate.findUnique({
          where: { refCode: data.affiliateRefCode }
        })
        if (affiliate) affiliateId = affiliate.id
      }

      // Generate a unique 4-char alphanumeric code
      let receiptCode = generateReceiptCode()
      let codeExists = await tx.order.findUnique({ where: { receiptCode } })
      while (codeExists) {
        receiptCode = generateReceiptCode()
        codeExists = await tx.order.findUnique({ where: { receiptCode } })
      }

      // Create the order
      const totalAmount = raffle.price * data.numbers.length
      const order = await tx.order.create({
        data: {
          customerName: data.customerName,
          customerPhone: data.customerPhone,
          receiptCode,
          totalAmount,
          affiliateId,
          status: 'PENDING'
        }
      })

      // Reserve the tickets
      // If a ticket existed but was expired/cancelled, we update it. If it didn't exist, we create it.
      const expiresAt = null // Reservations are now permanent until cancelled

      for (const num of data.numbers) {
        // Tomar 10 números secundarios del pool para cada número principal
        const pool = await tx.secondaryNumberPool.findMany({
          where: { raffleId: data.raffleId, isUsed: false },
          take: 10,
          orderBy: { id: 'asc' }
        })
        
        if (pool.length < 10) {
          throw new Error('No hay suficientes números secundarios disponibles.')
        }

        await tx.secondaryNumberPool.updateMany({
          where: { id: { in: pool.map(p => p.id) } },
          data: { isUsed: true }
        })

        const existing = existingTickets.find((t) => t.number === num)
        if (existing) {
          await tx.ticket.update({
            where: { id: existing.id },
            data: {
              status: 'RESERVED',
              expiresAt,
              orderId: order.id,
              secondaries: {
                create: pool.map(p => ({ number: p.number }))
              }
            }
          })
        } else {
          await tx.ticket.create({
            data: {
              number: num,
              status: 'RESERVED',
              expiresAt,
              raffleId: data.raffleId,
              orderId: order.id,
              secondaries: {
                create: pool.map(p => ({ number: p.number }))
              }
            }
          })
        }
      }

      return order
    })

    revalidatePath('/')
    return { success: true, order: result }
  } catch (error: any) {
    console.error('Reservation error:', error)
    return { success: false, error: error.message || 'Error al reservar los números.' }
  }
}
