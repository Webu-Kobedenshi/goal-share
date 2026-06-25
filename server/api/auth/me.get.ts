import { getCurrentUser } from '../../utils/session'

export default defineEventHandler(async (event) => {
  const user = await getCurrentUser(event)
  if (!user) {
    return { user: null }
  }
  return {
    user: {
      id: user.id,
      name: user.name,
      groupId: user.groupId,
      group: { id: user.group.id, name: user.group.name },
    },
  }
})
