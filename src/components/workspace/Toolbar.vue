<script setup lang="ts">
import { 
  Grid, Rows, Plus, Download, Type, Scissors
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
    <!-- View Toggle -->
    <div class="view-toggle">
      <button :class="{ active: viewMode === 'mosaic' }" @click="$emit('update:viewMode', 'mosaic')">
        <Grid :size="18" /> Mosaic
      </button>
      <button :class="{ active: viewMode === 'individual' }" @click="$emit('update:viewMode', 'individual')">
        <Rows :size="18" /> Individual
      </button>
    </div>

    <div class="divider"></div>

    <div class="general-actions">
      <label for="pdf-add-toolbar" class="btn-ghost pointer">
        <Plus :size="18" /> Add Files
      </label>
      <input type="file" multiple @change="$emit('add-files', $event)" accept="application/pdf" id="pdf-add-toolbar" hidden />
    </div>

    <div class="spacer"></div>

    <button @click="$emit('download')" class="btn-primary" :disabled="isLoading || pagesCount === 0">
      <Type v-if="activeTool === 'ocr'" :size="18" />
      <Scissors v-else-if="activeTool === 'split'" :size="18" />
      <Download v-else :size="18" />
      {{ isLoading ? (isOcrRunning ? 'OCR Processing...' : 'Wait...') : (activeTool === 'split' ? 'Export Split PDFs' : 'Export PDF') }}
    </button>
  </div>
</template>

<style scoped>
.local-toolbar { 
  padding: 0.75rem 2rem; background: white; border-bottom: 1px solid #e2e8f0; 
  display: flex; align-items: center; gap: 1rem; 
}
.view-toggle { display: flex; background: #f1f5f9; padding: 0.2rem; border-radius: 0.5rem; }
.view-toggle button { 
  border: none; background: transparent; padding: 0.4rem 0.8rem; border-radius: 0.4rem; 
  font-size: 0.875rem; font-weight: 600; color: #64748b; display: flex; align-items: center; gap: 0.4rem; 
  cursor: pointer;
}
.view-toggle button.active { background: white; color: #3b82f6; box-shadow: 0 1px 2px rgba(0,0,0,0.1); }
.divider { width: 1px; height: 24px; background: #e2e8f0; }
.spacer { flex: 1; }
.general-actions { display: flex; align-items: center; }
.btn-ghost { 
  background: transparent; border: none; font-weight: 600; color: #475569; 
  display: flex; align-items: center; gap: 0.4rem; cursor: pointer; padding: 0.5rem;
  border-radius: 0.5rem;
}
.btn-ghost:hover { background: #f1f5f9; }
.btn-primary { 
  background: #3b82f6; color: white; border: none; padding: 0.6rem 1.25rem; 
  border-radius: 0.75rem; font-weight: 700; display: flex; align-items: center; 
  gap: 0.5rem; cursor: pointer; 
}
.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
.pointer { cursor: pointer; }
</style>
