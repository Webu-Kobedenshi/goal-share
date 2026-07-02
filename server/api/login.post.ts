import { compare, hashSync } from 'bcrypt'
import { z } from 'zod'
import prisma from '../utils/prisma'

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

// ユーザー不在時もハッシュ比較を走らせて応答時間を揃え、タイミングによるメアド存在推測を防ぐ
const DUMMY_HASH = hashSync('dummy-password-for-timing-safety', 12)

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const result = schema.safeParse(body)

  if (!result.success) {
    throw createError({ statusCode: 400, message: '入力内容が正しくありません' })
  }

  const { email, password } = result.data

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, email: true, name: true, passwordHash: true },
  })

  const passwordOk = await compare(password, user?.passwordHash ?? DUMMY_HASH)

  if (!user || !passwordOk) {
    throw createError({ statusCode: 401, message: 'メールアドレスまたはパスワードが違います' })
  }

  await setUserSession(event, {
    user: { id: user.id, email: user.email, name: user.name },
  })

  return { ok: true }
})
