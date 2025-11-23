export class PriorityChart {
  constructor(controlCenter) {
    this.controlCenter = controlCenter;
    this.chartElement = document.getElementById('priorityChart');
  }

  initialize() {
    console.log('📊 Gráfico de Prioridades Inicializado');
    this.update();
  }

  update() {
    if (!this.chartElement) return;

    const stats = this.controlCenter.ticketService.getQueueStats();
    
    // Simulação de dados para o gráfico
    const data = [
      { priority: 'EMERGENCY', count: stats.emergency, color: '#ff4444' },
      { priority: 'HIGH', count: stats.highPriority, color: '#ffaa00' },
      { priority: 'NORMAL', count: stats.normal, color: '#44ff44' }
    ];

    this.renderChart(data);
  }

  renderChart(data) {
    // Implementação básica do gráfico
    // Em uma versão real, usaria D3.js ou Chart.js
    this.chartElement.innerHTML = `
      <div class="chart-container">
        <h3>Distribuição de Prioridades</h3>
        <div class="chart-bars">
          ${data.map(item => `
            <div class="chart-bar">
              <div class="bar" style="height: ${item.count * 20}px; background-color: ${item.color}"></div>
              <span class="bar-label">${item.priority}</span>
              <span class="bar-value">${item.count}</span>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }
}