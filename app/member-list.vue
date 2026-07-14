<script setup lang="ts">
// メンバーの型定義
interface Member {
  id: number;
  name: string;
}

// 親コンポーネントから受け取るデータの定義
defineProps<{
  members: Member[];
}>();
</script>

<template>
  <div class="member-list-container">
    <h3>メンバー一覧</h3>
    <ul class="member-list">
      <li v-for="member in members" :key="member.id" class="member-item">
        <span class="name">{{ member.name }}</span>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.member-list-container {
  margin-top: 20px;
}

.member-list {
  max-height: 240px;
  overflow-y: auto;
  padding-right: 8px;
  margin: 0;
  padding-left: 0;
}

.member-item {
  margin-bottom: 8px;
  list-style-type: none;
  padding: 8px 10px;
  border-radius: 8px;
  background-color: #f8fafc;
}
</style>