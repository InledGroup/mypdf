<script setup lang="ts">
import { RotateCcw, RotateCw, Trash2, MoveLeft, MoveRight } from 'lucide-vue-next'
import type { PageInfo, ToolType } from '../../types'

defineProps<{
  page: PageInfo;
  activeTool: ToolType;
  isDuplicate?: boolean;
  targetPagePos: number | null;
  isIndividual?: boolean;
}>()

defineEmits(['rotate', 'remove', 'move', 'update:targetPagePos'])

const getGroupColor = (g?: number) => {
  if (!g) return '#e2e8f0'
  const colors = [
    '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', 
    '#ec4899', '#06b6d4', '#f97316', '#6366f1', '#14b8a6'
  ]
  return colors[(g - 1) % colors.length]
}
</script>

<template>
  <div class="page-item" :class="{ 'individual-view': isIndividual }">
    <div 
      class="page-container" 
      :class="{ 'has-error': isDuplicate }"
      :style="{ transform: `rotate(${page.rotation}deg)`, borderColor: activeTool === 'split' ? getGroupColor(page.group) : undefined, borderWeight: activeTool === 'split' ? '4px' : '1px' }"
    >
      <img :src="page.dataUrl" alt="Page preview" />
      <div class="page-number">#{{ page.originalPageIndex + 1 }}</div>
      <div v-if="isIndividual" class="focus-badge">Original Page #{{ page.originalPageIndex + 1 }}</div>
      <div v-if="activeTool === 'split' && page.group" class="group-badge" :style="{ background: getGroupColor(page.group) }">
        PDF #{{ page.group }}
      </div>
    </div>
    
    <!-- Controls Overlay/Bottom -->
    <div class="page-actions">
      <!-- Reorder Tool -->
      <template v-if="activeTool === 'reorder'">
        <template v-if="!isIndividual">
          <span class="label">New Pos:</span>
          <input type="number" v-model.number="page.order" class="order-input" />
        </template>
        <template v-else>
          <div class="move-logic">
            <label>Move to Pos:</label>
            <div class="move-inputs">
              <input type="number" :value="targetPagePos" @input="$emit('update:targetPagePos', ($event.target as any).valueAsNumber)" placeholder="Pos" />
              <button @click="$emit('move', 'before')" class="btn-action">BEFORE</button>
              <button @click="$emit('move', 'after')" class="btn-action">AFTER</button>
            </div>
          </div>
        </template>
      </template>

      <!-- Rotate Tool -->
      <template v-else-if="activeTool === 'rotate'">
        <button @click="$emit('rotate', 'ccw')" title="Rotate Left"><RotateCcw :size="16" /></button>
        <button @click="$emit('rotate', 'cw')" title="Rotate Right"><RotateCw :size="16" /></button>
      </template>

      <!-- Merge Tool -->
      <template v-else-if="activeTool === 'merge'">
        <button @click="$emit('remove')" class="text-red" title="Remove Page">
          <Trash2 :size="16" />
        </button>
      </template>

      <!-- OCR Tool -->
      <template v-else-if="activeTool === 'ocr'">
        <span class="badge-status">OCR Ready</span>
      </template>

      <!-- Split Tool -->
      <template v-else-if="activeTool === 'split'">
        <div class="split-manual">
          <span class="label">PDF:</span>
          <select v-model="page.group" class="group-select">
            <option v-for="n in 10" :key="n" :value="n">#{{ n }}</option>
          </select>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
.page-item { display: flex; flex-direction: column; gap: 1rem; align-items: center; }
.page-container { position: relative; background: white; border-radius: 0.25rem; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); transition: transform 0.3s ease; aspect-ratio: 1 / 1.414; width: 100%; display: flex; align-items: center; justify-content: center; overflow: hidden; border: 2px solid #e2e8f0; }
.page-container.has-error { border: 3px solid #ef4444; box-shadow: 0 0 10px rgba(239, 68, 68, 0.3); }
.page-container img { width: 100%; height: 100%; object-fit: contain; }
.page-number { position: absolute; top: -10px; left: -10px; background: #3b82f6; color: white; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.75rem; font-weight: 800; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2); z-index: 10; }
.focus-badge { position: absolute; bottom: 0.5rem; right: 0.5rem; background: rgba(0,0,0,0.6); color: white; padding: 0.15rem 0.5rem; border-radius: 0.25rem; font-size: 0.7rem; }
.group-badge { position: absolute; top: 0.5rem; right: 0.5rem; color: white; padding: 0.15rem 0.5rem; border-radius: 0.25rem; font-size: 0.65rem; font-weight: 800; z-index: 10; box-shadow: 0 1px 3px rgba(0,0,0,0.2); }
.page-actions { display: flex; gap: 0.5rem; background: white; padding: 0.4rem 0.8rem; border-radius: 2rem; box-shadow: 0 2px 4px rgba(0,0,0,0.05); align-items: center; }
.page-actions button { background: transparent; border: none; padding: 0.25rem; cursor: pointer; color: #1e293b; border-radius: 0.25rem; display: flex; align-items: center; }
.page-actions button:hover { background: #f1f5f9; }
.label { font-size: 0.75rem; font-weight: 700; color: #64748b; margin-right: 0.2rem; }
.order-input { width: 45px; border: 1px solid #e2e8f0; border-radius: 0.25rem; text-align: center; font-weight: 700; padding: 0.1rem; }
.badge-status { font-size: 0.65rem; font-weight: 800; color: #3b82f6; background: #eff6ff; padding: 0.15rem 0.5rem; border-radius: 1rem; }
.text-red { color: #ef4444 !important; }
.individual-view { width: 100%; max-width: 500px; margin: 0 auto; }
.move-logic { display: flex; flex-direction: column; gap: 0.5rem; align-items: center; }
.move-inputs { display: flex; gap: 0.4rem; }
.move-inputs input { width: 50px; border: 1px solid #e2e8f0; border-radius: 0.4rem; text-align: center; }
.btn-action { background: #eff6ff; color: #3b82f6; border: none; padding: 0.35rem 0.75rem; border-radius: 0.4rem; font-weight: 700; font-size: 0.75rem; }
.split-manual { display: flex; align-items: center; gap: 0.25rem; }
.group-select { border: 1px solid #e2e8f0; border-radius: 0.4rem; font-size: 0.75rem; font-weight: 700; outline: none; background: #f8fafc; cursor: pointer; }
</style>
