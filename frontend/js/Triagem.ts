import { SpaceControlCenter } from "../../backend/SpaceControlCenter.js";
import { Priority } from "../../backend/enums/Priority.js";
import { Ticket } from "../../backend/models/Ticket.js";
import { Receptionist } from "../../backend/models/Receptionist.js";

export class Triagem {
  private controlCenter: SpaceControlCenter;
  private currentTicket: Ticket | null = null;

  constructor(controlCenter: SpaceControlCenter) {
    this.controlCenter = controlCenter;
  }

  public initialize(): void {
    this.setupNavigation();
    this.setupTabs();
    this.loadReceptionists();
    this.updateDisplay();
    this.startAutoRefresh();
  }

  private setupNavigation(): void {
    const navButtons = document.querySelectorAll('.nav-btn');
    navButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        const target = e.target as HTMLButtonElement;
        const module = target.dataset.module;

        // Remover classe active de todos os botões
        navButtons.forEach(btn => btn.classList.remove('active'));
        // Adicionar classe active ao botão clicado
        target.classList.add('active');

        // Mostrar módulo correspondente
        this.showModule(module!);
      });
    });
  }

  private showModule(moduleName: string): void {
    // Esconder todos os módulos
    const modules = document.querySelectorAll('.module-content');
    modules.forEach(module => module.classList.remove('active'));

    // Mostrar módulo selecionado
    const targetModule = document.getElementById(moduleName);
    targetModule?.classList.add('active');
  }

  private setupTabs(): void {
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        const target = e.target as HTMLButtonElement;
        const priority = target.dataset.priority;

        // Atualizar tabs
        tabButtons.forEach(btn => btn.classList.remove('active'));
        target.classList.add('active');

        // Atualizar lista de tickets
        this.updateTicketsList(priority!);
      });
    });
  }

  private loadReceptionists(): void {
    const select = document.getElementById('triagemReceptionist') as HTMLSelectElement;
    if (!select) return;

    select.innerHTML = '';

    const receptionists = this.controlCenter.receptionistService.getAllReceptionists();
    receptionists.forEach(receptionist => {
      const option = document.createElement('option');
      option.value = receptionist.getId().toString();
      option.textContent = receptionist.getName();
      select.appendChild(option);
    });
  }

  private updateDisplay(): void {
    this.updateStats();
    this.updateTicketsList('all');
  }

  private updateStats(): void {
    const queueElement = document.getElementById('triagemQueue');
    const emergenciesElement = document.getElementById('triagemEmergencies');

    if (queueElement && emergenciesElement) {
      const stats = this.controlCenter.ticketService.getQueueStats();
      queueElement.textContent = `Fila: ${stats.total} tickets`;
      emergenciesElement.textContent = `Emergências: ${stats.emergency}`;
    }
  }

  private updateTicketsList(priorityFilter: string): void {
    const ticketsList = document.getElementById('ticketsList');
    if (!ticketsList) return;

    ticketsList.innerHTML = '';

    const allTickets = this.controlCenter.ticketService.getAllTickets();

    // Filtrar tickets: apenas não designados para especialistas e não completados
    const pendingTickets = allTickets.filter(ticket =>
      !ticket.getSpecialistId() && !ticket.isCompleted()
    );

    // Ordenar por prioridade (EMERGENCY primeiro)
    const sortedTickets = pendingTickets.sort((a, b) => {
      const priorityOrder = { 'EMERGENCY': 0, 'HIGH': 1, 'NORMAL': 2 };
      return priorityOrder[a.getPriority()] - priorityOrder[b.getPriority()];
    });

    // Aplicar filtro
    const filteredTickets = priorityFilter === 'all'
      ? sortedTickets
      : sortedTickets.filter(ticket => ticket.getPriority() === priorityFilter);

    if (filteredTickets.length === 0) {
      ticketsList.innerHTML = '<p class="no-tickets">Nenhum ticket encontrado</p>';
      return;
    }

    filteredTickets.forEach(ticket => {
      const ticketElement = this.createTicketElement(ticket);
      ticketsList.appendChild(ticketElement);
    });
  }

  private createTicketElement(ticket: Ticket): HTMLDivElement {
    const ticketDiv = document.createElement('div');
    ticketDiv.className = `ticket-item ${ticket.getPriority().toLowerCase()}`;
    ticketDiv.setAttribute('data-ticket-id', ticket.getId().toString());

    const priorityLabel = this.getPriorityLabel(ticket.getPriority());
    const timeAgo = this.getTimeAgo(ticket.getCreatedAt());

    ticketDiv.innerHTML = `
      <div class="ticket-header">
        <span class="ticket-id">Ticket #${ticket.getId()}</span>
        <span class="ticket-priority ${ticket.getPriority().toLowerCase()}">${priorityLabel}</span>
      </div>
      <div class="ticket-description">${ticket.getDescription()}</div>
      <div class="ticket-meta">
        <span>Nave ID: ${ticket.getSpaceshipId()}</span>
        <span>${timeAgo}</span>
      </div>
      ${ticket.getHumansInvolved() ? '<div class="ticket-humans">🧑‍🚀 Humanos envolvidos</div>' : ''}
    `;

    ticketDiv.addEventListener('click', () => {
      this.selectTicket(ticket);
    });

    return ticketDiv;
  }

  private selectTicket(ticket: Ticket): void {
    this.currentTicket = ticket;
    this.showTicketDetails(ticket);

    // Destacar ticket selecionado
    document.querySelectorAll('.ticket-item').forEach(item => {
      item.classList.remove('selected');
    });
    document.querySelector(`[data-ticket-id="${ticket.getId()}"]`)?.classList.add('selected');
  }

  private showTicketDetails(ticket: Ticket): void {
    const currentTicketElement = document.getElementById('currentTicket');
    const atendimentoForm = document.getElementById('atendimentoForm') as HTMLFormElement;

    if (!currentTicketElement || !atendimentoForm) return;

    // Mostrar formulário e esconder "nenhum ticket"
    currentTicketElement.classList.add('hidden');
    atendimentoForm.classList.remove('hidden');

    // Preencher dados do ticket no formulário
    (document.getElementById('triagemSpaceshipName') as HTMLInputElement).value = `Nave ${ticket.getSpaceshipId()}`;
    (document.getElementById('triagemMissionCode') as HTMLInputElement).value = `MISS-${ticket.getSpaceshipId()}`;
    (document.getElementById('triagemOrbitalSector') as HTMLInputElement).value = 'Setor Alpha';
    (document.getElementById('triagemDescription') as HTMLTextAreaElement).value = ticket.getDescription();
    (document.getElementById('triagemHumansInvolved') as HTMLInputElement).checked = ticket.getHumansInvolved();

    // Configurar submit do formulário
    atendimentoForm.onsubmit = (e) => {
      e.preventDefault();
      this.finalizarTriagem(ticket);
    };

    // Configurar botão de designar
    const assignButton = document.querySelector('.btn-assign') as HTMLButtonElement;
    if (assignButton) {
      assignButton.onclick = () => {
        this.designarParaEspecialista(ticket);
      };
    }

    // Configurar botão de cancelar
    const cancelButton = document.querySelector('.btn-cancel') as HTMLButtonElement;
    if (cancelButton) {
      cancelButton.onclick = () => {
        this.cancelarAtendimento();
      };
    }
  }

  private finalizarTriagem(ticket: Ticket): void {
    alert(`✅ Triagem finalizada para Ticket #${ticket.getId()}`);
    this.cancelarAtendimento();
    this.updateDisplay();
  }

  private designarParaEspecialista(ticket: Ticket): void {
    const specialists = this.controlCenter.specialistService.getAllSpecialists();
    if (specialists.length > 0) {
      const specialist = specialists[0];
      const success = this.controlCenter.specialistService.assignTicketToSpecialist(
        ticket.getId(),
        specialist.getId()
      );

      if (success) {
        alert(`✅ Ticket #${ticket.getId()} designado para ${specialist.getName()}`);
        this.cancelarAtendimento();
        this.updateDisplay();
      } else {
        alert('❌ Erro ao designar ticket');
      }
    } else {
      alert('❌ Nenhum especialista disponível');
    }
  }

  private cancelarAtendimento(): void {
    this.currentTicket = null;

    const currentTicketElement = document.getElementById('currentTicket');
    const atendimentoForm = document.getElementById('atendimentoForm') as HTMLFormElement;

    if (currentTicketElement && atendimentoForm) {
      currentTicketElement.classList.remove('hidden');
      atendimentoForm.classList.add('hidden');
      atendimentoForm.reset();
    }

    // Remover destaque dos tickets
    document.querySelectorAll('.ticket-item').forEach(item => {
      item.classList.remove('selected');
    });
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
    setInterval(() => {
      this.updateDisplay();
    }, 10000);
  }
}