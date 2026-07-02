<script setup lang="ts">
import { ref, watch } from 'vue'
import MemberList from '../member-list.vue'

interface Member {
  id: number
  name: string
}

interface Group {
  id: number
  name: string
  members: Member[]
}

const fallbackGroup: Group = {
  id: 1,
  name: 'ダミーグループ',
  members: [
    { id: 1, name: '山田 太郎' },
    { id: 2, name: '佐藤 美咲' },
    { id: 3, name: '鈴木 一郎' },
    { id: 4, name: '高橋 花子' },
    { id: 5, name: '福山 雅治' },
    { id: 6, name: '坂本 九' }
  ]
}

const route = useRoute()
const group = ref<Group>({ ...fallbackGroup })

const getQueryValue = (value: unknown): string | undefined => {
  if (Array.isArray(value)) {
    return typeof value[0] === 'string' ? value[0] : undefined
  }

  return typeof value === 'string' ? value : undefined
}

const normalizeMember = (value: unknown, index: number): Member | null => {
  if (typeof value === 'string') {
    const name = value.trim()
    return name ? { id: index + 1, name } : null
  }

  if (typeof value === 'object' && value !== null) {
    const candidate = value as { id?: number; name?: string }
    const name = candidate.name?.trim()

    if (!name) {
      return null
    }

    return {
      id: typeof candidate.id === 'number' ? candidate.id : index + 1,
      name
    }
  }

  return null
}

const normalizeMembers = (value: unknown): Member[] => {
  if (Array.isArray(value)) {
    return value
      .map((item, index) => normalizeMember(item, index))
      .filter((member): member is Member => member !== null)
  }

  if (typeof value === 'string') {
    const trimmed = value.trim()
    if (!trimmed) {
      return []
    }

    try {
      const parsed = JSON.parse(trimmed)
      if (Array.isArray(parsed)) {
        return parsed
          .map((item, index) => normalizeMember(item, index))
          .filter((member): member is Member => member !== null)
      }
    } catch {
      // 文字列のままカンマ区切りとして扱う
    }

    return trimmed
      .split(',')
      .map((name, index) => normalizeMember(name, index))
      .filter((member): member is Member => member !== null)
  }

  return []
}

const applyIncomingGroupData = () => {
  const query = route.query
  const incomingName = getQueryValue(query.groupName) ?? getQueryValue(query.name)
  const incomingMembers = normalizeMembers(
    query.members ?? query.memberList ?? query.memberNames ?? query.groupData
  )

  let parsedGroupData: Partial<Group> | null = null
  const groupDataQuery = getQueryValue(query.groupData)

  if (groupDataQuery) {
    try {
      parsedGroupData = JSON.parse(groupDataQuery) as Partial<Group>
    } catch {
      parsedGroupData = null
    }
  }

  const resolvedName = parsedGroupData?.name ?? incomingName ?? fallbackGroup.name
  const resolvedMembers = parsedGroupData?.members?.length
    ? parsedGroupData.members.map((member, index) => normalizeMember(member, index)).filter((member): member is Member => member !== null)
    : incomingMembers.length
      ? incomingMembers
      : fallbackGroup.members

  group.value = {
    id: group.value.id,
    name: resolvedName,
    members: resolvedMembers
  }
}

watch(
  () => [route.query.groupName, route.query.name, route.query.members, route.query.memberList, route.query.memberNames, route.query.groupData],
  () => {
    applyIncomingGroupData()
  },
  { immediate: true }
)
</script>

<template>
  <div class="page-container">
    <header class="group-header">
      <h1>{{ group.name }}</h1>
    </header>

    <section class="member-section">
      <MemberList :members="group.members" />
    </section>
  </div>
</template>

<style scoped>
.page-container {
  max-width: 900px;
  margin: 0 auto;
  padding: 40px 20px;
  font-family: 'Helvetica Neue', Arial, sans-serif;
  color: #1e293b;
}

.group-header {
  background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
  color: #ffffff;
  padding: 24px 32px;
  border-radius: 16px;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
  margin-bottom: 24px;
}

.group-header h1 {
  margin: 0;
  font-size: 2rem;
  font-weight: 700;
}

.member-section {
  background-color: #ffffff;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.08);
}

/* 目標操作フッター */
.goal-card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-top: 1px solid #f1f5f9;
  padding-top: 12px;
  margin-top: 12px;
  font-size: 0.85em;
}
.control-label {
  color: #64748b;
}
.status-controls {
  display: flex;
  gap: 6px;
}
.btn-status {
  background-color: #f8fafc;
  border: 1px solid #e2e8f0;
  color: #64748b;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 0.9em;
  cursor: pointer;
  transition: all 0.15s;
}
.btn-status:hover {
  background-color: #f1f5f9;
  color: #1e293b;
}
.btn-status.active {
  background-color: #3b82f6;
  border-color: #3b82f6;
  color: #ffffff;
  font-weight: 500;
}

/* フォーム共通 */
.form-card {
  background-color: #ffffff;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
}
.form-card h3 {
  margin: 0 0 16px 0;
  font-size: 1.15em;
  font-weight: 600;
}
.form-group {
  margin-bottom: 16px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.form-group label {
  font-size: 0.85em;
  font-weight: 600;
  color: #475569;
}
.form-group input[type="text"],
.form-group input[type="date"],
.form-group select {
  padding: 8px 12px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font-size: 0.95em;
  outline: none;
  transition: border-color 0.15s;
}
.form-group input:focus,
.form-group select:focus {
  border-color: #3b82f6;
}
.form-row {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}
@media (min-width: 480px) {
  .form-row {
    grid-template-columns: 1fr 1fr;
  }
}
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 20px;
}

/* ボタン類 */
.btn {
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 0.9em;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.15s, border-color 0.15s;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.btn-primary {
  background-color: #3b82f6;
  border: 1px solid #3b82f6;
  color: #ffffff;
}
.btn-primary:hover {
  background-color: #2563eb;
  border-color: #2563eb;
}
.btn-secondary {
  background-color: #ffffff;
  border: 1px solid #cbd5e1;
  color: #475569;
}
.btn-secondary:hover {
  background-color: #f8fafc;
  color: #1e293b;
}
.btn-submit {
  background-color: #10b981;
  border: 1px solid #10b981;
  color: #ffffff;
}
.btn-submit:hover {
  background-color: #059669;
  border-color: #059669;
}
.btn-full {
  width: 100%;
}

/* サイドバー */
.sidebar-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.sidebar-card {
  background-color: #ffffff;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  padding: 24px;
  box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
}
.member-add-area {
  margin-top: 24px;
  border-top: 1px solid #f1f5f9;
  padding-top: 20px;
}
.member-form-container {
  margin-top: 16px;
  background-color: #f8fafc;
  padding: 16px;
  border-radius: 8px;
  border: 1px solid #f1f5f9;
}
.form-group.mini {
  margin-bottom: 12px;
}
.form-group.mini input {
  padding: 6px 10px;
  font-size: 0.9em;
}

/* 空表示 */
.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: #64748b;
  border: 2px dashed #cbd5e1;
  border-radius: 12px;
  background-color: #ffffff;
}

/* トランジションアニメーション */
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.3s ease-out;
}
.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateY(-10px);
  opacity: 0;
}
</style>
