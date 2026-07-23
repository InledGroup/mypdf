<script setup lang="ts">
import { ref, computed } from 'vue'
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
  ChevronRight,
  Shield,
  FileCode2,
  X
} from 'lucide-vue-next'

// Reference template-only icon component to satisfy TS6133
Shield;

defineEmits(['select-tool'])

const tools = [
  { id: 'reorder', title: 'Reorder', desc: 'Visually rearrange the order of pages.', icon: ArrowUpDown },
  { id: 'rotate', title: 'Rotate', desc: 'Fix page orientation.', icon: RotateCw },
  { id: 'crop', title: 'Crop', desc: 'Adjust margins and remove white borders.', icon: Crop },
  { id: 'merge', title: 'Merge', desc: 'Combine multiple PDFs into a single file.', icon: Combine },
  { id: 'split', title: 'Split', desc: 'Extract pages or divide documents.', icon: Scissors },
  { id: 'numbering', title: 'Page Numbers', desc: 'Add page numbers with style control.', icon: Binary },
  { id: 'watermark', title: 'Watermark', desc: 'Add text or image watermarks.', icon: Stamp },
  { id: 'ocr', title: 'OCR Text', desc: 'Convert images into selectable text.', icon: ScanText },
  { id: 'protect', title: 'Protect PDF', desc: 'Encrypt document with password.', icon: Lock },
  { id: 'unlock', title: 'Unlock PDF', desc: 'Remove password protection.', icon: Unlock },
]

const activeModal = ref<'privacy' | 'terms' | 'cookies' | null>(null)

const modalTitle = computed(() => {
  if (activeModal.value === 'privacy') return 'Privacy Policy'
  if (activeModal.value === 'terms') return 'Terms of Use'
  if (activeModal.value === 'cookies') return 'Cookie Policy'
  return ''
})
</script>

<template>
  <div class="landing-page">

    <!-- ── Hero ── -->
    <section class="hero-section">
      <div class="logo-container">
        <img src="https://hosted.inled.es/MYPDF.png" alt="MyPDF Logo" class="landing-logo" />
      </div>

      <h1 class="hero-title">PDF tools that don't upload anything, they are private</h1>
      <p class="hero-subtitle">
        In today's world, most PDF tools do business through AD's but also through your PDF's. We cannot know what they do with the PDF once they upload it to their servers. MyPDF is different: everything runs in your browser, with technology that doesn't upload anything to any servers. Try loading a tool and turning off the Wifi, it should work.
      </p>
    </section>

    <!-- ── Tools Grid ── -->
    <section class="tools-section">
      <div class="tools-grid">
        <button
          v-for="tool in tools"
          :key="tool.id"
          class="tool-card"
          @click="$emit('select-tool', tool.id)"
        >
          <div class="tool-icon">
            <component :is="tool.icon" :size="18" />
          </div>
          <div class="tool-text">
            <span class="tool-title">{{ tool.title }}</span>
            <span class="tool-desc">{{ tool.desc }}</span>
          </div>
          <ChevronRight class="tool-chevron" :size="16" />
        </button>
      </div>
    </section>

    <!-- ── Contribution Callout ── -->
    <section class="contribute-section">
      <div class="contribute-card">
        <div class="contribute-icon">
          <FileCode2 :size="20" />
        </div>
        <div class="contribute-content">
          <h3>Help Us Improve MyPDF</h3>
          <p>MyPDF is an open-source project. You can report bugs, request features, or contribute code directly on GitHub.</p>
        </div>
        <a href="https://github.com/InledGroup/mypdf" target="_blank" class="contribute-btn">
          <span>Contribute on GitHub</span>
          <ChevronRight :size="16" />
        </a>
      </div>
    </section>

    <!-- ── Footer ── -->
    <footer class="landing-footer">
      <fluent-divider></fluent-divider>
      <div class="footer-items">
        <button class="footer-link" @click="activeModal = 'privacy'">Privacy Policy</button>
        <button class="footer-link" @click="activeModal = 'terms'">Terms of Use</button>
        <button class="footer-link" @click="activeModal = 'cookies'">Cookie Policy</button>
        <a href="https://github.com/InledGroup/mypdf" target="_blank" class="footer-link">GitHub Project</a>
      </div>
      <div class="footer-bottom">
        <span class="footer-copy">Made by Inled Group · inled.es</span>
      </div>
    </footer>

    <!-- ── Modal Overlay ── -->
    <div v-if="activeModal" class="modal-overlay" @click="activeModal = null">
      <div class="modal-card" @click.stop>
        <div class="modal-header">
          <h3>{{ modalTitle }}</h3>
          <button class="modal-close" @click="activeModal = null">
            <X :size="16" />
          </button>
        </div>
        <div class="modal-body">
          <!-- Privacy Policy Content -->
          <div v-if="activeModal === 'privacy'" class="policy-text">
            <p>All the PDFs you open in PDF are saved in your computer's memory, within the browser, so you can manipulate them. They are not uploaded to any server.</p>
            
          </div>
          
          <!-- Terms Content -->
          <div v-else-if="activeModal === 'terms'" class="policy-text">
            <p>When you use MyPDF you release us from any responsibility for any problems with any document you process. You understand that you are solely responsible for complying with law and order in the country in which you are located.</p>
          </div>
          
          <!-- Cookies Content -->
          <div v-else-if="activeModal === 'cookies'" class="policy-text">
            <p>We don't use cookies to track or analytics or any other anti-privacy thing.</p>
          </div>
        </div>
        <div class="modal-footer">
          <fluent-button appearance="primary" @click="activeModal = null">Close</fluent-button>
        </div>
      </div>
    </div>

  </div>
</template>

<style scoped>
.landing-page {
  overflow-y: auto;
  height: 100%;
  padding: 60px 40px;
  max-width: 900px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 40px;
}

/* ── Hero ── */
.hero-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 16px;
  max-width: 680px;
  margin: 0 auto;
}

.logo-container {
  margin-bottom: 8px;
}

.landing-logo {
  height: 48px;
  width: auto;
}

.hero-title {
  font-size: clamp(26px, 3.5vw, 38px);
  font-weight: var(--fontWeightBold);
  line-height: 1.2;
  letter-spacing: -0.02em;
  color: var(--colorNeutralForeground1);
}

.hero-subtitle {
  font-size: var(--fontSizeBase400);
  color: var(--colorNeutralForeground2);
  line-height: 1.5;
}

.notice-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: var(--colorNeutralBackground3);
  border: 1px solid var(--colorNeutralStroke1);
  color: var(--colorNeutralForeground2);
  font-size: var(--fontSizeBase200);
  font-weight: var(--fontWeightSemibold);
  padding: 4px 10px;
  border-radius: var(--borderRadiusSmall);
}

/* ── Tools Grid ── */
.tools-section {
  width: 100%;
}

.tools-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 12px;
}

.tool-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  background: var(--colorNeutralBackground1);
  border: 1px solid var(--colorNeutralStroke1);
  border-radius: var(--borderRadiusMedium);
  cursor: pointer;
  text-align: left;
  transition: border-color 0.1s, background 0.1s;
  font-family: inherit;
  color: var(--colorNeutralForeground1);
}

.tool-card:hover {
  background: var(--colorNeutralBackground3);
  border-color: var(--colorNeutralStroke1Hover);
}

.tool-card:hover .tool-chevron {
  opacity: 1;
}

.tool-icon {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--colorBrandBackground2);
  color: var(--colorBrandForeground1);
  border-radius: var(--borderRadiusSmall);
}

.tool-text {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1px;
  min-width: 0;
}

.tool-title {
  font-size: var(--fontSizeBase300);
  font-weight: var(--fontWeightSemibold);
  white-space: nowrap;
}

.tool-desc {
  font-size: var(--fontSizeBase200);
  color: var(--colorNeutralForeground2);
  line-height: 1.3;
}

.tool-chevron {
  flex-shrink: 0;
  color: var(--colorNeutralForeground3);
  opacity: 0.3;
  transition: opacity 0.1s;
}

/* ── Contribute ── */
.contribute-section {
  width: 100%;
}

.contribute-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: var(--colorNeutralBackground3);
  border: 1px solid var(--colorNeutralStroke1);
  border-radius: var(--borderRadiusMedium);
}

.contribute-icon {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--colorNeutralBackground1);
  border: 1px solid var(--colorNeutralStroke1);
  border-radius: var(--borderRadiusSmall);
  color: var(--colorBrandForeground1);
}

.contribute-content {
  flex: 1;
}

.contribute-content h3 {
  font-size: var(--fontSizeBase400);
  font-weight: var(--fontWeightSemibold);
  margin-bottom: 4px;
}

.contribute-content p {
  font-size: var(--fontSizeBase200);
  color: var(--colorNeutralForeground2);
  line-height: 1.4;
}

.contribute-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background: var(--colorBrandBackground);
  color: var(--colorNeutralForegroundOnBrand);
  border-radius: var(--borderRadiusMedium);
  font-size: var(--fontSizeBase200);
  font-weight: var(--fontWeightSemibold);
  text-decoration: none;
  transition: background 0.1s;
}

.contribute-btn:hover {
  background: var(--colorBrandBackgroundHover);
}

/* ── Footer ── */
.landing-footer {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: auto;
}

.footer-items {
  display: flex;
  align-items: center;
  gap: 24px;
  justify-content: center;
  flex-wrap: wrap;
}

.footer-link {
  background: transparent;
  border: none;
  padding: 0;
  cursor: pointer;
  font-family: inherit;
  font-size: var(--fontSizeBase200);
  color: var(--colorNeutralForeground3);
  text-decoration: none;
  transition: color 0.1s;
}

.footer-link:hover {
  color: var(--colorBrandForeground1);
}

.footer-bottom {
  text-align: center;
}

.footer-copy {
  font-size: var(--fontSizeBase200);
  color: var(--colorNeutralForeground4);
}

/* ── Modal Overlay ── */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: var(--colorBackgroundOverlay);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(2px);
}

.modal-card {
  width: 100%;
  max-width: 500px;
  background: var(--colorNeutralBackground1);
  border: 1px solid var(--colorNeutralStroke1);
  border-radius: var(--borderRadiusMedium);
  box-shadow: var(--shadow28);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  margin: 20px;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid var(--colorNeutralStroke1);
}

.modal-header h3 {
  font-size: var(--fontSizeBase500);
  font-weight: var(--fontWeightSemibold);
}

.modal-close {
  background: transparent;
  border: none;
  padding: 4px;
  border-radius: var(--borderRadiusSmall);
  cursor: pointer;
  color: var(--colorNeutralForeground2);
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-close:hover {
  background: var(--colorNeutralBackground3);
  color: var(--colorNeutralForeground1);
}

.modal-body {
  padding: 20px;
  overflow-y: auto;
  max-height: 60vh;
}

.policy-text {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.policy-text h4 {
  font-size: var(--fontSizeBase300);
  font-weight: var(--fontWeightSemibold);
  margin-top: 8px;
}

.policy-text h4:first-of-type {
  margin-top: 0;
}

.policy-text p {
  font-size: var(--fontSizeBase200);
  color: var(--colorNeutralForeground2);
  line-height: 1.5;
}

.modal-footer {
  padding: 12px 20px;
  border-top: 1px solid var(--colorNeutralStroke1);
  display: flex;
  justify-content: flex-end;
}

@media (max-width: 768px) {
  .landing-page {
    padding: 30px 20px;
    gap: 30px;
  }

  .tools-grid {
    grid-template-columns: 1fr;
  }

  .contribute-card {
    flex-direction: column;
    text-align: center;
  }

  .contribute-btn {
    width: 100%;
    justify-content: center;
  }
}
</style>
