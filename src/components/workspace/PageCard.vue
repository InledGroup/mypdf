<script setup lang="ts">
import { RotateCcw, RotateCw, Trash2 } from 'lucide-vue-next'
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
  if (!g) return 'var(--colorNeutralStroke1)'
  const colors = ['#0078d4', '#d13438', '#0f7b0f', '#ca5010', '#8764b8', '#e3008c', '#00b294', '#ff8c00', '#5c2d91', '#008272']
  return colors[(g - 1) % colors.length]
}

const getPreviewPosStyle = (pos: string) => {
  const [v, h] = pos.split('-')
  const style: any = { position: 'absolute' }
  if (v === 'top') style.top = '4cqw'
  else if (v === 'bottom') style.bottom = '4cqw'
  else style.top = '50%', style.transform = 'translateY(-50%)'

  if (h === 'left') style.left = '4cqw'
  else if (h === 'right') style.right = '4cqw'
  else style.left = '50%', style.transform = (style.transform || '') + ' translateX(-50%)'
  
  return style
}

const localCrop = ref({ ...(props.page.crop || { x: 10, y: 10, width: 80, height: 80 }) })

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
      :style="{ borderColor: (activeTool === 'split') ? getGroupColor(page.group) : (isDuplicate && activeTool === 'reorder' ? '#d13438' : undefined) }"
    >
      <div class="render-box">
        <div class="document-layer" :style="{ transform: `rotate(${page.rotation}deg)` }">
          <img :src="page.dataUrl" alt="PDF Page" />
        </div>

        <div class="overlay-layer">
          <template v-if="watermark?.enabled">
            <div v-if="watermark.repeat" class="watermark-grid">
               <div v-for="n in 12" :key="n" class="wm-cell" :style="{ opacity: watermark.opacity, color: watermark.color, fontSize: (watermark.size / 15) + 'cqw', transform: `rotate(${watermark.rotation}deg)` }">
                  <template v-if="watermark.type === 'text'">{{ watermark.text }}</template>
                  <img v-else-if="watermark.image" :src="watermark.image" class="wm-img" :style="{ width: (watermark.size / 4) + 'cqw', maxWidth: '100%', height: 'auto' }" />
               </div>
            </div>
            <div v-else class="watermark-single" :style="getPreviewPosStyle(watermark.pos)">
               <div :style="{ opacity: watermark.opacity, color: watermark.color, fontSize: (watermark.size / 6) + 'cqw', transform: `rotate(${watermark.rotation}deg)` }">
                  <template v-if="watermark.type === 'text'">{{ watermark.text }}</template>
                  <img v-else-if="watermark.image" :src="watermark.image" class="wm-img" :style="{ width: (watermark.size * 0.8) + 'cqw', maxWidth: '100%', height: 'auto' }" />
               </div>
            </div>
          </template>

          <div v-if="numbering?.enabled" class="numbering-preview" :style="[getPreviewPosStyle(numbering.pos), { background: numbering.bg, color: numbering.text }]">
            {{ numbering.index }}
          </div>

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
              <div class="crop-badge">Crop Area</div>
            </div>
          </div>
        </div>
      </div>

      <div class="page-index">#{{ page.originalPageIndex + 1 }}</div>

      <div v-if="activeTool === 'split' && page.group" class="group-badge" :style="{ background: getGroupColor(page.group) }">
        PDF #{{ page.group }}
      </div>
    </div>
    
    <div class="page-actions">
      <template v-if="activeTool === 'reorder'">
        <template v-if="!isIndividual">
          <label class="action-label" :for="`pos-${page.originalPageIndex}`">Pos:</label>
          <input
            :id="`pos-${page.originalPageIndex}`"
            type="text"
            :value="String(page.order)"
            @input="page.order = Number(($event.target as any).value)"
            class="fluent-input order-field"
          />
        </template>
        <template v-else>
          <div class="move-inputs">
            <input
              type="text"
              :value="targetPagePos ? String(targetPagePos) : ''"
              @input="$emit('update:targetPagePos', ($event.target as any).valueAsNumber)"
              placeholder="Pos"
              class="fluent-input pos-field"
            />
            <fluent-button appearance="outline" @click="$emit('move', 'before')" class="action-btn">Before</fluent-button>
            <fluent-button appearance="outline" @click="$emit('move', 'after')" class="action-btn">After</fluent-button>
          </div>
        </template>
      </template>

      <template v-else-if="activeTool === 'rotate'">
        <button class="icon-btn" @click="$emit('rotate', 'ccw')" title="Rotate left">
          <RotateCcw :size="16" />
        </button>
        <button class="icon-btn" @click="$emit('rotate', 'cw')" title="Rotate right">
          <RotateCw :size="16" />
        </button>
      </template>

      <template v-else-if="activeTool === 'merge'">
        <button class="icon-btn icon-btn--danger" @click="$emit('remove')" title="Remove page">
          <Trash2 :size="16" />
        </button>
      </template>

      <template v-else-if="activeTool === 'ocr'">
        <span class="status-chip">OCR Active</span>
      </template>

      <template v-else-if="activeTool === 'split'">
        <select :value="String(page.group)" @change="page.group = Number(($event.target as any).value)" class="fluent-select group-select">
          <option v-for="n in 10" :key="n" :value="String(n)">PDF #{{ n }}</option>
        </select>
      </template>

      <template v-else-if="activeTool === 'crop'">
        <fluent-button appearance="outline" @click="localCrop = { x: 0, y: 0, width: 100, height: 100 }; $emit('update:crop', localCrop)" class="action-btn">
          Reset Crop
        </fluent-button>
      </template>
    </div>
  </div>
</template>

<style scoped>
.page-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
  align-items: center;
  width: 100%;
}

.page-container {
  position: relative;
  background: var(--colorNeutralBackgroundCard);
  border-radius: var(--borderRadiusMedium);
  box-shadow: var(--shadow4);
  aspect-ratio: 1 / 1.414;
  width: 100%;
  overflow: hidden;
  border: 1px solid var(--colorNeutralStroke1);
  transition: border-color 0.15s;
}

.page-container.has-error {
  border: 2px solid #d13438 !important;
  box-shadow: 0 0 8px rgba(209, 52, 56, 0.25) !important;
}

.render-box {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
  container-type: inline-size;
}

.document-layer {
  width: 100%;
  height: 100%;
  transition: transform 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.document-layer img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  background: white;
}

.overlay-layer {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 10;
}

.watermark-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 4px;
  padding: 4px;
  height: 100%;
}

.wm-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: var(--fontWeightBold);
  white-space: nowrap;
  text-align: center;
}

.wm-img {
  display: block;
}

.watermark-single {
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: var(--fontWeightBold);
}

.numbering-preview {
  padding: 1cqw 2cqw;
  border-radius: var(--borderRadiusSmall);
  font-size: 2.2cqw;
  font-weight: var(--fontWeightBold);
  min-width: 3.5cqw;
  text-align: center;
}

/* ── Crop ── */
.crop-overlay {
  position: absolute;
  inset: 0;
  z-index: 30;
  pointer-events: auto;
}

.crop-box {
  position: absolute;
  border: 2px solid var(--colorBrandForeground1);
  box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.5);
  cursor: move;
  z-index: 35;
}

.handle {
  position: absolute;
  width: 10px;
  height: 10px;
  background: white;
  border: 2px solid var(--colorBrandForeground1);
  border-radius: var(--borderRadiusSmall);
  box-shadow: var(--shadow4);
}

.handle.nw { top: -5px; left: -5px; cursor: nw-resize; }
.handle.ne { top: -5px; right: -5px; cursor: ne-resize; }
.handle.sw { bottom: -5px; left: -5px; cursor: sw-resize; }
.handle.se { bottom: -5px; right: -5px; cursor: se-resize; }

.crop-badge {
  position: absolute;
  top: 4px;
  left: 4px;
  background: var(--colorBrandForeground1);
  color: white;
  padding: 2px 5px;
  border-radius: var(--borderRadiusSmall);
  font-size: 9px;
  font-weight: var(--fontWeightBold);
  pointer-events: none;
}

/* ── Page index — square chip ── */
.page-index {
  position: absolute;
  top: 4px;
  left: 4px;
  background: var(--colorBrandForeground1);
  color: white;
  min-width: 22px;
  height: 18px;
  border-radius: var(--borderRadiusSmall);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 4px;
  font-size: 10px;
  font-weight: var(--fontWeightBold);
  z-index: 20;
  white-space: nowrap;
}

.group-badge {
  position: absolute;
  top: 4px;
  right: 4px;
  color: white;
  padding: 2px 5px;
  border-radius: var(--borderRadiusSmall);
  font-size: 9px;
  font-weight: var(--fontWeightBold);
  z-index: 20;
}

/* ── Actions bar — flat rectangle ── */
.page-actions {
  display: flex;
  gap: 4px;
  background: var(--colorNeutralBackground3);
  padding: 5px 8px;
  border-radius: var(--borderRadiusMedium);
  border: 1px solid var(--colorNeutralStroke1);
  align-items: center;
  flex-wrap: wrap;
  justify-content: center;
  width: 100%;
  box-sizing: border-box;
}

/* Fluent-style native input & select */
.fluent-input,
.fluent-select {
  height: 28px;
  padding: 0 8px;
  border: 1px solid var(--colorNeutralStroke1);
  border-radius: var(--borderRadiusMedium);
  background: var(--colorNeutralBackground1);
  color: var(--colorNeutralForeground1);
  font-family: inherit;
  font-size: var(--fontSizeBase200);
  outline: none;
  transition: border-color 0.1s;
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  line-height: 1;
  margin: 0;
  vertical-align: middle;
}

.fluent-select {
  padding-right: 24px;
  appearance: none;
  background-image: url("data:image/svg+xml;utf8,<svg fill='%23666666' height='14' viewBox='0 0 24 24' width='14' xmlns='http://www.w3.org/2000/svg'><path d='M7 10l5 5 5-5z'/><path d='M0 0h24v24H0z' fill='none'/></svg>");
  background-repeat: no-repeat;
  background-position: right 6px center;
  cursor: pointer;
}

.fluent-input:focus,
.fluent-select:focus {
  border-color: var(--colorBrandStroke1);
  box-shadow: 0 0 0 1px var(--colorBrandStroke1);
}

/* Icon buttons */
.icon-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  padding: 0;
  background: transparent;
  border: none;
  border-radius: var(--borderRadiusMedium);
  cursor: pointer;
  color: var(--colorNeutralForeground2);
  transition: background 0.1s, color 0.1s;
}

.icon-btn:hover {
  background: var(--colorNeutralBackground1Hover);
  color: var(--colorNeutralForeground1);
}

.icon-btn--danger {
  color: var(--colorPaletteRedForeground1);
}

.icon-btn--danger:hover {
  background: var(--colorPaletteRedBackground1);
}

.action-label {
  font-size: var(--fontSizeBase200);
  font-weight: var(--fontWeightSemibold);
  color: var(--colorNeutralForeground2);
  white-space: nowrap;
  display: inline-flex;
  align-items: center;
  line-height: 28px;
}

.order-field {
  width: 52px;
}

.pos-field {
  width: 56px;
}

.move-inputs {
  display: flex;
  gap: 4px;
  align-items: center;
}

.action-btn {
  --button-height: 28px;
  --button-padding-end: var(--spacingHorizontalS);
  --button-padding-start: var(--spacingHorizontalS);
  font-size: var(--fontSizeBase100);
}

.group-select {
  width: 90px;
}

/* OCR status label */
.status-chip {
  font-size: var(--fontSizeBase100);
  font-weight: var(--fontWeightSemibold);
  color: var(--colorBrandForeground1);
  letter-spacing: 0.02em;
}

.individual-view {
  max-width: 450px;
  margin: 0 auto;
}
</style>
