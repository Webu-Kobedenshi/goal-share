import prisma from '../../../../utils/prisma'
import { requireUser } from '../../../../utils/session'
import { parseIdParam } from '../../../../utils/validation'
import { requireGroupMember } from '../../../../utils/groupAccess'
import { LIGHT_GOALS } from '../../../../utils/lightGoals'

// 軽い目標をランダムに1つ選び、システムからの提案としてグループに追加する
export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const groupId = parseIdParam(event, 'id', 'グループID')
  await requireGroupMember(groupId, user.id)

  // すでにグループにある目標は候補から外す
  const existing = await prisma.goal.findMany({
    where: { groupId },
    select: { title: true }
  })
  const existingTitles = new Set(existing.map((g) => g.title))
  const candidates = LIGHT_GOALS.filter((g) => !existingTitles.has(g.title))
  const picked = candidates[Math.floor(Math.random() * candidates.length)]
  if (!picked) {
    throw createError({ statusCode: 409, message: '提案できる目標がもうありません' })
  }

  const goal = await prisma.goal.create({
    data: {
      groupId,
      createdBy: null,
      title: picked.title,
      description: picked.description,
      source: 'SYSTEM'
    },
    select: { id: true, title: true, description: true, createdAt: true }
  })

  return goal
})
