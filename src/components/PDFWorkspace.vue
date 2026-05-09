<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import * as pdfjsLib from 'pdfjs-dist'
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url'
import { PDFDocument, degrees, StandardFonts, rgb, PDFImage } from 'pdf-lib'
import { encryptPDF } from '@pdfsmaller/pdf-encrypt-lite'
import { createWorker } from 'tesseract.js'
import { FileUp, ChevronUp, ChevronDown, Settings, Lock, Zap } from 'lucide-vue-next'

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
const loadingCurrentPage = ref(0)
const loadingTotalPages = ref(0)

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

// Protect Specific
const protectEnabled = ref(false)
const pdfPassword = ref('')

// Unlock Specific
const unlockEnabled = ref(false)
const unlockPasswordInput = ref('')
const bruteForceEnabled = ref(false)
const isBruteForcing = ref(false)
const bruteForceStatus = ref('')

const isMobileDrawerOpen = ref(false)

// Auto-enable features
watch(() => props.activeTool, (newTool) => {
  if (newTool === 'numbering') numberingEnabled.value = true
  if (newTool === 'watermark') watermarkEnabled.value = true
  if (newTool === 'ocr') ocrEnabled.value = true
  if (newTool === 'protect') protectEnabled.value = true
  if (newTool === 'unlock') unlockEnabled.value = true
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
    loadingCurrentPage.value = 0
    loadingTotalPages.value = 0
    
    const files = Array.from(target.files)
    for (const file of files) {
      const arrayBuffer = await file.arrayBuffer()
      const fileIndex = loadedFiles.value.length
      loadedFiles.value.push({ name: file.name, arrayBuffer })
      
      // If we are in unlock mode, we don't block if loading fails due to password
      // We just keep the file in loadedFiles so the user can unlock it from settings
      await loadPagesFromFile(arrayBuffer, fileIndex)
    }
    isLoading.value = false
  }
}

const loadPagesFromFile = async (buffer: ArrayBuffer, fileIndex: number, password?: string): Promise<boolean> => {
  try {
    const loadingTask = pdfjsLib.getDocument({ data: buffer.slice(0), password })
    const pdfDoc = await loadingTask.promise
    
    // Store successful password for later export
    if (loadedFiles.value[fileIndex]) {
      loadedFiles.value[fileIndex].password = password
    }

    loadingTotalPages.value += pdfDoc.numPages
    
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
      loadingCurrentPage.value++
    }
    return true
  } catch (error: any) {
    if (error.name === 'PasswordException') {
      if (props.activeTool === 'unlock') {
        return false
      } else {
        const pwd = prompt('This PDF is password protected. Enter password:')
        if (pwd) return await loadPagesFromFile(buffer, fileIndex, pwd)
      }
      return false
    } else {
      console.error(error)
      return false
    }
  }
}

const handleManualUnlock = async () => {
  if (loadedFiles.value.length === 0) return
  isLoading.value = true
  const file = loadedFiles.value[loadedFiles.value.length - 1]
  if (file) {
    const success = await loadPagesFromFile(file.arrayBuffer, loadedFiles.value.length - 1, unlockPasswordInput.value)
    if (!success) alert('Invalid password. Please try again.')
    else {
      // Clear status if successful
      bruteForceStatus.value = ''
    }
  }
  isLoading.value = false
}

const startBruteForce = async () => {
  if (loadedFiles.value.length === 0) return
  isBruteForcing.value = true
  bruteForceStatus.value = 'Preparing...'
  
  const charset = '0123456789abcdefghijklmnopqrstuvwxyz'
  const maxLen = 4 
  
  const file = loadedFiles.value[loadedFiles.value.length - 1]
  if (!file) { isBruteForcing.value = false; return }

  const generatePasswords = function* (length: number, current = ''): Generator<string> {
    if (current.length === length) {
      yield current
      return
    }
    for (const char of charset) {
      yield* generatePasswords(length, current + char)
    }
  }

  try {
    let attempts = 0
    for (let len = 1; len <= maxLen; len++) {
      for (const pwd of generatePasswords(len)) {
        if (!isBruteForcing.value) break
        
        attempts++
        // Update status and yield to UI every 5 attempts to prevent "toast"
        if (attempts % 5 === 0) {
          bruteForceStatus.value = `Trying: ${pwd} (${attempts} attempts)`
          await new Promise(r => setTimeout(r, 10)) 
        }

        try {
          const loadingTask = pdfjsLib.getDocument({ data: file.arrayBuffer.slice(0), password: pwd })
          const pdfDoc = await loadingTask.promise
          
          // Success!
          unlockPasswordInput.value = pwd
          isBruteForcing.value = false
          bruteForceStatus.value = `Found: ${pwd}! Rendering pages...`
          
          // Properly load the pages now
          await loadPagesFromFile(file.arrayBuffer, loadedFiles.value.length - 1, pwd)
          
          bruteForceStatus.value = `Unlocked successfully with password: ${pwd}`
          
          // Cleanup PDF.js doc
          await pdfDoc.destroy()
          return
        } catch (e: any) {
          if (e.name !== 'PasswordException') throw e
        }
      }
    }
    if (isBruteForcing.value) bruteForceStatus.value = "Not found (tried up to 4 chars)"
  } catch (e) {
    console.error(e)
    bruteForceStatus.value = "Error during brute force"
  } finally {
    isBruteForcing.value = false
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
        const file = loadedFiles.value[pInfo.originalFileIndex]
        if (!file) continue
        
        if (!cache[pInfo.originalFileIndex]) {
          try {
            // pdf-lib does not support password decryption, so we attempt a normal load
            cache[pInfo.originalFileIndex] = await PDFDocument.load(file.arrayBuffer)
          } catch (e) {
            // If it fails (likely due to encryption), we set it to null to trigger image fallback
            cache[pInfo.originalFileIndex] = null as any
          }
        }

        const srcDoc = cache[pInfo.originalFileIndex]
        let cp: any
        
        if (srcDoc) {
          try {
            [cp] = await doc.copyPages(srcDoc, [pInfo.originalPageIndex])
          } catch (e) {
            // Fallback if copyPages fails on encrypted content
            srcDoc = null as any
          }
        }

        if (!srcDoc) {
          // IMAGE FALLBACK: Recreate the page from the rendered image
          const imgBytes = await fetch(pInfo.dataUrl).then(r => r.arrayBuffer())
          const img = await doc.embedJpg(imgBytes)
          cp = doc.addPage([pInfo.width, pInfo.height])
          cp.drawImage(img, { x: 0, y: 0, width: pInfo.width, height: pInfo.height })
        } else {
          doc.addPage(cp)
        }

        const { width, height } = cp.getSize()
        
        // Final orientation calculation
        const originalRotation = cp.getRotation ? cp.getRotation().angle : 0
        const totalRotation = (originalRotation + (pInfo.rotation || 0)) % 360
        const isRotated = totalRotation % 180 !== 0
        const vWidth = isRotated ? height : width
        const vHeight = isRotated ? width : height

        const mapCoords = (vx: number, vy: number) => {
          if (totalRotation === 90) return { x: width - vy, y: vx }
          if (totalRotation === 180) return { x: width - vx, y: height - vy }
          if (totalRotation === 270) return { x: vy, y: height - vx }
          return { x: vx, y: vy }
        }

        // Apply Crop
        if (pInfo.crop && (pInfo.crop.width < 100 || pInfo.crop.height < 100 || pInfo.crop.x > 0 || pInfo.crop.y > 0)) {
          const cx = (pInfo.crop.x / 100) * width, cy = (pInfo.crop.y / 100) * height
          const cw = (pInfo.crop.width / 100) * width, ch = (pInfo.crop.height / 100) * height
          cp.setCropBox(cx, height - cy - ch, cw, ch)
        }

        if (withWatermark) {
          const nr = degrees(watermarkRotation.value + totalRotation)
          const draw = (vx: number, vy: number) => {
            const { x, y } = mapCoords(vx, vy)
            const finalSize = watermarkRepeat.value ? watermarkSize.value / 2.5 : watermarkSize.value
            if (watermarkType.value === 'text') {
              const c = hexToRgb(watermarkColor.value)
              cp.drawText(watermarkText.value, { x, y, size: finalSize, font, opacity: watermarkOpacity.value, rotate: nr, color: rgb(c.r, c.g, c.b) })
            } else if (wImg) {
              const d = wImg.scale(finalSize / 100)
              cp.drawImage(wImg, { x, y, width: d.width, height: d.height, opacity: watermarkOpacity.value, rotate: nr })
            }
          }
          if (watermarkRepeat.value) { 
            const cols = 3, rows = 4
            for (let i = 0; i < cols; i++) {
              for (let j = 0; j < rows; j++) {
                const vx = (i + 0.5) * (vWidth / cols) - (watermarkSize.value * 1)
                const vy = (j + 0.5) * (vHeight / rows)
                draw(vx, vy)
              }
            }
          } else {
            let tx=0, ty=0, [v,h] = watermarkPosition.value.split('-')
            tx = h==='left'?50 : h==='right'?vWidth-200 : vWidth/2-100
            ty = v==='top'?vHeight-100 : v==='bottom'?50 : vHeight/2-50
            draw(tx, ty)
          }
        }
        if (withNumbering) {
          const txt = `${gIdx}`, fs = 12, tw = font.widthOfTextAtSize(txt, fs), pad = 6, bw = tw+pad*2, bh = fs+pad*2
          let vnx=0, vny=0, npos = numberingPosition.value
          vnx = npos.includes('left')?20 : npos.includes('right')?vWidth-bw-20 : (vWidth-bw)/2
          vny = npos.includes('top')?vHeight-bh-20 : 20
          
          const { x: nx, y: ny } = mapCoords(vnx, vny)
          const { x: tx, y: ty } = mapCoords(vnx + pad, vny + pad + 2)
          const nr = degrees(totalRotation)
          const bc = hexToRgb(numberingBgColor.value), tc = hexToRgb(numberingTextColor.value)
          
          cp.drawRectangle({ x: nx, y: ny, width: bw, height: bh, color: rgb(bc.r,bc.g,bc.b), rotate: nr })
          cp.drawText(txt, { x: tx, y: ty, size: fs, font, color: rgb(tc.r,tc.g,tc.b), rotate: nr })
        }
        cp.setRotation(degrees(totalRotation))
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
      let bytes = await doc.save()

      // Apply Protection if enabled
      if (protectEnabled.value && pdfPassword.value) {
        bytes = await encryptPDF(bytes, pdfPassword.value, pdfPassword.value)
      }

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
    <Toolbar :active-tool="activeTool" v-model:viewMode="viewMode" :isLoading="isLoading" :isOcrRunning="isOcrRunning" :pagesCount="pages.length" @add-files="onFileChange" @download="downloadPdf" :isMobileDrawerOpen="isMobileDrawerOpen" @toggle-drawer="isMobileDrawerOpen = !isMobileDrawerOpen" />
    <div class="workspace-layout">
      <div class="workspace-main">
        <div v-if="pages.length === 0" class="empty-state">
          <div class="upload-card">
            <input type="file" multiple @change="onFileChange" accept="application/pdf" id="pdf-upload" hidden />
            <label for="pdf-upload" class="upload-area"><div class="icon-circle"><FileUp :size="40" /></div><h3>Upload PDF Files</h3><p>Select documents to start</p><span class="btn-secondary">Browse Files</span></label>
            
            <div v-if="loadedFiles.length > 0 && props.activeTool === 'unlock'" class="locked-status" style="margin-top: 2rem; padding: 1rem; background: #fffbeb; border: 1px solid #fef3c7; border-radius: 1rem; color: #92400e; font-size: 0.875rem;">
              <Lock :size="20" style="margin-bottom: 0.5rem;" />
              <p><strong>{{ loadedFiles[0].name }}</strong> is locked.</p>
              <p>Use the settings on the right to unlock it.</p>
            </div>
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
      <div v-if="pages.length > 0 || (loadedFiles.length > 0 && props.activeTool === 'unlock')" class="settings-drawer" :class="{ 'mobile-open': isMobileDrawerOpen }">
        <button class="drawer-handle desktop-only" @click="isMobileDrawerOpen = !isMobileDrawerOpen">
          <ChevronUp v-if="!isMobileDrawerOpen" :size="18" />
          <ChevronDown v-else :size="18" />
          {{ isMobileDrawerOpen ? 'Hide Settings' : 'Configure Tool' }}
        </button>
        <div class="drawer-scrollable">
          <div v-if="isMobileDrawerOpen" class="mobile-drawer-header mobile-only">
             <h3>Tool Settings</h3>
             <button @click="isMobileDrawerOpen = false" class="btn-close-drawer"><ChevronDown :size="24" /></button>
          </div>
          <SidebarSettings 
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
            v-model:protectEnabled="protectEnabled"
            v-model:pdfPassword="pdfPassword"
            v-model:unlockEnabled="unlockEnabled"
            v-model:unlockPasswordInput="unlockPasswordInput"
            v-model:bruteForceEnabled="bruteForceEnabled"
            :isBruteForcing="isBruteForcing"
            :bruteForceStatus="bruteForceStatus"
            @apply-order="applyOrder" 
            @apply-split="applySplitGroups" 
            @rotate-all="handleRotateAll" 
            @apply-crop-all="applyCropAll"
            @reset="reset"
            @start-brute-force="startBruteForce"
            @manual-unlock="handleManualUnlock"
          />
        </div>
      </div>
    </div>

    <!-- Floating Action Button for Mobile Settings -->
    <button v-if="pages.length > 0 && !isMobileDrawerOpen" class="fab-settings mobile-only" @click="isMobileDrawerOpen = true">
      <Settings :size="24" />
      <span>Settings</span>
    </button>
    <div v-if="isLoading" class="loader-overlay">
      <div class="loader-content">
        <div class="loader"></div>
        <div v-if="isOcrRunning" class="progress-info">
          <p>OCR Recognition: Page {{ ocrCurrentPage }} of {{ ocrTotalPages }}</p>
          <div class="progress-container"><div class="progress-bar" :style="{ width: ocrProgress + '%' }"></div></div>
        </div>
        <div v-else-if="loadingTotalPages > 0" class="progress-info">
          <p>Cargando páginas: {{ loadingCurrentPage }} de {{ loadingTotalPages }}</p>
          <div class="progress-container"><div class="progress-bar" :style="{ width: (loadingCurrentPage / loadingTotalPages * 100) + '%' }"></div></div>
        </div>
        <p v-else>Processing PDF...</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.workspace { display: flex; flex-direction: column; height: 100%; background: #f8fafc; }
.workspace-layout { flex: 1; display: flex; overflow: hidden; }

@media (max-width: 1024px) {
  .workspace-layout {
    flex-direction: column;
    overflow: hidden;
  }
}

.workspace-main { flex: 1; display: flex; flex-direction: column; overflow: hidden; position: relative; }

@media (max-width: 1024px) {
  .workspace-main {
    flex: 1;
    height: auto;
    border-bottom: none;
  }
}

.settings-drawer {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.drawer-scrollable {
  flex: 1;
  overflow-y: auto;
}

.mobile-drawer-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
}

.mobile-drawer-header h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 800;
}

.btn-close-drawer {
  background: #f1f5f9;
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.fab-settings {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  background: #1e293b;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 3rem;
  font-weight: 800;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  box-shadow: 0 10px 25px rgba(0,0,0,0.2);
  z-index: 500;
  transition: all 0.2s;
}

.fab-settings:active {
  transform: scale(0.95);
}

@media (max-width: 1024px) {
  .settings-drawer {
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 70vh;
    background: white;
    z-index: 1000;
    transform: translateY(100%);
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 -10px 30px rgba(0,0,0,0.1);
    border-top-left-radius: 1.5rem;
    border-top-right-radius: 1.5rem;
  }

  .settings-drawer.mobile-open {
    transform: translateY(0);
  }

  .drawer-handle {
    display: none;
  }
}

.mobile-only { display: none; }
.desktop-only { display: inline-flex; }

@media (max-width: 1024px) {
  .mobile-only { display: flex; }
  .desktop-only { display: none; }
}

@media (min-width: 1025px) {
  .drawer-handle {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 1rem;
    background: #f8fafc;
    border: none;
    border-bottom: 1px solid #e2e8f0;
    width: 100%;
    font-weight: 800;
    color: #475569;
    border-top-left-radius: 1.5rem;
    border-top-right-radius: 1.5rem;
    cursor: pointer;
    flex-shrink: 0;
  }
}

.empty-state { height: 100%; display: flex; align-items: center; justify-content: center; padding: 2rem; overflow-y: auto; }
.upload-card { background: white; padding: 3rem; border-radius: 1.5rem; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); width: 100%; max-width: 450px; text-align: center; }
.upload-area { cursor: pointer; display: flex; flex-direction: column; align-items: center; }
.icon-circle { width: 70px; height: 70px; background: #eff6ff; color: #3b82f6; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-bottom: 1rem; }
.btn-secondary { background: white; color: #1e293b; border: 1px solid #e2e8f0; padding: 0.5rem 1rem; border-radius: 0.5rem; font-weight: 600; }
.loader-overlay { position: absolute; inset: 0; background: rgba(255,255,255,0.9); display: flex; flex-direction: column; align-items: center; justify-content: center; z-index: 200; font-weight: 600; color: #1e293b; text-align: center; }
.loader-content { width: 100%; max-width: 300px; display: flex; flex-direction: column; align-items: center; }
.progress-info { width: 100%; margin-top: 1rem; }
.progress-container { width: 100%; height: 8px; background: #e2e8f0; border-radius: 4px; overflow: hidden; margin-top: 0.5rem; }
.progress-bar { height: 100%; background: #3b82f6; transition: width 0.3s ease; }
.loader { border: 3px solid #f3f3f3; border-top: 3px solid #3b82f6; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; }
@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
</style>
