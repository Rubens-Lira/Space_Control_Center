import { Terminal } from './Terminal.js';
import { Triagem } from './Triagem.js';
import { PriorityChart } from './PriorityChart.js';
import { SpaceControlCenter } from '../../backend/SpaceControlCenter.js';

class SpaceControlApp {
  private controlCenter: SpaceControlCenter;
  private terminal: Terminal;
  private triagem: Triagem;
  private priorityChart: PriorityChart;

  constructor() {
    this.controlCenter = new SpaceControlCenter();
    this.terminal = new Terminal(this.controlCenter);
    this.triagem = new Triagem(this.controlCenter);
    this.priorityChart = new PriorityChart(this.controlCenter);

    this.initializeApp();
  }

  private initializeApp(): void {
    console.log('🚀 Centro de Controle Espacial Iniciado');

    // Inicializar componentes
    this.terminal.initialize();
    this.triagem.initialize();
    this.priorityChart.initialize();

    // Atualizar dados em tempo real
    this.startRealTimeUpdates();
  }

  private startRealTimeUpdates(): void {
    setInterval(() => {
      this.priorityChart.update();
      this.terminal.updateQueueStatus();
    }, 5000);
  }
}

// Inicializar a aplicação
new SpaceControlApp();