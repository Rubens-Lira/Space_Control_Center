export class Terminal {
    constructor(controlCenter) {
        this.currentPriority = null;
        this.controlCenter = controlCenter;
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
        form?.classList.remove('hidden');
        priorityButtons?.classList.add('hidden');
    }
    hideRequestForm() {
        const form = document.getElementById('requestForm');
        const priorityButtons = document.querySelector('.priority-buttons');
        form?.classList.add('hidden');
        priorityButtons?.classList.remove('hidden');
        this.resetForm();
    }
    setupFormSubmission() {
        const form = document.getElementById('supportForm');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.processSupportRequest();
        });
    }
    setupCancelButton() {
        const cancelBtn = document.getElementById('cancelBtn');
        cancelBtn?.addEventListener('click', () => {
            this.hideRequestForm();
        });
    }
    processSupportRequest() {
        if (!this.currentPriority)
            return;
        const spaceshipName = document.getElementById('spaceshipName').value;
        const missionCode = document.getElementById('missionCode').value;
        const orbitalSector = document.getElementById('orbitalSector').value;
        const problemDescription = document.getElementById('problemDescription').value;
        const humansInvolved = document.getElementById('humansInvolved').checked;
        // Aqui precisaríamos ter um Receptionist ativo
        // Por enquanto, usamos o primeiro recepcionista disponível
        const receptionists = this.controlCenter.receptionistService.getAllReceptionists();
        const receptionistId = receptionists.length > 0 ? receptionists[0].getId() : 1;
        // Criar a nave primeiro (em um sistema real, isso viria de um cadastro)
        const spaceshipId = this.controlCenter.ticketService.getAllTickets().length + 1;
        try {
            const ticket = this.controlCenter.receptionistService.processNewRequest(receptionistId, spaceshipId, problemDescription, humansInvolved, this.currentPriority);
            if (ticket) {
                this.showSuccessMessage(ticket);
                this.hideRequestForm();
                this.updateQueueStatus();
            }
        }
        catch (error) {
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
        form.reset();
        this.currentPriority = null;
    }
    updateQueueStatus() {
        const queueCountElement = document.getElementById('queueCount');
        if (queueCountElement) {
            const stats = this.controlCenter.ticketService.getQueueStats();
            queueCountElement.textContent = `Fila: ${stats.total} tickets (${stats.emergency} 🟥 ${stats.highPriority} 🟧 ${stats.normal} 🟩)`;
        }
    }
}
