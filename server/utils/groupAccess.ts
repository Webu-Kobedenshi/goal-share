import prisma from './prisma'

type GroupMembership = NonNullable<Awaited<ReturnType<typeof prisma.groupMember.findUnique>>>

// グループのメンバーであることを確認する。owner: true ならオーナーに限定する
export async function requireGroupMember(
  groupId: number,
  userId: number,
  options: { owner?: boolean } = {}
): Promise<GroupMembership> {
  const membership = await prisma.groupMember.findUnique({
    where: { groupId_userId: { groupId, userId } }
  })
  if (options.owner) {
    if (!membership || membership.role !== 'OWNER') {
      throw createError({ statusCode: 403, message: 'この操作はグループのオーナーのみ可能です' })
    }
    return membership
  }
  if (!membership) {
    throw createError({ statusCode: 403, message: 'このグループにアクセスできません' })
  }
  return membership
}

// 目標が存在し、その目標のグループにユーザーが所属していることを確認する
export async function requireGoalMember(goalId: number, userId: number) {
  const goal = await prisma.goal.findUnique({
    where: { id: goalId },
    select: { id: true, groupId: true }
  })
  if (!goal) {
    throw createError({ statusCode: 404, message: '目標が見つかりません' })
  }
  await requireGroupMember(goal.groupId, userId)
  return goal
}
