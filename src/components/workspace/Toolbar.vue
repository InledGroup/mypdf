<script setup lang="ts">
import { LayoutGrid, FileText, Plus, Download } from 'lucide-vue-next'
import type { ToolType, ViewMode } from '../../types'

defineProps<{
  activeTool: ToolType;
  viewMode: ViewMode;
  isLoading: boolean;
  isOcrRunning: boolean;
  pagesCount: number;
  isMobileDrawerOpen?: boolean;
}>()

defineEmits([
  'update:viewMode', 'add-files', 'download', 'toggle-drawer'
])
</script>

<template>
  <div class="local-toolbar">
    <div class="view-toggle" role="tablist">
      <button
        :class="['toggle-btn', { 'toggle-btn--active': viewMode === 'mosaic' }]"
        role="tab"
        :aria-selected="viewMode === 'mosaic'"
        @click="$emit('update:viewMode', 'mosaic')"
      >
        <LayoutGrid :size="16" />
        <span class="hide-mobile">Mosaic</span>
      </button>
      <button
        :class="['toggle-btn', { 'toggle-btn--active': viewMode === 'individual' }]"
        role="tab"
        :aria-selected="viewMode === 'individual'"
        @click="$emit('update:viewMode', 'individual')"
      >
        <FileText :size="16" />
        <span class="hide-mobile">Individual</span>
      </button>
    </div>

    <div class="tool-indicator hide-mobile">
      {{ activeTool.toUpperCase() }}
    </div>

    <div class="spacer"></div>

    <div class="global-actions">
      <label for="pdf-add-toolbar" class="add-files-label">
        <Plus :size="16" />
        <span class="hide-mobile">Add Files</span>
        <span class="mobile-only">Add</span>
      </label>
      <input type="file" multiple @change="$emit('add-files', $event)" accept="application/pdf" id="pdf-add-toolbar" hidden />

      <button
        class="download-btn"
        @click="$emit('download')"
        :disabled="isLoading || pagesCount === 0"
      >
        <Download :size="16" />
        <span class="hide-mobile">
          {{ isLoading ? (isOcrRunning ? 'OCR Working...' : 'Processing...') : 'Download Result' }}
        </span>
        <span class="mobile-only">{{ isLoading ? '...' : 'Export' }}</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.local-toolbar {
  padding: 0 16px;
  height: 44px;
  background: var(--colorNeutralBackground1);
  border-bottom: 1px solid var(--colorNeutralStroke1);
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

/* ── View Toggle ── */
.view-toggle {
  display: flex;
  gap: 1px;
  background: var(--colorNeutralStroke1);
  border: 1px solid var(--colorNeutralStroke1);
  border-radius: var(--borderRadiusMedium);
  overflow: hidden;
}

.toggle-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 5px 12px;
  background: var(--colorNeutralBackground3);
  border: none;
  cursor: pointer;
  font-family: inherit;
  font-size: var(--fontSizeBase200);
  font-weight: var(--fontWeightRegular);
  color: var(--colorNeutralForeground2);
  transition: background 0.1s, color 0.1s;
}

.toggle-btn:hover {
  background: var(--colorNeutralBackground3Hover);
  color: var(--colorNeutralForeground1);
}

.toggle-btn--active {
  background: var(--colorBrandBackground);
  color: var(--colorNeutralForegroundOnBrand);
  font-weight: var(--fontWeightSemibold);
}

.toggle-btn--active:hover {
  background: var(--colorBrandBackgroundHover);
}

/* ── Tool indicator ── */
.tool-indicator {
  padding: 3px 8px;
  background: var(--colorNeutralBackground3);
  border: 1px solid var(--colorNeutralStroke1);
  border-radius: var(--borderRadiusSmall);
  font-size: var(--fontSizeBase100);
  font-weight: var(--fontWeightBold);
  letter-spacing: 0.06em;
  color: var(--colorNeutralForeground2);
}

.spacer {
  flex: 1;
}

/* ── Actions ── */
.global-actions {
  display: flex;
  align-items: center;
  gap: 6px;
}

.add-files-label {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 5px 12px;
  background: var(--colorNeutralBackground1);
  border: 1px solid var(--colorNeutralStroke1);
  border-radius: var(--borderRadiusMedium);
  cursor: pointer;
  font-family: inherit;
  font-size: var(--fontSizeBase200);
  font-weight: var(--fontWeightRegular);
  color: var(--colorNeutralForeground1);
  transition: background 0.1s, border-color 0.1s;
  user-select: none;
}

.add-files-label:hover {
  background: var(--colorNeutralBackground1Hover);
  border-color: var(--colorNeutralStroke1Hover);
}

.download-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 5px 14px;
  background: var(--colorBrandBackground);
  border: none;
  border-radius: var(--borderRadiusMedium);
  cursor: pointer;
  font-family: inherit;
  font-size: var(--fontSizeBase200);
  font-weight: var(--fontWeightSemibold);
  color: var(--colorNeutralForegroundOnBrand);
  transition: background 0.1s;
}

.download-btn:hover:not(:disabled) {
  background: var(--colorBrandBackgroundHover);
}

.download-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.mobile-only {
  display: none;
}

@media (max-width: 1024px) {
  .local-toolbar {
    padding: 0 8px;
    gap: 4px;
  }

  .hide-mobile {
    display: none !important;
  }

  .mobile-only {
    display: inline;
  }

  .toggle-btn {
    padding: 6px 8px;
  }

  .download-btn,
  .add-files-label {
    padding: 6px 10px;
  }
}
</style>
