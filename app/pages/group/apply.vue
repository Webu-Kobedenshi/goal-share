<template>
  <div class="page-container">
    <header class="page-header">
      <h1>グループ参加申請</h1>
      <NuxtLink to="/group" class="back-link">← グループにもどる</NuxtLink>
    </header>

    <section class="form-section">
      <form @submit.prevent="handleSubmit">
        <div class="field">
          <label for="groupId">グループID</label>
          <input id="groupId" v-model="groupId" type="number" placeholder="参加したいグループのIDを入力" />
        </div>

        <div class="field">
          <label for="groupName">グループ名</label>
          <input id="groupName" v-model="groupName" type="text" placeholder="参加したいグループの名前を入力" />
        </div>

        <div class="field">
          <label for="applicantName">申請者名</label>
          <input id="applicantName" v-model="applicantName" type="text" placeholder="あなたの名前を入力" />
        </div>

        <div class="field">
          <label for="message">参加メッセージ</label>
          <textarea id="message" v-model="message" placeholder="グループ運営へのメッセージ（任意）" rows="4"></textarea>
        </div>

        <div class="actions">
          <button type="submit">申請する</button>
        </div>
      </form>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const groupId = ref<number | null>(null)
const groupName = ref('')
const applicantName = ref('')
const message = ref('')

const { addApplication } = useApplications()

const handleSubmit = () => {
  if (!groupId.value || !groupName.value.trim() || !applicantName.value.trim()) return
  addApplication({
    groupId: groupId.value,
    groupName: groupName.value.trim(),
    applicantName: applicantName.value.trim(),
    message: message.value.trim()
  })
  groupId.value = null
  groupName.value = ''
  applicantName.value = ''
  message.value = ''
  navigateTo('/group/applications')
}
</script>

<style scoped>
.page-container {
  max-width: 720px;
  margin: 0 auto;
  padding: 40px 20px;
  font-family: 'Helvetica Neue', Arial, sans-serif;
  color: #1e293b;
}

.page-header {
  background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
  color: #ffffff;
  padding: 24px 32px;
  border-radius: 16px;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
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
  color: rgba(255, 255, 255, 0.75);
  font-size: 0.9rem;
  text-decoration: none;
}

.back-link:hover {
  color: #ffffff;
}

.form-section {
  background-color: #ffffff;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.08);
}

.field {
  margin-bottom: 20px;
}

.field label {
  display: block;
  margin-bottom: 6px;
  font-weight: 600;
}

.field input,
.field textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ccc;
  border-radius: 8px;
  font-size: 1rem;
  font-family: inherit;
  box-sizing: border-box;
}

.field textarea {
  resize: vertical;
}

.actions {
  display: flex;
  gap: 12px;
}

.actions button {
  padding: 10px 24px;
  border: none;
  border-radius: 8px;
  color: #fff;
  background: #0077cc;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
}

.actions button:hover {
  opacity: 0.9;
}
</style>
