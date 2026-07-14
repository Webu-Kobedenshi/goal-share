<script setup lang="ts">
import { ref, watch } from 'vue'
import MemberList from '../../member-list.vue'

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

    <nav class="group-nav">
      <NuxtLink to="/group/apply" class="nav-link">参加申請をする</NuxtLink>
      <NuxtLink to="/group/applications" class="nav-link">申請一覧を見る</NuxtLink>
    </nav>

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

.group-nav {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
}

.nav-link {
  padding: 8px 16px;
  background: #0077cc;
  color: #fff;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 600;
  text-decoration: none;
}

.nav-link:hover {
  opacity: 0.9;
}

.member-section {
  background-color: #ffffff;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.08);
}
</style>
