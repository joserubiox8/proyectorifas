'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

// Shuffle array using Fisher-Yates algorithm
function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array]
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[newArray[i], newArray[j]] = [newArray[j], newArray[i]]
  }
  return newArray
}

export async function createRaffle(data: { name: string, price: number, commissionPct: number, drawDate?: string }) {
  try {
    // Generate numbers 000 to 999
    const numbers = Array.from({ length: 1000 }, (_, i) => i.toString().padStart(3, '0'))
    
    // Shuffle numbers once to guarantee randomness but sequential assignment
    const shuffledNumbers = shuffleArray(numbers)

    const raffle = await prisma.raffle.create({
      data: {
        name: data.name,
        price: data.price,
        drawDate: data.drawDate || null,
        commissionPct: data.commissionPct,
        status: 'ACTIVE',
        secondaryPool: {
          create: shuffledNumbers.map((num) => ({
            number: num,
            isUsed: false
          }))
        }
      }
    })
    
    revalidatePath('/')
    revalidatePath('/admin')
    return { success: true, raffle }
  } catch (error) {
    console.error('Error creating raffle:', error)
    return { success: false, error: 'Failed to create raffle' }
  }
}

export async function getActiveRaffle() {
  return await prisma.raffle.findFirst({
    where: { status: 'ACTIVE' },
    include: {
      tickets: true
    }
  })
}

export async function deleteRaffle(id: string) {
  try {
    // 1. Encontrar todas las órdenes/recibos asociados a esta rifa
    const ordersToDelete = await prisma.order.findMany({
      where: {
        OR: [
          { tickets: { some: { raffleId: id } } },
          { tickets: { none: {} } }
        ]
      },
      select: { id: true }
    })
    
    const orderIds = ordersToDelete.map(o => o.id)

    // 2. Eliminar la rifa PRIMERO (limpia tickets y secondary pool por cascade para evitar errores de Foreign Key)
    await prisma.raffle.delete({
      where: { id }
    })

    // 3. Eliminar los recibos huérfanos
    if (orderIds.length > 0) {
      await prisma.order.deleteMany({
        where: { id: { in: orderIds } }
      })
    }
    revalidatePath('/')
    revalidatePath('/admin')
    return { success: true }
  } catch (error) {
    console.error('Error deleting raffle:', error)
    return { success: false, error: 'Error al eliminar la rifa.' }
  }
}

export async function updateRaffleName(id: string, name: string) {
  if (!name.trim()) return { success: false, error: 'El nombre no puede estar vacío.' }
  try {
    await prisma.raffle.update({
      where: { id },
      data: { name }
    })
    revalidatePath('/')
    revalidatePath('/admin')
    return { success: true }
  } catch (error) {
    console.error('Error updating raffle name:', error)
    return { success: false, error: 'Error al actualizar el nombre.' }
  }
}

export async function updateRaffleDrawDate(id: string, drawDate: string | null) {
  try {
    await prisma.raffle.update({
      where: { id },
      data: { drawDate }
    })
    revalidatePath('/')
    revalidatePath('/admin')
    revalidatePath('/admin/publicidad')
    return { success: true }
  } catch (error) {
    console.error('Error updating draw date:', error)
    return { success: false, error: 'Error al actualizar la fecha.' }
  }
}
