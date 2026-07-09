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
.member-list-container h3 {
  color: #6b5f52;
}

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
  padding: 10px 14px;
  border-radius: 14px;
  background-color: #ede1c9;
  color: #4a4038;
  transition: background-color 0.2s ease;
}

.member-item:hover {
  background-color: #e3d4b3;
}
</style>