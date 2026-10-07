import prisma from '../../../utils/prisma'
import { requireUser } from '../../../utils/session'
import { parseIdParam } from '../../../utils/validation'
import { requireGoalMember } from '../../../utils/groupAccess'

// 投票する（何度呼んでも投票済みの状態になる）
export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const goalId = parseIdParam(event, 'id', '目標ID')
  await requireGoalMember(goalId, user.id)

  // INSERT ... ON CONFLICT DO NOTHING になるので、同時に押されても一意制約違反にならない
  await prisma.vote.createMany({
    data: [{ goalId, userId: user.id }],
    skipDuplicates: true
  })

  const voteCount = await prisma.vote.count({ where: { goalId } })
  return { voted: true, voteCount }
})
