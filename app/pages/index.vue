<script setup lang="ts">
const { user, fetchMe } = useAuth()
if (!user.value) await fetchMe()
if (user.value) await navigateTo('/dashboard')
else await navigateTo('/login')
</script>

<template>
  <div />
</template>
