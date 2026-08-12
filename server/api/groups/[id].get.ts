import prisma from '../../utils/prisma'
import { requireUser } from '../../utils/session'

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

  const group = await prisma.group.findUnique({
    where: { id: groupId },
    include: {
      members: {
        include: { user: { select: { id: true, name: true, email: true } } },
        orderBy: { joinedAt: 'asc' },
      },
      _count: { select: { goals: true } },
    },
  })
  if (!group) {
    throw createError({ statusCode: 404, message: 'グループが見つかりません' })
  }

  return {
    id: group.id,
    name: group.name,
    createdBy: group.createdBy,
    createdAt: group.createdAt,
    myRole: membership.role,
    members: group.members.map((m) => ({
      id: m.user.id,
      name: m.user.name,
      email: m.user.email,
      role: m.role,
      joinedAt: m.joinedAt,
    })),
    goalCount: group._count.goals,
  }
})
