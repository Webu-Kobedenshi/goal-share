import prisma from '../../../utils/prisma'
import { requireUser } from '../../../utils/session'
import { parseIdParam } from '../../../utils/validation'
import { requireGroupMember } from '../../../utils/groupAccess'

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const groupId = parseIdParam(event, 'id', 'グループID')
  await requireGroupMember(groupId, user.id, { owner: true })

  const requests = await prisma.groupJoinRequest.findMany({
    where: { groupId },
    include: {
      user: { select: { id: true, name: true, email: true } }
    },
    orderBy: { createdAt: 'desc' }
  })

  return requests.map((r) => ({
    id: r.id,
    groupId: r.groupId,
    userId: r.userId,
    applicantName: r.user.name,
    applicantEmail: r.user.email,
    message: r.message,
    status: r.status,
    createdAt: r.createdAt
  }))
})
