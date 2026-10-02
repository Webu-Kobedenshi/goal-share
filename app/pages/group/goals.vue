<script setup lang="ts">
import { ref, computed } from 'vue'
import { FetchError } from 'ofetch'

// GET /api/groups/:id/goals のレスポンス
interface Goal {
  id: number
  title: string
  description: string | null
  source: 'USER' | 'SYSTEM'
  createdBy: { id: number; name: string } | null
  createdAt: string
  voteCount: number
  reactionCount: number
  hasVoted: boolean
}

// API のエラーメッセージを取り出す
const errorMessage = (e: unknown, fallback: string) =>
  e instanceof FetchError ? (e.data?.message ?? fallback) : fallback

const REACTIONS = ['❤️', '🎉', '🚀']

const route = useRoute()
const groupId = computed(() => route.query.id as string | undefined)

const goals = ref<Goal[]>([])
const loading = ref(true)
const error = ref('')

const fetchGoals = async () => {
  if (!groupId.value) {
    error.value = 'グループIDが指定されていません'
    loading.value = false
    return
  }
  try {
    goals.value = (await $fetch<Goal[]>(`/api/groups/${groupId.value}/goals`)) ?? []
    error.value = ''
  } catch (e) {
    error.value = errorMessage(e, '目標の読み込みに失敗しました')
  } finally {
    loading.value = false
  }
}

// --- 目標提案（メンバー → グループ） ---
const newTitle = ref('')
const newDescription = ref('')
const proposing = ref(false)

const proposeGoal = async () => {
  const title = newTitle.value.trim()
  if (!title || !groupId.value) return
  proposing.value = true
  try {
    await $fetch(`/api/groups/${groupId.value}/goals`, {
      method: 'POST',
      body: { title, description: newDescription.value.trim() || undefined },
    })
    newTitle.value = ''
    newDescription.value = ''
    await fetchGoals()
  } catch (e) {
    error.value = errorMessage(e, '目標の提案に失敗しました')
  } finally {
    proposing.value = false
  }
}

// --- システムからのおまかせ提案（軽い目標をランダムに1つ） ---
const suggesting = ref(false)

const suggestGoal = async () => {
  if (!groupId.value) return
  suggesting.value = true
  try {
    await $fetch(`/api/groups/${groupId.value}/goals/suggest`, { method: 'POST' })
    await fetchGoals()
  } catch (e) {
    error.value = errorMessage(e, '目標の提案に失敗しました')
  } finally {
    suggesting.value = false
  }
}

// --- 投票（もう一度押すと取り消し） ---
const toggleVote = async (goal: Goal) => {
  try {
    const result = await $fetch<{ voted: boolean }>(`/api/goals/${goal.id}/vote`, { method: 'POST' })
    goal.hasVoted = result.voted
    goal.voteCount += result.voted ? 1 : -1
  } catch (e) {
    error.value = errorMessage(e, '投票に失敗しました')
  }
}

// --- リアクション（もう一度押すと取り消し） ---
const toggleReaction = async (goal: Goal, emoji: string) => {
  try {
    const result = await $fetch<{ reacted: boolean }>(`/api/goals/${goal.id}/reaction`, {
      method: 'POST',
      body: { emoji },
    })
    goal.reactionCount += result.reacted ? 1 : -1
  } catch (e) {
    error.value = errorMessage(e, 'リアクションに失敗しました')
  }
}

const formatDate = (iso: string) => new Date(iso).toLocaleDateString('ja-JP')

onMounted(fetchGoals)
</script>

<template>
  <div class="page-container">
    <header class="page-header">
      <h1>グループの目標</h1>
      <NuxtLink :to="{ path: '/group', query: { id: groupId } }" class="back-link">← グループにもどる</NuxtLink>
    </header>

    <!-- 目標を提案する（メンバー → グループ） -->
    <section class="card">
      <h2>目標を提案する</h2>
      <p class="hint">グループのみんなに取り組みたい目標を提案できます。提案された目標にはメンバーが投票できます。</p>
      <form @submit.prevent="proposeGoal">
        <div class="field">
          <label for="goal-title">目標</label>
          <input id="goal-title" v-model="newTitle" type="text" placeholder="例：毎日30分勉強する" />
        </div>
        <div class="field">
          <label for="goal-desc">ひとこと説明（任意）</label>
          <textarea id="goal-desc" v-model="newDescription" rows="2" placeholder="なぜこの目標を提案するか"></textarea>
        </div>
        <div class="actions">
          <button type="submit" class="btn-primary" :disabled="proposing || !newTitle.trim()">この目標を提案する</button>
        </div>
      </form>

      <div class="suggest-box">
        <p class="hint">思いつかないときは、システムが軽い目標をランダムに提案します。</p>
        <button type="button" class="btn-suggest" :disabled="suggesting" @click="suggestGoal">🎲 おまかせで提案してもらう</button>
      </div>
    </section>

    <!-- 目標一覧テーブル -->
    <section class="card">
      <div class="card-head">
        <h2>目標一覧</h2>
        <span class="voting-badge">{{ goals.length }}件</span>
      </div>

      <p v-if="error" class="error-msg">{{ error }}</p>
      <div v-if="loading" class="loading">読み込み中...</div>
      <div v-else-if="goals.length === 0" class="empty">まだ目標がありません。最初の目標を提案してみましょう。</div>
      <div v-else class="table-scroll">
        <table class="goals-table">
          <thead>
            <tr>
              <th>目標</th>
              <th>提案者</th>
              <th>提案日</th>
              <th class="col-vote">投票</th>
              <th class="col-reaction">リアクション</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="goal in goals" :key="goal.id">
              <td>
                <div class="goal-title">{{ goal.title }}</div>
                <div v-if="goal.description" class="goal-desc">{{ goal.description }}</div>
              </td>
              <td class="proposer">
                <span v-if="goal.source === 'SYSTEM'" class="system-badge">🎲 システム</span>
                <template v-else>{{ goal.createdBy?.name ?? '退会したユーザー' }}</template>
              </td>
              <td class="created-at">{{ formatDate(goal.createdAt) }}</td>
              <td class="col-vote">
                <button class="vote" :class="{ voted: goal.hasVoted }" @click="toggleVote(goal)">👍 {{ goal.voteCount }}</button>
              </td>
              <td class="col-reaction">
                <div class="vote-row">
                  <button v-for="emoji in REACTIONS" :key="emoji" class="vote" @click="toggleReaction(goal, emoji)">{{ emoji }}</button>
                  <span class="reaction-total">{{ goal.reactionCount }}</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>

<style scoped>
.page-container {
  max-width: 900px;
  margin: 0 auto;
  padding: 40px 20px;
  font-family: 'Hiragino Sans', 'Noto Sans JP', 'Helvetica Neue', Arial, sans-serif;
  color: #4a4038;
}

.page-header {
  background: linear-gradient(135deg, #6fa885 0%, #8fc19f 100%);
  color: #ffffff;
  padding: 24px 32px;
  border-radius: 20px;
  box-shadow: 0 10px 25px -5px rgba(60, 90, 70, 0.28);
  margin-bottom: 24px;
}
.page-header h1 {
  margin: 0;
  font-size: 2rem;
  font-weight: 700;
}
.back-link {
  display: inline-block;
  margin-top: 12px;
  color: rgba(255, 255, 255, 0.85);
  font-size: 0.9rem;
  text-decoration: none;
}
.back-link:hover { color: #ffffff; }

.card {
  background: #fffdfa;
  border: 1px solid #ddd0b6;
  border-radius: 20px;
  padding: 24px 28px;
  box-shadow: 0 12px 30px -12px rgba(120, 100, 70, 0.22);
  margin-bottom: 24px;
}
.card h2 {
  margin: 0 0 6px;
  font-size: 1.2rem;
  color: #4a4038;
}
.card-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
}
.card-head h2 { margin: 0; }
.hint {
  margin: 0 0 16px;
  color: #857b6f;
  font-size: 0.9rem;
}
.voting-badge {
  background: #f6e6c8;
  color: #9a7b3c;
  border-radius: 999px;
  padding: 4px 12px;
  font-size: 0.8rem;
  font-weight: 600;
  white-space: nowrap;
}

.field { margin-bottom: 14px; }
.field label {
  display: block;
  margin-bottom: 6px;
  font-weight: 600;
  color: #6b5f52;
  font-size: 0.9rem;
}
.field input,
.field textarea {
  width: 100%;
  box-sizing: border-box;
  padding: 10px 14px;
  border: 1px solid #d9cbb0;
  border-radius: 14px;
  background: #fffefb;
  color: #4a4038;
  font-family: inherit;
  font-size: 1rem;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}
.field textarea { resize: vertical; }
.field input:focus,
.field textarea:focus {
  outline: none;
  border-color: #6fa885;
  box-shadow: 0 0 0 3px rgba(111, 168, 133, 0.3);
}

.actions { display: flex; gap: 12px; }
.btn-primary {
  padding: 10px 22px;
  border: none;
  border-radius: 999px;
  background: #5e9c7a;
  color: #fff;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.15s ease, opacity 0.15s ease;
}
.btn-primary:disabled { opacity: 0.6; cursor: default; }
.btn-primary:hover:not(:disabled) { transform: translateY(-1px); opacity: 0.92; }

.suggest-box {
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px dashed #ddd0b6;
}
.suggest-box .hint { margin-bottom: 10px; }
.btn-suggest {
  padding: 10px 22px;
  border: 1px solid #dd9f5c;
  border-radius: 999px;
  background: #fbf0e2;
  color: #a8692b;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.15s ease, background 0.15s ease;
}
.btn-suggest:hover:not(:disabled) { transform: translateY(-1px); background: #f6e3cc; }
.btn-suggest:disabled { opacity: 0.6; cursor: default; }

.error-msg { color: #c1584f; font-size: 0.9rem; margin: 0 0 12px; }
.loading,
.empty { color: #857b6f; text-align: center; padding: 24px 0; }

/* テーブル */
.table-scroll { overflow-x: auto; }
.goals-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.95rem;
}
.goals-table th {
  text-align: left;
  color: #857b6f;
  font-size: 0.8rem;
  font-weight: 600;
  padding: 8px 12px;
  border-bottom: 2px solid #ede1c9;
  white-space: nowrap;
}
.goals-table td {
  padding: 14px 12px;
  border-bottom: 1px solid #f0e8d8;
  vertical-align: top;
}
.goal-title { font-weight: 600; }
.goal-desc { color: #857b6f; font-size: 0.85rem; margin-top: 2px; }
.proposer,
.created-at { color: #6b5f52; white-space: nowrap; }
.system-badge {
  display: inline-block;
  background: #fbf0e2;
  color: #a8692b;
  border-radius: 999px;
  padding: 3px 10px;
  font-size: 0.8rem;
  font-weight: 600;
}

.col-vote { width: 1%; }
.vote-row { display: flex; gap: 6px; }
.vote {
  border: 1px solid #e4dcce;
  background: #fffefb;
  border-radius: 999px;
  padding: 5px 10px;
  font-size: 0.82rem;
  cursor: pointer;
  color: #4a4038;
  white-space: nowrap;
  transition: background 0.15s ease;
}
.vote:hover:not(:disabled) { background: #e7f1ea; border-color: #6fa885; }
.vote.voted { background: #d9ece0; border-color: #6fa885; color: #3f7757; font-weight: 600; }
.reaction-total { color: #857b6f; font-size: 0.8rem; margin-left: 2px; }
.vote:disabled { opacity: 0.45; cursor: default; }

.col-reaction { width: 1%; }
</style>
