import { z } from 'zod'
import prisma from '../../../utils/prisma'
import { requireUser } from '../../../utils/session'
import { parseBody, parseIdParam } from '../../../utils/validation'
import { requireGroupMember } from '../../../utils/groupAccess'

const schema = z.object({
  title: z.string().trim().min(1, 'タイトルを入力してください').max(100, 'タイトルは100文字以内にしてください'),
  description: z.string().trim().max(500, '説明は500文字以内にしてください').optional()
})

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const groupId = parseIdParam(event, 'id', 'グループID')
  await requireGroupMember(groupId, user.id)
  const { title, description } = await parseBody(event, schema)

  const goal = await prisma.goal.create({
    data: {
      groupId,
      createdBy: user.id,
      title,
      description: description || undefined,
      source: 'USER'
    },
    select: { id: true, title: true, description: true, createdAt: true }
  })

  return goal
})
