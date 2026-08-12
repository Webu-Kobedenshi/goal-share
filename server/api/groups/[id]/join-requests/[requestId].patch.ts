import { z } from 'zod'
import prisma from '../../../../utils/prisma'
import { requireUser } from '../../../../utils/session'

const schema = z.object({
  status: z.enum(['APPROVED', 'REJECTED']),
})

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const rawId = getRouterParam(event, 'id')
  const groupId = Number(rawId)
  const rawRid = getRouterParam(event, 'requestId')
  const requestId = Number(rawRid)
  if (!rawId || Number.isNaN(groupId)) throw createError({ statusCode: 400, message: '無効なグループIDです' })
  if (!rawRid || Number.isNaN(requestId)) throw createError({ statusCode: 400, message: '無効な申請IDです' })

  const membership = await prisma.groupMember.findUnique({
    where: { groupId_userId: { groupId, userId: user.id } },
  })
  if (!membership || membership.role !== 'OWNER') {
    throw createError({ statusCode: 403, message: 'この操作はグループのオーナーのみ可能です' })
  }

  const joinRequest = await prisma.groupJoinRequest.findUnique({
    where: { id: requestId },
  })
  if (!joinRequest || joinRequest.groupId !== groupId) {
    throw createError({ statusCode: 404, message: '申請が見つかりません' })
  }
  if (joinRequest.status !== 'PENDING') {
    throw createError({ statusCode: 409, message: 'この申請はすでに処理済みです' })
  }

  const body = await readBody(event)
  const result = schema.safeParse(body)
  if (!result.success) {
    throw createError({ statusCode: 400, message: result.error.issues[0].message })
  }

  const { status } = result.data

  const updated = await prisma.$transaction(async (tx) => {
    const req = await tx.groupJoinRequest.update({
      where: { id: requestId },
      data: { status },
    })

    if (status === 'APPROVED') {
      await tx.groupMember.create({
        data: {
          groupId,
          userId: joinRequest.userId,
          role: 'MEMBER',
        },
      })
    }

    return req
  })

  return {
    id: updated.id,
    status: updated.status,
  }
})
