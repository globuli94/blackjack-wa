<template>
  <q-layout view="hHh lpR fFf" class="auth-page">
    <q-page-container>
      <q-page class="flex flex-center">
        <div class="auth-container">
          <AuthLogin
            v-if="showLogin"
            @switch-to-signup="showLogin = false"
            @authenticated="handleAuthenticated"
          />
          <AuthSignup
            v-else
            @switch-to-login="showLogin = true"
            @authenticated="handleAuthenticated"
          />
        </div>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from 'src/stores/auth'
import AuthLogin from 'src/components/AuthLogin.vue'
import AuthSignup from 'src/components/AuthSignup.vue'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const showLogin = ref(true)

const handleAuthenticated = () => {
  const redirect = route.query.redirect || '/'
  router.push(redirect)
}

onMounted(() => {
  // If already authenticated, redirect
  if (authStore.isAuthenticated) {
    const redirect = route.query.redirect || '/'
    router.push(redirect)
  }
})
</script>

<style scoped>
.auth-page {
  background: linear-gradient(135deg, #0f766e 0%, #15803d 100%);
  min-height: 100vh;
}

.auth-container {
  width: 100%;
  max-width: 500px;
  padding: 2rem;
}
</style>
