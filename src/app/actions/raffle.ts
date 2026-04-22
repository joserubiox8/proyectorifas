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

export async function createRaffle(data: { name: string, price: number, commissionPct: number }) {
  try {
    // Generate numbers 000 to 999
    const numbers = Array.from({ length: 1000 }, (_, i) => i.toString().padStart(3, '0'))
    
    // Shuffle numbers once to guarantee randomness but sequential assignment
    const shuffledNumbers = shuffleArray(numbers)

    const raffle = await prisma.raffle.create({
      data: {
        name: data.name,
        price: data.price,
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
    await prisma.raffle.delete({
      where: { id }
    })
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
