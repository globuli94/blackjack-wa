<template>
  <q-card class="auth-card">
    <q-card-section>
      <div class="text-h5 text-center q-mb-md">Sign Up</div>
      <div class="text-subtitle2 text-center text-grey-6 q-mb-lg">
        Create an account to play Blackjack
      </div>
    </q-card-section>

    <q-card-section>
      <q-form @submit="handleSignUp" class="q-gutter-md">
        <q-input
          v-model="displayName"
          label="Display Name (optional)"
          outlined
          dense
          :disable="authStore.loading"
        />

        <q-input
          v-model="email"
          type="email"
          label="Email"
          outlined
          dense
          :rules="[val => !!val || 'Email is required', val => /.+@.+\..+/.test(val) || 'Email must be valid']"
          :disable="authStore.loading"
        />

        <q-input
          v-model="password"
          type="password"
          label="Password"
          outlined
          dense
          :rules="[val => !!val || 'Password is required', val => val.length >= 6 || 'Password must be at least 6 characters']"
          :disable="authStore.loading"
        />

        <q-input
          v-model="confirmPassword"
          type="password"
          label="Confirm Password"
          outlined
          dense
          :rules="[val => !!val || 'Please confirm your password', val => val === password || 'Passwords do not match']"
          :disable="authStore.loading"
        />

        <q-btn
          type="submit"
          label="Sign Up"
          color="primary"
          class="full-width"
          :loading="authStore.loading"
        />

        <div class="text-center text-grey-6 q-mt-md">or</div>

        <!-- SSO Providers -->
        <q-btn
          outline
          color="primary"
          icon="fab fa-google"
          label="Sign up with Google"
          class="full-width"
          :disable="authStore.loading"
          @click="handleGoogleSignIn"
        />
      </q-form>
    </q-card-section>

    <q-card-section class="text-center">
      <div class="text-body2">
        Already have an account?
        <a href="#" class="text-primary" @click.prevent="$emit('switch-to-login')">Sign in</a>
      </div>
    </q-card-section>

    <q-banner v-if="authStore.error" class="bg-negative text-white q-ma-md">
      {{ authStore.error }}
      <template v-slot:action>
        <q-btn flat dense icon="close" @click="authStore.clearError()" />
      </template>
    </q-banner>
  </q-card>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from 'src/stores/auth'
import { Notify } from 'quasar'

const emit = defineEmits(['switch-to-login', 'authenticated'])

const authStore = useAuthStore()

const displayName = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')

const handleSignUp = async () => {
  if (password.value !== confirmPassword.value) {
    Notify.create({
      type: 'negative',
      message: 'Passwords do not match',
      position: 'top',
    })
    return
  }

  const result = await authStore.signUp(email.value, password.value, displayName.value || null)
  if (result.success) {
    Notify.create({
      type: 'positive',
      message: 'Account created successfully!',
      position: 'top',
    })
    emit('authenticated')
  }
}

const handleGoogleSignIn = async () => {
  const result = await authStore.signInWithGoogle()
  if (result.success) {
    Notify.create({
      type: 'positive',
      message: 'Signed up with Google successfully!',
      position: 'top',
    })
    emit('authenticated')
  }
}
</script>

<style scoped>
.auth-card {
  min-width: 400px;
  max-width: 500px;
  margin: 0 auto;
}
</style>
