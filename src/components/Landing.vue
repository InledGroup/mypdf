<script setup lang="ts">
import { 
  LayoutGrid, RotateCcw, FileStack, CheckCircle, Type, 
  Scissors, Hash, Stamp, Crop, ShieldCheck, WifiOff, 
  Zap, Lock, ServerOff, Check, X, MousePointerClick
} from 'lucide-vue-next'

defineEmits(['select-tool'])
</script>

<template>
  <div class="landing">
    <!-- Hero Section -->
    <section class="hero">
      <div class="badge-privacy">
        <ShieldCheck :size="16" />
        <span>100% Privacy Guaranteed</span>
      </div>
      <h1>Your PDF Never Leaves Your Device</h1>
      <p class="hero-subtitle">
        Unlike other tools, MyPDF processes everything <strong>locally in your browser</strong>. 
        Your documents are never uploaded to any server.
      </p>
      
      <div class="offline-challenge">
        <div class="offline-icon">
          <WifiOff :size="24" />
        </div>
        <div class="offline-text">
          <strong>The Ultimate Privacy Test:</strong>
          <span>Turn off your Wi-Fi right now. The tool will keep working perfectly.</span>
        </div>
      </div>
    </section>

    <!-- Comparison Table -->
    <section class="comparison-section">
      <h2>Why Choose MyPDF?</h2>
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>Feature</th>
              <th class="col-highlight">MyPDF (Local)</th>
              <th>iLovePDF / Others</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>File Privacy</td>
              <td><div class="cell-content"><Check class="icon-check" /> 100% Private (On your PC)</div></td>
              <td><div class="cell-content"><X class="icon-x" /> Uploaded to the cloud</div></td>
            </tr>
            <tr>
              <td>Offline Mode</td>
              <td><div class="cell-content"><Check class="icon-check" /> Works without Internet</div></td>
              <td><div class="cell-content"><X class="icon-x" /> Connection required</div></td>
            </tr>
            <tr>
              <td>File Limits</td>
              <td><div class="cell-content"><Check class="icon-check" /> No limits (Unlimited)</div></td>
              <td><div class="cell-content"><X class="icon-x" /> Limited per task/day</div></td>
            </tr>
            <tr>
              <td>Speed</td>
              <td><div class="cell-content"><Check class="icon-check" /> Instant (No uploads)</div></td>
              <td><div class="cell-content"><Zap :size="16" /> Depends on bandwidth</div></td>
            </tr>
            <tr>
              <td>Workflow</td>
              <td><div class="cell-content"><Check class="icon-check" /> Unified Workspace</div></td>
              <td><div class="cell-content"><X class="icon-x" /> Disconnected tools</div></td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- Unified Workspace Explanation -->
    <section class="workspace-promo">
      <div class="promo-content">
        <div class="promo-text">
          <h2>Fluid Editing, No More Tab Hopping</h2>
          <p>
            Traditional sites force you to 'Rotate', download, then go to 'Merge', upload again... 
            <strong>It's a waste of time.</strong>
          </p>
          <div class="promo-features">
            <div class="p-feature">
              <div class="p-icon"><MousePointerClick :size="20" /></div>
              <span>Drag, rotate, and reorder everything in a single canvas.</span>
            </div>
            <div class="p-feature">
              <div class="p-icon"><Zap :size="20" /></div>
              <span>Apply multiple changes and export just once.</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Tools Grid -->
    <section class="tools-section">
      <div class="section-header">
        <h2>Professional Tools</h2>
        <p>Select a tool to start or simply drag a PDF into the workspace.</p>
      </div>
      
      <div class="tools-grid">
        <div class="tool-card active" @click="$emit('select-tool', 'reorder')">
          <div class="tool-icon"><LayoutGrid :size="24" /></div>
          <h3>Reorder</h3>
          <p>Visually change the order of pages.</p>
        </div>

        <div class="tool-card active" @click="$emit('select-tool', 'rotate')">
          <div class="tool-icon"><RotateCcw :size="24" /></div>
          <h3>Rotate</h3>
          <p>Fix orientation for individual pages.</p>
        </div>

        <div class="tool-card active" @click="$emit('select-tool', 'crop')">
          <div class="tool-icon"><Crop :size="24" /></div>
          <h3>Crop</h3>
          <p>Adjust margins or remove white borders.</p>
        </div>

        <div class="tool-card active" @click="$emit('select-tool', 'merge')">
          <div class="tool-icon"><FileStack :size="24" /></div>
          <h3>Merge / Combine</h3>
          <p>Combine multiple documents into one.</p>
        </div>

        <div class="tool-card active" @click="$emit('select-tool', 'split')">
          <div class="tool-icon"><Scissors :size="24" /></div>
          <h3>Split</h3>
          <p>Extract pages or split large files.</p>
        </div>

        <div class="tool-card active" @click="$emit('select-tool', 'numbering')">
          <div class="tool-icon"><Hash :size="24" /></div>
          <h3>Page Numbers</h3>
          <p>Add custom page numbering.</p>
        </div>

        <div class="tool-card active" @click="$emit('select-tool', 'watermark')">
          <div class="tool-icon"><Stamp :size="24" /></div>
          <h3>Watermark</h3>
          <p>Protect PDFs with text or logos.</p>
        </div>

        <div class="tool-card active" @click="$emit('select-tool', 'ocr')">
          <div class="tool-icon"><Type :size="24" /></div>
          <h3>OCR Text</h3>
          <p>Convert scans into searchable text.</p>
        </div>
      </div>
    </section>

    <footer class="landing-footer">
      <div class="trust-icons">
        <div class="trust-item"><Lock :size="16" /> Local Processing</div>
        <div class="trust-item"><ServerOff :size="16" /> No Servers Involved</div>
        <div class="trust-item"><CheckCircle :size="16" /> Open Source</div>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.landing {
  padding: 2rem 0 4rem 0;
  display: flex;
  flex-direction: column;
  gap: 6rem;
}

/* Hero Section */
.hero {
  text-align: center;
  max-width: 800px;
  margin: 0 auto;
}

.badge-privacy {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: #dcfce7;
  color: #166534;
  padding: 0.5rem 1rem;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
}

.hero h1 {
  font-size: 4rem;
  font-weight: 900;
  line-height: 1.1;
  color: #0f172a;
  margin-bottom: 1.5rem;
  letter-spacing: -0.04em;
}

.hero-subtitle {
  font-size: 1.5rem;
  color: #475569;
  line-height: 1.5;
  margin-bottom: 2.5rem;
}

.offline-challenge {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  background: #1e293b;
  color: white;
  padding: 1.5rem 2rem;
  border-radius: 1.25rem;
  text-align: left;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

.offline-icon {
  background: rgba(255, 255, 255, 0.1);
  padding: 1rem;
  border-radius: 1rem;
  color: #60a5fa;
}

.offline-text {
  display: flex;
  flex-direction: column;
}

.offline-text strong {
  font-size: 1.125rem;
  margin-bottom: 0.25rem;
}

.offline-text span {
  color: #94a3b8;
  font-size: 0.95rem;
}

/* Comparison Table */
.comparison-section h2 {
  text-align: center;
  font-size: 2.25rem;
  font-weight: 800;
  margin-bottom: 3rem;
}

.table-container {
  background: white;
  border-radius: 1.5rem;
  border: 1px solid #e2e8f0;
  overflow: hidden;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}

table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  padding: 1.5rem;
  text-align: left;
  border-bottom: 1px solid #f1f5f9;
}

th {
  background: #f8fafc;
  font-weight: 700;
  color: #475569;
}

.col-highlight {
  background: #eff6ff;
  color: var(--primary);
}

.cell-content {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-weight: 500;
}

.icon-check {
  color: #10b981;
}

.icon-x {
  color: #ef4444;
}

/* Workspace Promo */
.workspace-promo {
  background: #f1f5f9;
  border-radius: 2rem;
  padding: 4rem;
  text-align: center;
}

.promo-content {
  max-width: 700px;
  margin: 0 auto;
}

.promo-text h2 {
  font-size: 2.5rem;
  font-weight: 800;
  margin-bottom: 1.5rem;
}

.promo-text p {
  font-size: 1.25rem;
  color: #475569;
  margin-bottom: 3rem;
  line-height: 1.6;
}

.promo-features {
  display: flex;
  justify-content: center;
  gap: 3rem;
}

.p-feature {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  font-weight: 600;
  color: #1e293b;
  flex: 1;
}

.p-icon {
  background: white;
  padding: 1rem;
  border-radius: 1rem;
  color: var(--primary);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}

/* Tools Grid */
.tools-section {
  display: flex;
  flex-direction: column;
  gap: 3rem;
}

.section-header {
  text-align: center;
}

.section-header h2 {
  font-size: 2.25rem;
  font-weight: 800;
  margin-bottom: 0.5rem;
}

.section-header p {
  color: var(--text-muted);
}

.tools-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 1.5rem;
}

.tool-card {
  background: white;
  padding: 1.5rem;
  border-radius: 1.25rem;
  border: 1px solid #e2e8f0;
  transition: all 0.2s ease;
  cursor: pointer;
}

.tool-card:hover {
  border-color: var(--primary);
  transform: translateY(-4px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}

.tool-icon {
  background: #eff6ff;
  color: var(--primary);
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.75rem;
  margin-bottom: 1.25rem;
}

.tool-card h3 {
  font-size: 1.125rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.tool-card p {
  font-size: 0.875rem;
  color: #64748b;
  line-height: 1.5;
}

/* Footer */
.landing-footer {
  border-top: 1px solid #e2e8f0;
  padding-top: 2rem;
  display: flex;
  justify-content: center;
}

.trust-icons {
  display: flex;
  gap: 2rem;
  color: #94a3b8;
  font-size: 0.875rem;
  font-weight: 600;
}

.trust-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

@media (max-width: 768px) {
  .hero h1 { font-size: 2.5rem; }
  .workspace-promo { padding: 2rem; }
  .promo-features { flex-direction: column; gap: 2rem; }
  .trust-icons { flex-direction: column; gap: 1rem; align-items: center; }
}
</style>
