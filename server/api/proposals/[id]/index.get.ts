import { getCurrentUser } from '../../../utils/session'
import { getProposalWithStats, updateProposalStatus } from '../../../utils/proposals'

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
    select: { groupId: true, status: true },
  })
  if (!proposal) {
    throw createError({ statusCode: 404, statusMessage: '提案が見つかりません' })
  }
  if (proposal.groupId !== user.groupId) {
    throw createError({ statusCode: 403, statusMessage: 'この提案にアクセスする権限がありません' })
  }

  await updateProposalStatus(prisma, id)

  const result = await getProposalWithStats(prisma, id)
  if (!result) {
    throw createError({ statusCode: 404, statusMessage: '提案が見つかりません' })
  }
  return { proposal: result }
})
