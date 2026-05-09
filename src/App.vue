<script setup lang="ts">
import { ref } from 'vue'
import Landing from './components/Landing.vue'
import PDFWorkspace from './components/PDFWorkspace.vue'
import { LayoutGrid, RotateCcw, FileStack, Home, Type, Scissors, Hash, Stamp, Crop, Lock, LockOpen, Menu, X } from 'lucide-vue-next'

const currentView = ref<'landing' | 'workspace'>('landing')
const activeTool = ref<'reorder' | 'rotate' | 'merge' | 'ocr' | 'split' | 'numbering' | 'watermark' | 'crop' | 'protect' | 'unlock'>('reorder')
const isMobileMenuOpen = ref(false)

const setView = (view: 'landing' | 'workspace', tool: 'reorder' | 'rotate' | 'merge' | 'ocr' | 'split' | 'numbering' | 'watermark' | 'crop' | 'protect' | 'unlock' = 'reorder') => {
  currentView.value = view
  activeTool.value = tool
  isMobileMenuOpen.value = false
}

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
}

const selectTool = (tool: any) => {
  activeTool.value = tool
  isMobileMenuOpen.value = false
}
</script>

<template>
  <div class="app-container">
    <header v-if="currentView === 'workspace'" class="mobile-header">
      <div class="sidebar-logo" @click="setView('landing')">
        <span class="logo-text">MY<span class="logo-highlight">PDF</span></span>
      </div>
      <button class="menu-toggle" @click="toggleMobileMenu">
        <Menu v-if="!isMobileMenuOpen" :size="24" />
        <X v-else :size="24" />
      </button>
    </header>

    <div v-if="isMobileMenuOpen && currentView === 'workspace'" class="mobile-overlay" @click="isMobileMenuOpen = false"></div>

    <aside v-if="currentView === 'workspace'" class="sidebar" :class="{ 'mobile-open': isMobileMenuOpen }">
      <div class="sidebar-logo desktop-only" @click="setView('landing')">
        <span class="logo-text">MY<span class="logo-highlight">PDF</span></span>
      </div>
      
      <nav class="sidebar-nav">
        <button :class="{ active: activeTool === 'reorder' }" @click="selectTool('reorder')">
          <LayoutGrid :size="20" /> Reorder
        </button>
        <button :class="{ active: activeTool === 'rotate' }" @click="selectTool('rotate')">
          <RotateCcw :size="20" /> Rotate
        </button>
        <button :class="{ active: activeTool === 'crop' }" @click="selectTool('crop')">
          <Crop :size="20" /> Crop
        </button>
        <button :class="{ active: activeTool === 'merge' }" @click="selectTool('merge')">
          <FileStack :size="20" /> Merge
        </button>
        <button :class="{ active: activeTool === 'split' }" @click="selectTool('split')">
          <Scissors :size="20" /> Split
        </button>
        <button :class="{ active: activeTool === 'numbering' }" @click="selectTool('numbering')">
          <Hash :size="20" /> Numbering
        </button>
        <button :class="{ active: activeTool === 'watermark' }" @click="selectTool('watermark')">
          <Stamp :size="20" /> Watermark
        </button>
        <button :class="{ active: activeTool === 'ocr' }" @click="selectTool('ocr')">
          <Type :size="20" /> OCR
        </button>
        <button :class="{ active: activeTool === 'protect' }" @click="selectTool('protect')">
          <Lock :size="20" /> Protect
        </button>
        <button :class="{ active: activeTool === 'unlock' }" @click="selectTool('unlock')">
          <LockOpen :size="20" /> Unlock
        </button>
      </nav>

      <div class="sidebar-footer">
        <button @click="setView('landing')" class="btn-home">
          <Home :size="20" /> Exit Tool
        </button>
      </div>
    </aside>

    <div class="main-content">
      <header v-if="currentView === 'landing'" class="app-header">
        <div class="logo" @click="setView('landing')">
          <span class="logo-text">MY<span class="logo-highlight">PDF</span></span>
        </div>
      </header>

      <main :class="{ 'full-page': currentView === 'landing' }">
        <div v-if="currentView === 'landing'" class="full-page-container">
          <Landing @select-tool="(tool) => setView('workspace', tool)" />
        </div>
        <PDFWorkspace v-else :active-tool="activeTool" />
      </main>
    </div>
  </div>
</template>

<style>
:root {
  --primary: #3b82f6;
  --primary-light: #eff6ff;
  --bg-app: #f8fafc;
  --sidebar-bg: #1e293b;
  --text-main: #1e293b;
  --text-muted: #64748b;
  --card-bg: #ffffff;
}

body {
  margin: 0;
  font-family: 'Inter', sans-serif;
  background-color: var(--bg-app);
  color: var(--text-main);
  overflow: hidden;
}

.app-container {
  display: flex;
  height: 100vh;
  width: 100vw;
}

/* Sidebar Styles */
.sidebar {
  width: 260px;
  background: var(--sidebar-bg);
  color: white;
  display: flex;
  flex-direction: column;
  padding: 1.5rem;
  z-index: 100;
  transition: all 0.3s ease;
}

.mobile-header {
  display: none;
}

.mobile-overlay {
  display: none;
}

@media (max-width: 1024px) {
  .app-container {
    flex-direction: column;
  }

  .mobile-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.75rem 1rem;
    background: var(--sidebar-bg);
    color: white;
    z-index: 110;
    position: sticky;
    top: 0;
    box-shadow: 0 2px 10px rgba(0,0,0,0.2);
  }

  .mobile-header .sidebar-logo {
    margin-bottom: 0;
    padding-left: 0;
  }

  .menu-toggle {
    background: transparent;
    border: none;
    color: white;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .sidebar {
    position: fixed;
    top: 0;
    left: -100%;
    width: 280px;
    height: 100vh;
    padding-top: 5rem;
    box-shadow: 10px 0 30px rgba(0,0,0,0.3);
    z-index: 105;
  }

  .sidebar.mobile-open {
    left: 0;
  }

  .mobile-overlay {
    display: block;
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.5);
    z-index: 102;
  }

  .desktop-only {
    display: none;
  }

  .sidebar-nav {
    flex-direction: column;
    overflow-y: auto;
    padding-bottom: 2rem;
  }

  .sidebar-nav button {
    padding: 0.85rem 1.25rem;
    font-size: 1rem;
    width: 100%;
    justify-content: flex-start;
    flex-direction: row;
    min-width: unset;
    gap: 0.75rem;
  }
  
  .sidebar-nav button svg {
    width: 20px;
    height: 20px;
  }

  .sidebar-footer {
    display: block;
    margin-top: auto;
    padding: 1.5rem;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
  }
}

.sidebar-logo {
  cursor: pointer;
  font-weight: 800;
  font-size: 1.5rem;
  margin-bottom: 3rem;
  padding-left: 0.5rem;
}

.sidebar-nav {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.sidebar-nav button {
  background: transparent;
  border: none;
  color: #94a3b8;
  padding: 0.75rem 1rem;
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-weight: 500;
  width: 100%;
  text-align: left;
  transition: all 0.2s;
  cursor: pointer;
}

.sidebar-nav button:hover {
  background: rgba(255, 255, 255, 0.05);
  color: white;
}

.sidebar-nav button.active {
  background: var(--primary);
  color: white;
}

.sidebar-footer {
  margin-top: auto;
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.btn-home {
  width: 100%;
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  padding: 0.75rem;
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  cursor: pointer;
}

/* Main Content Styles */
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
}

main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.app-header {
  background: white;
  border-bottom: 1px solid #e2e8f0;
  padding: 1rem 2rem;
  position: sticky;
  top: 0;
  z-index: 50;
}

.full-page {
  width: 100%;
  overflow-y: auto;
  flex: 1;
}

.full-page-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  width: 100%;
}

.logo {
  font-weight: 800;
  font-size: 1.5rem;
}

.logo-highlight {
  color: var(--primary);
}
</style>
