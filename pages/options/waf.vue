<script setup>
import { ref, onMounted, computed } from "vue";

definePageMeta({
  middleware: ["auth", "admin-auth"],
  layout: "login",
});

const loading = ref(false);
const stats = ref({
  blockedRequests: 0,
  blockRate: "0%",

  threats: {
    xss: 0,
    sqlInjection: 0,
    rateLimit: 0,
    total: 0,
  },

  last24h: {
    totalEvents: 0,
    xssBlocks: 0,
    sqlInjectionBlocks: 0,
    rateLimitBlocks: 0,
  },

  recentEvents: [],
});

const config = ref({
  rateLimitEnabled: true,
  rateLimitMax: 100,
  sqlInjectionEnabled: true,
  xssEnabled: true,
});

const maxThreats = computed(() => {
  const threats = stats.value.threats;
  return (
    Math.max(
      threats.xss || 0,
      threats.sqlInjection || 0,
      threats.rateLimit || 0
    ) || 1
  );
});

const refreshData = async () => {
  loading.value = true;
  try {
    const response = await useApiFrontend("waf/dashboard");
    if (response.success) {
      stats.value = {
        blockedRequests: response.data.blockedRequests || 0,
        blockRate: response.data.blockRate || "0%",

        threats: {
          xss: response.data.threats?.xss || 0,
          sqlInjection: response.data.threats?.sqlInjection || 0,
          rateLimit: response.data.threats?.rateLimit || 0,
          total: response.data.threats?.total || 0,
        },

        last24h: {
          totalEvents: response.data.last24h?.totalEvents || 0,
          xssBlocks: response.data.last24h?.xssBlocks || 0,
          sqlInjectionBlocks: response.data.last24h?.sqlInjectionBlocks || 0,
          rateLimitBlocks: response.data.last24h?.rateLimitBlocks || 0,
        },

        recentEvents: response.data.recentEvents || [],
      };

      config.value = {
        rateLimitEnabled: response.data.config?.rateLimitEnabled || true,
        rateLimitMax: response.data.config?.rateLimitMax || 100,
        sqlInjectionEnabled: response.data.config?.sqlInjectionEnabled || true,
        xssEnabled: response.data.config?.xssEnabled || true,
      };
    }
  } catch (error) {
    console.error("Błąd podczas pobierania danych WAF:", error);
  } finally {
    loading.value = false;
  }
};

const updateConfig = async () => {
  try {
    await useApiFrontend("waf/config", {
      method: "PATCH",
      body: {
        config: {
          rateLimiting: {
            enabled: config.value.rateLimitEnabled,
            maxRequests: config.value.rateLimitMax,
          },
          sqlInjection: {
            enabled: config.value.sqlInjectionEnabled,
          },
          xss: {
            enabled: config.value.xssEnabled,
          },
        },
      },
    });
    await refreshData();
    console.log("✅ Konfiguracja WAF zaktualizowana");
  } catch (error) {
    console.error("Błąd podczas aktualizacji konfiguracji:", error);
  }
};

const formatNumber = (num) => {
  return new Intl.NumberFormat("pl-PL").format(num || 0);
};

const formatTime = (timestamp) => {
  return new Date(timestamp).toLocaleString("pl-PL", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    day: "2-digit",
    month: "2-digit",
  });
};

const getPercentage = (value) => {
  return maxThreats.value > 0 ? (value / maxThreats.value) * 100 : 0;
};

onMounted(() => {
  refreshData();
});
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
        >
          <span class="nav-text">Partycje</span>
        </NuxtLink>
        <NuxtLink
          to="/options/waf"
          class="nav-item"
          active-class="active"
        >
          <span class="nav-text">Bezpieczeństwo</span>
        </NuxtLink>
      </nav>
    </div>

    <div class="content-area">
      <div class="waf-dashboard">
        <div class="waf-header">
          <div class="header-content">
            <div class="header-info">
              <h1>🛡️ WAF</h1>
              <p>Dane na temat ataków w aplikacji</p>
            </div>
          </div>
        </div>

        <div class="dashboard-content">
          <div class="stats-grid">
            <div class="stat-card">
              <div class="card-header">
                <h3>Zablokowane (sesja)</h3>
                <div class="card-icon red">🛡️</div>
              </div>
              <div class="card-value blocked">
                {{ formatNumber(stats.blockedRequests) }}
              </div>
              <div class="card-change negative">
                {{ stats.blockRate }} ratio
              </div>
            </div>

            <div class="stat-card">
              <div class="card-header">
                <h3>Ataki XSS (ogółem)</h3>
                <div class="card-icon orange">⚠️</div>
              </div>
              <div class="card-value xss">
                {{ formatNumber(stats.threats?.xss || 0) }}
              </div>
              <div class="card-change">
                {{ stats.last24h?.xssBlocks || 0 }} ostatnie 24h
              </div>
            </div>

            <div class="stat-card">
              <div class="card-header">
                <h3>SQL Injection (ogółem)</h3>
                <div class="card-icon purple">💉</div>
              </div>
              <div class="card-value sql">
                {{ formatNumber(stats.threats?.sqlInjection || 0) }}
              </div>
              <div class="card-change">
                {{ stats.last24h?.sqlInjectionBlocks || 0 }} ostatnie 24h
              </div>
            </div>

            <div class="stat-card">
              <div class="card-header">
                <h3>Rate Limiting (ogółem)</h3>
                <div class="card-icon blue">⏰</div>
              </div>
              <div class="card-value rate">
                {{ formatNumber(stats.threats?.rateLimit || 0) }}
              </div>
              <div class="card-change">
                {{ stats.last24h?.rateLimitBlocks || 0 }} ostatnie 24h
              </div>
            </div>
          </div>

          <div class="chart-section">
            <div class="chart-card">
              <h3>Rozkład zagrożeń (wszystkie czasy)</h3>
              <div class="threat-chart">
                <div class="threat-item">
                  <div class="threat-bar">
                    <div
                      class="threat-fill xss"
                      :style="{
                        width: getPercentage(stats.threats?.xss || 0) + '%',
                      }"
                    ></div>
                  </div>
                  <span class="threat-label"
                    >XSS: {{ formatNumber(stats.threats?.xss || 0) }}</span
                  >
                </div>
                <div class="threat-item">
                  <div class="threat-bar">
                    <div
                      class="threat-fill sql"
                      :style="{
                        width:
                          getPercentage(stats.threats?.sqlInjection || 0) + '%',
                      }"
                    ></div>
                  </div>
                  <span class="threat-label"
                    >SQL:
                    {{ formatNumber(stats.threats?.sqlInjection || 0) }}</span
                  >
                </div>
                <div class="threat-item">
                  <div class="threat-bar">
                    <div
                      class="threat-fill rate"
                      :style="{
                        width:
                          getPercentage(stats.threats?.rateLimit || 0) + '%',
                      }"
                    ></div>
                  </div>
                  <span class="threat-label"
                    >Rate Limit:
                    {{ formatNumber(stats.threats?.rateLimit || 0) }}</span
                  >
                </div>
              </div>
            </div>
          </div>

          <div class="events-section">
            <div class="events-header">
              <h3>Ostatnie zdarzenia bezpieczeństwa</h3>
              <div class="events-stats">
                <span class="total-events"
                  >Łącznie:
                  {{ formatNumber(stats.threats?.total || 0) }} eventów</span
                >
              </div>
            </div>
            <div class="events-table">
              <div class="table-header">
                <div class="col-time">Czas</div>
                <div class="col-type">Typ</div>
                <div class="col-ip">IP</div>
                <div class="col-endpoint">Endpoint</div>
                <div class="col-risk">Ryzyko</div>
              </div>
              <div class="table-body">
                <div
                  v-for="event in stats.recentEvents?.slice(0, 10) || []"
                  :key="event.id"
                  class="table-row"
                >
                  <div class="col-time">{{ formatTime(event.timestamp) }}</div>
                  <div class="col-type">
                    <span
                      class="event-type"
                      :class="event.type"
                      >{{ event.type }}</span
                    >
                  </div>
                  <div class="col-ip">{{ event.ip }}</div>
                  <div class="col-endpoint">{{ event.endpoint || "-" }}</div>
                  <div class="col-risk">
                    <span
                      class="risk-badge"
                      :class="event.risk"
                      >{{ event.risk }}</span
                    >
                  </div>
                </div>
                <div
                  v-if="!stats.recentEvents?.length"
                  class="no-events"
                >
                  Brak zdarzeń w bazie danych
                </div>
              </div>
            </div>
          </div>

          <div class="config-section">
            <h3>⚙️ Konfiguracja WAF</h3>
            <div class="config-grid">
              <div class="config-item">
                <label class="config-label">
                  <input
                    type="checkbox"
                    v-model="config.rateLimitEnabled"
                    @change="updateConfig"
                  />
                  Rate Limiting
                </label>
                <div
                  v-if="config.rateLimitEnabled"
                  class="config-details"
                >
                  <input
                    type="number"
                    v-model="config.rateLimitMax"
                    @change="updateConfig"
                    class="config-input"
                    min="1"
                    max="10000"
                  />
                  <span>żądań/minutę</span>
                </div>
              </div>

              <div class="config-item">
                <label class="config-label">
                  <input
                    type="checkbox"
                    v-model="config.sqlInjectionEnabled"
                    @change="updateConfig"
                  />
                  SQL Injection Protection
                </label>
              </div>

              <div class="config-item">
                <label class="config-label">
                  <input
                    type="checkbox"
                    v-model="config.xssEnabled"
                    @change="updateConfig"
                  />
                  XSS Protection
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
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
  flex: 1;
  overflow-y: auto;
}

.waf-dashboard {
  min-height: 100%;
}

.waf-header {
  background: white;
  border-bottom: 1px solid #e9ecef;
  padding: 20px 0;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.header-info h1 {
  margin: 0;
  font-size: 2rem;
  color: #2c3e50;
  font-weight: bold;
}

.header-info p {
  margin: 5px 0 0 0;
  color: #6c757d;
  font-size: 1rem;
}

.dashboard-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 30px 20px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  background: white;
  padding: 25px;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  border: 1px solid #e9ecef;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.card-header h3 {
  margin: 0;
  font-size: 0.9rem;
  color: #6c757d;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.card-icon {
  font-size: 2rem;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-icon.red {
  background: #ffebee;
}
.card-icon.orange {
  background: #fff3e0;
}
.card-icon.purple {
  background: #f3e5f5;
}
.card-icon.blue {
  background: #e3f2fd;
}

.card-value {
  font-size: 2.5rem;
  font-weight: bold;
  margin-bottom: 10px;
  color: #2c3e50;
}

.card-value.blocked {
  color: #dc3545;
}
.card-value.xss {
  color: #fd7e14;
}
.card-value.sql {
  color: #6f42c1;
}
.card-value.rate {
  color: #007bff;
}

.card-change {
  font-size: 0.85rem;
  color: #6c757d;
}

.card-change.negative {
  color: #dc3545;
}

.chart-section {
  margin-bottom: 30px;
}

.chart-card {
  background: white;
  padding: 25px;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  border: 1px solid #e9ecef;
}

.chart-card h3 {
  margin: 0 0 20px 0;
  font-size: 1.1rem;
  color: #2c3e50;
  font-weight: 600;
}

.threat-chart {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.threat-item {
  display: flex;
  align-items: center;
  gap: 15px;
}

.threat-bar {
  flex: 1;
  height: 25px;
  background: #f8f9fa;
  border-radius: 12px;
  overflow: hidden;
}

.threat-fill {
  height: 100%;
  border-radius: 12px;
  transition: width 0.8s ease;
}

.threat-fill.xss {
  background: linear-gradient(90deg, #fd7e14, #ff8c3a);
}
.threat-fill.sql {
  background: linear-gradient(90deg, #6f42c1, #8a63d2);
}
.threat-fill.rate {
  background: linear-gradient(90deg, #007bff, #409fff);
}

.threat-label {
  min-width: 140px;
  font-size: 0.9rem;
  color: #495057;
  font-weight: 500;
}

.events-section {
  background: white;
  padding: 25px;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  border: 1px solid #e9ecef;
  margin-bottom: 30px;
}

.events-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 10px;
}

.events-header h3 {
  margin: 0;
  font-size: 1.1rem;
  color: #2c3e50;
  font-weight: 600;
}

.events-stats {
  color: #6c757d;
  font-size: 0.9rem;
  font-weight: 500;
}

.total-events {
  background: #e9ecef;
  padding: 4px 8px;
  border-radius: 4px;
}

.events-table {
  width: 100%;
}

.table-header {
  display: grid;
  grid-template-columns: 120px 100px 140px 1fr 80px;
  gap: 15px;
  padding: 12px 0;
  border-bottom: 2px solid #e9ecef;
  font-weight: 600;
  color: #495057;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.table-body {
  display: flex;
  flex-direction: column;
}

.table-row {
  display: grid;
  grid-template-columns: 120px 100px 140px 1fr 80px;
  gap: 15px;
  padding: 15px 0;
  border-bottom: 1px solid #f8f9fa;
  align-items: center;
  font-size: 0.9rem;
}

.table-row:hover {
  background-color: #f8f9fa;
}

.event-type {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.event-type.xss {
  background: #fff3e0;
  color: #f57c00;
}

.event-type.sql_injection {
  background: #f3e5f5;
  color: #7b1fa2;
}

.event-type.rate_limit {
  background: #e3f2fd;
  color: #1565c0;
}

.risk-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.risk-badge.low {
  background: #e8f5e8;
  color: #2e7d32;
}

.risk-badge.medium {
  background: #fff3e0;
  color: #f57c00;
}

.risk-badge.high {
  background: #ffebee;
  color: #c62828;
}

.no-events {
  text-align: center;
  color: #6c757d;
  font-style: italic;
  padding: 30px;
}

.config-section {
  background: white;
  padding: 25px;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  border: 1px solid #e9ecef;
}

.config-section h3 {
  margin: 0 0 20px 0;
  font-size: 1.1rem;
  color: #2c3e50;
  font-weight: 600;
}

.config-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.config-item {
  padding: 20px;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  background: #f8f9fa;
}

.config-label {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 500;
  color: #495057;
  cursor: pointer;
  margin-bottom: 10px;
}

.config-label input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.config-details {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 10px;
}

.config-input {
  width: 80px;
  padding: 6px 10px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 0.9rem;
}

@media (max-width: 768px) {
  .course-management {
    flex-direction: column;
  }

  .sidebar {
    width: 100%;
  }

  .header-content {
    text-align: center;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .events-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .table-header,
  .table-row {
    grid-template-columns: 1fr;
    text-align: center;
  }

  .config-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .dashboard-content {
    padding: 20px 15px;
  }

  .stat-card,
  .chart-card,
  .events-section,
  .config-section {
    padding: 20px;
  }
}
</style>
