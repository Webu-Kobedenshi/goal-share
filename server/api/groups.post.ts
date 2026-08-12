import { z } from 'zod'
import prisma from '../utils/prisma'
import { requireUser } from '../utils/session'

const schema = z.object({
  name: z.string().min(1, 'グループ名を入力してください'),
})

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const body = await readBody(event)
  const result = schema.safeParse(body)
  if (!result.success) {
    throw createError({ statusCode: 400, message: result.error.issues[0].message })
  }

  const group = await prisma.group.create({
    data: {
      name: result.data.name,
      createdBy: user.id,
      members: {
        create: { userId: user.id, role: 'OWNER' },
      },
    },
    select: { id: true, name: true, createdAt: true },
  })

  return group
})
