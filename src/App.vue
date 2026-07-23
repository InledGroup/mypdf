<script setup lang="ts">
import { ref } from 'vue'
import {
  ArrowUpDown,
  RotateCw,
  Crop,
  Combine,
  Scissors,
  Binary,
  Stamp,
  ScanText,
  Lock,
  Unlock,
  ArrowLeft,
  Menu
} from 'lucide-vue-next'
import Landing from './components/Landing.vue'
import PDFWorkspace from './components/PDFWorkspace.vue'

const currentView = ref<'landing' | 'workspace'>('landing')
const activeTool = ref<'reorder' | 'rotate' | 'merge' | 'ocr' | 'split' | 'numbering' | 'watermark' | 'crop' | 'protect' | 'unlock'>('reorder')
const isMobileMenuOpen = ref(false)

const setView = (view: 'landing' | 'workspace', tool: 'reorder' | 'rotate' | 'merge' | 'ocr' | 'split' | 'numbering' | 'watermark' | 'crop' | 'protect' | 'unlock' = 'reorder') => {
  currentView.value = view
  activeTool.value = tool
  isMobileMenuOpen.value = false
}

const selectTool = (tool: any) => {
  activeTool.value = tool
  isMobileMenuOpen.value = false
}

const tools = [
  { id: 'reorder' as const, label: 'Reorder', icon: ArrowUpDown },
  { id: 'rotate' as const, label: 'Rotate', icon: RotateCw },
  { id: 'crop' as const, label: 'Crop', icon: Crop },
  { id: 'merge' as const, label: 'Merge', icon: Combine },
  { id: 'split' as const, label: 'Split', icon: Scissors },
  { id: 'numbering' as const, label: 'Numbering', icon: Binary },
  { id: 'watermark' as const, label: 'Watermark', icon: Stamp },
  { id: 'ocr' as const, label: 'OCR', icon: ScanText },
  { id: 'protect' as const, label: 'Protect', icon: Lock },
  { id: 'unlock' as const, label: 'Unlock', icon: Unlock },
]
</script>

<template>
  <div class="app-shell">
    <aside v-if="currentView === 'workspace'" class="nav-sidebar" :class="{ open: isMobileMenuOpen }">
      <div class="nav-brand" @click="setView('landing')">
        <img src="https://hosted.inled.es/MYPDF.png" alt="MyPDF" class="brand-logo" />
      </div>

      <fluent-divider style="margin: 8px 0;"></fluent-divider>

      <nav class="nav-items">
        <button
          v-for="tool in tools"
          :key="tool.id"
          :class="['nav-item', { 'nav-item--active': activeTool === tool.id }]"
          @click="selectTool(tool.id)"
        >
          <component :is="tool.icon" class="nav-icon-svg" :size="16" />
          {{ tool.label }}
        </button>
      </nav>

      <fluent-divider style="margin: 8px 0;"></fluent-divider>

      <button class="nav-item nav-item--back" @click="setView('landing')">
        <ArrowLeft class="nav-icon-svg" :size="16" />
        Back to Home
      </button>
    </aside>

    <div v-if="isMobileMenuOpen && currentView === 'workspace'" class="mobile-overlay" @click="isMobileMenuOpen = false"></div>

    <header v-if="currentView === 'workspace'" class="mobile-bar">
      <div class="nav-brand" @click="setView('landing')">
        <img src="https://hosted.inled.es/MYPDF.png" alt="MyPDF" class="brand-logo" />
      </div>
      <button class="hamburger-btn" @click="isMobileMenuOpen = !isMobileMenuOpen">
        <Menu :size="20" />
      </button>
    </header>

    <main class="main-area">
      <Landing v-if="currentView === 'landing'" @select-tool="(t) => setView('workspace', t)" />
      <PDFWorkspace v-else :active-tool="activeTool" />
    </main>
  </div>
</template>

<style>
.app-shell {
  display: flex;
  height: 100vh;
  background: var(--colorNeutralBackground1);
}

.nav-sidebar {
  width: 220px;
  min-width: 220px;
  background: var(--colorNeutralBackground3);
  display: flex;
  flex-direction: column;
  padding: 12px 8px;
  gap: 2px;
  border-right: 1px solid var(--colorNeutralStroke1);
}

.nav-brand {
  display: flex;
  align-items: center;
  padding: 12px 8px;
  cursor: pointer;
  user-select: none;
}

.brand-logo {
  height: 28px;
  width: auto;
  object-fit: contain;
}

.nav-items {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  overflow-y: auto;
  padding: 4px 0;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 8px 10px;
  background: transparent;
  border: none;
  border-radius: var(--borderRadiusMedium);
  cursor: pointer;
  font-family: inherit;
  font-size: var(--fontSizeBase300);
  font-weight: var(--fontWeightRegular);
  color: var(--colorNeutralForeground1);
  text-align: left;
  transition: background 0.1s;
}

.nav-item:hover {
  background: var(--colorNeutralBackground1Hover);
}

.nav-item--active {
  background: var(--colorBrandBackground2);
  color: var(--colorBrandForeground1);
  font-weight: var(--fontWeightSemibold);
}

.nav-item--active:hover {
  background: var(--colorBrandBackground2Hover);
}

.nav-item--back {
  color: var(--colorNeutralForeground2);
  font-size: var(--fontSizeBase200);
}

.nav-icon-svg {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.mobile-bar {
  display: none;
}

.mobile-overlay {
  display: none;
}

.hamburger-btn {
  background: transparent;
  border: none;
  padding: 6px;
  cursor: pointer;
  color: var(--colorNeutralForeground1);
  border-radius: var(--borderRadiusMedium);
  display: flex;
  align-items: center;
  justify-content: center;
}

.hamburger-btn:hover {
  background: var(--colorNeutralBackground1Hover);
}

.main-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

@media (max-width: 768px) {
  .mobile-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 16px;
    background: var(--colorNeutralBackground3);
    border-bottom: 1px solid var(--colorNeutralStroke1);
    height: 52px;
    flex-shrink: 0;
  }

  .nav-sidebar {
    position: fixed;
    top: 0;
    left: -240px;
    width: 240px;
    height: 100vh;
    z-index: 1000;
    transition: left 0.2s ease;
    box-shadow: var(--shadow28);
  }

  .nav-sidebar.open {
    left: 0;
  }

  .mobile-overlay {
    display: block;
    position: fixed;
    inset: 0;
    background: var(--colorBackgroundOverlay);
    z-index: 999;
  }

  .main-area {
    height: calc(100vh - 52px);
  }
}
</style>
