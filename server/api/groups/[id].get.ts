import prisma from '../../utils/prisma'
import { requireUser } from '../../utils/session'
import { parseIdParam } from '../../utils/validation'
import { requireGroupMember } from '../../utils/groupAccess'

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const groupId = parseIdParam(event, 'id', 'グループID')
  const membership = await requireGroupMember(groupId, user.id)

  const group = await prisma.group.findUnique({
    where: { id: groupId },
    include: {
      // メールアドレスは他のメンバーに見せない
      members: {
        include: { user: { select: { id: true, name: true } } },
        orderBy: { joinedAt: 'asc' }
      },
      _count: { select: { goals: true } }
    }
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
      role: m.role,
      joinedAt: m.joinedAt
    })),
    goalCount: group._count.goals
  }
})
