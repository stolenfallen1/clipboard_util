<script setup lang="ts">
import { defineComponent } from 'vue';
import ClipboardUtil from "./components/ClipboardUtil.vue";

defineComponent({
  components: {
    ClipboardUtil
  }
});
</script>

<template>
  <ClipboardUtil />
</template>

<style>
html, body {
    margin: 0;
    padding: 0;
    background-color: white;
}

.app {
    width: 100%;
    height: 100%;
}
</style>