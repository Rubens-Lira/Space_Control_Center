import { SpaceControlCenter } from "../../backend/SpaceControlCenter.js";
import { Priority } from "../../backend/enums/Priority.js";

export class Terminal {
  private controlCenter: SpaceControlCenter;
  private currentPriority: Priority | null = null;

  constructor(controlCenter: SpaceControlCenter) {
    this.controlCenter = controlCenter;
  }

  public initialize(): void {
    this.setupPriorityButtons();
    this.setupFormSubmission();
    this.setupCancelButton();
    this.updateQueueStatus();
  }

  private setupPriorityButtons(): void {
    const buttons = document.querySelectorAll('.priority-buttons button');

    buttons.forEach(button => {
      button.addEventListener('click', (e) => {
        const target = e.target as HTMLButtonElement;
        this.currentPriority = target.dataset.priority as Priority;
        this.showRequestForm();
      });
    });
  }

  private showRequestForm(): void {
    const form = document.getElementById('requestForm');
    const priorityButtons = document.querySelector('.priority-buttons');

    form?.classList.remove('hidden');
    priorityButtons?.classList.add('hidden');
  }

  private hideRequestForm(): void {
    const form = document.getElementById('requestForm');
    const priorityButtons = document.querySelector('.priority-buttons');

    form?.classList.add('hidden');
    priorityButtons?.classList.remove('hidden');
    this.resetForm();
  }

  private setupFormSubmission(): void {
    const form = document.getElementById('supportForm') as HTMLFormElement;

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.processSupportRequest();
    });
  }

  private setupCancelButton(): void {
    const cancelBtn = document.getElementById('cancelBtn');

    cancelBtn?.addEventListener('click', () => {
      this.hideRequestForm();
    });
  }

  private processSupportRequest(): void {
    if (!this.currentPriority) return;

    const spaceshipName = (document.getElementById('spaceshipName') as HTMLInputElement).value;
    const missionCode = (document.getElementById('missionCode') as HTMLInputElement).value;
    const orbitalSector = (document.getElementById('orbitalSector') as HTMLInputElement).value;
    const problemDescription = (document.getElementById('problemDescription') as HTMLTextAreaElement).value;
    const humansInvolved = (document.getElementById('humansInvolved') as HTMLInputElement).checked;

    if (!spaceshipName.trim() || !missionCode.trim() || !orbitalSector.trim() || !problemDescription.trim()) {
      this.showErrorMessage('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    // Usar o primeiro recepcionista disponível
    const receptionists = this.controlCenter.receptionistService.getAllReceptionists();
    const receptionistId = receptionists.length > 0 ? receptionists[0].getId() : 1;

    // Gerar ID único para a nave
    const spaceshipId = Date.now();

    try {
      const ticket = this.controlCenter.receptionistService.processNewRequest(
        receptionistId,
        spaceshipId,
        `[${orbitalSector}] ${spaceshipName} - ${missionCode}: ${problemDescription}`,
        humansInvolved,
        this.currentPriority
      );

      if (ticket) {
        this.showSuccessMessage(ticket);
        this.hideRequestForm();
        this.updateQueueStatus();
      }
    } catch (error) {
      this.showErrorMessage('Erro ao processar solicitação: ' + error);
    }
  }

  private showSuccessMessage(ticket: any): void {
    alert(`✅ Solicitação criada com sucesso!\nTicket #${ticket.getId()}\nPrioridade: ${ticket.getPriority()}`);
  }

  private showErrorMessage(message: string): void {
    alert(`❌ ${message}`);
  }

  private resetForm(): void {
    const form = document.getElementById('supportForm') as HTMLFormElement;
    form.reset();
    this.currentPriority = null;
  }

  public updateQueueStatus(): void {
    const queueCountElement = document.getElementById('queueCount');
    if (queueCountElement) {
      const stats = this.controlCenter.ticketService.getQueueStats();
      queueCountElement.textContent = `Fila: ${stats.total} tickets (${stats.emergency} 🟥 ${stats.highPriority} 🟧 ${stats.normal} 🟩)`;
    }
  }
}