<script setup lang="ts">
import { ref } from 'vue'
import PageCard from './PageCard.vue'
import type { PageInfo, ToolType, ViewMode } from '../../types'

const props = defineProps<{
  pages: PageInfo[];
  sortedPages: PageInfo[];
  activeTool: ToolType;
  viewMode: ViewMode;
  duplicateOrders: Set<string>;
}>()

const emit = defineEmits(['rotate', 'remove', 'move'])

const currentPageIndex = ref(0)
const targetPagePos = ref<number | null>(null)

const next = () => { if (currentPageIndex.value < props.pages.length - 1) currentPageIndex.value++ }
const prev = () => { if (currentPageIndex.value > 0) currentPageIndex.value-- }
</script>

<template>
  <div class="canvas-area">
    <!-- Mosaic View -->
    <div v-if="viewMode === 'mosaic'" class="mosaic-grid">
      <PageCard 
        v-for="page in pages" 
        :key="page.id"
        :page="page"
        :active-tool="activeTool"
        :is-duplicate="duplicateOrders.has(page.id)"
        :target-page-pos="null"
        @rotate="(dir) => $emit('rotate', page.id, dir)"
        @remove="() => $emit('remove', page.id)"
      />
    </div>

    <!-- Individual View -->
    <div v-else class="individual-container">
      <div class="focus-navigation">
        <button @click="prev" :disabled="currentPageIndex === 0" class="nav-btn">Prev</button>
        <span class="nav-info">{{ currentPageIndex + 1 }} / {{ pages.length }}</span>
        <button @click="next" :disabled="currentPageIndex === pages.length - 1" class="nav-btn">Next</button>
      </div>

      <PageCard 
        :page="sortedPages[currentPageIndex]"
        :active-tool="activeTool"
        :is-duplicate="duplicateOrders.has(sortedPages[currentPageIndex].id)"
        :is-individual="true"
        v-model:targetPagePos="targetPagePos"
        @rotate="(dir) => $emit('rotate', sortedPages[currentPageIndex].id, dir)"
        @remove="() => $emit('remove', sortedPages[currentPageIndex].id)"
        @move="(rel) => $emit('move', sortedPages[currentPageIndex].id, targetPagePos, rel)"
      />
    </div>
  </div>
</template>

<style scoped>
.canvas-area { flex: 1; overflow-y: auto; padding: 2rem; }

.mosaic-grid {
  display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 2.5rem;
}

.individual-container {
  display: flex; flex-direction: column; gap: 2rem; align-items: center;
}

.focus-navigation {
  display: flex; gap: 1.5rem; align-items: center; background: white;
  padding: 0.5rem 1.5rem; border-radius: 2rem; box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.nav-btn {
  background: transparent; border: 1px solid #e2e8f0; padding: 0.4rem 1.2rem;
  border-radius: 0.5rem; font-weight: 700; color: #1e293b;
}

.nav-btn:disabled { opacity: 0.5; cursor: not-allowed; }

.nav-info { font-weight: 800; color: #3b82f6; font-size: 0.875rem; }
</style>
