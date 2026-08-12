import prisma from '../../../utils/prisma'
import { requireUser } from '../../../utils/session'

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const rawId = getRouterParam(event, 'id')
  const groupId = Number(rawId)
  if (!rawId || Number.isNaN(groupId)) throw createError({ statusCode: 400, message: '無効なグループIDです' })

  const membership = await prisma.groupMember.findUnique({
    where: { groupId_userId: { groupId, userId: user.id } },
  })
  if (!membership || membership.role !== 'OWNER') {
    throw createError({ statusCode: 403, message: 'この操作はグループのオーナーのみ可能です' })
  }

  const requests = await prisma.groupJoinRequest.findMany({
    where: { groupId },
    include: {
      user: { select: { id: true, name: true, email: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return requests.map((r) => ({
    id: r.id,
    groupId: r.groupId,
    userId: r.userId,
    applicantName: r.user.name,
    applicantEmail: r.user.email,
    message: r.message,
    status: r.status,
    createdAt: r.createdAt,
  }))
})
