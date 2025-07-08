<template>
  <div class="markdown-body" style="white-space:pre-line;">{{ content }}</div>
</template>

<script setup>
const props = defineProps({ content: { type: String, required: true } })
</script>

<style scoped>
.markdown-body {
  font-size: 15px;
  line-height: 1.8;
  color: #2d3748;
  word-break: break-word;
}
</style> 