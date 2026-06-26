<script setup lang="ts">
import { ref } from 'vue';
import GroupMemberList from './member-list.vue';

// グループ名のデータ（リアクティブ）
const groupName = ref<string>('ダミーグループ');

// メンバー一覧のダミーデータ
const members = ref([
  { id: 1, name: '山田 太郎', role: 'リーダー' },
  { id: 2, name: '佐藤 次郎', role: 'エンジニア' },
  { id: 3, name: '鈴木 花子', role: 'デザイナー' },
]);
</script>

<template>
  <div class="group-page">
    <h2>グループ名: {{ groupName }}</h2>
    
    <hr />

    <GroupMemberList :members="members" />
  </div>
</template>

<style scoped>
.group-page {
  padding: 20px;
  max-width: 600px;
  margin: 0 auto;
  border: 1px solid #ddd;
  border-radius: 8px;
}
h2 {
  color: #2c3e50;
}
hr {
  border: 0;
  border-top: 1px solid #eee;
  margin: 20px 0;
}
</style>