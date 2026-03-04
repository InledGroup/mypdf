<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import * as pdfjsLib from 'pdfjs-dist'
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url'
import { PDFDocument, degrees, StandardFonts, rgb, PDFImage } from 'pdf-lib'
import { createWorker } from 'tesseract.js'
import { FileUp } from 'lucide-vue-next'

import type { PageInfo, LoadedFile, ToolType, ViewMode } from '../types'
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
const ocrEnabled = ref(false)
const ocrLanguage = ref<'spa' | 'glg' | 'eng'>('spa')
const isOcrRunning = ref(false)
const ocrProgress = ref(0)
const ocrCurrentPage = ref(0)
const ocrTotalPages = ref(0)

// Split Specific
const splitStrategy = ref<'range' | 'even-odd' | 'manual' | 'custom'>('range')
const splitRange = ref(1)
const customRanges = ref<{ start: number; end: number }[]>([{ start: 1, end: 1 }])

// Numbering Specific
const numberingEnabled = ref(false)
const numberingPosition = ref('bottom-center')
const numberingBgColor = ref('#3b82f6')
const numberingTextColor = ref('#ffffff')

// Watermark Specific
const watermarkEnabled = ref(false)
const watermarkType = ref<'text' | 'image'>('text')
const watermarkText = ref('CONFIDENTIAL')
const watermarkImage = ref<string | null>(null)
const watermarkPosition = ref('center-center')
const watermarkRepeat = ref(false)
const watermarkRotation = ref(-45)
const watermarkOpacity = ref(0.3)
const watermarkColor = ref('#000000')
const watermarkSize = ref(50)

// Auto-enable features
watch(() => props.activeTool, (newTool) => {
  if (newTool === 'numbering') numberingEnabled.value = true
  if (newTool === 'watermark') watermarkEnabled.value = true
  if (newTool === 'ocr') ocrEnabled.value = true
})

// --- Computed ---
const sortedPages = computed(() => [...pages.value].sort((a, b) => a.order - b.order))
const duplicateOrders = computed(() => {
  const counts: Record<number, number> = {}
  pages.value.forEach((p: PageInfo) => { counts[p.order] = (counts[p.order] || 0) + 1 })
  return new Set(pages.value.filter((p: PageInfo) => (counts[p.order] || 0) > 1).map((p: PageInfo) => p.id))
})

// --- Helpers ---
const hexToRgb = (hex: string) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return { r: 0, g: 0, b: 0 };
  return {
    r: parseInt(result[1]!, 16) / 255,
    g: parseInt(result[2]!, 16) / 255,
    b: parseInt(result[3]!, 16) / 255
  };
}

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
  for (let i = 1; i <= pdfDoc.numPages; i++) {
    const page = await pdfDoc.getPage(i)
    const viewport = page.getViewport({ scale: 2.0 })
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')
    canvas.height = viewport.height
    canvas.width = viewport.width
    await page.render({ canvasContext: context!, viewport, intent: 'print' } as any).promise
    pages.value.push({
      id: `f${fileIndex}-p${i}-${Math.random().toString(36).substr(2, 9)}`,
      originalFileIndex: fileIndex,
      originalPageIndex: i - 1,
      order: pages.value.length + 1,
      dataUrl: canvas.toDataURL('image/jpeg', 0.9),
      rotation: 0,
      width: viewport.width / 2.0,
      height: viewport.height / 2.0,
      group: undefined,
      crop: { x: 0, y: 0, width: 100, height: 100 }
    })
  }
}

const handleRotate = (pId: string, dir: 'cw' | 'ccw') => {
  const p = pages.value.find(x => x.id === pId); if (!p) return
  p.rotation = dir === 'cw' ? (p.rotation + 90) % 360 : (p.rotation - 90 + 360) % 360
}
const handleRotateAll = (dir: 'cw' | 'ccw') => pages.value.forEach(p => handleRotate(p.id, dir))
const handleRemove = (pId: string) => { pages.value = pages.value.filter(x => x.id !== pId) }
const handleMove = (pId: string, to: number, rel: 'before' | 'after') => {
  const p = pages.value.find(x => x.id === pId), t = sortedPages.value[to - 1]
  if (p && t) { p.order = rel === 'after' ? t.order + 0.5 : t.order - 0.5; applyOrder() }
}
const applyOrder = () => { pages.value.sort((a,b) => a.order - b.order); pages.value.forEach((p,i) => p.order = i+1) }
const applySplitGroups = () => {
  pages.value.forEach(p => p.group = undefined)
  if (splitStrategy.value === 'range') pages.value.forEach((p,i) => p.group = Math.floor(i / splitRange.value) + 1)
  else if (splitStrategy.value === 'even-odd') pages.value.forEach((p,i) => p.group = (i % 2 === 0) ? 1 : 2)
  else if (splitStrategy.value === 'custom') {
    customRanges.value.forEach((r, idx) => {
      for (let i = Math.max(1, r.start); i <= Math.min(pages.value.length, r.end); i++) {
        const page = pages.value[i-1]
        if (page && !page.group) page.group = idx + 1
      }
    })
  }
}

const handleCropUpdate = (pId: string, crop: any) => {
  const p = pages.value.find(x => x.id === pId); if (p) p.crop = crop
}
const applyCropAll = () => {
  const sourceCrop = sortedPages.value[0]?.crop; if (!sourceCrop) return
  pages.value.forEach(p => p.crop = { ...sourceCrop })
}

const downloadPdf = async () => {
  if (pages.value.length === 0) return
  isLoading.value = true
  try {
    const withOcr = ocrEnabled.value, withNumbering = numberingEnabled.value, withWatermark = watermarkEnabled.value
    const groupsList = Array.from(new Set(pages.value.map(p => p.group || 1))).sort((a: any, b: any) => a - b)
    let tWorker: any = null
    if (withOcr) {
      isOcrRunning.value = true; ocrTotalPages.value = sortedPages.value.length; ocrCurrentPage.value = 1
      tWorker = await createWorker(ocrLanguage.value, 1, {
        workerPath: 'https://cdn.jsdelivr.net/npm/tesseract.js@v5.0.0/dist/worker.min.js',
        langPath: 'https://tessdata.projectnaptha.com/4.0.0_best',
        corePath: 'https://cdn.jsdelivr.net/npm/tesseract.js-core@v5.0.0/tesseract-core.wasm.js',
      })
    }
    const cache: Record<number, PDFDocument> = {}
    for (const g of groupsList) {
      const doc = await PDFDocument.create(), font = await doc.embedFont(StandardFonts.HelveticaBold)
      let wImg: PDFImage | null = null
      if (withWatermark && watermarkType.value === 'image' && watermarkImage.value) {
        const bytes = await fetch(watermarkImage.value).then(r => r.arrayBuffer())
        wImg = watermarkImage.value.startsWith('data:image/png') ? await doc.embedPng(bytes) : await doc.embedJpg(bytes)
      }
      const gPages = sortedPages.value.filter(p => (p.group || 1) === g)
      let gIdx = 1
      for (const pInfo of gPages) {
        const fileBuffer = loadedFiles.value[pInfo.originalFileIndex]?.arrayBuffer
        if (!fileBuffer) continue
        if (!cache[pInfo.originalFileIndex]) cache[pInfo.originalFileIndex] = await PDFDocument.load(fileBuffer)
        const srcDoc = cache[pInfo.originalFileIndex]!
        const [cp] = await doc.copyPages(srcDoc, [pInfo.originalPageIndex])
        if (!cp) continue
        const { width, height } = cp.getSize()
        
        // Apply Crop
        if (pInfo.crop && (pInfo.crop.width < 100 || pInfo.crop.height < 100 || pInfo.crop.x > 0 || pInfo.crop.y > 0)) {
          const cx = (pInfo.crop.x / 100) * width, cy = (pInfo.crop.y / 100) * height
          const cw = (pInfo.crop.width / 100) * width, ch = (pInfo.crop.height / 100) * height
          cp.setCropBox(cx, height - cy - ch, cw, ch)
        }

        if (withWatermark) {
          const draw = (x: number, y: number) => {
            if (watermarkType.value === 'text') {
              const c = hexToRgb(watermarkColor.value)
              cp.drawText(watermarkText.value, { x, y, size: watermarkSize.value, font, opacity: watermarkOpacity.value, rotate: degrees(watermarkRotation.value), color: rgb(c.r, c.g, c.b) })
            } else if (wImg) {
              const d = wImg.scale(watermarkSize.value / 100)
              cp.drawImage(wImg, { x, y, width: d.width, height: d.height, opacity: watermarkOpacity.value, rotate: degrees(watermarkRotation.value) })
            }
          }
          if (watermarkRepeat.value) { for (let tx=0; tx<width; tx+=150) for (let ty=0; ty<height; ty+=150) draw(tx, ty) }
          else {
            let tx=0, ty=0, [v,h] = watermarkPosition.value.split('-')
            tx = h==='left'?50 : h==='right'?width-150 : width/2-50
            ty = v==='top'?height-100 : v==='bottom'?50 : height/2-50
            draw(tx, ty)
          }
        }
        if (withNumbering) {
          const txt = `${gIdx}`, fs = 12, tw = font.widthOfTextAtSize(txt, fs), pad = 6, bw = tw+pad*2, bh = fs+pad*2
          let nx=0, ny=0, npos = numberingPosition.value
          nx = npos.includes('left')?20 : npos.includes('right')?width-bw-20 : (width-bw)/2
          ny = npos.includes('top')?height-bh-20 : 20
          const bc = hexToRgb(numberingBgColor.value), tc = hexToRgb(numberingTextColor.value)
          cp.drawRectangle({ x: nx, y: ny, width: bw, height: bh, color: rgb(bc.r,bc.g,bc.b) })
          cp.drawText(txt, { x: nx+pad, y: ny+pad+2, size: fs, font, color: rgb(tc.r,tc.g,tc.b) })
        }
        if (pInfo.rotation !== 0) cp.setRotation(degrees(pInfo.rotation))
        if (withOcr && tWorker) {
          const res = await tWorker.recognize(pInfo.dataUrl), d = res.data
          if (d?.words) for (const w of d.words) {
            const wx = (w.bbox.x0/(d.width||width*2))*width, wy = height-(w.bbox.y1/(d.height||height*2))*height, wfs = Math.max(1, ((w.bbox.y1-w.bbox.y0)/(d.height||height*2))*height)
            if (w.text?.trim()) cp.drawText(w.text, { x: wx, y: wy, size: wfs, font, opacity: 0.001, color: rgb(0,0,0) })
          }
          ocrCurrentPage.value++
        }
        doc.addPage(cp); gIdx++
      }
      const bytes = await doc.save()
      const link = document.createElement('a')
      link.href = URL.createObjectURL(new Blob([bytes as any], { type: 'application/pdf' }))
      link.download = `mypdf-export-${g}-${Date.now()}.pdf`

      link.click()
    }
    if (tWorker) await tWorker.terminate()
  } catch (e) { console.error(e); alert('Error generating PDF.') } finally { isLoading.value = false; isOcrRunning.value = false }
}
const reset = () => { if (confirm('Clear all pages?')) { pages.value = []; loadedFiles.value = [] } }
</script>

<template>
  <div class="workspace">
    <Toolbar :active-tool="activeTool" v-model:viewMode="viewMode" :isLoading="isLoading" :isOcrRunning="isOcrRunning" :pagesCount="pages.length" @add-files="onFileChange" @download="downloadPdf" />
    <div class="workspace-layout">
      <div class="workspace-main">
        <div v-if="pages.length === 0" class="empty-state">
          <div class="upload-card">
            <input type="file" multiple @change="onFileChange" accept="application/pdf" id="pdf-upload" hidden />
            <label for="pdf-upload" class="upload-area"><div class="icon-circle"><FileUp :size="40" /></div><h3>Upload PDF Files</h3><p>Select documents to start</p><span class="btn-secondary">Browse Files</span></label>
          </div>
        </div>
        <Canvas v-else 
          :pages="pages" 
          :sorted-pages="sortedPages" 
          :active-tool="activeTool" 
          :view-mode="viewMode" 
          :duplicate-orders="duplicateOrders" 
          :numbering="{ enabled: numberingEnabled, pos: numberingPosition, bg: numberingBgColor, text: numberingTextColor }"
          :watermark="{ enabled: watermarkEnabled, type: watermarkType, text: watermarkText, image: watermarkImage, pos: watermarkPosition, repeat: watermarkRepeat, opacity: watermarkOpacity, color: watermarkColor, size: watermarkSize, rotation: watermarkRotation }"
          @rotate="handleRotate" 
          @remove="handleRemove" 
          @move="handleMove" 
          @update:crop="handleCropUpdate"
        />
      </div>
      <SidebarSettings v-if="pages.length > 0" 
        :active-tool="activeTool" 
        :pages="pages" 
        :duplicate-count="duplicateOrders.size" 
        v-model:ocrEnabled="ocrEnabled"
        v-model:ocrLanguage="ocrLanguage" 
        v-model:splitStrategy="splitStrategy" 
        v-model:splitRange="splitRange" 
        v-model:customRanges="customRanges" 
        v-model:numberingEnabled="numberingEnabled" 
        v-model:numberingPosition="numberingPosition" 
        v-model:numberingBgColor="numberingBgColor" 
        v-model:numberingTextColor="numberingTextColor" 
        v-model:watermarkEnabled="watermarkEnabled"
        v-model:watermarkType="watermarkType" 
        v-model:watermarkText="watermarkText" 
        v-model:watermarkImage="watermarkImage" 
        v-model:watermarkPosition="watermarkPosition" 
        v-model:watermarkRepeat="watermarkRepeat" 
        v-model:watermarkRotation="watermarkRotation" 
        v-model:watermarkOpacity="watermarkOpacity" 
        v-model:watermarkColor="watermarkColor" 
        v-model:watermarkSize="watermarkSize" 
        @apply-order="applyOrder" 
        @apply-split="applySplitGroups" 
        @rotate-all="handleRotateAll" 
        @apply-crop-all="applyCropAll"
        @reset="reset"
      />
    </div>
    <div v-if="isLoading" class="loader-overlay"><div class="loader"></div><p v-if="isOcrRunning">OCR Recognition: Page {{ ocrCurrentPage }} of {{ ocrTotalPages }} ({{ ocrProgress }}%)</p><p v-else>Processing PDF...</p></div>
  </div>
</template>

<style scoped>
.workspace { display: flex; flex-direction: column; height: 100%; background: #f8fafc; }
.workspace-layout { flex: 1; display: flex; overflow: hidden; }
.workspace-main { flex: 1; display: flex; flex-direction: column; overflow: hidden; position: relative; }
.empty-state { height: 100%; display: flex; align-items: center; justify-content: center; padding: 2rem; overflow-y: auto; }
.upload-card { background: white; padding: 3rem; border-radius: 1.5rem; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); width: 100%; max-width: 450px; text-align: center; }
.upload-area { cursor: pointer; display: flex; flex-direction: column; align-items: center; }
.icon-circle { width: 70px; height: 70px; background: #eff6ff; color: #3b82f6; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-bottom: 1rem; }
.btn-secondary { background: white; color: #1e293b; border: 1px solid #e2e8f0; padding: 0.5rem 1rem; border-radius: 0.5rem; font-weight: 600; }
.loader-overlay { position: absolute; inset: 0; background: rgba(255,255,255,0.85); display: flex; flex-direction: column; align-items: center; justify-content: center; z-index: 200; font-weight: 600; color: #1e293b; }
.loader { border: 3px solid #f3f3f3; border-top: 3px solid #3b82f6; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; margin-bottom: 1rem; }
@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
</style>
