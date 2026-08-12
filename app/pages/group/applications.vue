<template>
  <div class="page-container">
    <header class="page-header">
      <h1>参加申請一覧</h1>
      <NuxtLink to="/group" class="back-link">← グループにもどる</NuxtLink>
    </header>

    <section class="applications-section">
      <div class="field">
        <label for="gid">グループID</label>
        <input id="gid" v-model="groupId" type="number" placeholder="グループIDを入力" class="input-field" />
        <button class="load-btn" @click="loadApplications">読み込む</button>
      </div>

      <div v-if="applications.length === 0" class="empty-state">
        現在、申請はありません。
      </div>

      <div v-for="app in applications" :key="app.id" class="application-card">
        <div class="app-header">
          <span class="app-group">{{ app.applicantName }}</span>
          <span class="app-badge" :class="statusClass(app.status)">{{ statusLabel(app.status) }}</span>
        </div>

        <div class="app-body">
          <div class="app-field">
            <span class="app-field-label">メール</span>
            <span class="app-field-value">{{ app.applicantEmail }}</span>
          </div>
          <div v-if="app.message" class="app-field">
            <span class="app-field-label">メッセージ</span>
            <p class="app-message">{{ app.message }}</p>
          </div>
        </div>

        <div v-if="app.status === 'PENDING'" class="app-actions">
          <button class="btn-approve" @click="approve(app.id, app.groupId)">承認</button>
          <button class="btn-reject" @click="reject(app.id, app.groupId)">却下</button>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const groupId = ref<number | null>(null)
const { applications, fetchApplications, approve, reject, statusLabel, statusClass } = useApplications()

const loadApplications = () => {
  if (!groupId.value) return
  fetchApplications(groupId.value)
}
</script>

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

.back-link:hover {
  color: #ffffff;
}

.applications-section {
  background-color: #fffdfa;
  border: 1px solid #ddd0b6;
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 12px 30px -12px rgba(120, 100, 70, 0.22);
}

.field {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
  align-items: flex-start;
}

.field label {
  font-weight: 600;
  margin-top: 8px;
  min-width: 80px;
}

.input-field {
  flex: 1;
  padding: 10px 12px;
  border: 1px solid #ccc;
  border-radius: 8px;
  font-size: 1rem;
  font-family: inherit;
  box-sizing: border-box;
}

.load-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  background: #0f172a;
  color: #fff;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
}

.empty-state {
  text-align: center;
  color: #a89e8f;
  padding: 40px 0;
  font-size: 1.1rem;
}

.application-card {
  border: 1px solid #e4dcce;
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 16px;
  background: #fffefb;
}

.application-card:last-child {
  margin-bottom: 0;
}

.app-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.app-group {
  font-size: 1.2rem;
  font-weight: 700;
}

.app-badge {
  font-size: 0.8rem;
  padding: 4px 10px;
  border-radius: 999px;
  font-weight: 600;
}

.status-pending {
  background: #fef3c7;
  color: #92400e;
}

.status-approved {
  background: #d1fae5;
  color: #065f46;
}

.status-rejected {
  background: #fee2e2;
  color: #991b1b;
}

.app-body {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.app-field {
  display: flex;
  gap: 8px;
}

.app-field-label {
  font-weight: 600;
  color: #857b6f;
  min-width: 80px;
  flex-shrink: 0;
}

.app-field-value {
  color: #4a4038;
}

.app-message {
  margin: 0;
  color: #6b5f52;
  white-space: pre-wrap;
}

.app-actions {
  margin-top: 16px;
  display: flex;
  gap: 12px;
}

.btn-approve,
.btn-reject {
  padding: 8px 20px;
  border: none;
  border-radius: 999px;
  cursor: pointer;
  font-size: 0.95rem;
  font-weight: 600;
  color: #fff;
  transition: transform 0.15s ease, opacity 0.15s ease;
}

.btn-approve:hover,
.btn-reject:hover {
  transform: translateY(-1px);
  opacity: 0.92;
}

.btn-approve {
  background: #5e9c7a;
}

.btn-reject {
  background: #c1584f;
}
</style>
