import type { z } from 'zod'

type H3Event = Parameters<typeof getRouterParam>[0]

// ルートパラメータを正の整数IDとして取り出す。不正なら400
export function parseIdParam(event: H3Event, name: string, label: string): number {
  const raw = getRouterParam(event, name)
  const id = Number(raw)
  if (!raw || !Number.isInteger(id) || id <= 0) {
    throw createError({ statusCode: 400, message: `無効な${label}です` })
  }
  return id
}

// リクエストボディを zod スキーマで検証する。不正なら最初のエラーメッセージで400
export async function parseBody<T extends z.ZodType>(event: H3Event, schema: T): Promise<z.infer<T>> {
  const result = schema.safeParse(await readBody(event))
  if (!result.success) {
    throw createError({
      statusCode: 400,
      message: result.error.issues[0]?.message ?? '入力内容が正しくありません'
    })
  }
  return result.data
}
