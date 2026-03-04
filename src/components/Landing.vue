<script setup lang="ts">
import { LayoutGrid, RotateCcw, FileStack, Download, CheckCircle, Type, Scissors } from 'lucide-vue-next'

defineEmits(['select-tool'])
</script>

<template>
  <div class="landing">
    <div class="hero">
      <h1>All-in-one PDF Workspace</h1>
      <p>Professional tools that run 100% in your browser. Your files stay private.</p>
    </div>

    <div class="tools-grid">
      <div class="tool-card active" @click="$emit('select-tool', 'reorder')">
        <div class="tool-icon">
          <LayoutGrid :size="32" />
        </div>
        <h3>Reorder PDF</h3>
        <p>Rearrange pages visually with custom numbering or simple move operations.</p>
        <span class="tool-badge">Popular</span>
      </div>

      <div class="tool-card active" @click="$emit('select-tool', 'rotate')">
        <div class="tool-icon">
          <RotateCcw :size="32" />
        </div>
        <h3>Rotate PDF</h3>
        <p>Fix orientation issues by rotating individual pages or the entire document.</p>
        <span class="tool-badge">New</span>
      </div>

      <div class="tool-card active" @click="$emit('select-tool', 'merge')">
        <div class="tool-icon">
          <FileStack :size="32" />
        </div>
        <h3>Merge PDF</h3>
        <p>Combine multiple PDF files into one single organized document.</p>
        <span class="tool-badge">Available</span>
      </div>

      <div class="tool-card active" @click="$emit('select-tool', 'split')">
        <div class="tool-icon">
          <Scissors :size="32" />
        </div>
        <h3>Split PDF</h3>
        <p>Divide documents by ranges, even/odd pages, or manually into separate files.</p>
        <span class="tool-badge">Essential</span>
      </div>

      <div class="tool-card active" @click="$emit('select-tool', 'ocr')">
        <div class="tool-icon">
          <Type :size="32" />
        </div>
        <h3>OCR & Searchable</h3>
        <p>Convert scanned PDFs or images into searchable documents with text selection.</p>
        <span class="tool-badge">Pro</span>
      </div>
    </div>

    <div class="features-row">
      <div class="feature">
        <CheckCircle :size="20" class="text-primary" />
        <span>100% Client-Side</span>
      </div>
      <div class="feature">
        <CheckCircle :size="20" class="text-primary" />
        <span>No File Limits</span>
      </div>
      <div class="feature">
        <CheckCircle :size="20" class="text-primary" />
        <span>High Definition Rendering</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.landing {
  padding: 1rem 0;
}

.hero {
  text-align: center;
  margin-bottom: 4rem;
}

.hero h1 {
  font-size: 3.5rem;
  font-weight: 800;
  margin-bottom: 1rem;
  color: #111827;
  letter-spacing: -0.025em;
}

.hero p {
  font-size: 1.25rem;
  color: var(--text-muted);
  max-width: 600px;
  margin: 0 auto;
}

.tools-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 2rem;
  margin-bottom: 4rem;
}

.tool-card {
  background: white;
  padding: 2.5rem;
  border-radius: 1.5rem;
  border: 1px solid #e2e8f0;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  position: relative;
  cursor: pointer;
}

.tool-card:hover {
  transform: translateY(-8px);
  border-color: var(--primary);
  box-shadow: 0 20px 25px -5px rgba(59, 130, 246, 0.1), 0 10px 10px -5px rgba(59, 130, 246, 0.04);
}

.tool-icon {
  background: #eff6ff;
  color: var(--primary);
  padding: 1.25rem;
  border-radius: 1rem;
  margin-bottom: 1.5rem;
}

.tool-card h3 {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 0.75rem;
  color: #111827;
}

.tool-card p {
  color: var(--text-muted);
  line-height: 1.6;
  margin-bottom: 2rem;
}

.tool-badge {
  position: absolute;
  top: 1.5rem;
  right: 1.5rem;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 0.35rem 0.85rem;
  border-radius: 9999px;
  background: #dcfce7;
  color: #166534;
  text-transform: uppercase;
}

.features-row {
  display: flex;
  justify-content: center;
  gap: 3rem;
  margin-top: 2rem;
}

.feature {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: var(--text-main);
  font-weight: 500;
}

.text-primary {
  color: var(--primary);
}
</style>
