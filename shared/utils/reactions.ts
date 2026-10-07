// 目標に付けられるリアクション絵文字（サーバーの検証とUIで共有する）
export const REACTION_EMOJIS = ['❤️', '🎉', '🚀'] as const

export type ReactionEmoji = (typeof REACTION_EMOJIS)[number]
