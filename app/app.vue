<script setup lang="ts">
const { user, fetchMe } = useAuth()
if (!user.value) await fetchMe()
</script>

<template>
<<<<<<< Updated upstream
  <NuxtPage />
=======
  <div>
    <NuxtRouteAnnouncer />
    <NuxtPage />
  </div>
>>>>>>> Stashed changes
</template>
