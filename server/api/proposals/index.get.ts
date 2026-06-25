import { getCurrentUser } from '../../utils/session'
import { votingDeadline } from '../../utils/proposals'

export default defineEventHandler(async (event) => {
  const user = await getCurrentUser(event)
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: '認証が必要です' })
  }

  const prisma = event.context.prisma
  const all = await prisma.goalProposal.findMany({
    where: { groupId: user.groupId },
    include: {
      proposer: { select: { id: true, name: true } },
      votes: { select: { userId: true } },
      completions: { select: { userId: true } },
      _count: { select: { votes: true, completions: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  const now = new Date()
  const proposals: typeof all = []
  for (const p of all) {
    if (p.status === 'pending' && votingDeadline(p.createdAt) < now) continue
    proposals.push(p)
  }

  const memberCount = await prisma.user.count({ where: { groupId: user.groupId } })
  const required = Math.ceil(memberCount / 2)

  return {
    proposals,
    memberCount,
    requiredVotes: required,
  }
})
