import { getCurrentUser } from '../../../utils/session'
import { updateProposalStatus } from '../../../utils/proposals'

export default defineEventHandler(async (event) => {
  const user = await getCurrentUser(event)
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: '認証が必要です' })
  }

  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: '提案IDが必要です' })
  }

  const prisma = event.context.prisma

  const proposal = await prisma.goalProposal.findUnique({
    where: { id },
    select: { groupId: true, status: true, proposerId: true },
  })
  if (!proposal) {
    throw createError({ statusCode: 404, statusMessage: '提案が見つかりません' })
  }
  if (proposal.groupId !== user.groupId) {
    throw createError({ statusCode: 403, statusMessage: 'この提案に投票する権限がありません' })
  }
  if (proposal.proposerId === user.id) {
    throw createError({ statusCode: 400, statusMessage: '自分の提案には投票できません' })
  }
  if (proposal.status !== 'pending') {
    throw createError({ statusCode: 400, statusMessage: '投票できない提案です' })
  }

  await prisma.vote.create({
    data: { proposalId: id, userId: user.id },
  }).catch(() => {
    throw createError({ statusCode: 400, statusMessage: 'すでに投票済みです' })
  })

  await updateProposalStatus(prisma, id)

  return { ok: true }
})
