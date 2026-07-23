<script setup lang="ts">
import type { ToolType, PageInfo } from '../../types'
import { computed } from 'vue'
import { Trash2, Check, RotateCcw, RotateCw, Plus, X, Lock } from 'lucide-vue-next'

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
  unlockEnabled: boolean;
  unlockPasswordInput: string;
  bruteForceEnabled: boolean;
  isBruteForcing: boolean;
  bruteForceStatus: string;
 }>()

const emit = defineEmits([
  'apply-order', 'rotate-all', 'apply-split', 'apply-crop-all', 'reset', 'start-brute-force', 'manual-unlock',
  'update:ocrEnabled', 'update:ocrLanguage', 
  'update:splitStrategy', 'update:splitRange', 
  'update:numberingEnabled', 'update:numberingPosition', 'update:numberingBgColor', 'update:numberingTextColor',
  'update:watermarkEnabled', 'update:watermarkType', 'update:watermarkText', 'update:watermarkImage', 'update:watermarkPosition',
  'update:watermarkRepeat', 'update:watermarkRotation', 'update:watermarkOpacity', 'update:watermarkColor', 'update:watermarkSize',
  'update:protectEnabled', 'update:pdfPassword',
  'update:unlockEnabled', 'update:unlockPasswordInput', 'update:bruteForceEnabled'
])

const groups = computed(() => {
  const map: Record<number, number> = {}
  props.pages.forEach(p => { if (p.group) map[p.group] = (map[p.group] || 0) + 1 })
  return Object.entries(map).map(([id, count]) => ({ id: Number(id), count }))
})

const getGroupColor = (g: number) => {
  const colors = ['#0078d4', '#d13438', '#0f7b0f', '#ca5010', '#8764b8', '#e3008c', '#00b294', '#ff8c00', '#5c2d91', '#008272']
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

const onSwitchChange = (event: Event, emitKey: string) => {
  const target = event.target as any
  emit(emitKey as any, target.checked)
}

const onSelectChange = (event: Event, emitKey: string) => {
  const target = event.target as any
  emit(emitKey as any, target.value)
}

const onTextInput = (event: Event, emitKey: string) => {
  const target = event.target as any
  emit(emitKey as any, target.value)
}

const onNumberInput = (event: Event, emitKey: string) => {
  const target = event.target as any
  emit(emitKey as any, Number(target.value))
}

const onSliderInput = (event: Event, emitKey: string) => {
  const target = event.target as any
  emit(emitKey as any, Number(target.value))
}
</script>

<template>
  <aside class="settings-sidebar">
    <div class="sidebar-header">
      <div class="header-flex">
        <h3>Tool Settings</h3>
        <button class="icon-btn-flat" @click="$emit('reset')" title="Clear All">
          <Trash2 :size="16" />
        </button>
      </div>
      <p class="header-desc">Configure your PDF process</p>
    </div>

    <div class="sidebar-content">
      <!-- REORDER -->
      <div v-if="activeTool === 'reorder'" class="setting-group">
        <div class="group-label">Reorder Logic</div>
        <fluent-button appearance="primary" @click="$emit('apply-order')" :disabled="duplicateCount > 0" class="full-btn">
          <Check slot="icon" :size="16" />
          Process Order
        </fluent-button>
        <div v-if="duplicateCount > 0" class="error-msg">
          Conflict: {{ duplicateCount }} duplicates!
        </div>
      </div>

      <!-- ROTATE -->
      <div v-if="activeTool === 'rotate'" class="setting-group">
        <div class="group-label">Rotation</div>
        <div class="button-grid">
          <fluent-button appearance="outline" @click="$emit('rotate-all', 'ccw')" class="half-btn">
            <RotateCcw slot="icon" :size="16" />
            Rotate Left
          </fluent-button>
          <fluent-button appearance="outline" @click="$emit('rotate-all', 'cw')" class="half-btn">
            <RotateCw slot="icon" :size="16" />
            Rotate Right
          </fluent-button>
        </div>
      </div>

      <!-- CROP -->
      <div v-if="activeTool === 'crop'" class="setting-group">
        <div class="group-label">Crop Settings</div>
        <div class="info-msg">
          Adjust the crop area on any page card. You can apply the current page's crop to all pages.
        </div>
        <fluent-button appearance="primary" @click="$emit('apply-crop-all')" class="full-btn">
          Apply Current to All
        </fluent-button>
      </div>

      <!-- SPLIT -->
      <div v-if="activeTool === 'split'" class="setting-group">
        <div class="group-label">Split</div>
        <select :value="splitStrategy" @change="onSelectChange($event, 'update:splitStrategy')" class="fluent-select full-width">
          <option value="range">Ranges</option>
          <option value="even-odd">Even/Odd</option>
          <option value="custom">Custom</option>
          <option value="manual">Manual</option>
        </select>

        <div v-if="splitStrategy === 'custom'" class="custom-ranges-box">
          <div v-for="(range, idx) in customRanges" :key="idx" class="range-row">
            <input type="text" :value="String(range.start)" @input="range.start = Number(($event.target as any).value)" class="fluent-input mini-field" />
            <span class="range-sep">to</span>
            <input type="text" :value="String(range.end)" @input="range.end = Number(($event.target as any).value)" class="fluent-input mini-field" />
            <button class="icon-btn-flat icon-btn-flat--danger" @click="customRanges.splice(idx, 1)" :disabled="customRanges.length === 1">
              <X :size="14" />
            </button>
          </div>
          <fluent-button appearance="outline" @click="customRanges.push({ start: 1, end: 1 })" class="full-btn">
            <Plus slot="icon" :size="16" />
            Add Range
          </fluent-button>
        </div>

        <fluent-button appearance="primary" @click="$emit('apply-split')" class="full-btn">Apply</fluent-button>

        <div class="group-list">
          <div v-for="g in groups" :key="g.id" class="group-item">
            <div class="group-dot" :style="{ background: getGroupColor(g.id) }"></div>
            <span>PDF #{{ g.id }} ({{ g.count }} pgs)</span>
          </div>
        </div>
      </div>

      <!-- WATERMARK -->
      <div v-if="activeTool === 'watermark'" class="setting-group">
        <div class="group-label">Watermark</div>
        <div class="toggle-row">
          <span>Enable Watermark</span>
          <fluent-switch :checked="watermarkEnabled" @change="onSwitchChange($event, 'update:watermarkEnabled')" />
        </div>
        <div v-if="watermarkEnabled" class="sub-settings">
          <div class="type-toggle">
            <fluent-button :appearance="watermarkType === 'text' ? 'primary' : 'subtle'" @click="$emit('update:watermarkType', 'text')" class="type-btn">
              Text
            </fluent-button>
            <fluent-button :appearance="watermarkType === 'image' ? 'primary' : 'subtle'" @click="$emit('update:watermarkType', 'image')" class="type-btn">
              Image
            </fluent-button>
          </div>
          <input v-if="watermarkType === 'text'" type="text" :value="watermarkText" @input="onTextInput($event, 'update:watermarkText')" class="fluent-input full-width" />
          <input v-else type="file" @change="handleImageUpload" accept="image/*" class="file-input" />

          <div class="control-item">
            <label class="field-label">Position Grid</label>
            <div class="pos-grid">
              <div v-for="(row, ri) in posGrid" :key="ri" class="pos-row">
                <button v-for="p in row" :key="p" :class="{ active: watermarkPosition === p }" @click="$emit('update:watermarkPosition', p)" class="pos-cell"></button>
              </div>
            </div>
          </div>

          <div class="toggle-row borderless">
            <span>Repeat</span>
            <fluent-switch :checked="watermarkRepeat" @change="onSwitchChange($event, 'update:watermarkRepeat')" />
          </div>

          <div class="options-grid">
            <div class="opt-field">
              <span class="field-label">Opacity</span>
              <fluent-slider min="0" max="1" step="0.1" :value="String(watermarkOpacity)" @input="onSliderInput($event, 'update:watermarkOpacity')" />
            </div>
            <div class="opt-field">
              <span class="field-label">Size</span>
              <input type="text" :value="String(watermarkSize)" @input="onNumberInput($event, 'update:watermarkSize')" class="fluent-input mini-field" />
            </div>
            <div v-if="watermarkType === 'text'" class="opt-field">
              <span class="field-label">Color</span>
              <input type="color" :value="watermarkColor" @input="onTextInput($event, 'update:watermarkColor')" class="color-picker" />
            </div>
          </div>
        </div>
      </div>

      <!-- NUMBERING -->
      <div v-if="activeTool === 'numbering'" class="setting-group">
        <div class="group-label">Numbering</div>
        <div class="toggle-row">
          <span>Enable</span>
          <fluent-switch :checked="numberingEnabled" @change="onSwitchChange($event, 'update:numberingEnabled')" />
        </div>
        <div v-if="numberingEnabled" class="sub-settings">
          <select :value="numberingPosition" @change="onSelectChange($event, 'update:numberingPosition')" class="fluent-select full-width">
            <option value="top-left">Top Left</option>
            <option value="top-center">Top Center</option>
            <option value="top-right">Top Right</option>
            <option value="bottom-left">Bottom Left</option>
            <option value="bottom-center">Bottom Center</option>
            <option value="bottom-right">Bottom Right</option>
          </select>
          <div class="color-row">
            <div class="color-group">
              <span class="field-label">BG</span>
              <input type="color" :value="numberingBgColor" @input="onTextInput($event, 'update:numberingBgColor')" class="color-picker" />
            </div>
            <div class="color-group">
              <span class="field-label">Text</span>
              <input type="color" :value="numberingTextColor" @input="onTextInput($event, 'update:numberingTextColor')" class="color-picker" />
            </div>
          </div>
        </div>
      </div>

      <!-- OCR -->
      <div v-if="activeTool === 'ocr'" class="setting-group">
        <div class="group-label">OCR</div>
        <div class="toggle-row">
          <span>Searchable PDF</span>
          <fluent-switch :checked="ocrEnabled" @change="onSwitchChange($event, 'update:ocrEnabled')" />
        </div>
        <select v-if="ocrEnabled" :value="ocrLanguage" @change="onSelectChange($event, 'update:ocrLanguage')" class="fluent-select full-width">
          <option value="spa">Spanish</option>
          <option value="glg">Galician</option>
          <option value="eng">English</option>
        </select>
      </div>

      <!-- PROTECT -->
      <div v-if="activeTool === 'protect'" class="setting-group">
        <div class="group-label">Password Protection</div>
        <div class="toggle-row">
          <span>Enable Protection</span>
          <fluent-switch :checked="protectEnabled" @change="onSwitchChange($event, 'update:protectEnabled')" />
        </div>
        <div v-if="protectEnabled" class="sub-settings">
          <div class="field-group">
            <span class="field-label">Set Password</span>
            <input type="password" :value="pdfPassword" @input="onTextInput($event, 'update:pdfPassword')" placeholder="Enter password..." class="fluent-input full-width" />
          </div>
          <div class="info-msg">
            The PDF will be encrypted. You will need this password to open it.
          </div>
        </div>
      </div>

      <!-- UNLOCK -->
      <div v-if="activeTool === 'unlock'" class="setting-group">
        <div class="group-label">Unlock / Decrypt</div>
        <div class="sub-settings no-border">
          <div class="field-group">
            <span class="field-label">Known Password</span>
            <div class="inline-row">
              <input type="password" :value="unlockPasswordInput" @input="onTextInput($event, 'update:unlockPasswordInput')" placeholder="Enter password..." class="fluent-input full-width" />
              <fluent-button appearance="primary" @click="$emit('manual-unlock')" class="unlock-btn">Unlock</fluent-button>
            </div>
          </div>

          <fluent-divider></fluent-divider>

          <div class="toggle-row">
            <span>Brute Force</span>
            <fluent-switch :checked="bruteForceEnabled" @change="onSwitchChange($event, 'update:bruteForceEnabled')" />
          </div>

          <div v-if="bruteForceEnabled" class="sub-settings no-border" style="margin-top: 12px;">
            <div class="info-msg">
              Attempt to find the password by trying combinations (0-9, a-z). Browser performance may vary.
            </div>
            <fluent-button appearance="primary" @click="$emit('start-brute-force')" :disabled="isBruteForcing" class="full-btn">
              <Lock slot="icon" :size="16" />
              <span>{{ isBruteForcing ? 'Cracking...' : 'Start Brute Force' }}</span>
            </fluent-button>
            <p v-if="bruteForceStatus" class="status-text">{{ bruteForceStatus }}</p>
          </div>
        </div>
      </div>
    </div>

    <div class="sidebar-footer">
      <div class="summary">
        <span class="summary-label">Workspace</span>
        <span class="summary-count">{{ pages.length }} page{{ pages.length !== 1 ? 's' : '' }}</span>
      </div>
    </div>
  </aside>
</template>

<style scoped>
.settings-sidebar {
  width: 300px;
  background: var(--colorNeutralBackground1);
  border-left: 1px solid var(--colorNeutralStroke1);
  display: flex;
  flex-direction: column;
  height: 100%;
}

.sidebar-header {
  padding: var(--spacingHorizontalL);
  border-bottom: 1px solid var(--colorNeutralStroke1);
}

.header-flex {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.icon-btn-flat {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  padding: 0;
  background: transparent;
  border: none;
  border-radius: var(--borderRadiusMedium);
  cursor: pointer;
  color: var(--colorNeutralForeground2);
  transition: background 0.1s, color 0.1s;
}

.icon-btn-flat:hover {
  background: var(--colorNeutralBackground1Hover);
  color: var(--colorStatusDangerForeground1);
}

.icon-btn-flat--danger {
  color: var(--colorPaletteRedForeground1);
}

.icon-btn-flat--danger:hover {
  background: var(--colorPaletteRedBackground1);
}

.icon-btn-flat:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* Fluent-style native inputs & selects */
.fluent-input,
.fluent-select {
  height: 32px;
  padding: 0 10px;
  border: 1px solid var(--colorNeutralStroke1);
  border-radius: var(--borderRadiusMedium);
  background: var(--colorNeutralBackground1);
  color: var(--colorNeutralForeground1);
  font-family: inherit;
  font-size: var(--fontSizeBase300);
  outline: none;
  transition: border-color 0.1s, box-shadow 0.1s;
  box-sizing: border-box;
}

.fluent-select {
  padding-right: 32px;
  appearance: none;
  background-image: url("data:image/svg+xml;utf8,<svg fill='%23666666' height='16' viewBox='0 0 24 24' width='16' xmlns='http://www.w3.org/2000/svg'><path d='M7 10l5 5 5-5z'/><path d='M0 0h24v24H0z' fill='none'/></svg>");
  background-repeat: no-repeat;
  background-position: right 8px center;
  cursor: pointer;
}

.fluent-input:focus,
.fluent-select:focus {
  border-color: var(--colorBrandStroke1);
  box-shadow: 0 0 0 1px var(--colorBrandStroke1);
}

.fluent-input::placeholder {
  color: var(--colorNeutralForeground4);
}

.sidebar-header h3 {
  font-size: var(--fontSizeBase400);
  font-weight: var(--fontWeightSemibold);
}

.header-desc {
  font-size: var(--fontSizeBase200);
  color: var(--colorNeutralForeground2);
  margin-top: var(--spacingVerticalXXS);
}

.sidebar-content {
  flex: 1;
  overflow-y: auto;
  padding: var(--spacingHorizontalL);
  display: flex;
  flex-direction: column;
  gap: var(--spacingVerticalL);
}

.setting-group {
  display: flex;
  flex-direction: column;
  gap: var(--spacingVerticalS);
}

.button-grid {
  display: flex;
  gap: var(--spacingHorizontalXS);
}

.group-label {
  font-size: var(--fontSizeBase100);
  font-weight: var(--fontWeightBold);
  color: var(--colorNeutralForeground2);
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.full-btn {
  --button-height: 36px;
  width: 100%;
  justify-content: center;
}

.half-btn {
  flex: 1;
  --button-height: 36px;
  justify-content: center;
  font-size: var(--fontSizeBase200);
}

.full-width {
  width: 100%;
}

.mini-field {
  width: 70px;
}

.error-msg {
  padding: var(--spacingVerticalS) var(--spacingHorizontalM);
  background: var(--colorPaletteRedBackground1);
  border: 1px solid var(--colorPaletteRedBorder1);
  border-radius: var(--borderRadiusMedium);
  font-size: var(--fontSizeBase200);
  font-weight: var(--fontWeightMedium);
  color: var(--colorPaletteRedForeground1);
}

.info-msg {
  padding: var(--spacingVerticalS) var(--spacingHorizontalM);
  background: var(--colorNeutralBackground3);
  font-size: var(--fontSizeBase200);
  color: var(--colorNeutralForeground2);
  line-height: 1.5;
  border-radius: var(--borderRadiusMedium);
}

.custom-ranges-box {
  display: flex;
  flex-direction: column;
  gap: var(--spacingHorizontalXS);
}

.range-row {
  display: flex;
  align-items: center;
  gap: var(--spacingHorizontalXS);
  font-size: var(--fontSizeBase200);
  color: var(--colorNeutralForeground2);
  font-weight: var(--fontWeightMedium);
}

.range-sep {
  color: var(--colorNeutralForeground2);
  font-size: var(--fontSizeBase200);
}

.group-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacingHorizontalXS);
}

.group-item {
  display: flex;
  align-items: center;
  gap: var(--spacingHorizontalS);
  padding: var(--spacingVerticalS) var(--spacingHorizontalM);
  background: var(--colorNeutralBackgroundCard);
  border: 1px solid var(--colorNeutralStroke1);
  border-radius: var(--borderRadiusMedium);
  font-size: var(--fontSizeBase200);
  font-weight: var(--fontWeightMedium);
}

.group-dot {
  width: 10px;
  height: 10px;
  border-radius: var(--borderRadiusSmall);
  flex-shrink: 0;
}

.toggle-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--colorNeutralBackground3);
  padding: var(--spacingVerticalS) var(--spacingHorizontalM);
  border-radius: var(--borderRadiusMedium);
  border: 1px solid var(--colorNeutralStroke1);
  font-size: var(--fontSizeBase300);
  font-weight: var(--fontWeightSemibold);
}

.toggle-row.borderless {
  background: transparent;
  border: none;
  padding: 0;
}

.sub-settings {
  display: flex;
  flex-direction: column;
  gap: var(--spacingVerticalS);
  padding-left: var(--spacingHorizontalM);
  border-left: 2px solid var(--colorNeutralStroke1);
}

.sub-settings.no-border {
  border-left: none;
  padding-left: 0;
}

.type-toggle {
  display: flex;
  background: var(--colorNeutralBackground3);
  padding: var(--spacingVerticalXXS);
  border-radius: var(--borderRadiusMedium);
  gap: 2px;
}

.type-btn {
  flex: 1;
  --button-height: 30px;
  justify-content: center;
  font-size: var(--fontSizeBase200);
  border-radius: var(--borderRadiusSmall) !important;
}

.field-label {
  font-size: var(--fontSizeBase100);
  font-weight: var(--fontWeightBold);
  color: var(--colorNeutralForeground2);
}

.field-group {
  display: flex;
  flex-direction: column;
  gap: var(--spacingHorizontalXS);
}

.control-item {
  display: flex;
  flex-direction: column;
  gap: var(--spacingHorizontalXS);
}

.pos-grid {
  display: flex;
  flex-direction: column;
  gap: var(--spacingHorizontalXXS);
  background: var(--colorNeutralBackground3);
  padding: var(--spacingHorizontalS);
  border-radius: var(--borderRadiusMedium);
  align-self: flex-start;
}

.pos-row {
  display: flex;
  gap: var(--spacingHorizontalXXS);
}

.pos-cell {
  width: 24px;
  height: 24px;
  border: 1px solid var(--colorNeutralStroke1);
  background: var(--colorNeutralBackground1);
  border-radius: var(--borderRadiusSmall);
  cursor: pointer;
  transition: background 0.15s;
}

.pos-cell:hover {
  background: var(--colorNeutralBackground3);
}

.pos-cell.active {
  background: var(--colorBrandBackground);
  border-color: var(--colorBrandBackground);
}

.options-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacingVerticalS);
}

.opt-field {
  display: flex;
  flex-direction: column;
  gap: var(--spacingHorizontalXXS);
}

.color-row {
  display: flex;
  gap: var(--spacingHorizontalM);
}

.color-group {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--spacingHorizontalXXS);
}

.color-picker {
  width: 100%;
  height: 32px;
  border: 1px solid var(--colorNeutralStroke1);
  border-radius: var(--borderRadiusSmall);
  padding: 2px;
  cursor: pointer;
  background: var(--colorNeutralBackground1);
}

.file-input {
  font-size: var(--fontSizeBase200);
}

.inline-row {
  display: flex;
  gap: var(--spacingHorizontalS);
  align-items: flex-start;
}

.unlock-btn {
  --button-height: 36px;
  flex-shrink: 0;
}

.status-text {
  font-size: var(--fontSizeBase200);
  font-weight: var(--fontWeightSemibold);
  color: var(--colorBrandForeground1);
  margin: 0;
  text-align: center;
}

.sidebar-footer {
  padding: var(--spacingHorizontalL);
  border-top: 1px solid var(--colorNeutralStroke1);
}

.summary {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.summary-label {
  font-size: var(--fontSizeBase200);
  color: var(--colorNeutralForeground2);
}

.summary-count {
  font-size: var(--fontSizeBase200);
  font-weight: var(--fontWeightSemibold);
  color: var(--colorNeutralForeground1);
}

@media (max-width: 1024px) {
  .settings-sidebar {
    width: 100%;
    height: auto;
    border-left: none;
    border-top: 1px solid var(--colorNeutralStroke1);
  }
}
</style>
