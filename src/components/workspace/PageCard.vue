<script setup lang="ts">
import { RotateCcw, RotateCw, Trash2, Crop as CropIcon } from 'lucide-vue-next'
import type { PageInfo, ToolType } from '../../types'
import { ref, watch } from 'vue'

const props = defineProps<{
  page: PageInfo;
  activeTool: ToolType;
  isDuplicate?: boolean;
  targetPagePos: number | null;
  isIndividual?: boolean;
  numbering?: { enabled: boolean; pos: string; bg: string; text: string; index: number };
  watermark?: { enabled: boolean; type: string; text: string; image: string | null; pos: string; repeat: boolean; opacity: number; color: string; size: number; rotation: number };
}>()

const emit = defineEmits(['rotate', 'remove', 'move', 'update:targetPagePos', 'update:crop'])

const getGroupColor = (g?: number) => {
  if (!g) return '#e2e8f0'
  const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316', '#6366f1', '#14b8a6']
  return colors[(g - 1) % colors.length]
}

const getPreviewPosStyle = (pos: string) => {
  const [v, h] = pos.split('-')
  const style: any = { position: 'absolute' }
  if (v === 'top') style.top = '10px'
  else if (v === 'bottom') style.bottom = '10px'
  else style.top = '50%', style.transform = 'translateY(-50%)'

  if (h === 'left') style.left = '10px'
  else if (h === 'right') style.right = '10px'
  else style.left = '50%', style.transform = (style.transform || '') + ' translateX(-50%)'
  
  return style
}

// --- CROPPING LOGIC ---
const localCrop = ref({ ...(props.page.crop || { x: 10, y: 10, width: 80, height: 80 }) })

// Keep local state in sync with props (important for "Apply All")
watch(() => props.page.crop, (newCrop) => {
  if (newCrop) localCrop.value = { ...newCrop }
}, { deep: true })

const startDrag = (e: MouseEvent, type: 'move' | 'nw' | 'ne' | 'sw' | 'se') => {
  if (props.activeTool !== 'crop') return
  e.preventDefault()
  e.stopPropagation()
  
  const startX = e.clientX
  const startY = e.clientY
  const startRect = { ...localCrop.value }
  
  const container = (e.currentTarget as HTMLElement).closest('.render-box')
  if (!container) return
  const rect = container.getBoundingClientRect()

  const onMouseMove = (moveEvent: MouseEvent) => {
    const dx = ((moveEvent.clientX - startX) / rect.width) * 100
    const dy = ((moveEvent.clientY - startY) / rect.height) * 100

    const newCrop = { ...startRect }

    if (type === 'move') {
      newCrop.x = Math.max(0, Math.min(100 - startRect.width, startRect.x + dx))
      newCrop.y = Math.max(0, Math.min(100 - startRect.height, startRect.y + dy))
    } else {
      if (type.includes('n')) {
        const delta = Math.min(dy, startRect.height - 5)
        newCrop.y = startRect.y + delta
        newCrop.height = startRect.height - delta
      }
      if (type.includes('s')) {
        newCrop.height = Math.max(5, Math.min(100 - startRect.y, startRect.height + dy))
      }
      if (type.includes('w')) {
        const delta = Math.min(dx, startRect.width - 5)
        newCrop.x = startRect.x + delta
        newCrop.width = startRect.width - delta
      }
      if (type.includes('e')) {
        newCrop.width = Math.max(5, Math.min(100 - startRect.x, startRect.width + dx))
      }
    }

    localCrop.value = newCrop
    emit('update:crop', { ...newCrop })
  }

  const onMouseUp = () => {
    window.removeEventListener('mousemove', onMouseMove)
    window.removeEventListener('mouseup', onMouseUp)
  }

  window.addEventListener('mousemove', onMouseMove)
  window.addEventListener('mouseup', onMouseUp)
}
</script>

<template>
  <div class="page-item" :class="{ 'individual-view': isIndividual }">
    <div 
      class="page-container" 
      :class="{ 'has-error': isDuplicate && activeTool === 'reorder' }"
      :style="{ borderColor: (activeTool === 'split') ? getGroupColor(page.group) : (isDuplicate && activeTool === 'reorder' ? '#ef4444' : undefined) }"
    >
      <div class="render-box">
        <div class="document-layer" :style="{ transform: `rotate(${page.rotation}deg)` }">
          <img :src="page.dataUrl" alt="PDF Page" />
        </div>

        <div class="overlay-layer">
          <template v-if="watermark?.enabled">
            <div v-if="watermark.repeat" class="watermark-grid">
               <div v-for="n in 12" :key="n" class="wm-cell" :style="{ opacity: watermark.opacity, color: watermark.color, fontSize: (watermark.size/2.5) + 'px', transform: `rotate(${watermark.rotation}deg)` }">
                  <template v-if="watermark.type === 'text'">{{ watermark.text }}</template>
                  <img v-else-if="watermark.image" :src="watermark.image" class="wm-img" />
               </div>
            </div>
            <div v-else class="watermark-single" :style="getPreviewPosStyle(watermark.pos)">
               <div :style="{ opacity: watermark.opacity, color: watermark.color, fontSize: watermark.size + 'px', transform: `rotate(${watermark.rotation}deg)` }">
                  <template v-if="watermark.type === 'text'">{{ watermark.text }}</template>
                  <img v-else-if="watermark.image" :src="watermark.image" class="wm-img" />
               </div>
            </div>
          </template>

          <div v-if="numbering?.enabled" class="numbering-preview" :style="[getPreviewPosStyle(numbering.pos), { background: numbering.bg, color: numbering.text }]">
            {{ numbering.index }}
          </div>

          <!-- CROP OVERLAY -->
          <div v-if="activeTool === 'crop'" class="crop-overlay">
            <div 
              class="crop-box" 
              :style="{ left: localCrop.x + '%', top: localCrop.y + '%', width: localCrop.width + '%', height: localCrop.height + '%' }" 
              @mousedown="startDrag($event, 'move')"
            >
              <div class="handle nw" @mousedown.stop="startDrag($event, 'nw')"></div>
              <div class="handle ne" @mousedown.stop="startDrag($event, 'ne')"></div>
              <div class="handle sw" @mousedown.stop="startDrag($event, 'sw')"></div>
              <div class="handle se" @mousedown.stop="startDrag($event, 'se')"></div>
              <div class="crop-badge"><CropIcon :size="12" /> Crop Area</div>
            </div>
          </div>
        </div>
      </div>

      <div class="page-badge-index">#{{ page.originalPageIndex + 1 }}</div>
      <div v-if="activeTool === 'split' && page.group" class="group-badge" :style="{ background: getGroupColor(page.group) }">
        Group #{{ page.group }}
      </div>
    </div>
    
    <div class="page-actions">
      <template v-if="activeTool === 'reorder'">
        <template v-if="!isIndividual"><span class="label">Pos:</span><input type="number" v-model.number="page.order" class="order-input" /></template>
        <template v-else>
          <div class="move-inputs">
            <input type="number" :value="targetPagePos" @input="$emit('update:targetPagePos', ($event.target as any).valueAsNumber)" placeholder="Pos" />
            <button @click="$emit('move', 'before')" class="btn-action">BEFORE</button>
            <button @click="$emit('move', 'after')" class="btn-action">AFTER</button>
          </div>
        </template>
      </template>
      <template v-else-if="activeTool === 'rotate'">
        <button @click="$emit('rotate', 'ccw')"><RotateCcw :size="16" /></button>
        <button @click="$emit('rotate', 'cw')"><RotateCw :size="16" /></button>
      </template>
      <template v-else-if="activeTool === 'merge'"><button @click="$emit('remove')" class="text-red"><Trash2 :size="16" /></button></template>
      <template v-else-if="activeTool === 'ocr'"><span class="badge-status">OCR Active</span></template>
      <template v-else-if="activeTool === 'split'">
        <select v-model="page.group" class="group-select"><option v-for="n in 10" :key="n" :value="n">PDF #{{ n }}</option></select>
      </template>
      <template v-else-if="activeTool === 'crop'">
        <button @click="localCrop = { x: 0, y: 0, width: 100, height: 100 }; $emit('update:crop', localCrop)" class="btn-action">RESET CROP</button>
      </template>
    </div>
  </div>
</template>

<style scoped>
.page-item { display: flex; flex-direction: column; gap: 0.75rem; align-items: center; width: 100%; }
.page-container { position: relative; background: #f1f5f9; border-radius: 0.5rem; box-shadow: 0 4px 12px rgba(0,0,0,0.08); aspect-ratio: 1 / 1.414; width: 100%; overflow: hidden; border: 2px solid #e2e8f0; transition: all 0.2s; }
.page-container.has-error { border: 4px solid #ef4444 !important; box-shadow: 0 0 15px rgba(239, 68, 68, 0.5) !important; z-index: 15; }
.render-box { width: 100%; height: 100%; position: relative; overflow: hidden; }
.document-layer { width: 100%; height: 100%; transition: transform 0.3s ease; display: flex; align-items: center; justify-content: center; }
.document-layer img { width: 100%; height: 100%; object-fit: contain; background: white; }
.overlay-layer { position: absolute; inset: 0; pointer-events: none; z-index: 10; }
.watermark-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; padding: 10px; height: 100%; }
.wm-cell { display: flex; align-items: center; justify-content: center; font-weight: 900; white-space: nowrap; text-align: center; }
.wm-img { max-width: 80%; height: auto; }
.watermark-single { display: flex; align-items: center; justify-content: center; font-weight: 900; }
.numbering-preview { padding: 2px 6px; border-radius: 3px; font-size: 10px; font-weight: 800; min-width: 18px; text-align: center; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }

.crop-overlay { position: absolute; inset: 0; z-index: 30; pointer-events: auto; }
.crop-box { position: absolute; border: 2px solid #3b82f6; box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.5); cursor: move; z-index: 35; }
.handle { position: absolute; width: 14px; height: 14px; background: white; border: 2px solid #3b82f6; border-radius: 50%; box-shadow: 0 2px 4px rgba(0,0,0,0.2); }
.handle.nw { top: -7px; left: -7px; cursor: nw-resize; }
.handle.ne { top: -7px; right: -7px; cursor: ne-resize; }
.handle.sw { bottom: -7px; left: -7px; cursor: sw-resize; }
.handle.se { bottom: -7px; right: -7px; cursor: se-resize; }
.crop-badge { position: absolute; top: 4px; left: 4px; background: #3b82f6; color: white; padding: 2px 6px; border-radius: 4px; font-size: 9px; font-weight: 800; display: flex; align-items: center; gap: 4px; pointer-events: none; }

.page-badge-index { position: absolute; top: 8px; left: 8px; background: #3b82f6; color: white; width: 22px; height: 22px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.65rem; font-weight: 800; z-index: 20; box-shadow: 0 2px 4px rgba(0,0,0,0.2); }
.group-badge { position: absolute; top: 8px; right: 8px; color: white; padding: 2px 6px; border-radius: 4px; font-size: 0.6rem; font-weight: 800; z-index: 20; }
.page-actions { display: flex; gap: 0.5rem; background: white; padding: 0.4rem 0.8rem; border-radius: 2rem; box-shadow: 0 2px 8px rgba(0,0,0,0.05); align-items: center; border: 1px solid #f1f5f9; }
.order-input { width: 40px; border: 1px solid #e2e8f0; border-radius: 4px; text-align: center; font-weight: 800; font-size: 0.8rem; }
.group-select { border: 1px solid #e2e8f0; border-radius: 4px; font-size: 0.7rem; font-weight: 700; outline: none; padding: 2px; }
.btn-action { background: #eff6ff; color: #3b82f6; border: none; padding: 4px 8px; border-radius: 4px; font-weight: 800; font-size: 0.65rem; cursor: pointer; }
.individual-view { max-width: 450px; margin: 0 auto; }
.badge-status { font-size: 0.65rem; font-weight: 800; color: #3b82f6; background: #eff6ff; padding: 0.15rem 0.5rem; border-radius: 1rem; }
</style>
