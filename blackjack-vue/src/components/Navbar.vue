<template>
  <q-toolbar class="navbar-toolbar shadow-2">
    <q-toolbar-title class="text-h5 text-weight-bold">
      <img src="icons/logo/blackjack_logo.png" alt="Blackjack Logo" class="logo-img q-mr-sm" />
      Blackjack
    </q-toolbar-title>

    <q-space />

    <q-btn
      flat
      label="Game"
      icon="casino"
      :color="currentPage === 'home' ? 'white' : 'grey-4'"
      @click="changePage('home')"
      class="q-mr-sm"
    />
    <q-btn
      flat
      label="History"
      icon="history"
      :color="currentPage === 'history' ? 'white' : 'grey-4'"
      @click="changePage('history')"
      class="q-mr-sm"
    />
    <q-btn
      flat
      label="Rules"
      icon="menu_book"
      :color="currentPage === 'rules' ? 'white' : 'grey-4'"
      @click="changePage('rules')"
      class="q-mr-sm"
    />

    <!-- User Info -->
    <q-separator vertical class="q-mx-md" style="height: 30px" />

    <q-btn-dropdown
      flat
      :label="authStore.userName"
      icon="account_circle"
      color="white"
      class="q-mr-sm"
    >
      <q-list>
        <q-item>
          <q-item-section avatar>
            <q-avatar>
              <q-icon name="account_circle" size="md" />
            </q-avatar>
          </q-item-section>
          <q-item-section>
            <q-item-label>{{ authStore.userName }}</q-item-label>
            <q-item-label caption>{{ authStore.userEmail }}</q-item-label>
          </q-item-section>
        </q-item>
        <q-separator />
        <q-item clickable v-close-popup @click="handleLogout">
          <q-item-section avatar>
            <q-icon name="logout" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Logout</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </q-btn-dropdown>
  </q-toolbar>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from 'src/stores/auth'
import { Notify } from 'quasar'

const emit = defineEmits(['page-change'])
const router = useRouter()
const authStore = useAuthStore()

const currentPage = ref('home')

const changePage = (page) => {
  currentPage.value = page
  emit('page-change', page)
}

const handleLogout = async () => {
  const result = await authStore.logout()
  if (result.success) {
    Notify.create({
      type: 'positive',
      message: 'Logged out successfully',
      position: 'top',
    })
    router.push('/auth')
  }
}
</script>

<style scoped>
.navbar-toolbar {
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  margin-bottom: 1rem;
}

.logo-img {
  height: 32px;
  width: auto;
  vertical-align: middle;
}
</style>
