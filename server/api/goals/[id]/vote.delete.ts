import prisma from '../../../utils/prisma'
import { requireUser } from '../../../utils/session'
import { parseIdParam } from '../../../utils/validation'
import { requireGoalMember } from '../../../utils/groupAccess'

// 投票を取り消す（投票していなくてもエラーにしない）
export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const goalId = parseIdParam(event, 'id', '目標ID')
  await requireGoalMember(goalId, user.id)

  await prisma.vote.deleteMany({ where: { goalId, userId: user.id } })

  const voteCount = await prisma.vote.count({ where: { goalId } })
  return { voted: false, voteCount }
})
