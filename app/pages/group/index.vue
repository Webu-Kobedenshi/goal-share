<script setup lang="ts">
interface Member {
  id: number
  name: string
  role: string
  joinedAt: string
}

interface GroupDetail {
  id: number
  name: string
  myRole: string
  members: Member[]
}

const route = useRoute()
const groupId = computed(() => queryString(route.query.id))

const group = ref<GroupDetail | null>(null)
const loading = ref(true)
const loadError = ref('')
const { goals, error, fetchGoals, toggleVote, toggleReaction } = useGoals(groupId)

const goalTitle = ref('')
const goalDescription = ref('')
const addingGoal = ref(false)

const fetchGroup = async () => {
  if (!groupId.value) {
    loadError.value = 'グループIDが指定されていません'
    loading.value = false
    return
  }
  try {
    group.value = await $fetch<GroupDetail>(`/api/groups/${groupId.value}`)
    await fetchGoals()
  } catch (e) {
    loadError.value = errorMessage(e, 'グループの読み込みに失敗しました')
  } finally {
    loading.value = false
  }
}

const addGoal = async () => {
  const title = goalTitle.value.trim()
  if (!title || !groupId.value) return
  addingGoal.value = true
  try {
    await $fetch(`/api/groups/${groupId.value}/goals`, {
      method: 'POST',
      body: { title, description: goalDescription.value.trim() || undefined }
    })
    goalTitle.value = ''
    goalDescription.value = ''
    await fetchGoals()
  } catch (e) {
    error.value = errorMessage(e, '目標の追加に失敗しました')
  } finally {
    addingGoal.value = false
  }
}

onMounted(fetchGroup)
</script>

<template>
  <div class="page-container">
    <div v-if="loading" class="loading">読み込み中...</div>
    <div v-else-if="loadError" class="error-msg">{{ loadError }}</div>
    <template v-else-if="group">
      <header class="group-header">
        <h1>{{ group.name }}</h1>
        <div class="header-meta">
          <span>{{ group.members.length }}人</span>
          <span class="role-badge">{{ group.myRole === 'OWNER' ? 'オーナー' : 'メンバー' }}</span>
          <span>グループID: {{ group.id }}</span>
        </div>
        <NuxtLink
          v-if="group.myRole === 'OWNER'"
          :to="{ path: '/group/applications', query: { id: group.id } }"
          class="header-link"
        >
          参加申請を確認する →
        </NuxtLink>
      </header>

      <section class="goals-section">
        <div class="goals-head">
          <h2>目標</h2>
          <NuxtLink :to="{ path: '/group/goals', query: { id: group.id } }" class="propose-link">目標を提案する →</NuxtLink>
        </div>

        <form v-if="group.myRole === 'OWNER'" class="add-goal-form" @submit.prevent="addGoal">
          <div class="field">
            <input v-model="goalTitle" type="text" placeholder="新しい目標" class="input-field" />
          </div>
          <div class="field">
            <textarea v-model="goalDescription" placeholder="詳細（任意）" class="textarea-field" rows="2"></textarea>
          </div>
          <button type="submit" :disabled="addingGoal || !goalTitle.trim()" class="add-btn">追加</button>
        </form>

        <p v-if="error" class="error-inline">{{ error }}</p>

        <div v-if="goals.length === 0" class="empty">目標がまだありません。</div>
        <div v-else class="goal-list">
          <div v-for="goal in goals" :key="goal.id" class="goal-card">
            <div class="goal-title">{{ goal.title }}</div>
            <p v-if="goal.description" class="goal-desc">{{ goal.description }}</p>
            <div class="goal-meta">
              <span v-if="goal.source === 'SYSTEM'" class="goal-author">🎲 システム</span>
              <span v-else-if="goal.createdBy" class="goal-author">{{ goal.createdBy.name }}</span>
              <span class="goal-date">{{ new Date(goal.createdAt).toLocaleDateString('ja-JP') }}</span>
            </div>
            <div class="goal-actions">
              <button class="action-btn" :class="{ active: goal.hasVoted }" @click="toggleVote(goal)">
                👍 {{ goal.voteCount }}
              </button>
              <button
                v-for="r in goal.reactions"
                :key="r.emoji"
                class="action-btn"
                :class="{ active: r.reacted }"
                @click="toggleReaction(goal, r)"
              >
                {{ r.emoji }} {{ r.count }}
              </button>
            </div>
          </div>
        </div>
      </section>

      <section class="member-section">
        <h2>メンバー</h2>
        <div class="member-list">
          <div v-for="m in group.members" :key="m.id" class="member-item">
            <span class="member-name">{{ m.name }}</span>
            <span class="member-role">{{ m.role === 'OWNER' ? 'オーナー' : 'メンバー' }}</span>
          </div>
        </div>
      </section>
    </template>
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
.loading, .error-msg {
  text-align: center;
  padding: 40px;
  color: #64748b;
}
.error-msg {
  color: #dc2626;
}
.group-header {
  background: linear-gradient(135deg, #6fa885 0%, #8fc19f 100%);
  color: #ffffff;
  padding: 24px 32px;
  border-radius: 20px;
  box-shadow: 0 10px 25px -5px rgba(60, 90, 70, 0.28);
  margin-bottom: 24px;
}
.group-header h1 {
  margin: 0 0 8px;
  font-size: 2rem;
  font-weight: 700;
}
.header-meta {
  display: flex;
  gap: 12px;
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.85);
}
.header-link {
  display: inline-block;
  margin-top: 12px;
  color: #ffffff;
  font-size: 0.9rem;
  font-weight: 600;
  text-decoration: none;
}
.header-link:hover { text-decoration: underline; }
.error-inline {
  color: #c1584f;
  font-size: 0.9rem;
  margin: 0 0 12px;
}
.goals-section {
  background-color: #fffdfa;
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 10px 25px -5px rgba(120, 100, 70, 0.1);
  margin-bottom: 24px;
}
.goals-section h2 {
  margin: 0 0 16px;
  font-size: 1.4rem;
  color: #4a4038;
}
.goals-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
}
.propose-link {
  color: #5e9c7a;
  font-size: 0.9rem;
  font-weight: 600;
  text-decoration: none;
}
.propose-link:hover { text-decoration: underline; }
.add-goal-form {
  margin-bottom: 24px;
  padding: 20px;
  border: 1px solid #ddd0b6;
  border-radius: 16px;
  background: #fffefb;
}
.add-goal-form .field {
  margin-bottom: 12px;
}
.input-field,
.textarea-field {
  width: 100%;
  box-sizing: border-box;
  padding: 10px 14px;
  border: 1px solid #d9cbb0;
  border-radius: 14px;
  font-size: 1rem;
  font-family: inherit;
  color: #4a4038;
  background: #fffefb;
  transition: all 0.2s ease;
}
.input-field:focus,
.textarea-field:focus {
  outline: none;
  border-color: #6fa885;
  box-shadow: 0 0 0 3px rgba(111, 168, 133, 0.3);
}
.textarea-field {
  resize: vertical;
}
.add-btn {
  padding: 10px 24px;
  border: none;
  border-radius: 999px;
  background: #5e9c7a;
  color: #fff;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}
.add-btn:hover {
  transform: translateY(-1px);
  opacity: 0.92;
}
.add-btn:disabled {
  opacity: 0.6;
}
.goal-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.goal-card {
  background: #fffefb;
  border: 1px solid #e4dcce;
  border-radius: 14px;
  padding: 16px 20px;
  transition: all 0.2s ease;
}
.goal-card:hover {
  border-color: #6fa885;
  box-shadow: 0 4px 12px rgba(111, 168, 133, 0.15);
}
.goal-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #4a4038;
  margin-bottom: 4px;
}
.goal-desc {
  margin: 4px 0 0;
  font-size: 0.9rem;
  color: #857b6f;
}
.goal-meta {
  display: flex;
  gap: 12px;
  align-items: center;
  margin-top: 8px;
  font-size: 0.8rem;
  color: #a09588;
}
.goal-author {
  font-weight: 500;
}
.goal-date {
  color: #b5aa9c;
}
.goal-actions {
  display: flex;
  gap: 8px;
  margin-top: 12px;
  flex-wrap: wrap;
}
.action-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 14px;
  border: 1px solid #e4dcce;
  border-radius: 999px;
  background: #fffefb;
  color: #6b5f52;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.15s ease;
}
.action-btn:hover {
  border-color: #6fa885;
  background: #ffffff;
}
.action-btn.active {
  background: #e8f5ee;
  border-color: #6fa885;
  color: #2d6b4f;
}
.member-section {
  background-color: #fffdfa;
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 10px 25px -5px rgba(120, 100, 70, 0.1);
}
.member-section h2 {
  margin: 0 0 16px;
  font-size: 1.4rem;
  color: #4a4038;
}
.member-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 16px;
}
.member-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-radius: 12px;
  background: #fffefb;
  border: 1px solid #ede1c9;
}
.member-name {
  font-weight: 500;
  color: #4a4038;
}
.member-role {
  font-size: 0.8rem;
  font-weight: 600;
  color: #857b6f;
}
.role-badge {
  background: rgba(255, 255, 255, 0.2);
  padding: 2px 10px;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 600;
}
.empty {
  text-align: center;
  padding: 40px;
  color: #857b6f;
}
@media (max-width: 768px) {
  .page-container {
    padding: 24px 16px;
  }
  .group-header {
    padding: 20px 24px;
  }
  .group-header h1 {
    font-size: 1.5rem;
  }
  .member-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
}
</style>
