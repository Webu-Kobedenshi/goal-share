import { getCurrentUser } from '../../utils/session'

export default defineEventHandler(async (event) => {
  const user = await getCurrentUser(event)
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: '認証が必要です' })
  }

  const prisma = event.context.prisma
  const group = await prisma.group.findUnique({
    where: { id: user.groupId },
    include: {
      users: {
        select: { id: true, name: true },
        orderBy: { createdAt: 'asc' },
      },
    },
  })

  if (!group) {
    throw createError({ statusCode: 404, statusMessage: 'グループが見つかりません' })
  }

  return { group }
})
