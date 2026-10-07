import { REACTION_EMOJIS, type ReactionEmoji } from '#shared/utils/reactions'

type H3Event = Parameters<typeof getRouterParam>[0]

const isReactionEmoji = (value: string): value is ReactionEmoji =>
  (REACTION_EMOJIS as readonly string[]).includes(value)

// URL の :emoji を取り出し、許可された絵文字か検証する。不正なら400
export function parseEmojiParam(event: H3Event): ReactionEmoji {
  const raw = getRouterParam(event, 'emoji', { decode: true })
  if (!raw || !isReactionEmoji(raw)) {
    throw createError({ statusCode: 400, message: '使用できないリアクションです' })
  }
  return raw
}
