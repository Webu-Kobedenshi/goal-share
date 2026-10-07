import prisma from '../../../utils/prisma'
import { requireUser } from '../../../utils/session'
import { parseIdParam } from '../../../utils/validation'
import { requireGroupMember } from '../../../utils/groupAccess'
import { REACTION_EMOJIS } from '#shared/utils/reactions'

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const groupId = parseIdParam(event, 'id', 'グループID')
  await requireGroupMember(groupId, user.id)

  const goals = await prisma.goal.findMany({
    where: { groupId },
    include: {
      creator: { select: { id: true, name: true } },
      _count: { select: { votes: true } },
      votes: { where: { userId: user.id }, take: 1 },
      reactions: { select: { emoji: true, userId: true } }
    },
    orderBy: { createdAt: 'desc' }
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
    hasVoted: g.votes.length > 0,
    // 絵文字ごとの件数と、自分が付けているかどうか
    reactions: REACTION_EMOJIS.map((emoji) => ({
      emoji,
      count: g.reactions.filter((r) => r.emoji === emoji).length,
      reacted: g.reactions.some((r) => r.emoji === emoji && r.userId === user.id)
    }))
  }))
})
