'use server'

import prisma from '@/lib/prisma'
import { getSession } from '@/lib/session'
import { revalidatePath } from 'next/cache'

export async function submitScore(formData: FormData) {
  const session = await getSession()
  if (!session) {
    return { error: 'Not authenticated' }
  }

  const examId = formData.get('examId') as string
  const category = formData.get('category') as string
  const score = parseFloat(formData.get('score') as string)

  if (!examId || !category || isNaN(score)) {
    return { error: 'Missing required fields' }
  }

  try {
    await prisma.score.create({
      data: {
        score,
        category,
        examId,
        userId: session.userId as string,
      },
    })
    revalidatePath('/dashboard')
    return { success: true }
  } catch (error: any) {
    if (error.code === 'P2002') {
      return { error: 'You have already submitted a score for this exam.' }
    }
    return { error: 'Failed to submit score' }
  }
}

export async function seedExams() {
  const exams = await prisma.exam.findMany()
  if (exams.length === 0) {
    await prisma.exam.createMany({
      data: [
        { name: 'JKSSB FAA' },
        { name: 'JKSSB VLW' },
        { name: 'JKSSB Patwari' },
        { name: 'JKSSB JE Civil' },
        { name: 'NEET UG' },
        { name: 'JEE Main' }
      ]
    })
  }
}
