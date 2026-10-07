import { z } from 'zod'
import prisma from '../../../../utils/prisma'
import { requireUser } from '../../../../utils/session'
import { parseBody, parseIdParam } from '../../../../utils/validation'
import { requireGroupMember } from '../../../../utils/groupAccess'

const schema = z.object({
  status: z.enum(['APPROVED', 'REJECTED'])
})

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const groupId = parseIdParam(event, 'id', 'グループID')
  const requestId = parseIdParam(event, 'requestId', '申請ID')
  await requireGroupMember(groupId, user.id, { owner: true })
  const { status } = await parseBody(event, schema)

  const joinRequest = await prisma.groupJoinRequest.findUnique({
    where: { id: requestId }
  })
  if (!joinRequest || joinRequest.groupId !== groupId) {
    throw createError({ statusCode: 404, message: '申請が見つかりません' })
  }

  await prisma.$transaction(async (tx) => {
    // PENDING のときだけ更新する。同時に処理された場合は片方だけが成功する
    const { count } = await tx.groupJoinRequest.updateMany({
      where: { id: requestId, status: 'PENDING' },
      data: { status }
    })
    if (count === 0) {
      throw createError({ statusCode: 409, message: 'この申請はすでに処理済みです' })
    }

    if (status === 'APPROVED') {
      await tx.groupMember.upsert({
        where: { groupId_userId: { groupId, userId: joinRequest.userId } },
        create: { groupId, userId: joinRequest.userId, role: 'MEMBER' },
        update: {}
      })
    }
  })

  return { id: requestId, status }
})
