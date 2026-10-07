// $fetch の失敗からサーバーが返したメッセージを取り出す。無ければ fallback
export const errorMessage = (e: unknown, fallback: string): string => {
  const data = (e as { data?: { message?: unknown } } | null)?.data
  return typeof data?.message === 'string' ? data.message : fallback
}

// ?id=... のようなクエリ値を1つの文字列として取り出す
export const queryString = (value: unknown): string | undefined => {
  const v = Array.isArray(value) ? value[0] : value
  return typeof v === 'string' && v !== '' ? v : undefined
}
