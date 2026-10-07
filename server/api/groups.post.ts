import { z } from 'zod'
import prisma from '../utils/prisma'
import { requireUser } from '../utils/session'
import { parseBody } from '../utils/validation'

const schema = z.object({
  name: z.string().trim().min(1, 'グループ名を入力してください').max(100, 'グループ名は100文字以内にしてください')
})

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const { name } = await parseBody(event, schema)

  const group = await prisma.group.create({
    data: {
      name,
      createdBy: user.id,
      members: {
        create: { userId: user.id, role: 'OWNER' }
      }
    },
    select: { id: true, name: true, createdAt: true }
  })

  return group
})
