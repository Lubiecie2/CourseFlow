<script setup>
// Metadane strony i uprawnienia
definePageMeta({
  middleware: ["auth", "admin-auth"],
  layout: "login",
  pagePermissions: ["PANEL_SHOW_ADMIN_PANEL"],
});

// ------ Zmienne stanu -------------------------------------------------

const tableName = ref("user_logs");
const partitions = ref([]);
const loading = ref(false);
const error = ref(null);
const success = ref(null);
const formVisible = ref(false);
const yearMonthForm = ref({
  year: new Date().getFullYear(),
  month: new Date().getMonth() + 1,
});

// ------ Pobieranie listy partycji -------------------------------------

const fetchPartitions = async () => {
  try {
    loading.value = true;
    error.value = null;

    const response = await useApiFrontend(
      `partitions?tableName=${tableName.value}`
    );

    if (response && response.success) {
      partitions.value = response.data || [];
    } else {
      error.value = "Nie udało się pobrać partycji";
    }
  } catch (err) {
    console.error("Błąd pobierania partycji:", err);
    error.value = "Wystąpił błąd podczas pobierania partycji";
  } finally {
    loading.value = false;
  }
};

// ------ Wybór tabeli --------------------------------------------------

const tableOptions = ref([
  { value: "user_logs", label: "Logi użytkowników" },
  { value: "course_logs", label: "Logi kursów" },
]);

// ------ Tworzenie nowej partycji --------------------------------------

const createPartition = async () => {
  try {
    loading.value = true;
    error.value = null;
    success.value = null;

    const response = await useApiFrontend("partitions", {
      method: "POST",
      body: {
        tableName: tableName.value,
        year: yearMonthForm.value.year,
        month: yearMonthForm.value.month,
      },
    });

    if (response && response.success) {
      success.value = "Partycja została pomyślnie utworzona";
      await fetchPartitions();
      formVisible.value = false;
    } else {
      error.value = "Nie udało się utworzyć partycji";
    }
  } catch (err) {
    console.error("Błąd tworzenia partycji:", err);
    error.value = "Wystąpił błąd podczas tworzenia partycji";
  } finally {
    loading.value = false;
  }
};

// ------ Odłączanie partycji -------------------------------------------

const detachPartition = async (year, month) => {
  try {
    loading.value = true;
    error.value = null;
    success.value = null;

    const response = await useApiFrontend("partitions/detach", {
      method: "POST",
      body: {
        tableName: tableName.value,
        year: year,
        month: month,
      },
    });

    if (response && response.success) {
      success.value = "Partycja została odłączona";
      await fetchPartitions();
    } else {
      error.value = "Nie udało się odłączyć partycji";
    }
  } catch (err) {
    console.error("Błąd odłączania partycji:", err);
    error.value = "Wystąpił błąd podczas odłączania partycji";
  } finally {
    loading.value = false;
  }
};

// ------ Podłączanie partycji ------------------------------------------

const attachPartition = async (year, month) => {
  try {
    loading.value = true;
    error.value = null;
    success.value = null;

    const response = await useApiFrontend("partitions/attach", {
      method: "POST",
      body: {
        tableName: tableName.value,
        year: year,
        month: month,
      },
    });

    if (response && response.success) {
      success.value = "Partycja została podłączona";
      await fetchPartitions();
    } else {
      error.value = "Nie udało się podłączyć partycji";
    }
  } catch (err) {
    console.error("Błąd podłączania partycji:", err);
    error.value = "Wystąpił błąd podczas podłączania partycji";
  } finally {
    loading.value = false;
  }
};

// ------ Formatowanie daty ---------------------------------------------

const formatYearMonth = (partition) => {
  const match = partition.partition_name.match(/y(\d{4})(\d{2})$/);
  if (match) {
    const [_, year, month] = match;
    return {
      year: parseInt(year),
      month: parseInt(month),
      formatted: `${year}-${month}`,
    };
  }
  return { year: null, month: null, formatted: "Nieznany format" };
};

// ------ Inicjalizacja -------------------------------------------------

onMounted(fetchPartitions);
</script>

<template>
  <AdminNavbar />
  <div class="course-management">
    <div class="sidebar">
      <h3 class="sidebar-title">Ustawienia strony</h3>
      <nav class="sidebar-nav">
        <NuxtLink
          to="/options/partitions"
          class="nav-item"
          active-class="active"
        >
          <span class="nav-text">Partycje</span>
        </NuxtLink>
      </nav>
    </div>

    <div class="content-area">
      <div class="page-container">
        <header class="page-header">
          <h1>Zarządzanie partycjami</h1>
          <p>Zarządzaj partycjami tabeli logów użytkownika</p>
        </header>

        <div class="table-selector">
          <label for="table-select">Wybierz tabelę:</label>
          <select
            id="table-select"
            v-model="tableName"
            @change="fetchPartitions"
            class="form-input"
          >
            <option
              v-for="option in tableOptions"
              :key="option.value"
              :value="option.value"
            >
              {{ option.label }}
            </option>
          </select>
        </div>
        <div
          v-if="success"
          class="success-message"
        >
          <div class="success-icon">✓</div>
          <p>{{ success }}</p>
        </div>

        <div
          v-if="error"
          class="error-message"
        >
          <div class="error-icon">⚠️</div>
          <p>{{ error }}</p>
        </div>

        <div class="action-controls">
          <button
            v-if="!formVisible"
            @click="formVisible = true"
            class="action-button"
          >
            <span class="icon">+</span> Dodaj nową partycję
          </button>
        </div>

        <div
          v-if="formVisible"
          class="partition-form"
        >
          <h3>Utwórz nową partycję</h3>
          <div class="form-grid">
            <div class="form-group">
              <label for="year-input">Rok:</label>
              <input
                id="year-input"
                v-model="yearMonthForm.year"
                type="number"
                min="2020"
                max="2100"
                class="form-input"
              />
            </div>

            <div class="form-group">
              <label for="month-input">Miesiąc:</label>
              <input
                id="month-input"
                v-model="yearMonthForm.month"
                type="number"
                min="1"
                max="12"
                class="form-input"
              />
            </div>
          </div>

          <div class="form-actions">
            <button
              @click="createPartition"
              class="primary-button"
              :disabled="loading"
            >
              {{ loading ? "Tworzenie..." : "Utwórz partycję" }}
            </button>
            <button
              @click="formVisible = false"
              class="secondary-button"
            >
              Anuluj
            </button>
          </div>
        </div>

        <div
          v-if="loading && !partitions.length"
          class="loading-state"
        >
          <div class="loading-spinner"></div>
          <p>Ładowanie partycji...</p>
        </div>

        <div
          v-else-if="partitions.length === 0"
          class="empty-state"
        >
          <div class="empty-icon">📊</div>
          <h3>Brak partycji</h3>
          <p>Nie znaleziono partycji dla tabeli logów użytkownika.</p>
        </div>

        <div
          v-else
          class="partitions-table-container"
        >
          <table class="partitions-table">
            <thead>
              <tr>
                <th>Nazwa partycji</th>
                <th>Okres</th>
                <th>Status</th>
                <th>Akcje</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="partition in partitions"
                :key="partition.partition_name"
                :class="{ 'active-partition': partition.is_attached }"
              >
                <td>{{ partition.partition_name }}</td>
                <td>
                  <span v-if="partition.start_date && partition.end_date">
                    {{ partition.start_date }} - {{ partition.end_date }}
                  </span>
                  <span v-else>-</span>
                </td>
                <td>
                  <span
                    class="status-badge"
                    :class="
                      partition.is_attached
                        ? 'status-active'
                        : 'status-inactive'
                    "
                  >
                    {{ partition.is_attached ? "Podłączona" : "Odłączona" }}
                  </span>
                </td>
                <td class="actions-cell">
                  <button
                    v-if="partition.is_attached"
                    @click="
                      detachPartition(
                        formatYearMonth(partition).year,
                        formatYearMonth(partition).month
                      )
                    "
                    class="danger-button small"
                    :disabled="loading"
                  >
                    Odłącz
                  </button>
                  <button
                    v-else
                    @click="
                      attachPartition(
                        formatYearMonth(partition).year,
                        formatYearMonth(partition).month
                      )
                    "
                    class="success-button small"
                    :disabled="loading"
                  >
                    Podłącz
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
  <foter></foter>
</template>

<style scoped>
.course-management {
  display: flex;
  min-height: calc(100vh - 80px);
  background-color: #f8f9fa;
}

.sidebar {
  width: 250px;
  background-color: white;
  border-right: 1px solid #e9ecef;
  display: flex;
  flex-direction: column;
}

.sidebar-title {
  padding: 15px;
  margin: 0;
  font-weight: 600;
}

.sidebar-nav {
  padding: 10px 0;
}

.nav-item {
  padding: 12px 15px;
  cursor: pointer;
  transition: background-color 0.2s;
  border-bottom: 1px solid #e9ecef;
}

.nav-item:hover {
  background-color: #f1f3f5;
}

.nav-item.active {
  background-color: #f8f9fa;
  color: #eb5757;
  font-weight: 500;
}

.nav-item {
  padding: 12px 15px;
  cursor: pointer;
  transition: background-color 0.2s;
  border-bottom: 1px solid #e9ecef;
  text-decoration: none;
  color: inherit;
  display: block;
}

.content-area {
  flex-grow: 1;
  padding: 20px;
}

.page-container {
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 30px;
}

.page-header h1 {
  margin-bottom: 5px;
  font-size: 28px;
  color: #333;
}

.page-header p {
  margin: 0;
  color: #666;
  font-size: 16px;
}

.success-message,
.error-message {
  display: flex;
  align-items: center;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.success-message {
  background-color: #e8f5e9;
  border: 1px solid #a5d6a7;
  color: #2e7d32;
}

.error-message {
  background-color: #ffebee;
  border: 1px solid #ef9a9a;
  color: #c62828;
}

.success-icon,
.error-icon {
  font-size: 20px;
  margin-right: 10px;
}

.action-controls {
  margin-bottom: 20px;
}

.action-button {
  background-color: #eb5757;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  transition: all 0.2s;
}

.table-selector {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
  background-color: white;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.action-button:hover {
  background-color: #d13030;
}

.action-button .icon {
  margin-right: 8px;
  font-size: 18px;
}

.partition-form {
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.partition-form h3 {
  margin-top: 0;
  margin-bottom: 15px;
  color: #333;
  font-size: 18px;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
  margin-bottom: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  margin-bottom: 5px;
  font-weight: 500;
  color: #555;
}

.form-input {
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 16px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.primary-button,
.secondary-button,
.danger-button,
.success-button {
  padding: 10px 20px;
  border-radius: 6px;
  border: none;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.primary-button {
  background-color: #eb5757;
  color: white;
}

.primary-button:hover {
  background-color: #d13030;
}

.secondary-button {
  background-color: #f0f0f0;
  color: #333;
}

.secondary-button:hover {
  background-color: #e0e0e0;
}

.danger-button {
  background-color: #f44336;
  color: white;
}

.danger-button:hover {
  background-color: #d32f2f;
}

.success-button {
  background-color: #4caf50;
  color: white;
}

.success-button:hover {
  background-color: #388e3c;
}

.small {
  padding: 6px 12px;
  font-size: 14px;
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.loading-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 50px 0;
  text-align: center;
}

.loading-spinner {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #eb5757;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin-bottom: 15px;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 15px;
  color: #ccc;
}

.partitions-table-container {
  overflow-x: auto;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.partitions-table {
  width: 100%;
  border-collapse: collapse;
}

.partitions-table th {
  background-color: #f8f9fa;
  color: #333;
  font-weight: 600;
  text-align: left;
  padding: 15px;
  border-bottom: 2px solid #e9ecef;
}

.partitions-table td {
  padding: 15px;
  border-bottom: 1px solid #e9ecef;
}

.partitions-table tr:hover {
  background-color: #f5f5f5;
}

.active-partition {
  background-color: #f9fafb;
}

.status-badge {
  display: inline-block;
  padding: 5px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
}

.status-active {
  background-color: #e8f5e9;
  color: #2e7d32;
}

.status-inactive {
  background-color: #ffebee;
  color: #c62828;
}

.actions-cell {
  text-align: center;
}

@media (max-width: 768px) {
  .course-management {
    flex-direction: column;
  }

  .sidebar {
    width: 100%;
    border-right: none;
    border-bottom: 1px solid #e9ecef;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }
}
</style>
