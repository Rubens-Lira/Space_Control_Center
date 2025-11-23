import { SpaceControlCenter } from "../../backend/SpaceControlCenter.js";

interface ChartData {
  priority: string;
  count: number;
  color: string;
}

export class PriorityChart {
  private controlCenter: SpaceControlCenter;
  private chartElement: HTMLElement | null;

  constructor(controlCenter: SpaceControlCenter) {
    this.controlCenter = controlCenter;
    this.chartElement = document.getElementById('priorityChart');
  }

  public initialize(): void {
    console.log('📊 Gráfico de Prioridades Inicializado');
    this.update();
  }

  public update(): void {
    if (!this.chartElement) {
      console.warn('Elemento do gráfico não encontrado');
      return;
    }

    const stats = this.controlCenter.ticketService.getQueueStats();

    const data: ChartData[] = [
      { priority: 'EMERGENCY', count: stats.emergency, color: '#ff4444' },
      { priority: 'HIGH', count: stats.highPriority, color: '#ffaa00' },
      { priority: 'NORMAL', count: stats.normal, color: '#44ff44' }
    ];

    this.renderChart(data);
  }

  private renderChart(data: ChartData[]): void {
    if (!this.chartElement) return;

    // Calcular altura máxima para escalar o gráfico
    const maxCount = Math.max(...data.map(item => item.count), 1);
    const maxHeight = 150;

    this.chartElement.innerHTML = `
      <div class="chart-container">
        <h3>Distribuição de Prioridades</h3>
        <div class="chart-bars">
          ${data.map(item => `
            <div class="chart-bar">
              <div class="bar" style="height: ${(item.count / maxCount) * maxHeight}px; background-color: ${item.color}"></div>
              <span class="bar-label">${this.getPriorityLabel(item.priority)}</span>
              <span class="bar-value">${item.count}</span>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  private getPriorityLabel(priority: string): string {
    const labels: { [key: string]: string } = {
      'EMERGENCY': 'EMERGÊNCIA',
      'HIGH': 'ALTA',
      'NORMAL': 'NORMAL'
    };
    return labels[priority] || priority;
  }
}