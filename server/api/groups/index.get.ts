export default defineEventHandler(async (event) => {
  const prisma = event.context.prisma
  const groups = await prisma.group.findMany({
    select: { id: true, name: true, _count: { select: { users: true } } },
    orderBy: { createdAt: 'asc' },
  })
  return { groups }
})
