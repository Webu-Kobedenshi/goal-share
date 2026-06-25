<<<<<<< Updated upstream
<script setup lang="ts">
const { user, login } = useAuth()
if (user.value) await navigateTo('/dashboard')

interface Group {
  id: string
  name: string
  _count: { users: number }
}

const { data: groupsData, refresh: refreshGroups } = await useFetch<{ groups: Group[] }>('/api/groups', {
  key: 'groups-list',
  default: () => ({ groups: [] }),
})

const selectedGroupId = ref('')
const name = ref('')
const error = ref<string | null>(null)
const submitting = ref(false)

const selectedGroup = computed(() => {
  return groupsData.value?.groups.find(g => g.id === selectedGroupId.value) ?? null
})

async function onSubmit() {
  error.value = null
  if (!name.value.trim()) {
    error.value = 'ユーザー名を入力してください'
    return
  }
  if (!selectedGroupId.value) {
    error.value = 'グループを選択してください'
    return
  }
  submitting.value = true
  try {
    await login(name.value.trim(), selectedGroupId.value)
    await navigateTo('/dashboard')
  } catch (e: unknown) {
    error.value = (e as { statusMessage?: string }).statusMessage ?? 'ログインに失敗しました'
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="container" style="max-width: 480px; padding-top: 4rem;">
    <h1 style="text-align: center;">goal-share</h1>
    <p class="muted" style="text-align: center; margin-bottom: 2rem;">
      グループで小さな目標を共有しよう
    </p>

    <div v-if="error" class="error" style="margin-bottom: 1rem;">{{ error }}</div>

    <form v-if="groupsData?.groups.length" class="card" @submit.prevent="onSubmit">
      <div class="stack" style="gap: 1rem;">
        <div>
          <label style="display: block; margin-bottom: 0.3rem; font-weight: 500;">ユーザー名</label>
          <input v-model="name" placeholder="あなたの名前" required>
        </div>

        <div>
          <label style="display: block; margin-bottom: 0.3rem; font-weight: 500;">グループ</label>
          <select v-model="selectedGroupId" required>
            <option value="" disabled>グループを選択</option>
            <option v-for="g in groupsData.groups" :key="g.id" :value="g.id">
              {{ g.name }} ({{ g._count.users }}人)
            </option>
          </select>
          <p v-if="selectedGroup" class="muted" style="margin: 0.3rem 0 0; font-size: 0.8rem;">
            ID: {{ selectedGroup.id }}
          </p>
        </div>

        <button type="submit" :disabled="submitting">
          {{ submitting ? 'ログイン中...' : 'ログイン' }}
        </button>
      </div>
    </form>

    <div v-else class="card">
      <p class="empty">
        グループがまだ作成されていません。<br>
        テスト用データを注入してください。
      </p>
    </div>

    <p class="muted" style="text-align: center; margin-top: 1rem;">
      <button class="btn-secondary" type="button" @click="() => refreshGroups()">再読み込み</button>
    </p>
  </div>
</template>
=======
<template>
  <div class="container">
    <h1>Login</h1>
    <form @submit.prevent="login">
      <div class="form-group">
        <label for="email">Email</label>
        <input type="email" id="email" v-model="email" required />
      </div>
      <div class="form-group">
        <label for="password">Password</label>
        <input type="password" id="password" v-model="password" required />
      </div>
      <button type="submit">Login</button>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const email = ref('');
const password = ref('');
const router = useRouter();

const login = () => {
  console.log('Logging in with:', email.value, password.value);
  router.push('/group');
};
</script>

<style scoped>
.container {
  max-width: 400px;
  margin: 50px auto;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 5px;
}
.form-group {
  margin-bottom: 15px;
}
label {
  display: block;
  margin-bottom: 5px;
}
input {
  width: 100%;
  padding: 8px;
  box-sizing: border-box;
}
button {
  width: 100%;
  padding: 10px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}
button:hover {
  background-color: #0056b3;
}
</style>
>>>>>>> Stashed changes
