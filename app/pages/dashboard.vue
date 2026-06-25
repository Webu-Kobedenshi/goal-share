<script setup lang="ts">
const { user } = useAuth()

interface Proposal {
  id: string
  content: string
  durationDays: number
  status: string
  createdAt: string
  proposer: { id: string; name: string }
  _count: { votes: number; completions: number }
  votes: { userId: string }[]
  completions: { userId: string }[]
}

interface ProposalsResponse {
  proposals: Proposal[]
  memberCount: number
  requiredVotes: number
}

const { data, refresh, error: fetchError } = await useFetch<ProposalsResponse>('/api/proposals', {
  key: 'proposals',
  default: () => ({ proposals: [], memberCount: 0, requiredVotes: 0 }),
})

const content = ref('')
const durationDays = ref(7)
const submitting = ref(false)
const submitError = ref<string | null>(null)

const myVoteIds = computed(() => {
  const me = user.value
  if (!me) return new Set<string>()
  return new Set(
    (data.value?.proposals ?? [])
      .filter(p => p.votes.some(v => v.userId === me.id))
      .map(p => p.id),
  )
})

const myCompletionIds = computed(() => {
  const me = user.value
  if (!me) return new Set<string>()
  return new Set(
    (data.value?.proposals ?? [])
      .filter(p => p.completions.some(c => c.userId === me.id))
      .map(p => p.id),
  )
})

const today = computed(() => {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), now.getDate())
})

const myProposalToday = computed(() => {
  const me = user.value
  if (!me) return null
  return (data.value?.proposals ?? []).find(p =>
    p.proposer.id === me.id && new Date(p.createdAt) >= today.value,
  ) ?? null
})

const pending = computed(() => (data.value?.proposals ?? []).filter(p => p.status === 'pending'))
const adopted = computed(() => (data.value?.proposals ?? []).filter(p => p.status === 'adopted'))

async function onPropose() {
  submitError.value = null
  if (!content.value.trim()) {
    submitError.value = '目標内容を入力してください'
    return
  }
  submitting.value = true
  try {
    await $fetch('/api/proposals', {
      method: 'POST',
      body: { content: content.value.trim(), durationDays: durationDays.value },
    })
    content.value = ''
    durationDays.value = 7
    await refresh()
  } catch (e: unknown) {
    submitError.value = (e as { statusMessage?: string }).statusMessage ?? '提案に失敗しました'
  } finally {
    submitting.value = false
  }
}

async function onVoted() { await refresh() }
async function onCompleted() { await refresh() }
</script>

<template>
  <div v-if="user">
    <AppHeader :user="user" />

    <div class="container">
      <section class="card">
        <h2 style="margin-top: 0;">今日の目標を提案</h2>
        <p v-if="myProposalToday" class="muted" style="margin: 0 0 0.5rem;">
          本日はすでに提案済みです。明日また提案できます。
        </p>
        <p v-else class="muted" style="margin: 0 0 0.5rem;">
          1日に1つまで提案できます。
        </p>

        <form v-if="!myProposalToday" class="stack" style="gap: 0.75rem; margin-top: 0.5rem;" @submit.prevent="onPropose">
          <textarea v-model="content" placeholder="例: 毎日30分勉強する" :disabled="submitting" />
          <div class="row">
            <label style="flex: 1;">
              <span style="display: block; margin-bottom: 0.2rem; font-weight: 500;">期間 (日)</span>
              <input v-model.number="durationDays" type="number" min="1" max="365" :disabled="submitting">
            </label>
            <button type="submit" :disabled="submitting" style="align-self: flex-end;">
              {{ submitting ? '送信中...' : '提案する' }}
            </button>
          </div>
          <div v-if="submitError" class="error">{{ submitError }}</div>
        </form>
      </section>

      <div v-if="fetchError" class="error" style="margin-bottom: 1rem;">
        目標一覧の取得に失敗しました
      </div>

      <section>
        <h2>投票中の目標 ({{ pending.length }})</h2>
        <p v-if="pending.length === 0" class="empty">投票中の目標はありません</p>
        <GoalCard
          v-for="p in pending"
          :key="p.id"
          :proposal="p"
          :member-count="data?.memberCount ?? 0"
          :required-votes="data?.requiredVotes ?? 0"
          :current-user-id="user.id"
          :has-voted="myVoteIds.has(p.id)"
          :has-completed="myCompletionIds.has(p.id)"
          @voted="onVoted"
          @completed="onCompleted"
        />
      </section>

      <div class="divider" />

      <section>
        <h2>採択された目標 ({{ adopted.length }})</h2>
        <p v-if="adopted.length === 0" class="empty">採択された目標はまだありません</p>
        <GoalCard
          v-for="p in adopted"
          :key="p.id"
          :proposal="p"
          :member-count="data?.memberCount ?? 0"
          :required-votes="data?.requiredVotes ?? 0"
          :current-user-id="user.id"
          :has-voted="myVoteIds.has(p.id)"
          :has-completed="myCompletionIds.has(p.id)"
          @voted="onVoted"
          @completed="onCompleted"
        />
      </section>
    </div>
  </div>
</template>
