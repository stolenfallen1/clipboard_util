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
  <div class="bg-gray-50 min-h-screen">
    <ClipboardUtil />
  </div>
</template>

<style>
body {
  margin: 0;
  padding: 0;
  min-width: 350px;
  min-height: 500px;
}
</style>