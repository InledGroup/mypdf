<script setup lang="ts">
import { 
  Grid, Rows, Plus, Download, Type, Scissors, RotateCw, Hash, Stamp, Crop, LayoutGrid, FileStack
} from 'lucide-vue-next'
import type { ToolType, ViewMode } from '../../types'

defineProps<{
  activeTool: ToolType;
  viewMode: ViewMode;
  isLoading: boolean;
  isOcrRunning: boolean;
  pagesCount: number;
}>()

defineEmits([
  'update:viewMode', 'add-files', 'download'
])
</script>

<template>
  <div class="local-toolbar">
    <!-- View Navigation -->
    <div class="view-toggle">
      <button :class="{ active: viewMode === 'mosaic' }" @click="$emit('update:viewMode', 'mosaic')" title="Mosaic View">
        <Grid :size="18" /> Mosaic
      </button>
      <button :class="{ active: viewMode === 'individual' }" @click="$emit('update:viewMode', 'individual')" title="Individual View">
        <Rows :size="18" /> Individual
      </button>
    </div>

    <div class="divider"></div>

    <!-- Active Tool Indicator -->
    <div class="tool-indicator">
      <div class="indicator-icon">
        <LayoutGrid v-if="activeTool === 'reorder'" :size="16" />
        <RotateCw v-else-if="activeTool === 'rotate'" :size="16" />
        <FileStack v-else-if="activeTool === 'merge'" :size="16" />
        <Scissors v-else-if="activeTool === 'split'" :size="16" />
        <Hash v-else-if="activeTool === 'numbering'" :size="16" />
        <Stamp v-else-if="activeTool === 'watermark'" :size="16" />
        <Crop v-else-if="activeTool === 'crop'" :size="16" />
        <Type v-else-if="activeTool === 'ocr'" :size="16" />
      </div>
      <span class="indicator-text">{{ activeTool.toUpperCase() }} MODE</span>
    </div>

    <div class="spacer"></div>

    <!-- Global Actions -->
    <div class="global-actions">
      <label for="pdf-add-toolbar" class="btn-ghost pointer" title="Add more PDFs">
        <Plus :size="18" /> Add Files
      </label>
      <input type="file" multiple @change="$emit('add-files', $event)" accept="application/pdf" id="pdf-add-toolbar" hidden />
      
      <button @click="$emit('download')" class="btn-primary" :disabled="isLoading || pagesCount === 0">
        <Download v-if="!isOcrRunning" :size="18" />
        <div v-else class="mini-loader"></div>
        {{ isLoading ? (isOcrRunning ? 'OCR Working...' : 'Processing...') : 'Download Result' }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.local-toolbar { 
  padding: 0.75rem 2rem; background: white; border-bottom: 1px solid #e2e8f0; 
  display: flex; align-items: center; gap: 1.25rem; z-index: 40;
}
.view-toggle { display: flex; background: #f1f5f9; padding: 0.2rem; border-radius: 0.6rem; }
.view-toggle button { 
  border: none; background: transparent; padding: 0.45rem 1rem; border-radius: 0.5rem; 
  font-size: 0.85rem; font-weight: 800; color: #64748b; display: flex; align-items: center; gap: 0.5rem; 
  cursor: pointer; transition: all 0.2s;
}
.view-toggle button.active { background: white; color: #3b82f6; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }

.divider { width: 1px; height: 24px; background: #e2e8f0; }
.spacer { flex: 1; }

.tool-indicator {
  display: flex; align-items: center; gap: 0.6rem; background: #eff6ff;
  padding: 0.4rem 0.8rem; border-radius: 2rem; border: 1px solid #dbeafe;
}
.indicator-icon { color: #3b82f6; display: flex; align-items: center; }
.indicator-text { font-size: 0.7rem; font-weight: 900; color: #1e40af; letter-spacing: 0.05em; }

.global-actions { display: flex; align-items: center; gap: 1rem; }
.btn-ghost { 
  background: transparent; border: none; font-weight: 800; color: #475569; 
  display: flex; align-items: center; gap: 0.5rem; cursor: pointer; padding: 0.6rem 1rem;
  border-radius: 0.75rem; font-size: 0.85rem;
}
.btn-ghost:hover { background: #f1f5f9; color: #1e293b; }

.btn-primary { 
  background: #3b82f6; color: white; border: none; padding: 0.7rem 1.5rem; 
  border-radius: 0.8rem; font-weight: 800; display: flex; align-items: center; 
  gap: 0.6rem; cursor: pointer; box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.2);
  transition: all 0.2s; font-size: 0.9rem;
}
.btn-primary:hover { background: #2563eb; transform: translateY(-1px); }
.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

.mini-loader {
  width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.3); border-top-color: white;
  border-radius: 50%; animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
.pointer { cursor: pointer; }
</style>
