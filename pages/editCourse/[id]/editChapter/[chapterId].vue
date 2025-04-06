<style scoped>
.editor-wrapper {
  max-width: 1600px;
  margin: 0 auto;
  padding: 20px;
}

.chapter-title {
  font-size: 28px;
  margin-bottom: 25px;
  border-bottom: 1px solid #e0e0e0;
  padding-bottom: 10px;
}

.preview-section {
  margin-bottom: 35px;
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 5px;
  border: 1px solid #e0e0e0;
  width: 100%;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.content-section {
  margin-bottom: 35px;
  background-color: white;
  padding: 0 10px;
  width: 100%;
}

.editable-element {
  padding: 8px 0;
  border: 1px solid transparent;
  transition: border-color 0.2s;
  margin-bottom: 5px;
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

.input-section {
  padding: 25px;
  margin-top: 20px;
  border-top: 1px solid #e0e0e0;
  background-color: #f8f8f8;
  border-radius: 5px;
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
  margin-bottom: 5px;
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
</style>

<template>
  <div class="editor-wrapper">
    <h1 class="chapter-title">{{ chapter?.chapter.title }}</h1>

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
              <i class="fas"></i>
            </div>
            <component
              :is="getComponent(element.type)"
              v-bind="element.params"
              contenteditable="true"
              @blur="updateContent($event, index)"
              class="editable-element"
            />
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
      <input
        v-model="text"
        class="text-input"
        placeholder="Wprowadź treść"
      />
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
import { NodeHeading, NodeParagraph } from "#components";
import { ref, shallowRef } from "vue";
import draggable from 'vuedraggable';

const route = useRoute();
const { chapterId, id: courseId } = route.params;

const text = ref("");
const contentType = ref("text");

const options = ref([
  { value: "text", label: "Tekst" },
  { value: "heading", label: "Nagłówek" },
]);

const content = shallowRef([]);

const getComponent = (type) => {
  switch (type) {
    case "text":
      return NodeParagraph;
    case "heading":
      return NodeHeading;
    default:
      return NodeParagraph;
  }
};

const add = () => {
  content.value.push({
    type: contentType.value,
    params: {
      content: text.value,
    },
    id: `item-${content.value.length}-${Date.now()}`,
  });

  triggerRef(content);

  save();
  text.value = "";
};


const ensureIds = () => {
  content.value = content.value.map((item, index) => {
    return { ...item, id: item.id || `item-${index}-${Date.now()}` };
  });
};

const updateContent = (event, index) => {
  const target = event.target;
  content.value[index].params.content = target.innerText;

  triggerRef(content);

  save();
};

const { data: chapter } = await useApiServer(
  `courses/${courseId}/chapters/${chapterId}`,
  { method: "GET" }
);

content.value = chapter.value.chapter.wysiwyg_code
  ? JSON.parse(chapter.value.chapter.wysiwyg_code)
  : [];

ensureIds();

const save = () => {
  useApiFrontend(`courses/${courseId}/chapters/${chapterId}`, {
    method: "PATCH",
    body: {
      wysiwyg_code: JSON.stringify(content.value),
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
