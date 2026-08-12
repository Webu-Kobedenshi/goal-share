<script setup lang="ts">
import { ref } from 'vue'

const selectedOption = ref<'create' | 'join' | null>(null)
const groupName = ref('')
const groupDescription = ref('')
const groupCode = ref('')
const joinMessage = ref('')
const error = ref('')
const submitting = ref(false)

const handleCreateGroup = () => {
  selectedOption.value = 'create'
}

const handleJoinGroup = () => {
  selectedOption.value = 'join'
}

const handleBack = () => {
  selectedOption.value = null
  error.value = ''
}

const submitCreate = async () => {
  const name = groupName.value.trim()
  if (!name) { error.value = 'グループ名を入力してください'; return }
  submitting.value = true
  error.value = ''
  try {
    const group = await $fetch<{ id: number }>('/api/groups', {
      method: 'POST',
      body: { name },
    })
    await navigateTo(`/group?id=${group.id}`)
  } catch (e: any) {
    error.value = e?.data?.message ?? '作成に失敗しました'
  } finally {
    submitting.value = false
  }
}

const submitJoin = async () => {
  const gid = Number(groupCode.value)
  if (!gid) { error.value = '有効なグループコードを入力してください'; return }
  submitting.value = true
  error.value = ''
  try {
    await $fetch(`/api/groups/${gid}/join-requests`, {
      method: 'POST',
      body: { message: joinMessage.value.trim() || undefined },
    })
    await navigateTo(`/group?id=${gid}`)
  } catch (e: any) {
    error.value = e?.data?.message ?? '申請に失敗しました'
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="page-container">
    <template v-if="selectedOption === null">
      <header class="fork-header">
        <h1>グループ作成/参加</h1>
        <p class="subtitle">グループを新規作成するか、既存グループに参加申請してください</p>
      </header>

      <section class="options-section">
        <div class="options-container">
          <button class="option-card" @click="handleCreateGroup">
            <div class="option-icon">➕</div>
            <h2>グループを作成</h2>
            <p>新しいグループを作成します</p>
          </button>

          <button class="option-card" @click="handleJoinGroup">
            <div class="option-icon">🤝</div>
            <h2>グループに参加</h2>
            <p>既存グループに参加申請します</p>
          </button>
        </div>
      </section>
    </template>

    <template v-if="selectedOption === 'create'">
      <header class="action-header">
        <button class="back-button" @click="handleBack">← 戻る</button>
        <h1>グループを作成</h1>
      </header>

      <section class="form-section">
        <form class="form-container" @submit.prevent="submitCreate">
          <div class="form-group">
            <label for="group-name">グループ名</label>
            <input
              id="group-name"
              v-model="groupName"
              type="text"
              placeholder="グループ名を入力してください"
              class="input-field"
            />
          </div>

          <p v-if="error" class="error">{{ error }}</p>

          <div class="form-actions">
            <button type="button" class="cancel-btn" @click="handleBack">キャンセル</button>
            <button type="submit" class="submit-btn" :disabled="submitting">作成</button>
          </div>
        </form>
      </section>
    </template>

    <template v-if="selectedOption === 'join'">
      <header class="action-header">
        <button class="back-button" @click="handleBack">← 戻る</button>
        <h1>グループに参加</h1>
      </header>

      <section class="form-section">
        <form class="form-container" @submit.prevent="submitJoin">
          <div class="form-group">
            <label for="group-code">グループコード（ID）</label>
            <input
              id="group-code"
              v-model="groupCode"
              type="text"
              placeholder="参加するグループのIDを入力してください"
              class="input-field"
            />
          </div>

          <div class="form-group">
            <label for="join-message">参加メッセージ</label>
            <textarea
              id="join-message"
              v-model="joinMessage"
              placeholder="参加理由や自己紹介を入力してください（オプション）"
              class="textarea-field"
              rows="4"
            ></textarea>
          </div>

          <p v-if="error" class="error">{{ error }}</p>

          <div class="form-actions">
            <button type="button" class="cancel-btn" @click="handleBack">キャンセル</button>
            <button type="submit" class="submit-btn" :disabled="submitting">申請</button>
          </div>
        </form>
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

.fork-header {
  background: linear-gradient(135deg, #6fa885 0%, #8fc19f 100%);
  color: #ffffff;
  padding: 40px 32px;
  border-radius: 20px;
  box-shadow: 0 10px 25px -5px rgba(60, 90, 70, 0.28);
  margin-bottom: 32px;
}

.fork-header h1 {
  margin: 0 0 12px 0;
  font-size: 2rem;
  font-weight: 700;
}

.subtitle {
  margin: 0;
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 400;
}

.action-header {
  display: flex;
  align-items: center;
  gap: 24px;
  margin-bottom: 32px;
}

.back-button {
  background-color: #ede1c9;
  color: #6b5f52;
  border: none;
  padding: 8px 16px;
  border-radius: 999px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.back-button:hover {
  background-color: #e3d4b3;
  transform: translateX(-4px);
}

.action-header h1 {
  margin: 0;
  font-size: 1.8rem;
  font-weight: 700;
  flex: 1;
}

.options-section {
  background-color: #fffdfa;
  border: 1px solid #ddd0b6;
  border-radius: 20px;
  padding: 40px 24px;
  box-shadow: 0 12px 30px -12px rgba(120, 100, 70, 0.22);
}

.options-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 24px;
}

.option-card {
  background: #fffefb;
  border: 2px solid #e4dcce;
  border-radius: 16px;
  padding: 32px 24px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.option-card:hover {
  border-color: #6fa885;
  background: #ffffff;
  box-shadow: 0 20px 40px -5px rgba(120, 100, 70, 0.15);
  transform: translateY(-4px);
}

.option-icon {
  font-size: 3rem;
  line-height: 1;
}

.option-card h2 {
  margin: 0;
  font-size: 1.3rem;
  font-weight: 700;
  color: #4a4038;
}

.option-card p {
  margin: 0;
  font-size: 0.9rem;
  color: #857b6f;
  font-weight: 400;
}

.form-section {
  background-color: #fffdfa;
  border: 1px solid #ddd0b6;
  border-radius: 20px;
  padding: 32px 24px;
  box-shadow: 0 12px 30px -12px rgba(120, 100, 70, 0.22);
}

.form-container {
  max-width: 500px;
  margin: 0 auto;
}

.form-group {
  margin-bottom: 24px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-size: 0.95rem;
  font-weight: 600;
  color: #6b5f52;
}

.input-field,
.textarea-field {
  padding: 12px 16px;
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

.form-actions {
  display: flex;
  gap: 12px;
  margin-top: 32px;
}

.cancel-btn,
.submit-btn {
  flex: 1;
  padding: 12px 24px;
  border: none;
  border-radius: 999px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.submit-btn:disabled {
  opacity: 0.6;
}

.cancel-btn {
  background-color: #ede1c9;
  color: #6b5f52;
}

.cancel-btn:hover {
  background-color: #e3d4b3;
}

.submit-btn {
  background: #5e9c7a;
  color: #ffffff;
}

.submit-btn:hover {
  transform: translateY(-2px);
  opacity: 0.92;
}

.error {
  color: #dc2626;
  font-size: 0.9rem;
  margin: 0 0 8px;
}

@media (max-width: 768px) {
  .page-container {
    padding: 24px 16px;
  }

  .fork-header {
    padding: 32px 24px;
  }

  .fork-header h1 {
    font-size: 1.5rem;
  }

  .action-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .action-header h1 {
    font-size: 1.5rem;
  }

  .options-container {
    grid-template-columns: 1fr;
  }

  .form-actions {
    flex-direction: column;
  }
}
</style>
