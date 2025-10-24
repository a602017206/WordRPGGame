<script setup>
import { ref } from 'vue'

defineProps({
  msg: String
})

const count = ref(0)
</script>

<template>
  <h1>{{ msg }}</h1>

  <div class="card">
    <button type="button" @click="count++">计数: {{ count }}</button>
    <p>
      编辑
      <code>src/components/HelloWorld.vue</code> 来测试 HMR
    </p>
  </div>

  <p>
    查看更多信息：
    <a href="https://vuejs.org/guide/quick-start.html" target="_blank">Vue 3 文档</a>
  </p>
  <p class="read-the-docs">点击 Vite 和 Vue 图标了解更多</p>
</template>

<style scoped>
.read-the-docs {
  color: #888;
}
</style>
