<script setup lang="ts">
interface Proposal {
  id: string
  content: string
  durationDays: number
  status: string
  createdAt: string
  proposer: { id: string; name: string }
  _count: { votes: number; completions: number }
}

const props = defineProps<{
  proposal: Proposal
  memberCount: number
  requiredVotes: number
  currentUserId: string
  hasVoted: boolean
  hasCompleted: boolean
}>()

const emit = defineEmits<{
  voted: [id: string]
  completed: [id: string]
}>()

const deadline = computed(() => {
  const d = new Date(props.proposal.createdAt)
  d.setDate(d.getDate() + 3)
  return d
})

const now = ref(new Date())
let timer: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  timer = setInterval(() => { now.value = new Date() }, 1000 * 30)
})
onUnmounted(() => { if (timer) clearInterval(timer) })

const remaining = computed(() => {
  const diff = deadline.value.getTime() - now.value.getTime()
  if (diff <= 0) return '締切済み'
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  if (days > 0) return `残り ${days}日 ${hours}時間`
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  return `残り ${hours}時間 ${minutes}分`
})

const votePercent = computed(() => {
  if (props.memberCount === 0) return 0
  return Math.round((props.proposal._count.votes / props.memberCount) * 100)
})

const completionPercent = computed(() => {
  if (props.memberCount === 0) return 0
  return Math.round((props.proposal._count.completions / props.memberCount) * 100)
})

const statusLabel = computed(() => {
  if (props.proposal.status === 'adopted') return '採択'
  if (props.proposal.status === 'rejected') return '却下'
  return '投票中'
})
const statusClass = computed(() => `badge badge-${props.proposal.status}`)

const isOwnProposal = computed(() => props.proposal.proposer.id === props.currentUserId)

const submitting = ref(false)
const error = ref<string | null>(null)

async function onVote() {
  submitting.value = true
  error.value = null
  try {
    await $fetch(`/api/proposals/${props.proposal.id}/vote`, { method: 'POST' })
    emit('voted', props.proposal.id)
  } catch (e: unknown) {
    error.value = (e as { statusMessage?: string }).statusMessage ?? '投票に失敗しました'
  } finally {
    submitting.value = false
  }
}

async function onComplete() {
  submitting.value = true
  error.value = null
  try {
    await $fetch(`/api/proposals/${props.proposal.id}/complete`, { method: 'POST' })
    emit('completed', props.proposal.id)
  } catch (e: unknown) {
    error.value = (e as { statusMessage?: string }).statusMessage ?? '完了報告に失敗しました'
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <article class="card">
    <div class="row" style="justify-content: space-between; align-items: flex-start;">
      <div style="flex: 1;">
        <p style="margin: 0 0 0.5rem; font-size: 1.05rem;">{{ proposal.content }}</p>
        <p class="muted" style="margin: 0;">
          提案者: {{ proposal.proposer.name }} · 期間: {{ proposal.durationDays }}日
        </p>
      </div>
      <span :class="statusClass">{{ statusLabel }}</span>
    </div>

    <div v-if="proposal.status === 'pending'" style="margin-top: 0.75rem;">
      <div class="row" style="justify-content: space-between; margin-bottom: 0.25rem;">
        <span class="muted">賛成: {{ proposal._count.votes }} / {{ memberCount }}人 ({{ votePercent }}%)</span>
        <span class="muted">必要: {{ requiredVotes }}人以上</span>
      </div>
      <div class="progress-bar">
        <div class="progress-bar-fill" :style="{ width: votePercent + '%' }" />
      </div>
      <p class="muted" style="margin: 0.5rem 0 0;">{{ remaining }}</p>
    </div>

    <div v-if="proposal.status === 'adopted'" style="margin-top: 0.75rem;">
      <div class="row" style="justify-content: space-between; margin-bottom: 0.25rem;">
        <span class="muted">完了: {{ proposal._count.completions }} / {{ memberCount }}人 ({{ completionPercent }}%)</span>
      </div>
      <div class="progress-bar">
        <div class="progress-bar-fill" :style="{ width: completionPercent + '%' }" />
      </div>
    </div>

    <div v-if="error" class="error" style="margin-top: 0.5rem;">{{ error }}</div>

    <div v-if="proposal.status === 'pending'" style="margin-top: 0.75rem;">
      <button
        v-if="!isOwnProposal && !hasVoted"
        :disabled="submitting"
        @click="onVote"
      >
        賛成する
      </button>
      <span v-else-if="isOwnProposal" class="muted">自分の提案には投票できません</span>
      <span v-else-if="hasVoted" class="muted">投票済み</span>
    </div>

    <div v-if="proposal.status === 'adopted'" style="margin-top: 0.75rem;">
      <button
        v-if="!hasCompleted"
        :disabled="submitting"
        @click="onComplete"
      >
        完了！
      </button>
      <span v-else class="muted">完了済み</span>
    </div>
  </article>
</template>
