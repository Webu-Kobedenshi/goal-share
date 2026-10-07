import prisma from '../../../../utils/prisma'
import { requireUser } from '../../../../utils/session'
import { parseIdParam } from '../../../../utils/validation'
import { requireGoalMember } from '../../../../utils/groupAccess'
import { parseEmojiParam } from '../../../../utils/reactions'

// リアクションを外す（付けていなくてもエラーにしない）
export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const goalId = parseIdParam(event, 'id', '目標ID')
  const emoji = parseEmojiParam(event)
  await requireGoalMember(goalId, user.id)

  await prisma.reaction.deleteMany({ where: { goalId, userId: user.id, emoji } })

  const count = await prisma.reaction.count({ where: { goalId, emoji } })
  return { emoji, reacted: false, count }
})
