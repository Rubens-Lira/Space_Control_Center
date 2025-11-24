import { SpaceControlCenter } from "../../backend/SpaceControlCenter.js";
import { Priority } from "../../backend/enums/Priority.js";
import { Ticket } from "../../backend/models/Ticket.js";
import { Receptionist } from "../../backend/models/Receptionist.js";

export class Triagem {
  private controlCenter: SpaceControlCenter;
  private currentTicket: Ticket | null = null;
  private autoRefreshInterval: number | null = null;

  constructor(controlCenter: SpaceControlCenter) {
    this.controlCenter = controlCenter;
  }

  public initialize(): void {
    this.setupNavigation();
    this.setupTabs();
    this.loadReceptionists();
    this.loadSpecialists();
    this.updateDisplay();
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

        navButtons.forEach(btn => btn.classList.remove('active'));
        target.classList.add('active');
        this.showModule(module!);
      });
    });
  }

  private showModule(moduleName: string): void {
    const modules = document.querySelectorAll('.module-content');
    modules.forEach(module => module.classList.remove('active'));
    const targetModule = document.getElementById(moduleName);
    targetModule?.classList.add('active');
  }

  private setupTabs(): void {
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        const target = e.target as HTMLButtonElement;
        const priority = target.dataset.priority;

        tabButtons.forEach(btn => btn.classList.remove('active'));
        target.classList.add('active');
        this.updateTicketsList(priority!);
      });
    });
  }

  private loadReceptionists(): void {
    const receptionistSelect = document.getElementById('triagemReceptionist') as HTMLSelectElement;
    if (!receptionistSelect) return;

    const receptionists = this.controlCenter.receptionistService.getAllReceptionists();

    receptionistSelect.innerHTML = '<option value="">Selecione o recepcionista</option>';

    if (receptionists.length === 0) {
      receptionistSelect.innerHTML = '<option value="">Nenhum recepcionista disponível</option>';
      return;
    }

    receptionists.forEach(receptionist => {
      const option = document.createElement('option');
      option.value = receptionist.getId().toString();
      option.textContent = `👨‍💼 ${receptionist.getName()}`;
      receptionistSelect.appendChild(option);
    });
  }

  private loadSpecialists(): void {
    const specialistSelect = document.getElementById('triagemSpecialist') as HTMLSelectElement;
    if (!specialistSelect) return;

    const specialists = this.controlCenter.specialistService.getAllSpecialists();

    specialistSelect.innerHTML = '<option value="">Selecione um especialista</option>';

    if (specialists.length === 0) {
      specialistSelect.innerHTML = '<option value="">Nenhum especialista disponível</option>';
      return;
    }

    specialists.forEach(specialist => {
      const option = document.createElement('option');
      option.value = specialist.getId().toString();
      option.textContent = `👩‍🔬 ${specialist.getName()} - ${this.getSpecialtyLabel(specialist.getSpecialty())}`;
      specialistSelect.appendChild(option);
    });
  }

  private getSpecialtyLabel(specialty: string): string {
    const specialties: { [key: string]: string } = {
      'COMMUNICATIONS': 'Comunicações',
      'POWER': 'Sistemas de Energia',
      'NAVIGATION': 'Navegação',
      'LIFE_SUPPORT': 'Suporte de Vida'
    };
    return specialties[specialty] || specialty;
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

    const spaceship = this.controlCenter.spaceshipService.getSpaceshipById(ticket.getSpaceshipId());

    ticketDiv.innerHTML = `
      <div class="ticket-header">
        <span class="ticket-id">Ticket #${ticket.getId()}</span>
        <span class="ticket-priority ${ticket.getPriority().toLowerCase()}">${priorityLabel}</span>
      </div>
      <div class="ticket-description">${ticket.getDescription()}</div>
      <div class="ticket-meta">
        <span>🚀 ${spaceship?.getName() || 'Nave não encontrada'}</span>
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

    document.querySelectorAll('.ticket-item').forEach(item => {
      item.classList.remove('selected');
    });
    document.querySelector(`[data-ticket-id="${ticket.getId()}"]`)?.classList.add('selected');
  }

  private showTicketDetails(ticket: Ticket): void {
    const currentTicketElement = document.getElementById('currentTicket');
    const atendimentoForm = document.getElementById('atendimentoForm') as HTMLFormElement;

    if (!currentTicketElement || !atendimentoForm) return;

    currentTicketElement.classList.add('hidden');
    atendimentoForm.classList.remove('hidden');

    const spaceship = this.controlCenter.spaceshipService.getSpaceshipById(ticket.getSpaceshipId());

    // Preencher dados do ticket no formulário
    (document.getElementById('triagemSpaceshipName') as HTMLInputElement).value = spaceship?.getName() || 'Nave não encontrada';
    (document.getElementById('triagemMissionCode') as HTMLInputElement).value = spaceship?.getMissionCode() || 'N/A';
    (document.getElementById('triagemOrbitalSector') as HTMLInputElement).value = spaceship?.getOrbitalSector() || 'N/A';
    (document.getElementById('triagemPriority') as HTMLInputElement).value = this.getPriorityLabel(ticket.getPriority());
    (document.getElementById('triagemDescription') as HTMLTextAreaElement).value = ticket.getDescription();
    (document.getElementById('triagemHumansInvolved') as HTMLInputElement).checked = ticket.getHumansInvolved();

    // Recarregar selects
    this.loadReceptionists();
    this.loadSpecialists();

    // Configurar botão de finalizar
    const completeButton = document.querySelector('.btn-complete') as HTMLButtonElement;
    if (completeButton) {
      completeButton.onclick = () => {
        this.finalizarTriagem(ticket);
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
    const receptionistSelect = document.getElementById('triagemReceptionist') as HTMLSelectElement;
    const specialistSelect = document.getElementById('triagemSpecialist') as HTMLSelectElement;

    // Validações
    if (!receptionistSelect.value) {
      alert('Selecione o recepcionista que está realizando a triagem!');
      return;
    }

    if (!specialistSelect.value) {
      alert('Selecione um especialista antes de finalizar a triagem!');
      return;
    }

    const receptionistId = parseInt(receptionistSelect.value);
    const specialistId = parseInt(specialistSelect.value);

    const receptionist = this.controlCenter.receptionistService.getReceptionistById(receptionistId);
    const specialist = this.controlCenter.specialistService.getSpecialistById(specialistId);

    if (!receptionist) {
      alert('Recepcionista selecionado não encontrado!');
      return;
    }

    if (!specialist) {
      alert('Especialista selecionado não encontrado!');
      return;
    }

    if (confirm(`Finalizar triagem do Ticket #${ticket.getId()}?\n\nRecepcionista: ${receptionist.getName()}\nEspecialista: ${specialist.getName()}\nEspecialidade: ${this.getSpecialtyLabel(specialist.getSpecialty())}`)) {
      try {
        // Designar o especialista ao ticket
        const success = this.controlCenter.specialistService.assignTicketToSpecialist(
          ticket.getId(),
          specialistId
        );

        if (success) {
          alert(`✅ Triagem finalizada com sucesso!\n\nTicket #${ticket.getId()}\nRecepcionista: ${receptionist.getName()}\nDesignado para: ${specialist.getName()}`);
          this.cancelarAtendimento();
          this.updateDisplay();
        } else {
          alert('❌ Erro ao finalizar triagem. O ticket pode já ter sido designado.');
        }
      } catch (error) {
        alert(`❌ Erro ao finalizar triagem: ${error}`);
      }
    }
  }

  private cancelarAtendimento(): void {
    this.currentTicket = null;

    const currentTicketElement = document.getElementById('currentTicket');
    const atendimentoForm = document.getElementById('atendimentoForm') as HTMLFormElement;

    if (currentTicketElement && atendimentoForm) {
      currentTicketElement.classList.remove('hidden');
      atendimentoForm.classList.add('hidden');

      // Resetar os selects
      const receptionistSelect = document.getElementById('triagemReceptionist') as HTMLSelectElement;
      const specialistSelect = document.getElementById('triagemSpecialist') as HTMLSelectElement;
      if (receptionistSelect) receptionistSelect.value = '';
      if (specialistSelect) specialistSelect.value = '';
    }

    // Remover destaque dos tickets
    document.querySelectorAll('.ticket-item').forEach(item => {
      item.classList.remove('selected');
    });
  }

  private getPriorityLabel(priority: Priority): string {
    const labels = {
      'EMERGENCY': '🟥 EMERGÊNCIA',
      'HIGH': '🟧 ALTA PRIORIDADE',
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
    }, 10000); // Atualiza a cada 10 segundos
  }
}