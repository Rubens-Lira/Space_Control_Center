import { Terminal } from './Terminal.js';
import { Triagem } from './Triagem.js';
import { PriorityChart } from './PriorityChart.js';
import { Registrations } from './Registrations.js';
import { SpaceControlCenter } from '../../backend/SpaceControlCenter.js';
import { Especialista } from './Especialista.js';
import { StatisticsPanel } from './StatisticsPainel.js';

class SpaceControlApp {
  private controlCenter: SpaceControlCenter;
  private terminal: Terminal;
  private triagem: Triagem;
  private priorityChart: PriorityChart;
  private registrations: Registrations;
  private especialista: Especialista;
  private statisticsPanel: StatisticsPanel;

  constructor() {
    this.controlCenter = new SpaceControlCenter();
    this.terminal = new Terminal(this.controlCenter);
    this.triagem = new Triagem(this.controlCenter);
    this.priorityChart = new PriorityChart(this.controlCenter);
    this.registrations = new Registrations(this.controlCenter);
    this.especialista = new Especialista(this.controlCenter);
    this.statisticsPanel = new StatisticsPanel(this.controlCenter);

    this.initializeApp();
  }

  private initializeApp(): void {
    console.log('🚀 Centro de Controle Espacial Iniciado');

    // Inicializar componentes
    this.terminal.initialize();
    this.triagem.initialize();
    this.priorityChart.initialize();
    this.registrations.initialize();
    this.especialista.initialize();
    this.statisticsPanel.initialize();

    // Iniciar atualizações em tempo real
    this.startRealTimeUpdates();
  }

  private startRealTimeUpdates(): void {
    setInterval(() => {
      this.priorityChart.update();
      this.terminal.updateQueueStatus();
      this.statisticsPanel.refresh();
    }, 10000); // Atualizar a cada 10 segundos
  }
}

// Inicializar a aplicação quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
  new SpaceControlApp();
});