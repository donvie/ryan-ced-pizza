<template>
  <div class="q-pa-md">
    <my-table></my-table>
    <my-dashboard class="q-mb-lg"></my-dashboard>
  </div>
</template>

<script setup>
import MyDashboard from 'src/components/MyDashboard.vue'
import MyTable from 'src/components/MyTable.vue'

import { useRouter } from 'vue-router'
import { getCurrentInstance, onMounted } from 'vue'
const app = getCurrentInstance()
const { $global } = app.appContext.config.globalProperties
const router = useRouter()

onMounted(async () => {
  if (!$global.user) {
    console.log('111')
    router.push('/')
  }
})
</script>
