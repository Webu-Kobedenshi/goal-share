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
  if (!membership) {
    throw createError({ statusCode: 403, message: 'このグループにアクセスできません' })
  }

  const goals = await prisma.goal.findMany({
    where: { groupId },
    include: {
      creator: { select: { id: true, name: true } },
      _count: { select: { votes: true, reactions: true } },
      votes: { where: { userId: user.id }, take: 1 },
    },
    orderBy: { createdAt: 'desc' },
  })

  return goals.map((g) => ({
    id: g.id,
    title: g.title,
    description: g.description,
    source: g.source,
    createdBy: g.creator ? { id: g.creator.id, name: g.creator.name } : null,
    createdAt: g.createdAt,
    updatedAt: g.updatedAt,
    voteCount: g._count.votes,
    reactionCount: g._count.reactions,
    hasVoted: g.votes.length > 0,
  }))
})
