<template>
  <div class="page-container">

    <section class="group-form">
      <h1>グループを作成</h1>
      <form @submit.prevent="handleCreateGroup">
        <div class="field">
          <label for="group-name">グループ名</label>
          <input id="group-name" v-model="groupName" type="text" placeholder="グループ名を入力" />
        </div>

        <div class="field">
          <label for="member-name">追加するユーザー名</label>
          <input id="member-name" v-model="memberName" type="text" placeholder="ユーザー名を入力" />
        </div>

        <div class="actions">
          <button type="button" class="secondary" @click="addMember">ユーザーを追加</button>
          <button type="submit" class="primary">グループを作成</button>
        </div>
      </form>

      <div v-if="members.length" class="member-list">
        <h2>追加されたユーザー</h2>
        <ul>
          <li v-for="(member, index) in members" :key="index">{{ member }}</li>
        </ul>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const groupName = ref('')
const memberName = ref('')
const members = ref([])

const addMember = () => {
  const name = memberName.value.trim()
  if (!name) return
  members.value.push(name)
  memberName.value = ''
}

const handleCreateGroup = () => {
  if (!groupName.value.trim()) return
  alert(`グループ「${groupName.value}」を作成しました。追加ユーザー: ${members.value.join('、')}`)
  groupName.value = ''
  memberName.value = ''
  members.value = []
}
</script>

<style scoped>
.page-container {
  max-width: 720px;
  margin: 0 auto;
  padding: 24px;
}
.group-form {
  margin-top: 32px;
  padding: 28px;
  border: 1px solid #ddd0b6;
  border-radius: 20px;
  background: #fffdfa;
  box-shadow: 0 12px 30px -12px rgba(120, 100, 70, 0.22);
}
.group-form h1 {
  margin-bottom: 18px;
  font-size: 1.4rem;
  color: #4a4038;
}
.field {
  margin-bottom: 18px;
}
.field label {
  display: block;
  margin-bottom: 6px;
  font-weight: 600;
  color: #6b5f52;
}
.field input {
  width: 100%;
  box-sizing: border-box;
  padding: 10px 14px;
  border: 1px solid #d9cbb0;
  border-radius: 14px;
  background: #fffefb;
  color: #4a4038;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}
.field input:focus {
  outline: none;
  border-color: #6fa885;
  box-shadow: 0 0 0 3px rgba(111, 168, 133, 0.3);
}
.actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}
.actions button {
  padding: 10px 20px;
  border: none;
  border-radius: 999px;
  color: #fff;
  cursor: pointer;
  transition: transform 0.15s ease, opacity 0.15s ease;
}
.actions button:hover {
  transform: translateY(-1px);
  opacity: 0.92;
}
.actions button.primary {
  background: #5e9c7a;
}
.actions button.secondary {
  background: #c1584f;
}
.member-list {
  margin-top: 24px;
}
.member-list h2 {
  color: #6b5f52;
  font-size: 1.1rem;
}
.member-list ul {
  margin: 10px 0 0;
  padding-left: 0;
  list-style: none;
}
.member-list li {
  margin-bottom: 8px;
  padding: 8px 14px;
  border-radius: 12px;
  background: #ede1c9;
  color: #4a4038;
}
</style>
