<script setup lang="ts">
import { 
  RotateCcw, RotateCw, Scissors, 
  ListOrdered, CheckCircle2, Layout,
  Plus, Trash2, Stamp, Image, Type as TextIcon, Search, Crop, Lock
} from 'lucide-vue-next'
import type { ToolType, PageInfo } from '../../types'
import { computed } from 'vue'

const props = defineProps<{
  activeTool: ToolType;
  pages: PageInfo[];
  duplicateCount: number;
  ocrEnabled: boolean;
  ocrLanguage: string;
  splitStrategy: 'range' | 'even-odd' | 'manual' | 'custom';
  splitRange: number;
  customRanges: { start: number; end: number }[];
  numberingEnabled: boolean;
  numberingPosition: string;
  numberingBgColor: string;
  numberingTextColor: string;
  watermarkEnabled: boolean;
  watermarkType: 'text' | 'image';
  watermarkText: string;
  watermarkImage: string | null;
  watermarkPosition: string;
  watermarkRepeat: boolean;
  watermarkRotation: number;
  watermarkOpacity: number;
  watermarkColor: string;
  watermarkSize: number;
  protectEnabled: boolean;
  pdfPassword: string;
}>()

const emit = defineEmits([
  'apply-order', 'rotate-all', 'apply-split', 'apply-crop-all', 'reset',
  'update:ocrEnabled', 'update:ocrLanguage', 
  'update:splitStrategy', 'update:splitRange', 
  'update:numberingEnabled', 'update:numberingPosition', 'update:numberingBgColor', 'update:numberingTextColor',
  'update:watermarkEnabled', 'update:watermarkType', 'update:watermarkText', 'update:watermarkImage', 'update:watermarkPosition',
  'update:watermarkRepeat', 'update:watermarkRotation', 'update:watermarkOpacity', 'update:watermarkColor', 'update:watermarkSize',
  'update:protectEnabled', 'update:pdfPassword'
])

const groups = computed(() => {
  const map: Record<number, number> = {}
  props.pages.forEach(p => { if (p.group) map[p.group] = (map[p.group] || 0) + 1 })
  return Object.entries(map).map(([id, count]) => ({ id: Number(id), count }))
})

const getGroupColor = (g: number) => {
  const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316', '#6366f1', '#14b8a6']
  return colors[(g - 1) % colors.length]
}

const handleImageUpload = (e: Event) => {
  const target = e.target as HTMLInputElement
  if (target.files?.[0]) {
    const reader = new FileReader()
    reader.onload = (ev) => emit('update:watermarkImage', ev.target?.result as string)
    reader.readAsDataURL(target.files[0])
  }
}

const posGrid = [['top-left', 'top-center', 'top-right'], ['center-left', 'center-center', 'center-right'], ['bottom-left', 'bottom-center', 'bottom-right']]
</script>

<template>
  <aside class="settings-sidebar">
    <div class="sidebar-header">
      <div class="header-flex">
        <h3>Tool Settings</h3>
        <button @click="$emit('reset')" class="btn-reset" title="Clear All"><Trash2 :size="14" /></button>
      </div>
      <p>Configure your PDF process</p>
    </div>
    <div class="sidebar-content">
      
      <!-- REORDER -->
      <div v-if="activeTool === 'reorder'" class="setting-group">
        <div class="group-label"><ListOrdered :size="16" /> Reorder Logic</div>
        <button @click="$emit('apply-order')" class="btn-action primary" :disabled="duplicateCount > 0"><CheckCircle2 :size="18" /> Process Order</button>
        <p v-if="duplicateCount > 0" class="error-msg">Conflict: {{ duplicateCount }} duplicates!</p>
      </div>

      <!-- ROTATE -->
      <div v-if="activeTool === 'rotate'" class="setting-group">
        <div class="group-label"><RotateCw :size="16" /> Rotation</div>
        <div class="button-grid">
          <button @click="$emit('rotate-all', 'ccw')" class="btn-outline"><RotateCcw :size="18" /> Left</button>
          <button @click="$emit('rotate-all', 'cw')" class="btn-outline"><RotateCw :size="18" /> Right</button>
        </div>
      </div>

      <!-- CROP -->
      <div v-if="activeTool === 'crop'" class="setting-group">
        <div class="group-label"><Crop :size="16" /> Crop Settings</div>
        <div class="info-card">Adjust the crop area on any page card. You can apply the current page's crop to all pages.</div>
        <button @click="$emit('apply-crop-all')" class="btn-action primary">Apply Current to All</button>
      </div>

      <!-- SPLIT -->
      <div v-if="activeTool === 'split'" class="setting-group">
        <div class="group-label"><Scissors :size="16" /> Split</div>
        <select :value="splitStrategy" @change="$emit('update:splitStrategy', ($event.target as any).value)" class="sidebar-select">
          <option value="range">Ranges</option><option value="even-odd">Even/Odd</option><option value="custom">Custom</option><option value="manual">Manual</option>
        </select>
        <div v-if="splitStrategy === 'custom'" class="custom-ranges-box">
          <div v-for="(range, idx) in customRanges" :key="idx" class="range-row">
            <input type="number" v-model.number="range.start" class="sidebar-input mini" /><span>to</span><input type="number" v-model.number="range.end" class="sidebar-input mini" />
            <button @click="customRanges.splice(idx, 1)" class="btn-icon-danger" :disabled="customRanges.length === 1"><Trash2 :size="14" /></button>
          </div>
          <button @click="customRanges.push({ start: 1, end: 1 })" class="btn-outline-sm"><Plus :size="14" /> Add Range</button>
        </div>
        <button @click="$emit('apply-split')" class="btn-action primary">Apply</button>
        <div class="group-list">
          <div v-for="g in groups" :key="g.id" class="group-item">
            <div class="group-indicator" :style="{ background: getGroupColor(g.id) }"></div>
            <span>PDF #{{ g.id }} ({{ g.count }} pgs)</span>
          </div>
        </div>
      </div>

      <!-- WATERMARK -->
      <div v-if="activeTool === 'watermark'" class="setting-group">
        <div class="group-label"><Stamp :size="16" /> Watermark</div>
        <div class="toggle-item"><span>Enable Watermark</span><label class="switch"><input type="checkbox" :checked="watermarkEnabled" @change="$emit('update:watermarkEnabled', ($event.target as any).checked)"><span class="slider round"></span></label></div>
        <div v-if="watermarkEnabled" class="sub-settings">
          <div class="view-toggle mini">
            <button :class="{ active: watermarkType === 'text' }" @click="$emit('update:watermarkType', 'text')"><TextIcon :size="14" /> Text</button>
            <button :class="{ active: watermarkType === 'image' }" @click="$emit('update:watermarkType', 'image')"><Image :size="14" /> Image</button>
          </div>
          <input v-if="watermarkType === 'text'" type="text" :value="watermarkText" @input="$emit('update:watermarkText', ($event.target as any).value)" class="sidebar-input" />
          <input v-else type="file" @change="handleImageUpload" accept="image/*" class="sidebar-input file" />
          <div class="control-item"><label>Position Grid</label><div class="pos-grid"><div v-for="(row, ri) in posGrid" :key="ri" class="pos-row"><button v-for="p in row" :key="p" :class="{ active: watermarkPosition === p }" @click="$emit('update:watermarkPosition', p)" class="pos-cell"></button></div></div></div>
          <div class="toggle-item borderless"><span>Repeat</span><label class="switch"><input type="checkbox" :checked="watermarkRepeat" @change="$emit('update:watermarkRepeat', ($event.target as any).checked)"><span class="slider round"></span></label></div>
          <div class="options-grid">
            <div class="opt-field"><span>Opacity</span><input type="range" min="0" max="1" step="0.1" :value="watermarkOpacity" @input="$emit('update:watermarkOpacity', Number(($event.target as any).value))" /></div>
            <div class="opt-field"><span>Size</span><input type="number" :value="watermarkSize" @input="$emit('update:watermarkSize', Number(($event.target as any).value))" class="sidebar-input mini" /></div>
            <div v-if="watermarkType === 'text'" class="opt-field"><span>Color</span><input type="color" :value="watermarkColor" @input="$emit('update:watermarkColor', ($event.target as any).value)" /></div>
          </div>
        </div>
      </div>

      <!-- NUMBERING -->
      <div v-if="activeTool === 'numbering'" class="setting-group">
        <div class="group-label"><Layout :size="16" /> Numbering</div>
        <div class="toggle-item"><span>Enable</span><label class="switch"><input type="checkbox" :checked="numberingEnabled" @change="$emit('update:numberingEnabled', ($event.target as any).checked)"><span class="slider round"></span></label></div>
        <div v-if="numberingEnabled" class="sub-settings">
          <select :value="numberingPosition" @change="$emit('update:numberingPosition', ($event.target as any).value)" class="sidebar-select">
            <option value="top-left">Top Left</option><option value="top-center">Top Center</option><option value="top-right">Top Right</option><option value="bottom-left">Bottom Left</option><option value="bottom-center">Bottom Center</option><option value="bottom-right">Bottom Right</option>
          </select>
          <div class="color-row">
            <div class="color-input-group"><span class="mini-label">BG</span><input type="color" :value="numberingBgColor" @input="$emit('update:numberingBgColor', ($event.target as any).value)" /></div>
            <div class="color-input-group"><span class="mini-label">Txt</span><input type="color" :value="numberingTextColor" @input="$emit('update:numberingTextColor', ($event.target as any).value)" /></div>
          </div>
        </div>
      </div>

      <!-- OCR -->
      <div v-if="activeTool === 'ocr'" class="setting-group">
        <div class="group-label"><Search :size="16" /> OCR</div>
        <div class="toggle-item"><span>Searchable PDF</span><label class="switch"><input type="checkbox" :checked="ocrEnabled" @change="$emit('update:ocrEnabled', ($event.target as any).checked)"><span class="slider round"></span></label></div>
        <select v-if="ocrEnabled" :value="ocrLanguage" @change="$emit('update:ocrLanguage', ($event.target as any).value)" class="sidebar-select">
          <option value="spa">Spanish</option><option value="glg">Galician</option><option value="eng">English</option>
        </select>
      </div>

      <!-- PROTECT -->
      <div v-if="activeTool === 'protect'" class="setting-group">
        <div class="group-label"><Lock :size="16" /> Password Protection</div>
        <div class="toggle-item"><span>Enable Protection</span><label class="switch"><input type="checkbox" :checked="protectEnabled" @change="$emit('update:protectEnabled', ($event.target as any).checked)"><span class="slider round"></span></label></div>
        <div v-if="protectEnabled" class="sub-settings">
          <div class="opt-field">
            <span>Set Password</span>
            <input type="password" :value="pdfPassword" @input="$emit('update:pdfPassword', ($event.target as any).value)" class="sidebar-input" placeholder="Enter password..." />
          </div>
          <p class="info-card">The PDF will be encrypted. You will need this password to open it.</p>
        </div>
      </div>

    </div>
    <div class="sidebar-footer"><div class="summary"><span>Workspace</span><strong>{{ pages.length }} Pages</strong></div></div>
  </aside>
</template>

<style scoped>
.settings-sidebar { width: 300px; background: white; border-left: 1px solid #e2e8f0; display: flex; flex-direction: column; height: 100%; box-shadow: -4px 0 15px rgba(0,0,0,0.02); }

@media (max-width: 1024px) {
  .settings-sidebar {
    width: 100%;
    height: auto;
    border-left: none;
    border-top: 1px solid #e2e8f0;
    box-shadow: 0 -4px 15px rgba(0,0,0,0.02);
  }
}

.sidebar-header { padding: 1.5rem; border-bottom: 1px solid #f1f5f9; }

@media (max-width: 1024px) {
  .sidebar-header {
    padding: 1rem 1.5rem;
  }
}

.header-flex { display: flex; justify-content: space-between; align-items: center; }
.btn-reset { background: transparent; border: none; color: #ef4444; cursor: pointer; padding: 4px; border-radius: 4px; }
.btn-reset:hover { background: #fee2e2; }
.sidebar-header h3 { margin: 0; font-size: 1.1rem; font-weight: 800; color: #1e293b; }
.sidebar-header p { margin: 0.25rem 0 0; font-size: 0.75rem; color: #64748b; }
.sidebar-content { flex: 1; overflow-y: auto; padding: 1.5rem; display: flex; flex-direction: column; gap: 2.5rem; }
.setting-group { display: flex; flex-direction: column; gap: 1rem; }
.button-grid { display: flex; gap: 0.5rem; }
.group-label { font-size: 0.7rem; font-weight: 800; color: #94a3b8; text-transform: uppercase; display: flex; align-items: center; gap: 0.5rem; }
.sidebar-select, .sidebar-input { width: 100%; padding: 0.6rem; border: 1px solid #e2e8f0; border-radius: 0.5rem; font-weight: 700; font-size: 0.85rem; background: #f8fafc; }
.sidebar-input.mini { width: 65px; text-align: center; }
.btn-action { width: 100%; padding: 0.8rem; border-radius: 0.75rem; border: none; font-weight: 800; display: flex; align-items: center; justify-content: center; gap: 0.5rem; cursor: pointer; }
.btn-action.primary { background: #3b82f6; color: white; }
.btn-outline { flex: 1; padding: 0.6rem; border-radius: 0.6rem; border: 1px solid #e2e8f0; background: white; font-weight: 700; font-size: 0.75rem; display: flex; align-items: center; justify-content: center; gap: 0.4rem; cursor: pointer; }
.btn-outline-sm { width: 100%; padding: 0.6rem; border-radius: 0.5rem; border: 1px dashed #3b82f6; background: #eff6ff; color: #3b82f6; font-weight: 800; font-size: 0.75rem; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 0.4rem; }
.btn-icon-danger { background: #fee2e2; color: #ef4444; border: none; border-radius: 0.5rem; padding: 0.5rem; cursor: pointer; }
.custom-ranges-box { display: flex; flex-direction: column; gap: 0.75rem; }
.range-row { display: flex; align-items: center; justify-content: space-between; gap: 0.5rem; font-size: 0.75rem; font-weight: 700; color: #64748b; }
.group-list { display: flex; flex-direction: column; gap: 0.6rem; }
.group-item { display: flex; align-items: center; gap: 0.75rem; background: #f8fafc; padding: 0.7rem; border-radius: 0.6rem; border: 1px solid #e2e8f0; font-size: 0.8rem; }
.group-indicator { width: 12px; height: 12px; border-radius: 3px; }
.info-card { background: #f8fafc; padding: 0.8rem; border-radius: 0.6rem; border: 1px solid #e2e8f0; font-size: 0.75rem; color: #475569; }
.sub-settings { display: flex; flex-direction: column; gap: 1rem; padding-left: 0.75rem; border-left: 2px solid #eff6ff; }
.toggle-item { display: flex; justify-content: space-between; align-items: center; background: #f8fafc; padding: 0.8rem; border-radius: 0.6rem; border: 1px solid #e2e8f0; font-size: 0.85rem; font-weight: 800; }
.toggle-item.borderless { background: transparent; border: none; padding: 0; }
.switch { position: relative; display: inline-block; width: 40px; height: 20px; }
.switch input { opacity: 0; width: 0; height: 0; }
.slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #cbd5e1; transition: .4s; border-radius: 20px; }
.slider:before { position: absolute; content: ""; height: 14px; width: 14px; left: 3px; bottom: 3px; background-color: white; transition: .4s; border-radius: 50%; }
input:checked + .slider { background-color: #3b82f6; }
input:checked + .slider:before { transform: translateX(20px); }
.view-toggle.mini { background: #f1f5f9; padding: 0.25rem; border-radius: 0.5rem; display: flex; gap: 0.25rem; }
.view-toggle.mini button { border: none; background: transparent; flex: 1; padding: 0.4rem; border-radius: 0.4rem; font-size: 0.75rem; font-weight: 800; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 0.4rem; color: #64748b; }
.view-toggle.mini button.active { background: white; color: #3b82f6; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
.pos-grid { display: flex; flex-direction: column; gap: 6px; background: #f1f5f9; padding: 10px; border-radius: 10px; align-self: flex-start; }
.pos-row { display: flex; gap: 6px; }
.pos-cell { width: 28px; height: 28px; border: 1px solid #e2e8f0; background: white; border-radius: 5px; cursor: pointer; }
.pos-cell.active { background: #3b82f6; }
.options-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
.opt-field { display: flex; flex-direction: column; gap: 0.35rem; }
.opt-field span { font-size: 0.65rem; font-weight: 800; color: #94a3b8; }
.color-row { display: flex; gap: 1rem; }
.color-input-group { flex: 1; display: flex; flex-direction: column; gap: 0.35rem; }
.mini-label { font-size: 0.65rem; font-weight: 800; color: #94a3b8; }
.color-input-group input { width: 100%; height: 35px; border: 1px solid #e2e8f0; border-radius: 0.5rem; padding: 2px; }
.sidebar-footer { padding: 1.5rem; border-top: 1px solid #f1f5f9; }
.summary { display: flex; justify-content: space-between; align-items: center; font-size: 0.8rem; }
</style>
