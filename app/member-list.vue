<script setup lang="ts">
// メンバーの型定義
interface Member {
  id: number;
  name: string;
  role: string;
}

// 親コンポーネントから受け取るデータの定義
defineProps<{
  members: Member[];
}>();
</script>

<template>
  <div class="member-list-container">
    <h3>メンバー一覧</h3>
    <ul>
      <li v-for="member in members" :key="member.id" class="member-item">
        <span class="name">{{ member.name }}</span>
        <span class="role">({{ member.role }})</span>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.member-list-container {
  margin-top: 20px;
}
.member-item {
  margin-bottom: 8px;
  list-style-type: none;
}
.role {
  margin-left: 8px;
  color: #666;
  font-size: 0.9em;
}
</style>