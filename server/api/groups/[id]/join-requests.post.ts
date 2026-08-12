import { z } from 'zod'
import prisma from '../../../utils/prisma'
import { requireUser } from '../../../utils/session'

const schema = z.object({
  message: z.string().optional(),
})

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const rawId = getRouterParam(event, 'id')
  const groupId = Number(rawId)
  if (!rawId || Number.isNaN(groupId)) throw createError({ statusCode: 400, message: '無効なグループIDです' })

  const group = await prisma.group.findUnique({ where: { id: groupId } })
  if (!group) {
    throw createError({ statusCode: 404, message: 'グループが見つかりません' })
  }

  const existingMember = await prisma.groupMember.findUnique({
    where: { groupId_userId: { groupId, userId: user.id } },
  })
  if (existingMember) {
    throw createError({ statusCode: 409, message: 'すでにグループのメンバーです' })
  }

  const existingRequest = await prisma.groupJoinRequest.findUnique({
    where: { groupId_userId: { groupId, userId: user.id } },
  })
  if (existingRequest?.status === 'PENDING') {
    throw createError({ statusCode: 409, message: '承認待ちの申請が既に存在します' })
  }

  const body = await readBody(event)
  const result = schema.safeParse(body)
  if (!result.success) {
    throw createError({ statusCode: 400, message: result.error.issues[0].message })
  }

  const request = await prisma.groupJoinRequest.create({
    data: {
      groupId,
      userId: user.id,
      message: result.data.message,
    },
    select: { id: true, status: true, createdAt: true },
  })

  return request
})
