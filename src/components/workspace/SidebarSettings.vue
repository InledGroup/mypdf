<script setup lang="ts">
import { 
  Hash, RotateCcw, RotateCw, Globe, Scissors, 
  ListOrdered, Layers, Copy, CheckCircle2, ChevronRight
} from 'lucide-vue-next'
import type { ToolType, PageInfo } from '../../types'
import { computed } from 'vue'

const props = defineProps<{
  activeTool: ToolType;
  pages: PageInfo[];
  duplicateCount: number;
  ocrLanguage: string;
  splitStrategy: 'range' | 'even-odd' | 'manual';
  splitRange: number;
}>()

const emit = defineEmits([
  'apply-order', 'rotate-all', 'update:ocrLanguage', 
  'update:splitStrategy', 'update:splitRange', 'apply-split'
])

const groups = computed(() => {
  const map: Record<number, number> = {}
  props.pages.forEach(p => {
    const g = p.group || 1
    map[g] = (map[g] || 0) + 1
  })
  return Object.entries(map).map(([id, count]) => ({ id: Number(id), count }))
})

const getGroupColor = (g: number) => {
  const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316', '#6366f1', '#14b8a6']
  return colors[(g - 1) % colors.length]
}
</script>

<template>
  <aside class="settings-sidebar">
    <div class="sidebar-header">
      <h3>Tool Settings</h3>
      <p>Configure how to process your PDF</p>
    </div>

    <div class="sidebar-content">
      <!-- REORDER SETTINGS -->
      <div v-if="activeTool === 'reorder'" class="setting-group">
        <div class="group-label"><ListOrdered :size="16" /> Reorder Logic</div>
        <div class="info-card">
          Assign numbers to pages in the canvas and press process to apply the new sequence.
        </div>
        <button @click="$emit('apply-order')" class="btn-action primary" :disabled="duplicateCount > 0">
          <CheckCircle2 :size="18" /> Process New Order
        </button>
        <p v-if="duplicateCount > 0" class="error-msg">Found {{ duplicateCount }} duplicate numbers!</p>
      </div>

      <!-- ROTATE SETTINGS -->
      <div v-if="activeTool === 'rotate'" class="setting-group">
        <div class="group-label"><RotateCw :size="16" /> Bulk Rotation</div>
        <div class="button-grid">
          <button @click="$emit('rotate-all', 'ccw')" class="btn-outline">
            <RotateCcw :size="18" /> All Left
          </button>
          <button @click="$emit('rotate-all', 'cw')" class="btn-outline">
            <RotateCw :size="18" /> All Right
          </button>
        </div>
      </div>

      <!-- SPLIT SETTINGS -->
      <div v-if="activeTool === 'split'" class="setting-group">
        <div class="group-label"><Scissors :size="16" /> Split Strategy</div>
        
        <div class="control-item">
          <label>Method</label>
          <select :value="splitStrategy" @change="$emit('update:splitStrategy', ($event.target as any).value)" class="sidebar-select">
            <option value="range">Fixed Ranges</option>
            <option value="even-odd">Even / Odd Pages</option>
            <option value="manual">Manual Grouping</option>
          </select>
        </div>

        <div v-if="splitStrategy === 'range'" class="control-item">
          <label>Pages per document</label>
          <input type="number" :value="splitRange" @input="$emit('update:splitRange', ($event.target as any).valueAsNumber)" min="1" class="sidebar-input" />
        </div>

        <button @click="$emit('apply-split')" class="btn-action primary">
          Apply Strategy
        </button>

        <div class="divider"></div>

        <div class="group-label"><Layers :size="16" /> Result Preview</div>
        <div class="group-list">
          <div v-for="group in groups" :key="id" class="group-item">
            <div class="group-indicator" :style="{ background: getGroupColor(group.id) }"></div>
            <span class="group-name">PDF #{{ group.id }}</span>
            <span class="group-count">{{ group.count }} pages</span>
          </div>
        </div>
      </div>

      <!-- OCR SETTINGS -->
      <div v-if="activeTool === 'ocr'" class="setting-group">
        <div class="group-label"><Globe :size="16" /> OCR Language</div>
        <div class="info-card">
          Selecting the correct language significantly improves text detection accuracy.
        </div>
        <select :value="ocrLanguage" @change="$emit('update:ocrLanguage', ($event.target as any).value)" class="sidebar-select">
          <option value="spa">Spanish (Español)</option>
          <option value="glg">Galician (Galego)</option>
          <option value="eng">English (English)</option>
        </select>
      </div>
    </div>

    <div class="sidebar-footer">
      <div class="summary">
        <span>Total Content</span>
        <strong>{{ pages.length }} Pages</strong>
      </div>
    </div>
  </aside>
</template>

<style scoped>
.settings-sidebar {
  width: 300px;
  background: white;
  border-left: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.sidebar-header { padding: 1.5rem; border-bottom: 1px solid #f1f5f9; }
.sidebar-header h3 { margin: 0; font-size: 1.125rem; font-weight: 800; color: #1e293b; }
.sidebar-header p { margin: 0.25rem 0 0; font-size: 0.75rem; color: #64748b; font-weight: 500; }

.sidebar-content { flex: 1; overflow-y: auto; padding: 1.5rem; display: flex; flex-direction: column; gap: 2rem; }

.setting-group { display: flex; flex-direction: column; gap: 1rem; }
.group-label { font-size: 0.75rem; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; display: flex; align-items: center; gap: 0.5rem; }

.info-card { background: #f8fafc; border: 1px solid #e2e8f0; padding: 0.75rem; border-radius: 0.5rem; font-size: 0.75rem; color: #475569; line-height: 1.4; }

.control-item { display: flex; flex-direction: column; gap: 0.4rem; }
.control-item label { font-size: 0.75rem; font-weight: 700; color: #1e293b; }

.sidebar-select, .sidebar-input {
  width: 100%; padding: 0.6rem; border: 1px solid #e2e8f0; border-radius: 0.5rem;
  font-weight: 600; font-size: 0.875rem; outline: none; background: #f8fafc;
}

.btn-action {
  width: 100%; padding: 0.75rem; border-radius: 0.6rem; border: none;
  font-weight: 700; display: flex; align-items: center; justify-content: center; gap: 0.5rem;
  cursor: pointer; transition: all 0.2s;
}
.btn-action.primary { background: #3b82f6; color: white; }
.btn-action.primary:hover { background: #2563eb; }
.btn-action:disabled { opacity: 0.5; cursor: not-allowed; }

.btn-outline {
  flex: 1; padding: 0.6rem; border-radius: 0.5rem; border: 1px solid #e2e8f0;
  background: white; font-weight: 600; font-size: 0.75rem; display: flex; align-items: center; justify-content: center; gap: 0.4rem;
}

.button-grid { display: flex; gap: 0.5rem; }

.divider { height: 1px; background: #f1f5f9; margin: 0.5rem 0; }

.error-msg { color: #ef4444; font-size: 0.7rem; font-weight: 700; text-align: center; margin: 0; }

.group-list { display: flex; flex-direction: column; gap: 0.5rem; }
.group-item {
  display: flex; align-items: center; gap: 0.75rem; background: #f8fafc;
  padding: 0.6rem; border-radius: 0.5rem; border: 1px solid #e2e8f0;
}
.group-indicator { width: 12px; height: 12px; border-radius: 3px; }
.group-name { font-size: 0.8rem; font-weight: 700; flex: 1; }
.group-count { font-size: 0.7rem; font-weight: 600; color: #64748b; }

.sidebar-footer { padding: 1.5rem; border-top: 1px solid #f1f5f9; }
.summary { display: flex; justify-content: space-between; align-items: center; }
.summary span { font-size: 0.75rem; font-weight: 600; color: #64748b; }
.summary strong { font-size: 0.875rem; font-weight: 800; color: #1e293b; }
</style>
