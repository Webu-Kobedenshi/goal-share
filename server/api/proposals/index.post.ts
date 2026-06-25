import { getCurrentUser } from '../../utils/session'
import { hasUserProposedToday } from '../../utils/proposals'

export default defineEventHandler(async (event) => {
  const user = await getCurrentUser(event)
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: '認証が必要です' })
  }

  const body = await readBody<{ content?: string; durationDays?: number }>(event)
  const content = body?.content?.trim()
  const durationDays = Number(body?.durationDays)

  if (!content) {
    throw createError({ statusCode: 400, statusMessage: '目標内容は必須です' })
  }
  if (!durationDays || durationDays < 1 || durationDays > 365 || !Number.isInteger(durationDays)) {
    throw createError({ statusCode: 400, statusMessage: '期間は1〜365日の整数で指定してください' })
  }

  const prisma = event.context.prisma

  const existing = await hasUserProposedToday(prisma, user.id)
  if (existing) {
    throw createError({ statusCode: 400, statusMessage: '今日はすでに提案済みです' })
  }

  const proposal = await prisma.goalProposal.create({
    data: {
      content,
      durationDays,
      groupId: user.groupId,
      proposerId: user.id,
    },
    include: {
      proposer: { select: { id: true, name: true } },
      _count: { select: { votes: true, completions: true } },
    },
  })

  return { proposal }
})
