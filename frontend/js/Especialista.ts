import { SpaceControlCenter } from "../../backend/SpaceControlCenter.js";
import { Priority } from "../../backend/enums/Priority.js";
import { Ticket } from "../../backend/models/Ticket.js";
import { Specialist } from "../../backend/models/Specialist.js";

export class Especialista {
  private controlCenter: SpaceControlCenter;
  private currentSpecialist: Specialist | null = null;
  private currentTicket: Ticket | null = null;
  private autoRefreshInterval: number | null = null;

  constructor(controlCenter: SpaceControlCenter) {
    this.controlCenter = controlCenter;
  }

  public initialize(): void {
    this.setupNavigation();
    this.loadEspecialistasSelect();
    this.setupEventListeners();
    this.startAutoRefresh();
  }

  public cleanup(): void {
    if (this.autoRefreshInterval) {
      clearInterval(this.autoRefreshInterval);
    }
  }

  private setupNavigation(): void {
    const navButtons = document.querySelectorAll('.nav-btn');
    navButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        const target = e.target as HTMLButtonElement;
        const module = target.dataset.module;

        if (module === 'especialista') {
          navButtons.forEach(btn => btn.classList.remove('active'));
          target.classList.add('active');
          this.showModule(module);
          this.updateDisplay();
        }
      });
    });
  }

  private showModule(moduleName: string): void {
    const modules = document.querySelectorAll('.module-content');
    modules.forEach(module => module.classList.remove('active'));
    const targetModule = document.getElementById(moduleName);
    targetModule?.classList.add('active');
  }

  private loadEspecialistasSelect(): void {
    const selectEspecialista = document.getElementById('selectEspecialista') as HTMLSelectElement;
    if (!selectEspecialista) return;

    const specialists = this.controlCenter.specialistService.getAllSpecialists();

    selectEspecialista.innerHTML = '<option value="">Selecione um especialista...</option>';

    specialists.forEach(specialist => {
      const option = document.createElement('option');
      option.value = specialist.getId().toString();
      option.textContent = `👩‍🔬 ${specialist.getName()} - ${this.getSpecialtyLabel(specialist.getSpecialty())}`;
      selectEspecialista.appendChild(option);
    });

    // Event listener para quando selecionar um especialista
    selectEspecialista.addEventListener('change', (e) => {
      const target = e.target as HTMLSelectElement;
      const specialistId = target.value;

      if (specialistId) {
        const specialist = this.controlCenter.specialistService.getSpecialistById(parseInt(specialistId));
        if (specialist) {
          this.currentSpecialist = specialist;
          this.loadTicketsEspecialista(specialist.getId());
        }
      } else {
        this.currentSpecialist = null;
        this.clearTicketsList();
      }
    });
  }

  private loadTicketsEspecialista(specialistId: number): void {
    const ticketsList = document.getElementById('ticketsListEspecialista');
    const ticketsPendentes = document.getElementById('ticketsPendentes');
    const ticketsConcluidos = document.getElementById('ticketsConcluidos');

    if (!ticketsList || !ticketsPendentes || !ticketsConcluidos) return;

    const allTickets = this.controlCenter.specialistService.getSpecialistTickets(specialistId);
    const pendingTickets = allTickets.filter(ticket => !ticket.isCompleted());
    const completedTickets = allTickets.filter(ticket => ticket.isCompleted());

    ticketsPendentes.textContent = `Pendentes: ${pendingTickets.length}`;
    ticketsConcluidos.textContent = `Concluídos: ${completedTickets.length}`;

    ticketsList.innerHTML = '';

    if (allTickets.length === 0) {
      ticketsList.innerHTML = '<p class="no-tickets">Nenhum ticket designado para este especialista</p>';
      return;
    }

    // Mostrar tickets pendentes primeiro
    pendingTickets.forEach(ticket => {
      const ticketElement = this.createTicketEspecialistaElement(ticket, false);
      ticketsList.appendChild(ticketElement);
    });

    completedTickets.forEach(ticket => {
      const ticketElement = this.createTicketEspecialistaElement(ticket, true);
      ticketsList.appendChild(ticketElement);
    });
  }

  private createTicketEspecialistaElement(ticket: Ticket, isCompleted: boolean): HTMLDivElement {
    const ticketDiv = document.createElement('div');
    ticketDiv.className = `ticket-especialista-item ${ticket.getPriority().toLowerCase()} ${isCompleted ? 'completed' : ''}`;
    ticketDiv.setAttribute('data-ticket-id', ticket.getId().toString());

    const priorityLabel = this.getPriorityLabel(ticket.getPriority());
    const timeAgo = this.getTimeAgo(ticket.getCreatedAt());
    const status = isCompleted ? 'Concluído' : 'Pendente';
    const statusClass = isCompleted ? 'status-concluido' : 'status-pendente';

    const spaceship = this.controlCenter.spaceshipService.getSpaceshipById(ticket.getSpaceshipId());

    ticketDiv.innerHTML = `
      <div class="ticket-especialista-header">
        <span class="ticket-id">Ticket #${ticket.getId()}</span>
        <span class="ticket-especialista-priority ${ticket.getPriority()}">${priorityLabel}</span>
      </div>
      <div class="ticket-description">${ticket.getDescription()}</div>
      <div class="ticket-especialista-meta">
        <span>🚀 ${spaceship?.getName() || 'Nave não encontrada'}</span>
        <span>${timeAgo}</span>
      </div>
      <div class="ticket-especialista-status">
        <span class="${statusClass}">${status}</span>
      </div>
      ${ticket.getHumansInvolved() ? '<div class="ticket-humans">🧑‍🚀 Humanos envolvidos</div>' : ''}
    `;

    if (!isCompleted) {
      ticketDiv.addEventListener('click', () => {
        this.selectTicketForAtendimento(ticket);
      });
    }

    return ticketDiv;
  }

  private selectTicketForAtendimento(ticket: Ticket): void {
    this.currentTicket = ticket;
    this.showTicketDetails(ticket);

    document.querySelectorAll('.ticket-especialista-item').forEach(item => {
      item.classList.remove('selected');
    });
    document.querySelector(`[data-ticket-id="${ticket.getId()}"]`)?.classList.add('selected');
  }

  private showTicketDetails(ticket: Ticket): void {
    const currentAtendimento = document.getElementById('currentAtendimento');
    const atendimentoForm = document.getElementById('atendimentoEspecialistaForm') as HTMLFormElement;

    if (!currentAtendimento || !atendimentoForm) return;

    currentAtendimento.classList.add('hidden');
    atendimentoForm.classList.remove('hidden');

    const spaceship = this.controlCenter.spaceshipService.getSpaceshipById(ticket.getSpaceshipId());

    // Preencher dados do ticket no formulário
    (document.getElementById('especialistaNave') as HTMLInputElement).value = spaceship?.getName() || 'Nave não encontrada';
    (document.getElementById('especialistaTicket') as HTMLInputElement).value = `#${ticket.getId()}`;
    (document.getElementById('especialistaPrioridade') as HTMLInputElement).value = this.getPriorityLabel(ticket.getPriority());
    (document.getElementById('especialistaSetor') as HTMLInputElement).value = spaceship?.getOrbitalSector() || 'N/A';
    (document.getElementById('especialistaDescricao') as HTMLTextAreaElement).value = ticket.getDescription();
    (document.getElementById('especialistaTripulacao') as HTMLInputElement).checked = ticket.getHumansInvolved();

    // Limpar campo de solução
    (document.getElementById('especialistaSolucao') as HTMLTextAreaElement).value = '';
  }

  private setupEventListeners(): void {
    // Botão Finalizar Atendimento
    const btnFinalizar = document.getElementById('btnFinalizarAtendimento');
    if (btnFinalizar) {
      btnFinalizar.addEventListener('click', () => {
        this.finalizarAtendimento();
      });
    }

    // Botão Cancelar
    const btnCancel = document.querySelector('.btn-cancel');
    if (btnCancel) {
      btnCancel.addEventListener('click', () => {
        this.cancelarAtendimento();
      });
    }
  }

  private finalizarAtendimento(): void {
    if (!this.currentSpecialist || !this.currentTicket) {
      alert('Selecione um especialista e um ticket primeiro!');
      return;
    }

    const solucaoInput = document.getElementById('especialistaSolucao') as HTMLTextAreaElement;
    const solucao = solucaoInput.value.trim();

    if (!solucao) {
      alert('Por favor, descreva a solução aplicada antes de finalizar o atendimento!');
      solucaoInput.focus();
      return;
    }

    if (confirm(`Finalizar atendimento do Ticket #${this.currentTicket.getId()}?\n\nSolução: ${solucao}`)) {
      try {
        const success = this.controlCenter.specialistService.completeTicketForSpecialist(
          this.currentSpecialist.getId(),
          this.currentTicket.getId()
        );

        if (success) {
          alert(`✅ Atendimento finalizado com sucesso!\nTicket #${this.currentTicket.getId()}\nEspecialista: ${this.currentSpecialist.getName()}`);

          // Registrar no histórico
          this.registrarNoHistorico(this.currentTicket, solucao);

          // Atualizar a lista de tickets
          if (this.currentSpecialist) {
            this.loadTicketsEspecialista(this.currentSpecialist.getId());
          }

          this.cancelarAtendimento();
        } else {
          alert('❌ Erro ao finalizar atendimento');
        }
      } catch (error) {
        alert(`❌ Erro ao finalizar atendimento: ${error}`);
      }
    }
  }

  private cancelarAtendimento(): void {
    this.currentTicket = null;

    const currentAtendimento = document.getElementById('currentAtendimento');
    const atendimentoForm = document.getElementById('atendimentoEspecialistaForm') as HTMLFormElement;

    if (currentAtendimento && atendimentoForm) {
      currentAtendimento.classList.remove('hidden');
      atendimentoForm.classList.add('hidden');
    }

    // Remover destaque dos tickets
    document.querySelectorAll('.ticket-especialista-item').forEach(item => {
      item.classList.remove('selected');
    });
  }

  private clearTicketsList(): void {
    const ticketsList = document.getElementById('ticketsListEspecialista');
    const ticketsPendentes = document.getElementById('ticketsPendentes');
    const ticketsConcluidos = document.getElementById('ticketsConcluidos');

    if (ticketsList) ticketsList.innerHTML = '<p class="no-tickets">Selecione um especialista para ver os tickets</p>';
    if (ticketsPendentes) ticketsPendentes.textContent = 'Pendentes: 0';
    if (ticketsConcluidos) ticketsConcluidos.textContent = 'Concluídos: 0';
  }

  private registrarNoHistorico(ticket: Ticket, solucao: string): void {
    const historicoList = document.getElementById('historicoList');
    if (!historicoList) return;

    const historicoItem = document.createElement('div');
    historicoItem.className = 'historico-item';

    const spaceship = this.controlCenter.spaceshipService.getSpaceshipById(ticket.getSpaceshipId());
    const specialist = this.currentSpecialist;

    historicoItem.innerHTML = `
      <div class="historico-header">
        <span class="historico-nave">🚀 ${spaceship?.getName() || 'Nave não encontrada'} - Ticket #${ticket.getId()}</span>
        <span class="historico-tempo">${new Date().toLocaleTimeString()}</span>
      </div>
      <div class="historico-descricao">
        <strong>Problema:</strong> ${ticket.getDescription()}
      </div>
      <div class="historico-solucao">
        <strong>Solução:</strong> ${solucao}
      </div>
      <div class="historico-meta">
        <small>👩‍🔬 ${specialist?.getName()} • ${this.getPriorityLabel(ticket.getPriority())} ${ticket.getHumansInvolved() ? '• 🧑‍🚀 Humanos envolvidos' : ''}</small>
      </div>
    `;

    // Adicionar no início da lista
    historicoList.insertBefore(historicoItem, historicoList.firstChild);

    // Manter apenas os últimos 10 itens
    const items = historicoList.querySelectorAll('.historico-item');
    if (items.length > 10) {
      historicoList.removeChild(items[items.length - 1]);
    }
  }

  private updateDisplay(): void {
    this.updateStats();
  }

  private updateStats(): void {
    const ativosElement = document.getElementById('especialistaAtivos');
    const ocupadosElement = document.getElementById('especialistaOcupados');
    const filaElement = document.getElementById('especialistaFila');

    if (ativosElement && ocupadosElement && filaElement) {
      const specialists = this.controlCenter.specialistService.getAllSpecialists();
      let ocupados = 0;
      let totalFila = 0;

      specialists.forEach(specialist => {
        const pendingTickets = this.controlCenter.specialistService.getSpecialistPendingTickets(specialist.getId());
        totalFila += pendingTickets.length;
        if (pendingTickets.length > 0) {
          ocupados++;
        }
      });

      ativosElement.textContent = `Especialistas: ${specialists.length}`;
      ocupadosElement.textContent = `Ocupados: ${ocupados}`;
      filaElement.textContent = `Fila: ${totalFila} tickets`;
    }
  }

  private getSpecialtyLabel(specialty: string): string {
    const specialties: { [key: string]: string } = {
      'COMMUNICATIONS': '📡 Comunicações',
      'POWER': '⚡ Sistemas de Energia',
      'NAVIGATION': '🧭 Navegação',
      'LIFE_SUPPORT': '💨 Suporte de Vida'
    };
    return specialties[specialty] || specialty;
  }

  private getPriorityLabel(priority: Priority): string {
    const labels = {
      'EMERGENCY': '🟥 EMERGÊNCIA',
      'HIGH': '🟧 ALTA',
      'NORMAL': '🟩 NORMAL'
    };
    return labels[priority];
  }

  private getTimeAgo(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Agora mesmo';
    if (diffMins < 60) return `${diffMins} min atrás`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} h atrás`;

    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} dias atrás`;
  }

  private startAutoRefresh(): void {
    this.autoRefreshInterval = setInterval(() => {
      this.updateDisplay();
      // Atualizar a lista de tickets se houver um especialista selecionado
      if (this.currentSpecialist) {
        this.loadTicketsEspecialista(this.currentSpecialist.getId());
      }
    }, 10000); // Atualiza a cada 10 segundos
  }
}