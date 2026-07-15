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
          <div class="input-wrap">
            <input v-model="form.password" :type="showPassword ? 'text' : 'password'" placeholder="••••••••" required />
            <button type="button" class="eye" @click="showPassword = !showPassword">
              {{ showPassword ? '🙈' : '👁' }}
            </button>
          </div>
        </div>
        <div v-if="mode === 'register'" class="field">
          <label>パスワード（確認）</label>
          <div class="input-wrap">
            <input v-model="form.passwordConfirm" :type="showPasswordConfirm ? 'text' : 'password'" placeholder="••••••••" required />
            <button type="button" class="eye" @click="showPasswordConfirm = !showPasswordConfirm">
              {{ showPasswordConfirm ? '🙈' : '👁' }}
            </button>
          </div>
        </div>
        <button type="submit" class="submit" :disabled="loading">
          {{ loading ? '処理中…' : mode === 'login' ? 'ログイン' : '登録する' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { FetchError } from 'ofetch'

const { loggedIn, fetch: refreshSession } = useUserSession()
if (loggedIn.value) {
  await navigateTo('/')
}

const mode = ref<'login' | 'register'>('login')
const form = reactive({ name: '', email: '', password: '', passwordConfirm: '' })
const error = ref('')
const loading = ref(false)
const showPassword = ref(false)
const showPasswordConfirm = ref(false)

watch(mode, () => {
  error.value = ''
  showPassword.value = false
  showPasswordConfirm.value = false
})

async function submit() {
  error.value = ''

  if (mode.value === 'register' && form.password !== form.passwordConfirm) {
    error.value = 'パスワードが一致しません'
    return
  }

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
  } catch (e) {
    if (e instanceof FetchError) {
      error.value = e.data?.message ?? 'エラーが発生しました'
    } else {
      error.value = 'エラーが発生しました'
    }
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-page { display: flex; justify-content: center; align-items: center; min-height: 100vh; background: #f2ecdf; color: #4a4038; }
.auth-card { background: #fffdfa; border: 1px solid #ddd0b6; border-radius: 20px; padding: 2rem; width: 100%; max-width: 380px; box-shadow: 0 12px 30px -12px rgba(120, 100, 70, 0.22); }
.title { font-size: 1.1rem; text-align: center; margin: 0 0 1.25rem; color: #4a4038; }
.tabs { display: flex; margin-bottom: 1.5rem; border-bottom: 2px solid #ede1c9; }
.tabs button { flex: 1; padding: 0.6rem; border: none; background: none; cursor: pointer; font-size: 1rem; color: #857b6f; }
.tabs button.active { color: #5e9c7a; border-bottom: 2px solid #5e9c7a; margin-bottom: -2px; font-weight: 600; }
.field { margin-bottom: 1rem; }
.field label { display: block; font-size: 0.8rem; color: #6b5f52; margin-bottom: 0.3rem; }
.input-wrap { position: relative; display: flex; align-items: center; }
.input-wrap input { width: 100%; padding: 0.6rem 2.4rem 0.6rem 0.8rem; border: 1px solid #d9cbb0; border-radius: 14px; font-size: 1rem; box-sizing: border-box; background: #fffefb; color: #4a4038; }
.input-wrap input:focus { outline: none; border-color: #6fa885; box-shadow: 0 0 0 3px rgba(111, 168, 133, 0.3); }
.field input { width: 100%; padding: 0.6rem 0.8rem; border: 1px solid #d9cbb0; border-radius: 14px; font-size: 1rem; box-sizing: border-box; background: #fffefb; color: #4a4038; }
.field input:focus { outline: none; border-color: #6fa885; box-shadow: 0 0 0 3px rgba(111, 168, 133, 0.3); }
.eye { position: absolute; right: 0.6rem; background: none; border: none; cursor: pointer; font-size: 1rem; padding: 0; line-height: 1; }
.submit { width: 100%; padding: 0.75rem; background: #5e9c7a; color: #fff; border: none; border-radius: 999px; font-size: 1rem; cursor: pointer; margin-top: 0.5rem; transition: transform 0.15s ease, opacity 0.15s ease; }
.submit:hover:not(:disabled) { transform: translateY(-1px); opacity: 0.92; }
.submit:disabled { opacity: 0.6; cursor: not-allowed; }
.error { background: #f7ded9; color: #a4453c; border-radius: 12px; padding: 0.6rem 0.8rem; margin-bottom: 1rem; font-size: 0.85rem; }
</style>
