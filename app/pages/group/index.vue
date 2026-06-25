<template>
  <div class="container">
    <h1>Groups</h1>
    <NuxtLink to="/group/create">
      <button class="create-button">Create New Group</button>
    </NuxtLink>
    <ul class="group-list">
      <li v-for="group in groups" :key="group.id">
        {{ group.name }}
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const groups = ref([
  { id: 1, name: 'Web Design Study Group' },
  { id: 2, name: 'Nuxt.js Enthusiasts' },
  { id: 3, name: 'Project Goal Sharers' },
]);
</script>

<style scoped>
.container {
  max-width: 600px;
  margin: 50px auto;
  padding: 20px;
}
.create-button {
  padding: 10px 15px;
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  margin-bottom: 20px;
  text-decoration: none;
}
.create-button:hover {
  background-color: #218838;
}
.group-list {
  list-style: none;
  padding: 0;
}
.group-list li {
  background: #f8f9fa;
  padding: 15px;
  border: 1px solid #dee2e6;
  margin-bottom: 10px;
  border-radius: 5px;
}
</style>