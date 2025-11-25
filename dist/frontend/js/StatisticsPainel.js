import { Priority } from '../../backend/enums/Priority.js';
export class StatisticsPanel {
    constructor(controlCenter) {
        this.updateInterval = null;
        this.controlCenter = controlCenter;
    }
    initialize() {
        this.createStatisticsPanel();
        this.updateAllStatistics();
        this.startAutoRefresh();
        this.setupEventListeners();
    }
    createStatisticsPanel() {
        const especialistaSection = document.getElementById('especialista');
        if (!especialistaSection)
            return;
        // Remover painel existente se houver
        const existingPanel = document.getElementById('estatisticasPanel');
        if (existingPanel) {
            existingPanel.remove();
        }
        const statsPanel = document.createElement('div');
        statsPanel.id = 'estatisticasPanel';
        statsPanel.className = 'estatisticas-panel';
        statsPanel.innerHTML = this.getStatisticsHTML();
        // Inserir antes do histórico de atendimentos
        const historicoSection = especialistaSection.querySelector('.historico-atendimentos');
        if (historicoSection) {
            historicoSection.insertAdjacentElement('beforebegin', statsPanel);
        }
        else {
            // Fallback: inserir no final da seção
            especialistaSection.appendChild(statsPanel);
        }
    }
    getStatisticsHTML() {
        return `
      <div class="estatisticas-header">
        <h3>📊 ESTATÍSTICAS DO SISTEMA</h3>
        <div class="estatisticas-actions">
          <button id="refreshStats" class="btn-refresh" title="Atualizar Estatísticas">🔄</button>
          <button id="exportStats" class="btn-export" title="Exportar Relatório">📄</button>
        </div>
      </div>
      
      <div class="estatisticas-grid">
        <!-- RESUMO GERAL -->
        <div class="stats-card general-stats">
          <h4>🌐 RESUMO GERAL</h4>
          <div class="stats-content">
            <div class="stat-item">
              <span class="stat-label">Total de Tickets</span>
              <span class="stat-value" id="totalTickets">0</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Naves Cadastradas</span>
              <span class="stat-value" id="totalSpaceships">0</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Especialistas</span>
              <span class="stat-value" id="totalSpecialists">0</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Taxa de Conclusão</span>
              <span class="stat-value" id="completionRate">0%</span>
            </div>
          </div>
        </div>

        <!-- ATIVIDADE HOJE -->
        <div class="stats-card today-stats">
          <h4>📅 HOJE</h4>
          <div class="stats-content">
            <div class="stat-item">
              <span class="stat-label">Tickets</span>
              <span class="stat-value" id="todayTotal">0</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Concluídos</span>
              <span class="stat-value" id="todayCompleted">0</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Emergências</span>
              <span class="stat-value emergency" id="todayEmergencies">0</span>
            </div>
          </div>
        </div>

        <!-- FILA ATUAL -->
        <div class="stats-card queue-stats">
          <h4>⏱ TEMPO REAL</h4>
          <div class="stats-content">
            <div class="stat-item">
              <span class="stat-label">Na Fila</span>
              <span class="stat-value" id="queueSize">0</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Espec. Disponíveis</span>
              <span class="stat-value" id="availableSpecialists">0</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Emerg. Ativas</span>
              <span class="stat-value emergency" id="activeEmergencies">0</span>
            </div>
          </div>
        </div>

        <!-- POR PRIORIDADE -->
        <div class="stats-card priority-stats">
          <h4>🎯 PRIORIDADES</h4>
          <div class="stats-content" id="priorityStats">
            <div class="loading">Carregando...</div>
          </div>
        </div>

        <!-- TOP NAVES -->
        <div class="stats-card top-spaceships">
          <h4>🚀 TOP NAVES</h4>
          <div class="stats-content" id="topSpaceships">
            <div class="loading">Carregando...</div>
          </div>
        </div>

        <!-- TOP ESPECIALISTAS -->
        <div class="stats-card top-specialists">
          <h4>👨‍🔬 TOP ESPECIALISTAS</h4>
          <div class="stats-content" id="topSpecialists">
            <div class="loading">Carregando...</div>
          </div>
        </div>

        <!-- TOP RECEPCIONISTAS -->
        <div class="stats-card top-receptionists">
          <h4>👨‍💼 TOP RECEPCIONISTAS</h4>
          <div class="stats-content" id="topReceptionists">
            <div class="loading">Carregando...</div>
          </div>
        </div>
      </div>
    `;
    }
    async updateAllStatistics() {
        try {
            const dashboardData = this.controlCenter.statisticsService.getDashboardData();
            this.updateGeneralStats(dashboardData.general);
            this.updateTodayStats(dashboardData.tickets.today);
            this.updateQueueStats(dashboardData.realTime);
            this.updatePriorityStats(dashboardData.tickets.byPriority);
            this.updateTopSpaceships(dashboardData.rankings.topSpaceships);
            this.updateTopSpecialists(dashboardData.rankings.topSpecialists);
            this.updateTopReceptionists(dashboardData.rankings.topReceptionists); // NOVO
        }
        catch (error) {
            console.error('Erro ao atualizar estatísticas:', error);
        }
    }
    updateGeneralStats(general) {
        this.updateElement('totalTickets', general.totalTickets);
        this.updateElement('totalSpaceships', general.totalSpaceships);
        this.updateElement('totalSpecialists', general.totalSpecialists);
        this.updateElement('completionRate', `${general.completionRate}%`);
    }
    updateTodayStats(today) {
        this.updateElement('todayTotal', today.total);
        this.updateElement('todayCompleted', today.completed);
        this.updateElement('todayEmergencies', today.emergency);
    }
    updateQueueStats(realTime) {
        this.updateElement('queueSize', realTime.queueSize);
        this.updateElement('availableSpecialists', realTime.availableSpecialists);
        this.updateElement('activeEmergencies', realTime.activeEmergencies);
    }
    updatePriorityStats(byPriority) {
        const priorityStatsElem = document.getElementById('priorityStats');
        if (!priorityStatsElem)
            return;
        const emergencyCount = byPriority.get(Priority.EMERGENCY) || 0;
        const highCount = byPriority.get(Priority.HIGH) || 0;
        const normalCount = byPriority.get(Priority.NORMAL) || 0;
        priorityStatsElem.innerHTML = `
      <div class="priority-item emergency">
        <span class="priority-icon">🟥</span>
        <span class="priority-label">Emergências</span>
        <span class="priority-count">${emergencyCount}</span>
      </div>
      <div class="priority-item high">
        <span class="priority-icon">🟧</span>
        <span class="priority-label">Alta Prioridade</span>
        <span class="priority-count">${highCount}</span>
      </div>
      <div class="priority-item normal">
        <span class="priority-icon">🟩</span>
        <span class="priority-label">Normal</span>
        <span class="priority-count">${normalCount}</span>
      </div>
    `;
    }
    updateTopSpaceships(topSpaceships) {
        const topSpaceshipsElem = document.getElementById('topSpaceships');
        if (!topSpaceshipsElem)
            return;
        if (topSpaceships.length === 0) {
            topSpaceshipsElem.innerHTML = '<div class="no-data">Nenhuma nave ativa</div>';
            return;
        }
        topSpaceshipsElem.innerHTML = topSpaceships.map((item, index) => `
      <div class="top-item ${index === 0 ? 'top-1' : ''}">
        <span class="top-rank">${index + 1}º</span>
        <span class="top-name">${item.name}</span>
        <span class="top-count">${item.count}</span>
      </div>
    `).join('');
    }
    updateTopSpecialists(topSpecialists) {
        const topSpecialistsElem = document.getElementById('topSpecialists');
        if (!topSpecialistsElem)
            return;
        if (topSpecialists.length === 0) {
            topSpecialistsElem.innerHTML = '<div class="no-data">Nenhum especialista</div>';
            return;
        }
        topSpecialistsElem.innerHTML = topSpecialists.map((item, index) => `
      <div class="top-item ${index === 0 ? 'top-1' : ''}">
        <span class="top-rank">${index + 1}º</span>
        <span class="top-name">${item.name}</span>
        <span class="top-count">${item.count}</span>
      </div>
    `).join('');
    }
    // NOVO MÉTODO: Ranking de Recepcionistas
    updateTopReceptionists(topReceptionists) {
        const topReceptionistsElem = document.getElementById('topReceptionists');
        if (!topReceptionistsElem)
            return;
        if (topReceptionists.length === 0) {
            topReceptionistsElem.innerHTML = '<div class="no-data">Nenhum recepcionista</div>';
            return;
        }
        topReceptionistsElem.innerHTML = topReceptionists.map((item, index) => `
      <div class="top-item ${index === 0 ? 'top-1' : ''}">
        <span class="top-rank">${index + 1}º</span>
        <span class="top-name">${item.name}</span>
        <span class="top-count">${item.count}</span>
      </div>
    `).join('');
    }
    updateElement(id, value) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value.toString();
        }
    }
    setupEventListeners() {
        // Botão de atualizar
        const refreshBtn = document.getElementById('refreshStats');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.updateAllStatistics();
                // Feedback visual
                refreshBtn.classList.add('refreshing');
                setTimeout(() => refreshBtn.classList.remove('refreshing'), 500);
            });
        }
        // Botão de exportar
        const exportBtn = document.getElementById('exportStats');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                this.exportReport();
            });
        }
    }
    exportReport() {
        const report = this.controlCenter.statisticsService.generateReport();
        // Criar e baixar arquivo de texto
        const blob = new Blob([report], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `relatorio-centro-controle-${new Date().toISOString().split('T')[0]}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        // Feedback
        const exportBtn = document.getElementById('exportStats');
        if (exportBtn) {
            exportBtn.textContent = '✅';
            setTimeout(() => {
                exportBtn.textContent = '📄';
            }, 2000);
        }
    }
    startAutoRefresh() {
        // Atualizar a cada 15 segundos
        this.updateInterval = window.setInterval(() => {
            this.updateAllStatistics();
        }, 15000);
    }
    destroy() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }
    }
    refresh() {
        this.updateAllStatistics();
    }
}
