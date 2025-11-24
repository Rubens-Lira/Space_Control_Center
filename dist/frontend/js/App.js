import { Terminal } from './Terminal.js';
import { Triagem } from './Triagem.js';
import { PriorityChart } from './PriorityChart.js';
import { Registrations } from './Registrations.js';
import { SpaceControlCenter } from '../../backend/SpaceControlCenter.js';
import { Especialista } from './Especialista.js';
class SpaceControlApp {
    constructor() {
        this.controlCenter = new SpaceControlCenter();
        this.terminal = new Terminal(this.controlCenter);
        this.triagem = new Triagem(this.controlCenter);
        this.priorityChart = new PriorityChart(this.controlCenter);
        this.registrations = new Registrations(this.controlCenter);
        this.especialista = new Especialista(this.controlCenter);
        this.initializeApp();
    }
    initializeApp() {
        console.log('🚀 Centro de Controle Espacial Iniciado');
        // Inicializar componentes (cada um gerencia seu próprio refresh)
        this.terminal.initialize();
        this.triagem.initialize();
        this.priorityChart.initialize();
        this.registrations.initialize();
        this.especialista.initialize();
        // Apenas componentes que precisam de coordenação central
        this.startRealTimeUpdates();
    }
    startRealTimeUpdates() {
        setInterval(() => {
            // Apenas componentes que precisam de sincronização central
            this.priorityChart.update();
            this.terminal.updateQueueStatus();
            // Triagem e Especialista se auto-gerenciam internamente
        }, 5000);
    }
}
// Inicializar a aplicação quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    new SpaceControlApp();
});
