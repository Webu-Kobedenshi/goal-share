import { getCurrentUser } from '../../../utils/session'

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
  if (proposal.status !== 'adopted') {
    throw createError({ statusCode: 400, statusMessage: '採択された目標のみ完了報告できます' })
  }

  await prisma.goalCompletion.create({
    data: { proposalId: id, userId: user.id },
  }).catch(() => {
    throw createError({ statusCode: 400, statusMessage: 'すでに完了報告済みです' })
  })

  return { ok: true }
})
