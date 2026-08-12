import { z } from 'zod'
import prisma from '../../../utils/prisma'
import { requireUser } from '../../../utils/session'

const schema = z.object({
  title: z.string().min(1, 'タイトルを入力してください'),
  description: z.string().optional(),
})

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const rawId = getRouterParam(event, 'id')
  const groupId = Number(rawId)
  if (!rawId || Number.isNaN(groupId)) throw createError({ statusCode: 400, message: '無効なグループIDです' })

  const membership = await prisma.groupMember.findUnique({
    where: { groupId_userId: { groupId, userId: user.id } },
  })
  if (!membership) {
    throw createError({ statusCode: 403, message: 'このグループにアクセスできません' })
  }

  const body = await readBody(event)
  const result = schema.safeParse(body)
  if (!result.success) {
    throw createError({ statusCode: 400, message: result.error.issues[0].message })
  }

  const goal = await prisma.goal.create({
    data: {
      groupId,
      createdBy: user.id,
      title: result.data.title,
      description: result.data.description,
      source: 'USER',
    },
    select: { id: true, title: true, description: true, createdAt: true },
  })

  return goal
})
