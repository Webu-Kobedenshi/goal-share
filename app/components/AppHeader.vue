<script setup lang="ts">
interface User {
  id: string
  name: string
  group: { id: string; name: string }
}

defineProps<{ user: User }>()

const { logout } = useAuth()
</script>

<template>
  <header class="header">
    <h1>goal-share</h1>
    <div class="header-info">
      <span>グループ: <strong>{{ user.group.name }}</strong></span>
      <span class="muted">|</span>
      <span>{{ user.name }}</span>
      <button class="btn-secondary" @click="logout">ログアウト</button>
    </div>
  </header>
</template>
