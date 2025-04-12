<style scoped>
/* Główne kontenery */
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
  max-width: 95%;
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
  background-color: #0066cc;
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
  background-color: #0055aa;
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
  display: flex;
  align-items: center;
  position: relative;
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
            <div class="drag-handle">
              <i class="fas fa-grip-vertical"></i>
            </div>
            <component
              :is="getComponent(element.type)"
              v-bind="element.params"
              contenteditable="true"
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

import { NodeHeading, NodeParagraph,  NodeList } from "#components";
import { ref, shallowRef, nextTick } from "vue";
import draggable from 'vuedraggable';


// ------ Koniec Importów -----------------------------------------

const route = useRoute();
const { chapterId, id: courseId } = route.params;


// ------ Zmienne -------------------------------------------------

const text = ref("");
const contentType = ref("text");
const chapterTitleElement = ref(null);
const chapterTitle = ref("");
const listItems = ref("");
const listType = ref("unordered");
const activeFormatMenu = ref(null);

// ------ Koniec zmiennch -----------------------------------------

// ------ Wybieranie komponentów ----------------------------------

const options = ref([
  { value: "text", label: "Tekst" },
  { value: "heading", label: "Nagłówek" },
  { value: "list", label: "Lista" },
]);

const getComponent = (type) => {
  switch (type) {
    case "text":
      return NodeParagraph;
    case "heading":
      return NodeHeading;
      case "list":
      return NodeList;
    default:
      return NodeParagraph;
  }
};

// ------ Koniec wybierania komponentów ---------------------------


const content = shallowRef([]);


const removeItem = (index) => {
  content.value = content.value.filter((_, i) => i !== index);
  triggerRef(content);
  save();
};

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

    triggerRef(content);
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

// ------ Koniec zmiany tytułu rozdziału --------------------------------

// ------ Roozwijane opcje formatowania ---------------------------------

const toggleFormatMenu = (index) => {
  if (activeFormatMenu.value === index) {
    activeFormatMenu.value = null;
  } else {
    activeFormatMenu.value = index;
  }
};

// ------ Koniec rozwijanych opcji formatowania -------------------------

// ------ Do przypisywania rozmiaru teksu -------------------------------

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

  triggerRef(content);
  save();
};

const hasFontSize = (formats, sizeClass) => {
  if (!formats || !Array.isArray(formats)) return false;

  const sizeClasses = ['text-xs', 'text-sm', 'text-base', 'text-lg', 'text-xl', 'text-2xl'];

  if (formats.includes(sizeClass)) return true;

  return sizeClasses.some(size => formats.includes(size) && size === sizeClass);
};

// ------ Koniec przypisywania rozmiaru teksu -------------------------------

// ------ Przypisywanie koloru teksu  -------------------------------

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

  triggerRef(content);
  save();
};

const hasColor = (formats, colorClass) => {
  if (!formats || !Array.isArray(formats)) return false;

  const colorClasses = ['text-red', 'text-blue', 'text-green', 'text-orange', 'text-purple', 'text-teal'];

  if (formats.includes(colorClass)) return true;

  return colorClasses.some(color => formats.includes(color) && color === colorClass);
};

// ------ Koniec przypisywania koloru teksu  -------------------------------

// ------ Dodawanie nowego elementu ------------------------------

const add = () => {
  let newItem = {
    type: contentType.value,
    params: {},
    id: `item-${content.value.length}-${Date.now()}`,
  };

  if (contentType.value === 'list') {
    newItem.params = {
      items: listItems.value.split('\n').filter(item => item.trim()),
      type: listType.value
    };
  } else {
    newItem.params = {
      content: text.value,
    };
  }

  content.value = [...content.value, newItem];
  triggerRef(content);
  save();

  text.value = "";
  listItems.value = "";
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

  if (item.type === 'list') {
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

  triggerRef(content);
  save();
};

const { data: chapter } = await useApiServer(
  `courses/${courseId}/chapters/${chapterId}`,
  { method: "GET" }
);
content.value = chapter.value.chapter.blocks || [];

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
