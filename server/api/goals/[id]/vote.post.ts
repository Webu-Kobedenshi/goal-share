import prisma from '../../../utils/prisma'
import { requireUser } from '../../../utils/session'

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const rawId = getRouterParam(event, 'id')
  const goalId = Number(rawId)
  if (!rawId || Number.isNaN(goalId)) throw createError({ statusCode: 400, message: '無効な目標IDです' })

  const goal = await prisma.goal.findUnique({
    where: { id: goalId },
    select: { groupId: true },
  })
  if (!goal) {
    throw createError({ statusCode: 404, message: '目標が見つかりません' })
  }

  const membership = await prisma.groupMember.findUnique({
    where: { groupId_userId: { groupId: goal.groupId, userId: user.id } },
  })
  if (!membership) {
    throw createError({ statusCode: 403, message: 'このグループにアクセスできません' })
  }

  const existingVote = await prisma.vote.findUnique({
    where: { goalId_userId: { goalId, userId: user.id } },
  })

  if (existingVote) {
    await prisma.vote.delete({ where: { id: existingVote.id } })
    return { voted: false }
  } else {
    await prisma.vote.create({
      data: { goalId, userId: user.id },
    })
    return { voted: true }
  }
})
