import { z } from 'zod'
import prisma from '../../../utils/prisma'
import { requireUser } from '../../../utils/session'
import { parseBody, parseIdParam } from '../../../utils/validation'

const schema = z.object({
  message: z.string().trim().max(500, 'メッセージは500文字以内にしてください').optional()
})

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const groupId = parseIdParam(event, 'id', 'グループID')
  const { message } = await parseBody(event, schema)

  const group = await prisma.group.findUnique({ where: { id: groupId }, select: { id: true } })
  if (!group) {
    throw createError({ statusCode: 404, message: 'グループが見つかりません' })
  }

  const existingMember = await prisma.groupMember.findUnique({
    where: { groupId_userId: { groupId, userId: user.id } }
  })
  if (existingMember) {
    throw createError({ statusCode: 409, message: 'すでにグループのメンバーです' })
  }

  const existingRequest = await prisma.groupJoinRequest.findUnique({
    where: { groupId_userId: { groupId, userId: user.id } }
  })
  if (existingRequest?.status === 'PENDING') {
    throw createError({ statusCode: 409, message: '承認待ちの申請が既に存在します' })
  }

  // (groupId, userId) は一意なので、却下済みの申請があれば作り直さずに再申請として更新する
  const request = await prisma.groupJoinRequest.upsert({
    where: { groupId_userId: { groupId, userId: user.id } },
    create: { groupId, userId: user.id, message: message || null },
    update: { status: 'PENDING', message: message || null, createdAt: new Date() },
    select: { id: true, status: true, createdAt: true }
  })

  return request
})
