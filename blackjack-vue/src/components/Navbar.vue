<template>
  <q-toolbar class="navbar-toolbar shadow-2">
    <q-toolbar-title class="navbar-title">
      <img src="icons/logo/blackjack_logo.png" alt="Blackjack Logo" class="logo-img q-mr-sm" />
      <span class="title-text">Blackjack</span>
    </q-toolbar-title>

    <q-space />

    <!-- Desktop Navigation -->
    <div class="desktop-nav">
      <q-btn
        flat
        label="Game"
        icon="casino"
        :color="currentPage === 'home' ? 'white' : 'grey-4'"
        @click="changePage('home')"
        class="nav-btn"
      />
      <q-btn
        flat
        label="History"
        icon="history"
        :color="currentPage === 'history' ? 'white' : 'grey-4'"
        @click="changePage('history')"
        class="nav-btn"
      />
      <q-btn
        flat
        label="Rules"
        icon="menu_book"
        :color="currentPage === 'rules' ? 'white' : 'grey-4'"
        @click="changePage('rules')"
        class="nav-btn"
      />

      <!-- User Info -->
      <q-separator vertical class="q-mx-md separator" />

      <q-btn
        v-if="authStore.isAuthenticated"
        flat
        icon="refresh"
        label="Reset"
        color="grey-6"
        text-color="white"
        @click="emit('reset')"
        class="reset-btn"
      />

      <q-separator v-if="authStore.isAuthenticated" vertical class="q-mx-md separator" />

      <q-btn-dropdown
        v-if="authStore.isAuthenticated"
        flat
        :label="userDisplayName"
        icon="account_circle"
        color="white"
        class="user-dropdown"
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

      <!-- Show login button if not authenticated -->
      <q-btn
        v-else
        flat
        label="Login"
        icon="login"
        color="white"
        @click="router.push('/auth')"
        class="login-btn"
      />
    </div>

    <!-- Mobile Money Display -->
    <div v-if="authStore.isAuthenticated && playerMoney !== null" class="mobile-money-display">
      <img src="icons/util-icons/dollars.png" alt="Money" class="money-icon" />
      <span class="money-amount">${{ playerMoney }}</span>
    </div>

    <!-- Mobile Menu Button -->
    <q-btn
      flat
      dense
      round
      icon="menu"
      color="white"
      class="mobile-menu-btn"
      @click="mobileMenuOpen = !mobileMenuOpen"
    />
  </q-toolbar>

  <!-- Mobile Menu Drawer -->
  <q-drawer
    v-model="mobileMenuOpen"
    side="right"
    overlay
    :width="280"
    class="mobile-drawer"
  >
    <q-list padding class="mobile-menu-list">
      <q-item-label header class="text-weight-bold text-h6 q-pb-md">
        Menu
      </q-item-label>

      <q-item
        clickable
        v-close-popup
        @click="changePage('home')"
        :active="currentPage === 'home'"
        class="mobile-menu-item"
      >
        <q-item-section avatar>
          <q-icon name="casino" />
        </q-item-section>
        <q-item-section>
          <q-item-label>Game</q-item-label>
        </q-item-section>
      </q-item>

      <q-item
        clickable
        v-close-popup
        @click="changePage('history')"
        :active="currentPage === 'history'"
        class="mobile-menu-item"
      >
        <q-item-section avatar>
          <q-icon name="history" />
        </q-item-section>
        <q-item-section>
          <q-item-label>History</q-item-label>
        </q-item-section>
      </q-item>

      <q-item
        clickable
        v-close-popup
        @click="changePage('rules')"
        :active="currentPage === 'rules'"
        class="mobile-menu-item"
      >
        <q-item-section avatar>
          <q-icon name="menu_book" />
        </q-item-section>
        <q-item-section>
          <q-item-label>Rules</q-item-label>
        </q-item-section>
      </q-item>

      <q-separator class="q-my-md" />

      <q-item
        v-if="authStore.isAuthenticated"
        class="mobile-menu-item"
      >
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

      <q-item
        v-if="authStore.isAuthenticated"
        clickable
        v-close-popup
        @click="emit('reset')"
        class="mobile-menu-item"
      >
        <q-item-section avatar>
          <q-icon name="refresh" />
        </q-item-section>
        <q-item-section>
          <q-item-label>Reset</q-item-label>
        </q-item-section>
      </q-item>

      <q-item
        v-if="authStore.isAuthenticated"
        clickable
        v-close-popup
        @click="handleLogout"
        class="mobile-menu-item text-negative"
      >
        <q-item-section avatar>
          <q-icon name="logout" />
        </q-item-section>
        <q-item-section>
          <q-item-label>Logout</q-item-label>
        </q-item-section>
      </q-item>

      <q-item
        v-else
        clickable
        v-close-popup
        @click="router.push('/auth')"
        class="mobile-menu-item"
      >
        <q-item-section avatar>
          <q-icon name="login" />
        </q-item-section>
        <q-item-section>
          <q-item-label>Login</q-item-label>
        </q-item-section>
      </q-item>
    </q-list>
  </q-drawer>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from 'src/stores/auth'
import { Notify } from 'quasar'

const props = defineProps({
  playerMoney: {
    type: Number,
    default: null,
  },
})

const emit = defineEmits(['page-change', 'reset'])
const router = useRouter()
const authStore = useAuthStore()

const currentPage = ref('home')
const mobileMenuOpen = ref(false)

const userDisplayName = computed(() => {
  if (props.playerMoney !== null) {
    return `${authStore.userName} - $${props.playerMoney}`
  }
  return authStore.userName
})

const changePage = (page) => {
  currentPage.value = page
  emit('page-change', page)
  mobileMenuOpen.value = false // Close mobile menu after navigation
}

const handleLogout = async () => {
  const result = await authStore.logout()
  if (result.success) {
    Notify.create({
      type: 'positive',
      message: 'Logged out successfully',
      position: 'top',
    })
    mobileMenuOpen.value = false
    router.push('/auth')
  }
}
</script>

<style scoped>
.navbar-toolbar {
  background: rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(10px);
  border-radius: 0;
  margin-bottom: 0.5rem;
  padding: 0.5rem 1rem;
}

.navbar-title {
  display: flex;
  align-items: center;
  font-size: 1.75rem;
  font-weight: 600;
}

.logo-img {
  height: 72px;
  width: auto;
  vertical-align: middle;
}

.title-text {
  display: inline-block;
}

.desktop-nav {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.nav-btn {
  min-width: auto;
  padding: 0.5rem 0.75rem;
  font-size: 1.1rem;
  font-weight: 500;
}

.nav-btn :deep(.q-btn__content) {
  font-size: 1.1rem;
}

.separator {
  height: 30px;
}

.reset-btn {
  min-width: auto;
  font-size: 0.95rem;
  font-weight: 500;
}

.reset-btn :deep(.q-btn__content) {
  font-size: 0.95rem;
}

.user-dropdown,
.login-btn {
  min-width: auto;
  font-size: 0.95rem;
  font-weight: 500;
}

.user-dropdown :deep(.q-btn__content),
.login-btn :deep(.q-btn__content) {
  font-size: 0.95rem;
}

.mobile-money-display {
  display: none;
  align-items: center;
  gap: 0.35rem;
  padding: 0.2rem 0.6rem;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  margin-right: 0.5rem;
}

.money-icon {
  height: 20px;
  width: auto;
}

.money-amount {
  font-size: 0.75rem;
  font-weight: 600;
  color: white;
}

.mobile-menu-btn {
  display: none;
}

.mobile-drawer {
  background: linear-gradient(135deg, #0f766e 0%, #15803d 100%);
  backdrop-filter: blur(20px);
}

.mobile-drawer :deep(.q-drawer__content) {
  background: transparent;
}

.mobile-menu-list {
  padding: 1rem;
  background: transparent;
}

.mobile-menu-item {
  border-radius: 8px;
  margin-bottom: 0.5rem;
  transition: all 0.2s ease;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: white;
}

.mobile-menu-item:hover {
  background: rgba(0, 0, 0, 0.5);
  border-color: rgba(251, 191, 36, 0.4);
}

.mobile-menu-item :deep(.q-item__label) {
  color: white;
  font-weight: 500;
  font-size: 1rem;
}

.mobile-menu-item :deep(.q-item__label--caption) {
  color: rgba(255, 255, 255, 0.7);
}

.mobile-menu-item :deep(.q-icon) {
  color: #fbbf24;
}

.mobile-menu-item.text-negative :deep(.q-item__label) {
  color: #ef4444;
}

.mobile-menu-item.text-negative :deep(.q-icon) {
  color: #ef4444;
}

.mobile-menu-list :deep(.q-item-label--header) {
  color: white;
  font-weight: 700;
  font-size: 1.25rem;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.mobile-menu-list :deep(.q-separator) {
  background: rgba(255, 255, 255, 0.2);
  margin: 1rem 0;
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .navbar-toolbar {
    padding: 0.15rem 0.5rem;
    border-radius: 0;
    min-height: 40px !important;
  }

  .navbar-toolbar :deep(.q-toolbar__content) {
    min-height: 40px;
  }

  .navbar-title {
    font-size: 1rem;
  }

  .logo-img {
    height: 32px;
  }

  .title-text {
    display: none;
  }

  .desktop-nav {
    display: none;
  }

  .mobile-money-display {
    display: flex;
  }

  .mobile-menu-btn {
    display: block;
    padding: 0.25rem;
  }

  .mobile-menu-btn :deep(.q-icon) {
    font-size: 1.5rem;
  }
}

/* Tablet adjustments */
@media (min-width: 769px) and (max-width: 1024px) {
  .nav-btn {
    padding: 0.5rem;
  }

  .nav-btn .q-btn__content {
    font-size: 1rem;
  }
}
</style>
