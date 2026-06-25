import type { H3Event } from 'h3'
import { getCookie, setCookie, deleteCookie } from 'h3'

const COOKIE_NAME = 'goal_share_user_id'

export function setSessionUserId(event: H3Event, userId: string) {
  setCookie(event, COOKIE_NAME, userId, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  })
}

export function getSessionUserId(event: H3Event): string | undefined {
  return getCookie(event, COOKIE_NAME)
}

export function clearAppSession(event: H3Event) {
  deleteCookie(event, COOKIE_NAME, { path: '/' })
}

export async function getCurrentUser(event: H3Event) {
  const userId = getSessionUserId(event)
  if (!userId) return null
  const prisma = event.context.prisma
  return prisma.user.findUnique({
    where: { id: userId },
    include: { group: true },
  })
}
