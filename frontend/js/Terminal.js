export class Terminal {
  constructor(controlCenter) {
    this.controlCenter = controlCenter;
    this.currentPriority = null;
  }

  initialize() {
    this.setupPriorityButtons();
    this.setupFormSubmission();
    this.setupCancelButton();
    this.updateQueueStatus();
  }

  setupPriorityButtons() {
    const buttons = document.querySelectorAll('.priority-buttons button');

    buttons.forEach(button => {
      button.addEventListener('click', (e) => {
        const target = e.target;
        this.currentPriority = target.dataset.priority;
        this.showRequestForm();
      });
    });
  }

  showRequestForm() {
    const form = document.getElementById('requestForm');
    const priorityButtons = document.querySelector('.priority-buttons');

    if (form) form.classList.remove('hidden');
    if (priorityButtons) priorityButtons.classList.add('hidden');
  }

  hideRequestForm() {
    const form = document.getElementById('requestForm');
    const priorityButtons = document.querySelector('.priority-buttons');

    if (form) form.classList.add('hidden');
    if (priorityButtons) priorityButtons.classList.remove('hidden');
    this.resetForm();
  }

  setupFormSubmission() {
    const form = document.getElementById('supportForm');

    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.processSupportRequest();
      });
    }
  }

  setupCancelButton() {
    const cancelBtn = document.getElementById('cancelBtn');

    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => {
        this.hideRequestForm();
      });
    }
  }

  processSupportRequest() {
    if (!this.currentPriority) return;

    const spaceshipName = document.getElementById('spaceshipName');
    const missionCode = document.getElementById('missionCode');
    const orbitalSector = document.getElementById('orbitalSector');
    const problemDescription = document.getElementById('problemDescription');
    const humansInvolved = document.getElementById('humansInvolved');

    // Verificar se elementos existem
    if (!spaceshipName || !missionCode || !orbitalSector || !problemDescription || !humansInvolved) {
      this.showErrorMessage('Formulário incompleto!');
      return;
    }

    // Aqui precisaríamos ter um Receptionist ativo
    // Por enquanto, usamos o primeiro recepcionista disponível
    const receptionists = this.controlCenter.receptionistService.getAllReceptionists();
    const receptionistId = receptionists.length > 0 ? receptionists[0].getId() : 1;

    // Criar a nave primeiro (em um sistema real, isso viria de um cadastro)
    const spaceshipId = this.controlCenter.ticketService.getAllTickets().length + 1;

    try {
      const ticket = this.controlCenter.receptionistService.processNewRequest(
        receptionistId,
        spaceshipId,
        problemDescription.value,
        humansInvolved.checked,
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

  showSuccessMessage(ticket) {
    alert(`✅ Solicitação criada com sucesso!\nTicket #${ticket.getId()}\nPrioridade: ${ticket.getPriority()}`);
  }

  showErrorMessage(message) {
    alert(`❌ ${message}`);
  }

  resetForm() {
    const form = document.getElementById('supportForm');
    if (form) {
      form.reset();
      this.currentPriority = null;
    }
  }

  updateQueueStatus() {
    const queueCountElement = document.getElementById('queueCount');
    if (queueCountElement) {
      const stats = this.controlCenter.ticketService.getQueueStats();
      queueCountElement.textContent = `Fila: ${stats.total} tickets (${stats.emergency} 🟥 ${stats.highPriority} 🟧 ${stats.normal} 🟩)`;
    }
  }
}