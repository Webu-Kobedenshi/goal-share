<template>
  <div class="page-container">
    <header class="page-header">
      <h1>参加申請一覧</h1>
      <NuxtLink to="/group" class="back-link">← グループにもどる</NuxtLink>
    </header>

    <section class="applications-section">
      <div v-if="applications.length === 0" class="empty-state">
        現在、申請はありません。
      </div>

      <div v-for="app in applications" :key="app.id" class="application-card">
        <div class="app-header">
          <span class="app-group">{{ app.groupName }}</span>
          <span class="app-badge" :class="statusClass(app.status)">{{ statusLabel(app.status) }}</span>
        </div>

        <div class="app-body">
          <div class="app-field">
            <span class="app-field-label">グループID</span>
            <span class="app-field-value">{{ app.groupId }}</span>
          </div>
          <div class="app-field">
            <span class="app-field-label">申請者</span>
            <span class="app-field-value">{{ app.applicantName }}</span>
          </div>
          <div v-if="app.message" class="app-field">
            <span class="app-field-label">メッセージ</span>
            <p class="app-message">{{ app.message }}</p>
          </div>
        </div>

        <div v-if="app.status === 'pending'" class="app-actions">
          <button class="btn-approve" @click="approve(app.id)">承認</button>
          <button class="btn-reject" @click="reject(app.id)">却下</button>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { useApplications } from '#imports'

const { applications, approve, reject, statusLabel, statusClass } = useApplications()
</script>

<style scoped>
.page-container {
  max-width: 900px;
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

.applications-section {
  background-color: #ffffff;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.08);
}

.empty-state {
  text-align: center;
  color: #94a3b8;
  padding: 40px 0;
  font-size: 1.1rem;
}

.application-card {
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 16px;
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
  color: #64748b;
  min-width: 80px;
  flex-shrink: 0;
}

.app-field-value {
  color: #1e293b;
}

.app-message {
  margin: 0;
  color: #475569;
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
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.95rem;
  font-weight: 600;
  color: #fff;
}

.btn-approve {
  background: #16a34a;
}

.btn-approve:hover {
  background: #15803d;
}

.btn-reject {
  background: #dc2626;
}

.btn-reject:hover {
  background: #b91c1c;
}
</style>
