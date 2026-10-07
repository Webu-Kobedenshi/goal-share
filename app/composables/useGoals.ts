import type { MaybeRefOrGetter } from 'vue'
import type { ReactionEmoji } from '#shared/utils/reactions'

export interface GoalReaction {
  emoji: ReactionEmoji
  count: number
  reacted: boolean
}

// GET /api/groups/:id/goals のレスポンス
export interface Goal {
  id: number
  title: string
  description: string | null
  source: 'USER' | 'SYSTEM'
  createdBy: { id: number; name: string } | null
  createdAt: string
  voteCount: number
  hasVoted: boolean
  reactions: GoalReaction[]
}

export const useGoals = (groupId: MaybeRefOrGetter<string | number | undefined>) => {
  const goals = ref<Goal[]>([])
  const error = ref('')

  const fetchGoals = async () => {
    const gid = toValue(groupId)
    if (!gid) return
    try {
      goals.value = await $fetch<Goal[]>(`/api/groups/${gid}/goals`)
      error.value = ''
    } catch (e) {
      error.value = errorMessage(e, '目標の読み込みに失敗しました')
    }
  }

  // 投票は PUT（付ける）/ DELETE（外す）で、何度送っても同じ結果になる
  const toggleVote = async (goal: Goal) => {
    try {
      const res = await $fetch<{ voted: boolean; voteCount: number }>(`/api/goals/${goal.id}/vote`, {
        method: goal.hasVoted ? 'DELETE' : 'PUT'
      })
      goal.hasVoted = res.voted
      goal.voteCount = res.voteCount
    } catch (e) {
      error.value = errorMessage(e, '投票に失敗しました')
    }
  }

  const toggleReaction = async (goal: Goal, reaction: GoalReaction) => {
    try {
      const res = await $fetch<{ reacted: boolean; count: number }>(
        `/api/goals/${goal.id}/reactions/${encodeURIComponent(reaction.emoji)}`,
        { method: reaction.reacted ? 'DELETE' : 'PUT' }
      )
      reaction.reacted = res.reacted
      reaction.count = res.count
    } catch (e) {
      error.value = errorMessage(e, 'リアクションに失敗しました')
    }
  }

  return { goals, error, fetchGoals, toggleVote, toggleReaction }
}
