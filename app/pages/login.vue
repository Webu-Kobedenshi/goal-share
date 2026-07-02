<template>
  <div class="login-page">
    <div class="auth-card">
      <h1 class="title">goal-share / ログイン</h1>
      <div class="tabs">
        <button :class="{ active: mode === 'login' }" @click="mode = 'login'">ログイン</button>
        <button :class="{ active: mode === 'register' }" @click="mode = 'register'">新規登録</button>
      </div>

      <p v-if="error" class="error">{{ error }}</p>

      <form @submit.prevent="submit">
        <div v-if="mode === 'register'" class="field">
          <label>名前</label>
          <input v-model="form.name" type="text" placeholder="山田 太郎" required />
        </div>
        <div class="field">
          <label>メールアドレス</label>
          <input v-model="form.email" type="email" placeholder="example@mail.com" required />
        </div>
        <div class="field">
          <label>パスワード{{ mode === 'register' ? '（8文字以上）' : '' }}</label>
          <input v-model="form.password" type="password" placeholder="••••••••" required />
        </div>
        <button type="submit" class="submit" :disabled="loading">
          {{ loading ? '処理中…' : mode === 'login' ? 'ログイン' : '登録する' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
const { loggedIn, fetch: refreshSession } = useUserSession()
if (loggedIn.value) {
  await navigateTo('/')
}

const mode = ref<'login' | 'register'>('login')
const form = reactive({ name: '', email: '', password: '' })
const error = ref('')
const loading = ref(false)

async function submit() {
  error.value = ''
  loading.value = true
  try {
    const endpoint = mode.value === 'login' ? '/api/login' : '/api/register'
    await $fetch(endpoint, {
      method: 'POST',
      body: {
        email: form.email,
        password: form.password,
        ...(mode.value === 'register' ? { name: form.name } : {}),
      },
    })
    await refreshSession()
    await navigateTo('/')
  } catch (e: any) {
    error.value = e.data?.message ?? 'エラーが発生しました'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-page { display: flex; justify-content: center; align-items: center; min-height: 100vh; }
.auth-card { background: #fff; border-radius: 12px; padding: 2rem; width: 100%; max-width: 380px; box-shadow: 0 2px 12px rgba(0,0,0,0.08); }
.title { font-size: 1.1rem; text-align: center; margin: 0 0 1.25rem; }
.tabs { display: flex; margin-bottom: 1.5rem; border-bottom: 2px solid #eee; }
.tabs button { flex: 1; padding: 0.6rem; border: none; background: none; cursor: pointer; font-size: 1rem; color: #888; }
.tabs button.active { color: #3b82f6; border-bottom: 2px solid #3b82f6; margin-bottom: -2px; font-weight: 600; }
.field { margin-bottom: 1rem; }
.field label { display: block; font-size: 0.8rem; color: #6b7280; margin-bottom: 0.3rem; }
.field input { width: 100%; padding: 0.6rem 0.8rem; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 1rem; box-sizing: border-box; }
.field input:focus { outline: none; border-color: #3b82f6; }
.submit { width: 100%; padding: 0.75rem; background: #3b82f6; color: #fff; border: none; border-radius: 8px; font-size: 1rem; cursor: pointer; margin-top: 0.5rem; }
.submit:hover:not(:disabled) { background: #2563eb; }
.submit:disabled { opacity: 0.6; cursor: not-allowed; }
.error { background: #fee2e2; color: #b91c1c; border-radius: 8px; padding: 0.6rem 0.8rem; margin-bottom: 1rem; font-size: 0.85rem; }
</style>
