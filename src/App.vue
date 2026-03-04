<script setup lang="ts">
import { ref } from 'vue'
import Landing from './components/Landing.vue'
import PDFWorkspace from './components/PDFWorkspace.vue'
import { LayoutGrid, RotateCcw, FileStack, Home, Type, Scissors, Hash, Stamp, Crop } from 'lucide-vue-next'

const currentView = ref<'landing' | 'workspace'>('landing')
const activeTool = ref<'reorder' | 'rotate' | 'merge' | 'ocr' | 'split' | 'numbering' | 'watermark' | 'crop'>('reorder')

const setView = (view: 'landing' | 'workspace', tool: 'reorder' | 'rotate' | 'merge' | 'ocr' | 'split' | 'numbering' | 'watermark' | 'crop' = 'reorder') => {
  currentView.value = view
  activeTool.value = tool
}
</script>

<template>
  <div class="app-container">
    <aside v-if="currentView === 'workspace'" class="sidebar">
      <div class="sidebar-logo" @click="setView('landing')">
        <span class="logo-text">MY<span class="logo-highlight">PDF</span></span>
      </div>
      
      <nav class="sidebar-nav">
        <button :class="{ active: activeTool === 'reorder' }" @click="activeTool = 'reorder'">
          <LayoutGrid :size="20" /> Reorder
        </button>
        <button :class="{ active: activeTool === 'rotate' }" @click="activeTool = 'rotate'">
          <RotateCcw :size="20" /> Rotate
        </button>
        <button :class="{ active: activeTool === 'crop' }" @click="activeTool = 'crop'">
          <Crop :size="20" /> Crop
        </button>
        <button :class="{ active: activeTool === 'merge' }" @click="activeTool = 'merge'">
          <FileStack :size="20" /> Merge
        </button>
        <button :class="{ active: activeTool === 'split' }" @click="activeTool = 'split'">
          <Scissors :size="20" /> Split
        </button>
        <button :class="{ active: activeTool === 'numbering' }" @click="activeTool = 'numbering'">
          <Hash :size="20" /> Numbering
        </button>
        <button :class="{ active: activeTool === 'watermark' }" @click="activeTool = 'watermark'">
          <Stamp :size="20" /> Watermark
        </button>
        <button :class="{ active: activeTool === 'ocr' }" @click="activeTool = 'ocr'">
          <Type :size="20" /> OCR
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
        <Landing v-if="currentView === 'landing'" @select-tool="(tool) => setView('workspace', tool)" />
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
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
  padding: 2rem;
  overflow-y: auto;
}

.logo {
  font-weight: 800;
  font-size: 1.5rem;
}

.logo-highlight {
  color: var(--primary);
}
</style>
