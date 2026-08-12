<template>
  <div class="page-container">
    <header class="top-header">
      <h1>Goal Share</h1>
      <p class="subtitle">グループで目標を共有しましょう</p>
    </header>

    <section class="create-section">
      <h2>グループを作成</h2>
      <form @submit.prevent="handleCreateGroup">
        <div class="field">
          <label for="group-name">グループ名</label>
          <input id="group-name" v-model="groupName" type="text" placeholder="グループ名を入力" />
        </div>
        <div class="actions">
          <button type="button" class="secondary" @click="addMember">ユーザーを追加</button>
          <button type="submit" class="primary">グループを作成</button>
        </div>
      </form>
      <p v-if="createError" class="error">{{ createError }}</p>
    </section>

    <section class="groups-section">
      <h2>マイグループ</h2>
      <div v-if="loading" class="loading">読み込み中...</div>
      <div v-else-if="groups.length === 0" class="empty">グループがありません。新しく作成しましょう。</div>
      <div v-else class="group-list">
        <NuxtLink v-for="g in groups" :key="g.id" :to="`/group?id=${g.id}`" class="group-card">
          <div class="group-name">{{ g.name }}</div>
          <div class="group-meta">
            <span>{{ g.memberCount }}人</span>
            <span class="role-badge">{{ g.role === 'OWNER' ? 'オーナー' : 'メンバー' }}</span>
          </div>
        </NuxtLink>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
const groupName = ref('')
const creating = ref(false)
const createError = ref('')
const groups = ref<{ id: number; name: string; memberCount: number; role: string }[]>([])
const loading = ref(true)

const fetchGroups = async () => {
  try {
    const data = await $fetch('/api/groups')
    groups.value = data ?? []
  } catch {
    groups.value = []
  } finally {
    loading.value = false
  }
}

const handleCreateGroup = async () => {
  const name = groupName.value.trim()
  if (!name) return
  creating.value = true
  createError.value = ''
  try {
    await $fetch('/api/groups', { method: 'POST', body: { name } })
    groupName.value = ''
    await fetchGroups()
  } catch (e: any) {
    createError.value = e?.data?.message ?? '作成に失敗しました'
  } finally {
    creating.value = false
  }
}

onMounted(fetchGroups)
</script>

<style scoped>
.page-container {
  max-width: 720px;
  margin: 0 auto;
  padding: 40px 20px;
  font-family: 'Hiragino Sans', 'Noto Sans JP', 'Helvetica Neue', Arial, sans-serif;
  color: #4a4038;
}

.top-header {
  background: linear-gradient(135deg, #6fa885 0%, #8fc19f 100%);
  color: #fff;
  padding: 40px 32px;
  border-radius: 20px;
  box-shadow: 0 10px 25px -5px rgba(60, 90, 70, 0.28);
  margin-bottom: 32px;
}

.top-header h1 {
  margin: 0 0 12px;
  font-size: 2rem;
  font-weight: 700;
}

.subtitle {
  margin: 0;
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 400;
}

.create-section {
  margin-top: 32px;
  padding: 28px;
  border: 1px solid #ddd0b6;
  border-radius: 20px;
  background: #fffdfa;
  box-shadow: 0 12px 30px -12px rgba(120, 100, 70, 0.22);
}

.create-section h2 {
  margin-bottom: 18px;
  font-size: 1.4rem;
  color: #4a4038;
}

.field {
  margin-bottom: 18px;
}

.field label {
  display: block;
  margin-bottom: 6px;
  font-weight: 600;
  color: #6b5f52;
}

.field input {
  width: 100%;
  box-sizing: border-box;
  padding: 10px 14px;
  border: 1px solid #d9cbb0;
  border-radius: 14px;
  background: #fffefb;
  color: #4a4038;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.field input:focus {
  outline: none;
  border-color: #6fa885;
  box-shadow: 0 0 0 3px rgba(111, 168, 133, 0.3);
}

.actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.actions button {
  padding: 10px 20px;
  border: none;
  border-radius: 999px;
  color: #fff;
  cursor: pointer;
  transition: transform 0.15s ease, opacity 0.15s ease;
}

.actions button:hover {
  transform: translateY(-1px);
  opacity: 0.92;
}

.actions button.primary {
  background: #5e9c7a;
}

.actions button.secondary {
  background: #c1584f;
}

.error {
  color: #dc2626;
  margin-top: 8px;
  font-size: 0.9rem;
}

.groups-section {
  margin-top: 32px;
  background-color: #fffdfa;
  border: 1px solid #ddd0b6;
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 12px 30px -12px rgba(120, 100, 70, 0.22);
}

.groups-section h2 {
  margin: 0 0 16px;
  font-size: 1.4rem;
  color: #4a4038;
}

.loading {
  text-align: center;
  padding: 40px;
  color: #64748b;
}

.empty {
  text-align: center;
  padding: 40px;
  color: #857b6f;
}

.group-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.group-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: #fffefb;
  border: 1px solid #e4dcce;
  border-radius: 14px;
  text-decoration: none;
  color: inherit;
  transition: all 0.2s ease;
}

.group-card:hover {
  border-color: #6fa885;
  box-shadow: 0 4px 12px rgba(111, 168, 133, 0.15);
  transform: translateY(-1px);
}

.group-name {
  font-weight: 600;
  font-size: 1.05rem;
  color: #4a4038;
}

.group-meta {
  display: flex;
  gap: 8px;
  align-items: center;
  font-size: 0.85rem;
  color: #857b6f;
}

.role-badge {
  background: #ede1c9;
  color: #6b5f52;
  padding: 2px 10px;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 600;
}

@media (max-width: 768px) {
  .page-container {
    padding: 24px 16px;
  }

  .top-header {
    padding: 32px 24px;
  }

  .top-header h1 {
    font-size: 1.5rem;
  }

  .group-card {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
}
</style>
