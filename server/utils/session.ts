export async function requireUser(event: any) {
  const session = await getUserSession(event)
  if (!session.user) {
    throw createError({ statusCode: 401, message: 'ログインが必要です' })
  }
  return session.user as { id: number; email: string; name: string }
}
