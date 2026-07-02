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
          <button type="button" @click="addMember">ユーザーを追加</button>
          <button type="submit">グループを作成</button>
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
  padding: 24px;
  border: 1px solid #ddd;
  border-radius: 12px;
  background: #fff;
}
.group-form h1 {
  margin-bottom: 18px;
  font-size: 1.4rem;
}
.field {
  margin-bottom: 16px;
}
.field label {
  display: block;
  margin-bottom: 6px;
  font-weight: 600;
}
.field input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ccc;
  border-radius: 8px;
}
.actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}
.actions button {
  padding: 10px 16px;
  border: none;
  border-radius: 8px;
  color: #fff;
  background: #0077cc;
  cursor: pointer;
}
.actions button[type="button"] {
  background: #e53935;
}
.member-list {
  margin-top: 24px;
}
.member-list ul {
  margin: 10px 0 0;
  padding-left: 20px;
}
.member-list li {
  margin-bottom: 6px;
}
</style>
