import prisma from '../../../../utils/prisma'
import { requireUser } from '../../../../utils/session'
import { parseIdParam } from '../../../../utils/validation'
import { requireGoalMember } from '../../../../utils/groupAccess'
import { parseEmojiParam } from '../../../../utils/reactions'

// リアクションを付ける（何度呼んでも付いた状態になる）
export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const goalId = parseIdParam(event, 'id', '目標ID')
  const emoji = parseEmojiParam(event)
  await requireGoalMember(goalId, user.id)

  // INSERT ... ON CONFLICT DO NOTHING になるので、同時に押されても一意制約違反にならない
  await prisma.reaction.createMany({
    data: [{ goalId, userId: user.id, emoji }],
    skipDuplicates: true
  })

  const count = await prisma.reaction.count({ where: { goalId, emoji } })
  return { emoji, reacted: true, count }
})
