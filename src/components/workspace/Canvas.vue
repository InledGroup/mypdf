<script setup lang="ts">
import { ref, computed } from 'vue'
import PageCard from './PageCard.vue'
import type { PageInfo, ToolType, ViewMode } from '../../types'

const props = defineProps<{
  pages: PageInfo[];
  sortedPages: PageInfo[];
  activeTool: ToolType;
  viewMode: ViewMode;
  duplicateOrders: Set<string>;
  numbering?: any;
  watermark?: any;
}>()

const emit = defineEmits(['rotate', 'remove', 'move', 'update:targetPagePos', 'update:crop'])

const currentPageIndex = ref(0)
const targetPagePos = ref<number | null>(null)

const next = () => { if (currentPageIndex.value < props.pages.length - 1) currentPageIndex.value++ }
const prev = () => { if (currentPageIndex.value > 0) currentPageIndex.value-- }

const currentPage = computed(() => {
  if (props.sortedPages.length === 0) return null
  return props.sortedPages[currentPageIndex.value] || null
})
</script>

<template>
  <div class="canvas-area">
    <div v-if="viewMode === 'mosaic'" class="mosaic-grid">
      <PageCard 
        v-for="(page, idx) in pages" 
        :key="page.id"
        :page="page"
        :active-tool="activeTool"
        :is-duplicate="duplicateOrders.has(page.id)"
        :target-page-pos="null"
        :numbering="numbering ? { ...numbering, index: idx + 1 } : undefined"
        :watermark="watermark"
        @rotate="(dir) => $emit('rotate', page.id, dir)"
        @remove="() => $emit('remove', page.id)"
        @update:crop="(crop) => $emit('update:crop', page.id, crop)"
      />
    </div>

    <div v-else-if="currentPage" class="individual-container">
      <div class="focus-navigation">
        <button @click="prev" :disabled="currentPageIndex === 0" class="nav-btn">Prev</button>
        <span class="nav-info">{{ currentPageIndex + 1 }} / {{ pages.length }}</span>
        <button @click="next" :disabled="currentPageIndex === pages.length - 1" class="nav-btn">Next</button>
      </div>

      <PageCard 
        :page="currentPage"
        :active-tool="activeTool"
        :is-duplicate="duplicateOrders.has(currentPage.id)"
        :is-individual="true"
        :target-page-pos="targetPagePos"
        :numbering="numbering ? { ...numbering, index: currentPageIndex + 1 } : undefined"
        :watermark="watermark"
        @update:targetPagePos="(val) => targetPagePos = val"
        @rotate="(dir) => $emit('rotate', currentPage.id, dir)"
        @remove="() => $emit('remove', currentPage.id)"
        @move="(rel) => $emit('move', currentPage.id, targetPagePos, rel)"
        @update:crop="(crop) => $emit('update:crop', currentPage.id, crop)"
      />
    </div>
  </div>
</template>

<style scoped>
.canvas-area { flex: 1; overflow-y: auto; padding: 2rem; background: #f8fafc; }
.mosaic-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 2.5rem; }
.individual-container { display: flex; flex-direction: column; gap: 2rem; align-items: center; padding-bottom: 4rem; }
.focus-navigation { display: flex; gap: 1.5rem; align-items: center; background: white; padding: 0.5rem 1.5rem; border-radius: 2rem; box-shadow: 0 4px 12px rgba(0,0,0,0.05); border: 1px solid #f1f5f9; }
.nav-btn { background: white; border: 1px solid #e2e8f0; padding: 0.5rem 1.2rem; border-radius: 0.5rem; font-weight: 800; color: #1e293b; cursor: pointer; }
.nav-btn:disabled { opacity: 0.4; }
.nav-info { font-weight: 800; color: #3b82f6; font-size: 0.9rem; min-width: 60px; text-align: center; }
</style>
