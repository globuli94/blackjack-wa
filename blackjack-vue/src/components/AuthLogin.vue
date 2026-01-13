<template>
  <q-card class="auth-card">
    <q-card-section>
      <div class="text-h5 text-center q-mb-md">Sign In</div>
      <div class="text-subtitle2 text-center text-grey-6 q-mb-lg">
        Sign in to play Blackjack
      </div>
    </q-card-section>

    <q-card-section>
      <q-form @submit="handleSignIn" class="q-gutter-md">
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

        <q-btn
          type="submit"
          label="Sign In"
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
          label="Sign in with Google"
          class="full-width"
          :disable="authStore.loading"
          @click="handleGoogleSignIn"
        />

        <q-btn
          outline
          color="primary"
          icon="fab fa-facebook"
          label="Sign in with Facebook"
          class="full-width"
          :disable="authStore.loading"
          @click="handleFacebookSignIn"
        />

        <q-btn
          outline
          color="primary"
          icon="fab fa-twitter"
          label="Sign in with Twitter"
          class="full-width"
          :disable="authStore.loading"
          @click="handleTwitterSignIn"
        />
      </q-form>
    </q-card-section>

    <q-card-section class="text-center">
      <div class="text-body2">
        Don't have an account?
        <a href="#" class="text-primary" @click.prevent="$emit('switch-to-signup')">Sign up</a>
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

const emit = defineEmits(['switch-to-signup', 'authenticated'])

const authStore = useAuthStore()

const email = ref('')
const password = ref('')

const handleSignIn = async () => {
  const result = await authStore.signIn(email.value, password.value)
  if (result.success) {
    Notify.create({
      type: 'positive',
      message: 'Signed in successfully!',
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
      message: 'Signed in with Google successfully!',
      position: 'top',
    })
    emit('authenticated')
  }
}

const handleFacebookSignIn = async () => {
  const result = await authStore.signInWithFacebook()
  if (result.success) {
    Notify.create({
      type: 'positive',
      message: 'Signed in with Facebook successfully!',
      position: 'top',
    })
    emit('authenticated')
  }
}

const handleTwitterSignIn = async () => {
  const result = await authStore.signInWithTwitter()
  if (result.success) {
    Notify.create({
      type: 'positive',
      message: 'Signed in with Twitter successfully!',
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
