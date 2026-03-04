<script setup lang="ts">
import { ref, computed } from 'vue'
import * as pdfjsLib from 'pdfjs-dist'
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url'
import { PDFDocument, degrees, StandardFonts, rgb } from 'pdf-lib'
import { createWorker } from 'tesseract.js'
import { Trash2, Download, FileUp, Type, Scissors, AlertCircle } from 'lucide-vue-next'

import type { PageInfo, LoadedFile, ToolType, ViewMode } from '../../types'
import Toolbar from './workspace/Toolbar.vue'
import Canvas from './workspace/Canvas.vue'
import SidebarSettings from './workspace/SidebarSettings.vue'

// Setup PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker

const props = defineProps<{
  activeTool: ToolType
}>()

// --- State ---
const loadedFiles = ref<LoadedFile[]>([])
const pages = ref<PageInfo[]>([])
const isLoading = ref(false)
const viewMode = ref<ViewMode>('mosaic')

// OCR Specific
const ocrLanguage = ref<'spa' | 'glg' | 'eng'>('spa')
const isOcrRunning = ref(false)
const ocrProgress = ref(0)
const ocrCurrentPage = ref(0)
const ocrTotalPages = ref(0)

// Split Specific
const splitStrategy = ref<'range' | 'even-odd' | 'manual'>('range')
const splitRange = ref(1)

// --- Computed ---
const sortedPages = computed(() => {
  return [...pages.value].sort((a, b) => a.order - b.order)
})

const duplicateOrders = computed(() => {
  const counts: Record<number, number> = {}
  pages.value.forEach(p => { counts[p.order] = (counts[p.order] || 0) + 1 })
  return new Set(
    pages.value.filter(p => counts[p.order] > 1).map(p => p.id)
  )
})

// --- Logic ---
const onFileChange = async (e: Event) => {
  const target = e.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    isLoading.value = true
    for (const file of Array.from(target.files)) {
      const arrayBuffer = await file.arrayBuffer()
      loadedFiles.value.push({ name: file.name, arrayBuffer })
      await loadPagesFromFile(arrayBuffer, loadedFiles.value.length - 1)
    }
    isLoading.value = false
  }
}

const loadPagesFromFile = async (buffer: ArrayBuffer, fileIndex: number) => {
  const loadingTask = pdfjsLib.getDocument({ data: buffer.slice(0) })
  const pdfDoc = await loadingTask.promise
  const numPages = pdfDoc.numPages
  
  for (let i = 1; i <= numPages; i++) {
    const page = await pdfDoc.getPage(i)
    const viewport = page.getViewport({ scale: 2.0 })
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')
    canvas.height = viewport.height
    canvas.width = viewport.width
    await page.render({ canvasContext: context!, viewport, intent: 'print' }).promise
    
    pages.value.push({
      id: `f${fileIndex}-p${i}-${Math.random().toString(36).substr(2, 9)}`,
      originalFileIndex: fileIndex,
      originalPageIndex: i - 1,
      order: pages.value.length + 1,
      dataUrl: canvas.toDataURL('image/jpeg', 0.9),
      rotation: 0,
      width: viewport.width / 2.0,
      height: viewport.height / 2.0,
      group: 1
    })
  }
}

const handleRotate = (pageId: string, dir: 'cw' | 'ccw') => {
  const page = pages.value.find(p => p.id === pageId)
  if (!page) return
  if (dir === 'cw') page.rotation = (page.rotation + 90) % 360
  else page.rotation = (page.rotation - 90 + 360) % 360
}

const handleRotateAll = (dir: 'cw' | 'ccw') => {
  pages.value.forEach(p => handleRotate(p.id, dir))
}

const handleRemove = (pageId: string) => {
  pages.value = pages.value.filter(p => p.id !== pageId)
}

const handleMove = (pageId: string, toPos: number, relative: 'before' | 'after') => {
  const page = pages.value.find(p => p.id === pageId)
  const target = sortedPages.value[toPos - 1]
  if (!page || !target) return
  let newOrder = target.order
  if (relative === 'after') newOrder += 0.5
  else newOrder -= 0.5
  page.order = newOrder
  applyOrder()
}

const applyOrder = () => {
  pages.value.sort((a, b) => a.order - b.order)
  pages.value.forEach((p, idx) => { p.order = idx + 1 })
}

const applySplitGroups = () => {
  if (splitStrategy.value === 'range') {
    pages.value.forEach((p, idx) => {
      p.group = Math.floor(idx / splitRange.value) + 1
    })
  } else if (splitStrategy.value === 'even-odd') {
    pages.value.forEach((p, idx) => {
      p.group = (idx % 2 === 0) ? 1 : 2
    })
  }
}

const downloadPdf = async () => {
  if (pages.value.length === 0) return
  isLoading.value = true
  
  try {
    const withOcr = props.activeTool === 'ocr'
    const uniqueGroups = Array.from(new Set(pages.value.map(p => p.group || 1))).sort((a, b) => a - b)
    
    let tesseractWorker: any = null;
    if (withOcr) {
      isOcrRunning.value = true;
      ocrTotalPages.value = sortedPages.value.length;
      ocrCurrentPage.value = 1;
      tesseractWorker = await createWorker(ocrLanguage.value, 1, {
        workerPath: 'https://cdn.jsdelivr.net/npm/tesseract.js@v5.0.0/dist/worker.min.js',
        langPath: 'https://tessdata.projectnaptha.com/4.0.0_best',
        corePath: 'https://cdn.jsdelivr.net/npm/tesseract.js-core@v5.0.0/tesseract-core.wasm.js',
      });
    }

    const srcDocCache: Record<number, PDFDocument> = {}

    for (const group of uniqueGroups) {
      const newDoc = await PDFDocument.create()
      const font = await newDoc.embedFont(StandardFonts.Helvetica)
      const groupPages = sortedPages.value.filter(p => (p.group || 1) === group)
      
      if (groupPages.length === 0) continue

      for (const pageInfo of groupPages) {
        if (!srcDocCache[pageInfo.originalFileIndex]) {
          srcDocCache[pageInfo.originalFileIndex] = await PDFDocument.load(loadedFiles.value[pageInfo.originalFileIndex].arrayBuffer)
        }
        const [copiedPage] = await newDoc.copyPages(srcDocCache[pageInfo.originalFileIndex], [pageInfo.originalPageIndex])
        if (pageInfo.rotation !== 0) copiedPage.setRotation(degrees(pageInfo.rotation))
        
        if (withOcr && tesseractWorker) {
          const result = await tesseractWorker.recognize(pageInfo.dataUrl);
          const data = result.data;
          const { width, height } = copiedPage.getSize();
          if (data?.words) {
            for (const word of data.words) {
              const x = (word.bbox.x0 / (data.width || width * 2)) * width
              const y = height - (word.bbox.y1 / (data.height || height * 2)) * height
              const fontSize = Math.max(1, ((word.bbox.y1 - word.bbox.y0) / (data.height || height * 2)) * height)
              if (word.text?.trim()) {
                copiedPage.drawText(word.text, { x, y, size: fontSize, font, opacity: 0.001, color: rgb(0, 0, 0) })
              }
            }
          }
          ocrCurrentPage.value++;
        }
        newDoc.addPage(copiedPage)
      }

      const pdfBytes = await newDoc.save()
      const blob = new Blob([pdfBytes], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `mypdf-group-${group}-${Date.now()}.pdf`
      link.click()
      URL.revokeObjectURL(url)
    }
    
    if (tesseractWorker) await tesseractWorker.terminate()
  } catch (error) {
    console.error('Error generating PDF:', error)
    alert('Error generating PDF.')
  } finally {
    isLoading.value = false
    isOcrRunning.value = false
  }
}

const reset = () => {
  if (confirm('Clear all pages?')) { pages.value = []; loadedFiles.value = []; }
}
</script>

<template>
  <div class="workspace">
    <!-- Top Toolbar -->
    <Toolbar 
      :active-tool="activeTool"
      v-model:viewMode="viewMode"
      :isLoading="isLoading"
      :isOcrRunning="isOcrRunning"
      :pagesCount="pages.length"
      @add-files="onFileChange"
      @download="downloadPdf"
    />

    <div class="workspace-layout">
      <!-- Main Content Area -->
      <div class="workspace-main">
        <!-- Empty State -->
        <div v-if="pages.length === 0" class="empty-state">
          <div class="upload-card">
            <input type="file" multiple @change="onFileChange" accept="application/pdf" id="pdf-upload" hidden />
            <label for="pdf-upload" class="upload-area">
              <div class="icon-circle"><FileUp :size="40" /></div>
              <h3>Upload PDF Files</h3>
              <p>Select documents to start processing</p>
              <span class="btn-secondary">Browse Files</span>
            </label>
          </div>
        </div>

        <!-- Canvas Area -->
        <Canvas 
          v-else
          :pages="pages"
          :sorted-pages="sortedPages"
          :active-tool="activeTool"
          :view-mode="viewMode"
          :duplicate-orders="duplicateOrders"
          @rotate="handleRotate"
          @remove="handleRemove"
          @move="handleMove"
        />
      </div>

      <!-- Lateral Settings Sidebar -->
      <SidebarSettings 
        v-if="pages.length > 0"
        :active-tool="activeTool"
        :pages="pages"
        :duplicate-count="duplicateOrders.size"
        v-model:ocrLanguage="ocrLanguage"
        v-model:splitStrategy="splitStrategy"
        v-model:splitRange="splitRange"
        @apply-order="applyOrder"
        @apply-split="applySplitGroups"
        @rotate-all="handleRotateAll"
      />
    </div>

    <!-- Loading Overlay -->
    <div v-if="isLoading" class="loader-overlay">
      <div class="loader"></div>
      <p v-if="isOcrRunning">OCR Recognition: Page {{ ocrCurrentPage }} of {{ ocrTotalPages }} ({{ ocrProgress }}%)</p>
      <p v-else>Processing PDF...</p>
    </div>
  </div>
</template>

<style scoped>
.workspace { display: flex; flex-direction: column; height: 100%; background: #f8fafc; }
.workspace-layout { flex: 1; display: flex; overflow: hidden; }
.workspace-main { flex: 1; display: flex; flex-direction: column; overflow: hidden; position: relative; }

.empty-state { height: 100%; display: flex; align-items: center; justify-content: center; }
.upload-card { background: white; padding: 3rem; border-radius: 1.5rem; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); width: 100%; max-width: 450px; text-align: center; }
.upload-area { cursor: pointer; display: flex; flex-direction: column; align-items: center; }
.icon-circle { width: 70px; height: 70px; background: #eff6ff; color: #3b82f6; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-bottom: 1rem; }

.btn-secondary { background: white; color: #1e293b; border: 1px solid #e2e8f0; padding: 0.5rem 1rem; border-radius: 0.5rem; font-weight: 600; }

.loader-overlay { position: absolute; inset: 0; background: rgba(255,255,255,0.85); display: flex; flex-direction: column; align-items: center; justify-content: center; z-index: 200; font-weight: 600; color: #1e293b; }
.loader { border: 3px solid #f3f3f3; border-top: 3px solid #3b82f6; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; margin-bottom: 1rem; }
@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
</style>
