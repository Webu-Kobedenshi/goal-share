interface User {
  id: string
  name: string
  groupId: string
  group: { id: string; name: string }
}

export function useAuth() {
  const user = useState<User | null>('auth-user', () => null)

  async function fetchMe() {
    const { data } = await useFetch<{ user: User | null }>('/api/auth/me', {
      key: 'auth-me',
      server: false,
    })
    user.value = data.value?.user ?? null
    return user.value
  }

  async function login(name: string, groupId: string) {
    const result = await $fetch<{ user: User }>('/api/auth/login', {
      method: 'POST',
      body: { name, groupId },
    })
    user.value = result.user
    return result.user
  }

  async function logout() {
    await $fetch('/api/auth/logout', { method: 'POST' })
    user.value = null
    await navigateTo('/login')
  }

  return { user, fetchMe, login, logout }
}
