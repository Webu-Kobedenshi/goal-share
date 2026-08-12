import { z } from 'zod'
import prisma from '../../../utils/prisma'
import { requireUser } from '../../../utils/session'

const schema = z.object({
  emoji: z.string().min(1, '絵文字を指定してください'),
})

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

  const body = await readBody(event)
  const result = schema.safeParse(body)
  if (!result.success) {
    throw createError({ statusCode: 400, message: result.error.issues[0].message })
  }

  const { emoji } = result.data

  const existingReaction = await prisma.reaction.findUnique({
    where: { goalId_userId_emoji: { goalId, userId: user.id, emoji } },
  })

  if (existingReaction) {
    await prisma.reaction.delete({ where: { id: existingReaction.id } })
    return { reacted: false, emoji }
  } else {
    await prisma.reaction.create({
      data: { goalId, userId: user.id, emoji },
    })
    return { reacted: true, emoji }
  }
})
