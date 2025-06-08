<style scoped>
.editor-wrapper {
  max-width: 1600px;
  margin: 0 auto;
  padding: 20px;
}

.content-section {
  margin-bottom: 35px;
  background-color: white;
  padding: 0 10px;
  width: 100%;
}

.input-section {
  padding: 25px;
  margin-top: 20px;
  border-top: 1px solid #e0e0e0;
  background-color: #f8f8f8;
  border-radius: 5px;
}

.chapter-title {
  font-size: 28px;
  margin-bottom: 25px;
  border-bottom: 1px solid #e0e0e0;
  padding-bottom: 10px;
  transition: border-color 0.2s;
}

.chapter-title:hover {
  border-color: #ccc;
}

.chapter-title:focus {
  outline: none;
  border-color: #0066cc;
  background-color: #f8f8f8;
  padding: 10px;
  margin: -10px;
  margin-bottom: 15px;
  border-radius: 4px;
}

.editable-element {
  flex-grow: 1;
  padding: 8px 0;
  border: 1px solid transparent;
  transition: border-color 0.2s;
  margin-bottom: 5px;
  overflow-wrap: break-word;
  word-wrap: break-word;
  white-space: pre-wrap;
  width: 95%;
}

.editable-element:hover {
  border-color: #e0e0e0;
}

.editable-element:focus {
  outline: none;
  border-color: #0066cc;
  padding: 8px;
  background-color: #f8f8f8;
  border-radius: 4px;
}

.list-input {
  margin-bottom: 15px;
}

.list-type-selector {
  display: flex;
  gap: 20px;
  margin-bottom: 10px;
}

.list-type-selector label {
  display: flex;
  align-items: center;
  gap: 5px;
  cursor: pointer;
}

.list-textarea {
  min-height: 100px;
  font-family: inherit;
  resize: vertical;
}

.font-bold {
  font-weight: bold;
}

.italic {
  font-style: italic;
}

.underline {
  text-decoration: underline;
}

.text-xs {
  font-size: 0.75rem;
}

.text-sm {
  font-size: 1rem;
}

.text-base {
  font-size: 1.125rem;
}

.text-lg {
  font-size: 1.25rem;
}

.text-xl {
  font-size: 1.5rem;
}

.text-2xl {
  font-size: 2rem;
}

.text-red {
  color: #dc3545;
}

.text-blue {
  color: #0066cc;
}

.text-green {
  color: #28a745;
}

.text-orange {
  color: #fd7e14;
}

.text-purple {
  color: #6f42c1;
}

.text-teal {
  color: #20c997;
}

.text-center {
  text-align: center;
}

.text-right {
  text-align: right;
}
.image-sm {
  max-width: 25%;
}

.image-md {
  max-width: 50%;
}

.image-lg {
  max-width: 75%;
}

.image-full {
  width: 100%;
}

.editable-element.text-center ul,
.editable-element.text-center ol,
.editable-element.text-right ul,
.editable-element.text-right ol {
  list-style: none !important;
  padding-left: 0 !important;
  margin-left: 0 !important;
  text-align: inherit !important;
}

.editable-element.text-center ul li,
.editable-element.text-right ul li,
.editable-element.text-center ol li,
.editable-element.text-right ol li {
  position: relative;
  display: flex !important;
  align-items: baseline;
}

.editable-element.text-center ul li,
.editable-element.text-center ol li {
  justify-content: center !important;
}

.editable-element.text-right ul li,
.editable-element.text-right ol li {
  justify-content: flex-end !important;
}

.editable-element.text-center ul li::before,
.editable-element.text-right ul li::before {
  content: "•";
  display: inline-block;
  margin-right: 0.5em;
}

.editable-element.text-center ol,
.editable-element.text-right ol {
  counter-reset: item;
}

.editable-element.text-center ol li::before,
.editable-element.text-right ol li::before {
  counter-increment: item;
  content: counter(item) ".";
  display: inline-block;
  margin-right: 0.5em;
}

.option-selector {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}

.option-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.option-item input[type="radio"] {
  cursor: pointer;
}

.option-item label {
  cursor: pointer;
  font-weight: 500;
}

.text-input {
  width: 100%;
  padding: 12px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 16px;
  margin-bottom: 20px;
  transition: border-color 0.2s;
}

.text-input:focus {
  outline: none;
  border-color: #0066cc;
}

.btn-primary {
  background-color: #eb5757;
  color: white;
  padding: 12px 24px;
  border-radius: 4px;
  font-size: 16px;
  font-weight: 500;
  border: none;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-primary:hover {
  background-color: #d64545;
}

.actions-row {
  display: flex;
  justify-content: flex-start;
}

.draggable-item {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  position: relative;
  width: 100%;
  padding-right: 50px;
}

.drag-handle {
  cursor: grab;
  padding: 8px;
  margin-right: 10px;
  color: #888;
}

.drag-handle:hover {
  color: #0066cc;
}

.item-actions {
  position: absolute;
  right: 0;
  top: 8px;
  display: flex;
  align-items: center;
}

.action-button {
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background-color: #f8f8f8;
  color: #888;
  margin-left: 8px;
  transition: all 0.2s;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  font-weight: bold;
}

.action-button:hover {
  background-color: #e0e0e0;
  color: #333;
}

.format-button {
  background-color: #e9ecef;
}

.format-button:hover {
  background-color: #dee2e6;
  color: #0066cc;
}

.format-menu {
  position: absolute;
  right: 40px;
  top: 0;
  display: flex;
  flex-direction: column;
  background-color: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.15);
  z-index: 100;
  padding: 8px;
  width: 260px;
}

.format-group {
  display: flex;
  flex-wrap: wrap;
  margin-bottom: 8px;
  padding-bottom: 8px;
  border-bottom: 1px solid #eee;
}

.format-group:last-child {
  margin-bottom: 0;
  padding-bottom: 0;
  border-bottom: none;
}

.format-option {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  margin: 2px;
  border-radius: 4px;
  background-color: #f8f9fa;
  border: 1px solid transparent;
}

.format-option:hover {
  background-color: #e9ecef;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.format-option.active {
  background-color: #cfe2ff;
  color: #0066cc;
  border: 1px solid #0066cc;
}

.font-size-group {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 4px;
  width: 100%;
}

.size-option {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 36px;
  width: 100%;
}

.color-option {
  width: 36px;
  height: 36px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  margin: 2px;
  border: 1px solid #ddd;
}

.color-option:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
}

.color-option.active {
  border: 2px solid #333;
}

.delete-group {
  margin-bottom: 8px;
  padding-bottom: 8px;
}

.delete-option {
  width: 100%;
  background-color: #fff0f0;
  color: #dc3545;
}

.delete-option:hover {
  background-color: #ffebeb;
  color: #c82333;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(220, 53, 69, 0.2);
}
.image-upload-container {
  margin-bottom: 15px;
}

.file-input-wrapper {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 15px;
}

.file-input-label {
  display: inline-block;
  padding: 10px 15px;
  background-color: #eb5757;
  color: white;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s;
  text-align: center;
  max-width: 200px;
}

.draggable-item {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  position: relative;
  width: 100%;
  padding-right: 50px;
  transition: all 0.2s ease;
  border-radius: 6px;
  border: 2px solid transparent;
  background: white;
}

.draggable-item:hover {
  background: #f8f9fa;
  border-color: #e9ecef;
}

.sortable-chosen {
  background: #e3f2fd !important;
  border: 2px solid #eb5757 !important;
  transform: scale(1.02) !important;
  box-shadow: 0 4px 12px rgba(33, 150, 243, 0.3) !important;
  z-index: 999 !important;
}

.sortable-ghost {
  opacity: 0.5 !important;
  background: #f0f8f0 !important;
  border: 2px dashed #eb5757 !important;
}

/* Block number - numerek bloku */
.block-number {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 26px;
  height: 26px;
  background-color: #f5f5f5;
  color: #666;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  font-size: 12px;
  font-weight: normal;
  margin-right: 10px;
  margin-top: 8px;
  user-select: none;
  cursor: grab;
  transition: all 0.2s ease;
}

.block-number:hover {
  background-color: #eb5757;
  color: white;
  border-color: #eb5757;
}

.block-number:active {
  cursor: grabbing;
  transform: scale(0.95);
}

.sortable-chosen .block-number {
  background-color: #eb5757 !important;
  color: white !important;
  border-color: #eb5757 !important;
  animation: selectedPulse 1s ease-in-out infinite alternate;
}

@keyframes selectedPulse {
  0% {
    box-shadow: #eb5757;
  }
  100% {
    box-shadow: 0 0 0 6px rgba(33, 150, 243, 0);
  }
}

.draggable-item,
.block-number,
.editable-element {
  transition: all 0.2s ease;
}

.file-input-label:hover {
  background-color: #d64545;
}

.file-input {
  display: none;
}

.selected-file-name {
  font-size: 14px;
  color: #555;
  margin-left: 5px;
}

.upload-progress {
  width: 100%;
  height: 6px;
  background-color: #e0e0e0;
  border-radius: 3px;
  overflow: hidden;
  margin-top: 5px;
}

.progress-bar {
  height: 100%;
  background-color: #0066cc;
  transition: width 0.3s ease;
}
.block-number {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 26px;
  height: 26px;
  background-color: #f5f5f5;
  color: #666;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  font-size: 12px;
  font-weight: normal;
  margin-right: 10px;
  margin-top: 8px;
  user-select: none;
  cursor: grab;
  transition: all 0.2s ease;
}

.block-number:hover {
  background-color: #e9ecef;
  color: #333;
  border-color: #ccc;
}

.block-number:active {
  cursor: grabbing;
  background-color: #dee2e6;
}
.video-sm {
  max-width: 25%;
}

.video-md {
  max-width: 50%;
}

.video-lg {
  max-width: 75%;
}

.video-full {
  width: 100%;
}

.video-input {
  margin-bottom: 15px;
}

.video-preview {
  margin-top: 10px;
  max-width: 320px;
}

.video-preview video {
  width: 100%;
  border-radius: 4px;
}
.file-path-container {
  margin-top: 10px;
  background-color: #f8f8f8;
  padding: 10px;
  border-radius: 4px;
  border: 1px solid #e0e0e0;
}

.file-path {
  font-size: 14px;
  word-break: break-all;
  margin-top: 5px;
}

.file-path code {
  color: #0066cc;
  font-family: monospace;
  padding: 2px 4px;
  background-color: #f1f1f1;
  border-radius: 3px;
}

.code-input {
  margin-bottom: 15px;
}

.code-language-selector {
  margin-bottom: 10px;
}

.code-textarea {
  font-family: monospace;
  white-space: pre;
  tab-size: 2;
}

.editable-element pre {
  background-color: #f5f5f5;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 1rem;
  overflow-x: auto;
  font-family: "Courier New", Courier, monospace;
}
.image-container.text-center,
.video-container.text-center {
  margin-left: auto;
  margin-right: auto;
  text-align: center;
  display: block;
}

.image-container.text-right,
.video-container.text-right {
  margin-left: auto;
  margin-right: 0;
  text-align: right;
  display: block;
}
</style>

<template>
  <div class="editor-wrapper">
    <h1
      class="chapter-title"
      contenteditable="true"
      @blur="updateTitle"
      ref="chapterTitleElement"
    >
      {{ chapter?.chapter.title }}
    </h1>

    <div class="content-section">
      <draggable
        v-model="content"
        item-key="id"
        handle=".drag-handle"
        @change="save"
      >
        <template #item="{ element, index }">
          <div class="draggable-item">
            <div class="block-number drag-handle">
              {{ index + 1 }}
            </div>
            <component
              :is="getComponent(element.type)"
              v-bind="element.params"
              :contenteditable="
                element.type !== 'image' && element.type !== 'video'
              "
              @blur="updateContent($event, index)"
              class="editable-element"
              :class="element.params.format"
            />
            <div class="item-actions">
              <div
                class="action-button format-button"
                @click="toggleFormatMenu(index)"
                title="Formatowanie"
              >
                <span>⚙️</span>
              </div>

              <div
                v-if="activeFormatMenu === index"
                class="format-menu"
                @click.stop
              >
                <div class="format-group delete-group">
                  <div
                    class="format-option delete-option"
                    @click="removeItem(index)"
                    title="Usuń element"
                  >
                    <span>🗑️</span>
                  </div>
                </div>
                <div class="format-group">
                  <div
                    class="format-option"
                    @click="applyFormat('font-bold', index)"
                    :class="{
                      active: element.params.format?.includes('font-bold'),
                    }"
                    title="Pogrubienie"
                  >
                    <span><strong>B</strong></span>
                  </div>
                  <div
                    class="format-option"
                    @click="applyFormat('italic', index)"
                    :class="{
                      active: element.params.format?.includes('italic'),
                    }"
                    title="Kursywa"
                  >
                    <span><em>I</em></span>
                  </div>
                  <div
                    class="format-option"
                    @click="applyFormat('underline', index)"
                    :class="{
                      active: element.params.format?.includes('underline'),
                    }"
                    title="Podkreślenie"
                  >
                    <span><u>U</u></span>
                  </div>
                </div>
                <div class="format-group font-size-group">
                  <div
                    class="format-option size-option"
                    @click="applyFontSize('text-xs', index)"
                    :class="{
                      active: hasFontSize(element.params.format, 'text-xs'),
                    }"
                    title="Bardzo mały"
                  >
                    <span style="font-size: 0.75em">Aa</span>
                  </div>
                  <div
                    class="format-option size-option"
                    @click="applyFontSize('text-sm', index)"
                    :class="{
                      active: hasFontSize(element.params.format, 'text-sm'),
                    }"
                    title="Mały"
                  >
                    <span style="font-size: 0.875em">Aa</span>
                  </div>
                  <div
                    class="format-option size-option"
                    @click="applyFontSize('text-base', index)"
                    :class="{
                      active: hasFontSize(element.params.format, 'text-base'),
                    }"
                    title="Normalny"
                  >
                    <span style="font-size: 1em">Aa</span>
                  </div>
                  <div
                    class="format-option size-option"
                    @click="applyFontSize('text-lg', index)"
                    :class="{
                      active: hasFontSize(element.params.format, 'text-lg'),
                    }"
                    title="Duży"
                  >
                    <span style="font-size: 1.125em">Aa</span>
                  </div>
                  <div
                    class="format-option size-option"
                    @click="applyFontSize('text-xl', index)"
                    :class="{
                      active: hasFontSize(element.params.format, 'text-xl'),
                    }"
                    title="Większy"
                  >
                    <span style="font-size: 1.25em">Aa</span>
                  </div>
                  <div
                    class="format-option size-option"
                    @click="applyFontSize('text-2xl', index)"
                    :class="{
                      active: hasFontSize(element.params.format, 'text-2xl'),
                    }"
                    title="Bardzo duży"
                  >
                    <span style="font-size: 1.5em">Aa</span>
                  </div>
                </div>
                <div class="format-group">
                  <div
                    class="format-option color-option"
                    style="background-color: #dc3545"
                    @click="applyColor('text-red', index)"
                    :class="{
                      active: hasColor(element.params.format, 'text-red'),
                    }"
                    title="Czerwony"
                  ></div>
                  <div
                    class="format-option color-option"
                    style="background-color: #0066cc"
                    @click="applyColor('text-blue', index)"
                    :class="{
                      active: hasColor(element.params.format, 'text-blue'),
                    }"
                    title="Niebieski"
                  ></div>
                  <div
                    class="format-option color-option"
                    style="background-color: #28a745"
                    @click="applyColor('text-green', index)"
                    :class="{
                      active: hasColor(element.params.format, 'text-green'),
                    }"
                    title="Zielony"
                  ></div>
                  <div
                    class="format-option color-option"
                    style="background-color: #fd7e14"
                    @click="applyColor('text-orange', index)"
                    :class="{
                      active: hasColor(element.params.format, 'text-orange'),
                    }"
                    title="Pomarańczowy"
                  ></div>
                  <div
                    class="format-option color-option"
                    style="background-color: #6f42c1"
                    @click="applyColor('text-purple', index)"
                    :class="{
                      active: hasColor(element.params.format, 'text-purple'),
                    }"
                    title="Fioletowy"
                  ></div>
                  <div
                    class="format-option color-option"
                    style="background-color: #20c997"
                    @click="applyColor('text-teal', index)"
                    :class="{
                      active: hasColor(element.params.format, 'text-teal'),
                    }"
                    title="Turkusowy"
                  ></div>
                </div>
                <div class="format-group">
                  <div
                    class="format-option"
                    @click="applyFormat('text-center', index)"
                    :class="{
                      active: element.params.format?.includes('text-center'),
                    }"
                    title="Wycentruj tekst"
                  >
                    <span>≡</span>
                  </div>
                  <div
                    class="format-option"
                    @click="applyFormat('text-right', index)"
                    :class="{
                      active: element.params.format?.includes('text-right'),
                    }"
                    title="Wyrównaj do prawej"
                  >
                    <span>⮕</span>
                  </div>
                </div>
                <div
                  class="format-group"
                  v-if="element.type === 'image'"
                >
                  <div
                    class="format-option size-option"
                    @click="applyImageSize('image-sm', index)"
                    :class="{
                      active: hasImageSize(element.params.format, 'image-sm'),
                    }"
                    title="Małe (25%)"
                  >
                    <span>S</span>
                  </div>
                  <div
                    class="format-option size-option"
                    @click="applyImageSize('image-md', index)"
                    :class="{
                      active: hasImageSize(element.params.format, 'image-md'),
                    }"
                    title="Średnie (50%)"
                  >
                    <span>M</span>
                  </div>
                  <div
                    class="format-option size-option"
                    @click="applyImageSize('image-lg', index)"
                    :class="{
                      active: hasImageSize(element.params.format, 'image-lg'),
                    }"
                    title="Duże (75%)"
                  >
                    <span>L</span>
                  </div>
                  <div
                    class="format-option size-option"
                    @click="applyImageSize('image-full', index)"
                    :class="{
                      active: hasImageSize(element.params.format, 'image-full'),
                    }"
                    title="Pełna szerokość"
                  >
                    <span>100%</span>
                  </div>
                </div>
                <div
                  class="format-group"
                  v-if="element.type === 'video'"
                >
                  <div
                    class="format-option size-option"
                    @click="applyVideoSize('video-sm', index)"
                    :class="{
                      active: hasVideoSize(element.params.format, 'video-sm'),
                    }"
                    title="Małe (25%)"
                  >
                    <span>S</span>
                  </div>
                  <div
                    class="format-option size-option"
                    @click="applyVideoSize('video-md', index)"
                    :class="{
                      active: hasVideoSize(element.params.format, 'video-md'),
                    }"
                    title="Średnie (50%)"
                  >
                    <span>M</span>
                  </div>
                  <div
                    class="format-option size-option"
                    @click="applyVideoSize('video-lg', index)"
                    :class="{
                      active: hasVideoSize(element.params.format, 'video-lg'),
                    }"
                    title="Duże (75%)"
                  >
                    <span>L</span>
                  </div>
                  <div
                    class="format-option size-option"
                    @click="applyVideoSize('video-full', index)"
                    :class="{
                      active: hasVideoSize(element.params.format, 'video-full'),
                    }"
                    title="Pełna szerokość"
                  >
                    <span>100%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </template>
      </draggable>
    </div>

    <div class="input-section">
      <div class="option-selector">
        <div
          v-for="(option, index) in options"
          :key="index"
          class="option-item"
        >
          <input
            type="radio"
            :id="`option-${option.value}`"
            :value="option.value"
            v-model="contentType"
          />
          <label :for="`option-${option.value}`">{{ option.label }}</label>
        </div>
      </div>

      <div
        v-if="contentType === 'list'"
        class="list-input"
      >
        <div class="list-type-selector">
          <label>
            <input
              type="radio"
              v-model="listType"
              value="unordered"
            />
            Lista punktowana
          </label>
          <label>
            <input
              type="radio"
              v-model="listType"
              value="ordered"
            />
            Lista numerowana
          </label>
        </div>
        <textarea
          v-model="listItems"
          class="text-input list-textarea"
          placeholder="Wprowadź elementy listy (każdy element w nowej linii)"
          rows="5"
        ></textarea>
      </div>

      <div v-else>
        <input
          v-model="text"
          class="text-input"
          placeholder="Wprowadź treść"
        />
      </div>
      <div
        v-if="contentType === 'image'"
        class="image-input"
      >
        <div class="image-upload-container">
          <div class="file-input-wrapper">
            <label
              for="image-upload"
              class="file-input-label"
            >
              <span>Wybierz plik</span>
              <input
                type="file"
                id="image-upload"
                accept="image/*"
                @change="handleImageUpload"
                class="file-input"
              />
            </label>
            <span
              v-if="selectedFile"
              class="selected-file-name"
              >{{ selectedFile.name }}</span
            >
            <div
              v-if="uploadProgress > 0 && uploadProgress < 100"
              class="upload-progress"
            >
              <div
                class="progress-bar"
                :style="{ width: uploadProgress + '%' }"
              ></div>
            </div>
          </div>
        </div>
        <input
          v-model="imageCaption"
          class="text-input"
          placeholder="Podpis pod zdjęciem (opcjonalnie)"
        />
      </div>
      <div
        v-if="contentType === 'video'"
        class="video-input"
      >
        <div class="file-input-wrapper">
          <label
            for="video-upload"
            class="file-input-label"
          >
            <span>Wybierz film</span>
            <input
              type="file"
              id="video-upload"
              accept="video/mp4,video/webm,video/ogg,video/quicktime"
              @change="handleVideoUpload"
              class="file-input"
            />
          </label>
          <span
            v-if="selectedVideo"
            class="selected-file-name"
          >
            {{ selectedVideo.name }}
          </span>
          <div
            v-if="uploadVideoProgress > 0 && uploadVideoProgress < 100"
            class="upload-progress"
          >
            <div
              class="progress-bar"
              :style="{ width: uploadVideoProgress + '%' }"
            ></div>
          </div>
          <div
            v-if="uploadedVideoUrl"
            class="file-path-container"
          >
            <p>Film został przesłany!</p>
          </div>
        </div>
        <input
          v-model="videoCaption"
          class="text-input"
          placeholder="Podpis pod filmem (opcjonalnie)"
        />
      </div>
      <div
        v-if="contentType === 'code'"
        class="code-input"
      >
        <div class="code-language-selector">
          <label for="code-language">Język programowania:</label>
          <select
            id="code-language"
            v-model="codeLanguage"
            class="text-input"
          >
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
            <option value="csharp">C#</option>
            <option value="cpp">C++</option>
            <option value="java">Java</option>
            <option value="html">HTML</option>
            <option value="css">CSS</option>
            <option value="sql">SQL</option>
            <option value="bash">Bash</option>
            <option value="typescript">TypeScript</option>
            <option value="php">PHP</option>
          </select>
        </div>

        <div class="code-options">
          <label class="checkbox-container">
            <input
              type="checkbox"
              v-model="showLineNumbers"
            />
            <span class="checkbox-label">Pokaż numerację linii</span>
          </label>
        </div>

        <textarea
          v-model="codeContent"
          class="text-input code-textarea"
          placeholder="Wpisz kod tutaj"
          rows="10"
        ></textarea>
        <input
          v-model="codeCaption"
          class="text-input"
          placeholder="Podpis pod kodem (opcjonalnie)"
        />
      </div>
      <div class="actions-row">
        <button
          class="btn-primary"
          @click="add"
        >
          Dodaj nowy element
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="js">


// ------ Importy -------------------------------------------------

import { NodeHeading, NodeParagraph,  NodeList, NodeImage, NodeVideo, NodeCode } from "#components";
import { ref, shallowRef, nextTick } from "vue";
import draggable from 'vuedraggable';


const route = useRoute();
const { chapterId, id: courseId } = route.params;


// ------ Zmienne -------------------------------------------------

const content = ref([]);
const text = ref("");
const contentType = ref("text");
const chapterTitleElement = ref(null);
const chapterTitle = ref("");
const listItems = ref("");
const listType = ref("unordered");
const activeFormatMenu = ref(null);
const selectedFile = ref(null);
const imageCaption = ref("");
const uploadProgress = ref(0);
const uploadedImageUrl = ref("");
const selectedVideo = ref(null);
const videoCaption = ref("");
const uploadVideoProgress = ref(0);
const uploadedVideoUrl = ref("");
const codeContent = ref("");
const codeLanguage = ref("javascript");
const codeCaption = ref("");
const showLineNumbers = ref(false);

// ------ Wybieranie komponentów ----------------------------------

const options = ref([
  { value: "text", label: "Tekst" },
  { value: "heading", label: "Nagłówek" },
  { value: "list", label: "Lista" },
  { value: "image", label: "Zdjęcie" },
  { value: "video", label: "Film" },
  { value: "code", label: "Kod" }
]);

const getComponent = (type) => {
  switch (type) {
    case "text":
      return NodeParagraph;
    case "heading":
      return NodeHeading;
    case "list":
      return NodeList;
    case "image":
      return NodeImage;
    case "video":
      return NodeVideo;
    case "code":
      return NodeCode;
    default:
      return NodeParagraph;
  }
};

// ------ Usuwanie elementów treści --------------------------------

const removeItem = (index) => {
  content.value = content.value.filter((_, i) => i !== index);
  save();
};

// ------ Formatowanie tekstu --------------------------------------

const applyFormat = (format, index) => {
  const item = content.value[index];
  if (item) {
    if (Array.isArray(item.params.format)) {
      if (!item.params.format.includes(format)) {
        item.params.format.push(format);
      } else {
        item.params.format = item.params.format.filter(f => f !== format);
      }
    } else {
      item.params.format = [format];
    }


    save();
  }
};


// ------ Zmiana tytułu rozdziału --------------------------------

const updateTitle = (event) => {
  const newTitle = event.target.innerText.trim();

  if (newTitle !== chapter.value.chapter.title && newTitle !== "") {

    chapter.value.chapter.title = newTitle;

    saveTitle(newTitle);
  }
};

const saveTitle = (newTitle) => {
  useApiFrontend(`courses/${courseId}/chapters/${chapterId}`, {
    method: "PATCH",
    body: {
      title: newTitle,
    },
  })
    .then(() => {
      console.log("Zapisano nowy tytuł rozdziału");
    })
    .catch((error) => {
      console.error("Błąd podczas zapisywania tytułu:", error);
    });
};

// ------ Rozwijane opcje formatowania ---------------------------------

const toggleFormatMenu = (index) => {
  if (activeFormatMenu.value === index) {
    activeFormatMenu.value = null;
  } else {
    activeFormatMenu.value = index;
  }
};


// ------ Formatowanie - rozmiar tekstu ----------------------------

const applyFontSize = (sizeClass, index) => {
  const item = content.value[index];
  if (!item) return;

  const sizeClasses = ['text-xs', 'text-sm', 'text-base', 'text-lg', 'text-xl', 'text-2xl'];

  let formats = Array.isArray(item.params.format) ? [...item.params.format] : [];
  formats = formats.filter(f => !sizeClasses.includes(f));

  if (!hasFontSize(item.params.format, sizeClass)) {
    formats.push(sizeClass);
  }

  item.params.format = formats;

  save();
};

const hasFontSize = (formats, sizeClass) => {
  if (!formats || !Array.isArray(formats)) return false;

  const sizeClasses = ['text-xs', 'text-sm', 'text-base', 'text-lg', 'text-xl', 'text-2xl'];

  if (formats.includes(sizeClass)) return true;

  return sizeClasses.some(size => formats.includes(size) && size === sizeClass);
};

// ------ Formatowanie - rozmiar filmu -----------------------------

const applyVideoSize = (sizeClass, index) => {
  const item = content.value[index];
  if (!item || item.type !== 'video') return;

  const sizeClasses = ['video-sm', 'video-md', 'video-lg', 'video-full'];

  let formats = Array.isArray(item.params.format) ? [...item.params.format] : [];
  formats = formats.filter(f => !sizeClasses.includes(f));

  if (!hasVideoSize(item.params.format, sizeClass)) {
    formats.push(sizeClass);
  }

  item.params.format = formats;
  save();
};

const hasVideoSize = (formats, sizeClass) => {
  if (!formats || !Array.isArray(formats)) return false;

  const sizeClasses = ['video-sm', 'video-md', 'video-lg', 'video-full'];

  if (formats.includes(sizeClass)) return true;
  return sizeClasses.some(size => formats.includes(size) && size === sizeClass);
};

// ------ Formatowanie - rozmiar obrazu ----------------------------

const applyImageSize = (sizeClass, index) => {
  const item = content.value[index];
  if (!item || item.type !== 'image') return;

  const sizeClasses = ['image-sm', 'image-md', 'image-lg', 'image-full'];

  let formats = Array.isArray(item.params.format) ? [...item.params.format] : [];
  formats = formats.filter(f => !sizeClasses.includes(f));

  if (!hasImageSize(item.params.format, sizeClass)) {
    formats.push(sizeClass);
  }

  item.params.format = formats;
  save();
};

const hasImageSize = (formats, sizeClass) => {
  if (!formats || !Array.isArray(formats)) return false;

  const sizeClasses = ['image-sm', 'image-md', 'image-lg', 'image-full'];

  if (formats.includes(sizeClass)) return true;
  return sizeClasses.some(size => formats.includes(size) && size === sizeClass);
};

// ------ Formatowanie - kolor tekstu ------------------------------

const applyColor = (colorClass, index) => {
  const item = content.value[index];
  if (!item) return;

  const colorClasses = ['text-red', 'text-blue', 'text-green', 'text-orange', 'text-purple', 'text-teal'];

  let formats = Array.isArray(item.params.format) ? [...item.params.format] : [];
  formats = formats.filter(f => !colorClasses.includes(f));

  if (!hasColor(item.params.format, colorClass)) {
    formats.push(colorClass);
  }

  item.params.format = formats;

  save();
};

const hasColor = (formats, colorClass) => {
  if (!formats || !Array.isArray(formats)) return false;

  const colorClasses = ['text-red', 'text-blue', 'text-green', 'text-orange', 'text-purple', 'text-teal'];

  if (formats.includes(colorClass)) return true;

  return colorClasses.some(color => formats.includes(color) && color === colorClass);
};

// ------ Przesyłanie obrazu ---------------------------------------

const handleImageUpload = async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  selectedFile.value = file;
  uploadProgress.value = 1;

  try {
    const formData = new FormData();
    formData.append("image", file);

    const response = await useApiFrontend(`courses/${courseId}/chapters/upload-image`, {
      method: "POST",
      body: formData,
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        uploadProgress.value = percentCompleted;
      }
    });

    uploadProgress.value = 100;
    uploadedImageUrl.value = response.imageUrl;
  } catch (error) {
    console.error("Błąd podczas przesyłania obrazu:", error);
    alert("Wystąpił błąd podczas przesyłania obrazu");
    selectedFile.value = null;
    uploadProgress.value = 0;
  }
};

// ------ Przesyłanie filmu ----------------------------------------

const handleVideoUpload = async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  selectedVideo.value = file;
  uploadVideoProgress.value = 1;

  try {
    const formData = new FormData();
    formData.append("video", file);

    const response = await useApiFrontend(`courses/${courseId}/chapters/${chapterId}/upload-video`, {
      method: "POST",
      body: formData,
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        uploadVideoProgress.value = percentCompleted;
      }
    });

    uploadVideoProgress.value = 100;
    uploadedVideoUrl.value = response.videoUrl;
  } catch (error) {
    console.error("Błąd podczas przesyłania filmu:", error);
    alert("Wystąpił błąd podczas przesyłania filmu");
    selectedVideo.value = null;
    uploadVideoProgress.value = 0;
  }
};

// ------ Dodawanie nowego elementu ------------------------------

const add = () => {
  let newItem = {
    type: contentType.value,
    params: {
      format: [],
    },
    id: `item-${content.value.length}-${Date.now()}`,
  };

  if (contentType.value === 'list') {
    newItem.params = {
      items: listItems.value.split('\n').filter(item => item.trim()),
      type: listType.value,
      format: [],
    };

    listItems.value = "";
  } else if (contentType.value === 'image') {
    if (!uploadedImageUrl.value) {
      alert('Najpierw prześlij zdjęcie');
      return;
    }

    newItem.params = {
      src: uploadedImageUrl.value,
      alt: selectedFile.value?.name || 'Obraz kursu',
      caption: imageCaption.value,
      format: [],
    };

    selectedFile.value = null;
    imageCaption.value = '';
    uploadedImageUrl.value = '';
    uploadProgress.value = 0;
  } else if (contentType.value === 'video') {
    if (!uploadedVideoUrl.value) {
      alert('Najpierw prześlij film');
      return;
    }

    newItem.params = {
      src: uploadedVideoUrl.value,
      caption: videoCaption.value,
      format: [],
    };

    selectedVideo.value = null;
    videoCaption.value = '';
    uploadedVideoUrl.value = '';
    uploadVideoProgress.value = 0;
  } else if (contentType.value === 'code') {
    if (!codeContent.value.trim()) {
      alert('Wprowadź kod przed dodaniem bloku');
      return;
    }

    newItem.params = {
      content: codeContent.value,
      language: codeLanguage.value,
      caption: codeCaption.value,
      showLineNumbers: showLineNumbers.value,
      format: [],
    };

    codeContent.value = "";
    codeCaption.value = "";
  } else {
    newItem.params = {
      content: text.value,
      format: [],
    };

    text.value = "";
  }

  content.value = [...content.value, newItem];
  save();
};

// ------ Unikalne identyfikatory elementów ------------------------

const ensureIds = () => {
  content.value = content.value.map((item, index) => {
    return { ...item, id: item.id || `item-${index}-${Date.now()}` };
  });
};

// ------ Aktualiazcja zawartości  ---------------------------------


const updateContent = (event, index) => {
  const target = event.target;
  const item = content.value[index];

  if (!item) return;

  if (item.type === 'code') {

    const codeElement = target.querySelector('code');
    if (codeElement) {

      item.params.content = codeElement.textContent;
    } else {

      const lines = target.innerText.split('\n');

      if (item.params.caption && lines.length > 1 &&
          lines[lines.length - 1].includes(item.params.caption)) {
        lines.pop();
      }
      item.params.content = lines.join('\n');
    }
  } else if (item.type === 'list') {
    const listElements = [];
    const listItems = target.querySelectorAll('li');

    const processedTexts = new Set();

    listItems.forEach(li => {
      const text = li.textContent.trim();
      if (text !== '' && !processedTexts.has(text)) {
        listElements.push(text);
        processedTexts.add(text);
      }
    });

    item.params.items = listElements;

    if (!item.params.type) {
      item.params.type = 'unordered';
    }
  } else {
    item.params.content = target.innerText;
  }

  save();
};

// ------ Pobieranie zawartości rozdziału z serwera ----------------------

const { data: chapter } = await useApiServer(
  `courses/${courseId}/chapters/${chapterId}`,
  { method: "GET" }
);
content.value = chapter.value.chapter.blocks || [];

// ------ Do wyświetlania ul, ol ----------------------------------------

content.value = content.value.map(item => {
  if (item.type === 'list' && item.params) {

    if (typeof item.params.items === 'string') {

      let splitItems = item.params.items.split(',');

      if (splitItems.length === 1) {
        splitItems = item.params.items.split('.');
      }

      if (splitItems.length === 1) {
        splitItems = item.params.items.split('\n');
      }

      item.params.items = splitItems
        .map(s => s.trim())
        .filter(s => s !== '');

      if (item.params.items.length === 0) {
        item.params.items = [item.params.items];
      }
    }

    if (!Array.isArray(item.params.items)) {
      item.params.items = [];
    }

    if (!item.params.type) {
      item.params.type = 'unordered';
    }
  }

  if(typeof item.params.format === 'string') {
      item.params.format = item.params.format.split(',');
    }
  return item;
});

ensureIds();

// ------ Zapisywanie zmian treści rozdziałów -----------------------

const save = () => {
  useApiFrontend(`courses/${courseId}/chapters/${chapterId}`, {
    method: "PATCH",
    body: {
      content: content.value,
    },
  })
    .then(() => {
      console.log("Zapisano zmiany");
    })
    .catch((error) => {
      console.error("Błąd podczas zapisywania zmian:", error);
    });
};
</script>
