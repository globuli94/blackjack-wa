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
    />
  </q-toolbar>
</template>

<script setup>
import { ref } from 'vue'

const emit = defineEmits(['page-change'])
const currentPage = ref('home')

const changePage = (page) => {
  currentPage.value = page
  emit('page-change', page)
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
