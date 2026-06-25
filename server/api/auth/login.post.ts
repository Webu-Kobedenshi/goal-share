import { setSessionUserId } from '../../utils/session'

export default defineEventHandler(async (event) => {
  const body = await readBody<{ name?: string; groupId?: string }>(event)
  const name = body?.name?.trim()
  const groupId = body?.groupId?.trim()

  if (!name) {
    throw createError({ statusCode: 400, statusMessage: 'ユーザー名は必須です' })
  }
  if (!groupId) {
    throw createError({ statusCode: 400, statusMessage: 'グループIDは必須です' })
  }

  const prisma = event.context.prisma

  const group = await prisma.group.findUnique({ where: { id: groupId } })
  if (!group) {
    throw createError({ statusCode: 404, statusMessage: 'グループが見つかりません' })
  }

  const user = await prisma.user.upsert({
    where: { name },
    update: { groupId: group.id },
    create: { name, groupId: group.id },
    include: { group: true },
  })

  setSessionUserId(event, user.id)

  return { user }
})
