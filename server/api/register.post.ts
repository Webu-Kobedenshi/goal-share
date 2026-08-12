import { hash } from 'bcrypt'
import { z } from 'zod'
import prisma from '../utils/prisma'

const schema = z.object({
  email: z.string().email('メールアドレスの形式が正しくありません'),
  name: z.string().min(1, '名前を入力してください'),
  password: z.string().min(8, 'パスワードは8文字以上にしてください'),
})

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const result = schema.safeParse(body)

  if (!result.success) {
    throw createError({ statusCode: 400, message: result.error.issues[0].message })
  }

  const { email, name, password } = result.data

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    throw createError({ statusCode: 409, message: 'このメールアドレスはすでに登録されています' })
  }

  const passwordHash = await hash(password, 12)
  const user = await prisma.user.create({
    data: { email, name, passwordHash },
    select: { id: true },
  })

  await setUserSession(event, {
    user: { id: user.id, email, name },
  })

  return { ok: true }
})
