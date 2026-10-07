import prisma from '../utils/prisma'
import { requireUser } from '../utils/session'

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)

  const memberships = await prisma.groupMember.findMany({
    where: { userId: user.id },
    include: {
      group: {
        select: {
          id: true,
          name: true,
          createdAt: true,
          _count: { select: { members: true } },
        },
      },
    },
    orderBy: { group: { createdAt: 'desc' } },
  })

  return memberships.map((m) => ({
    id: m.group.id,
    name: m.group.name,
    memberCount: m.group._count.members,
    role: m.role,
    createdAt: m.group.createdAt,
  }))
})
