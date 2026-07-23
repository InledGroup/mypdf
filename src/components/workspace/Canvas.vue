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

const emit = defineEmits(['rotate', 'remove', 'move', 'update:targetPagePos', 'update:crop', 'reorder'])

const currentPageIndex = ref(0)
const targetPagePos = ref<number | null>(null)

const next = () => { if (currentPageIndex.value < props.pages.length - 1) currentPageIndex.value++ }
const prev = () => { if (currentPageIndex.value > 0) currentPageIndex.value-- }

const currentPage = computed(() => {
  if (props.sortedPages.length === 0) return null
  return props.sortedPages[currentPageIndex.value] || null
})

// Drag and drop state
const draggedPageId = ref<string | null>(null)

const onDragStart = (e: DragEvent, pageId: string) => {
  if (props.activeTool !== 'reorder') return
  draggedPageId.value = pageId
  if (e.dataTransfer) {
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', pageId)
  }
}

const onDragOver = (e: DragEvent) => {
  if (props.activeTool !== 'reorder') return
  e.preventDefault() // Allow drop
}

const onDrop = (e: DragEvent, targetPageId: string) => {
  if (props.activeTool !== 'reorder') return
  e.preventDefault()
  if (!draggedPageId.value || draggedPageId.value === targetPageId) return

  const draggedIndex = props.pages.findIndex(p => p.id === draggedPageId.value)
  const targetIndex = props.pages.findIndex(p => p.id === targetPageId)

  if (draggedIndex !== -1 && targetIndex !== -1) {
    const draggedPage = props.pages[draggedIndex]
    const targetPage = props.pages[targetIndex]
    if (draggedPage && targetPage) {
      // Place dragged item slightly before or after depending on original index comparison
      draggedPage.order = targetIndex > draggedIndex ? targetPage.order + 0.5 : targetPage.order - 0.5
      emit('reorder')
    }
  }
  draggedPageId.value = null
}
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
        :draggable="activeTool === 'reorder'"
        @dragstart="onDragStart($event, page.id)"
        @dragover="onDragOver($event)"
        @drop="onDrop($event, page.id)"
        @dragend="draggedPageId = null"
        @rotate="(dir) => $emit('rotate', page.id, dir)"
        @remove="() => $emit('remove', page.id)"
        @update:crop="(crop) => $emit('update:crop', page.id, crop)"
        :class="{ 'is-dragging': draggedPageId === page.id }"
        :style="{ cursor: activeTool === 'reorder' ? 'grab' : 'default' }"
      />
    </div>

    <div v-else-if="currentPage" class="individual-container">
      <div class="focus-nav">
        <fluent-button appearance="subtle" @click="prev" :disabled="currentPageIndex === 0" class="nav-btn">
          ← Prev
        </fluent-button>
        <span class="nav-info">{{ currentPageIndex + 1 }} / {{ pages.length }}</span>
        <fluent-button appearance="subtle" @click="next" :disabled="currentPageIndex === pages.length - 1" class="nav-btn">
          Next →
        </fluent-button>
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
        @rotate="(dir) => $emit('rotate', currentPage!.id, dir)"
        @remove="() => $emit('remove', currentPage!.id)"
        @move="(rel) => $emit('move', currentPage!.id, targetPagePos, rel)"
        @update:crop="(crop) => $emit('update:crop', currentPage!.id, crop)"
      />
    </div>
  </div>
</template>

<style scoped>
.canvas-area {
  flex: 1;
  overflow-y: auto;
  padding: var(--spacingHorizontalXXL);
}

@media (max-width: 768px) {
  .canvas-area {
    padding: var(--spacingHorizontalM);
  }
}

.mosaic-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: var(--spacingHorizontalXXL);
}

@media (max-width: 768px) {
  .mosaic-grid {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: var(--spacingHorizontalL);
  }
}

.individual-container {
  display: flex;
  flex-direction: column;
  gap: var(--spacingHorizontalXXL);
  align-items: center;
  padding-bottom: 4rem;
}

.focus-nav {
  display: flex;
  align-items: center;
  gap: var(--spacingHorizontalL);
  padding: var(--spacingVerticalXS) var(--spacingHorizontalM);
  background: var(--colorNeutralBackgroundCard);
  border: 1px solid var(--colorNeutralStroke1);
  border-radius: var(--borderRadiusLarge);
}

.nav-btn {
  --button-height: 32px;
  --button-padding-end: var(--spacingHorizontalM);
  --button-padding-start: var(--spacingHorizontalM);
}

.nav-info {
  font-weight: var(--fontWeightSemibold);
  color: var(--colorBrandForeground1);
  font-size: var(--fontSizeBase300);
  min-width: 50px;
  text-align: center;
}

/* Dragging styles */
.is-dragging {
  opacity: 0.4;
  border: 1px dashed var(--colorBrandStroke1);
}
</style>
