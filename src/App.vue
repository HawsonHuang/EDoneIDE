<script setup lang="ts">
import MainPage from './components/MainPage.vue'
</script>

<template>
  <div class="w-screen h-screen overflow-hidden bg-white">
    <MainPage />
  </div>
</template>

<style>
/* 强制重置样式，防止出现多余的白边 */
html, body, #app {
  margin: 0;
  padding: 0;
  height: 100%;
  width: 100%;
}
</style>