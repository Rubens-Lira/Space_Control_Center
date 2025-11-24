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
        this.loadSpaceships();
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
        this.loadSpaceships();
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
        const spaceshipSelect = document.getElementById('spaceshipSelect');
        const problemDescription = document.getElementById('problemDescription').value;
        const humansInvolved = document.getElementById('humansInvolved').checked;
        // Validações
        if (!spaceshipSelect.value) {
            alert('Selecione uma nave!');
            return;
        }
        if (!problemDescription.trim()) {
            alert('Descreva o problema!');
            return;
        }
        const spaceshipId = parseInt(spaceshipSelect.value);
        const selectedSpaceship = this.controlCenter.spaceshipService.getSpaceshipById(spaceshipId);
        if (!selectedSpaceship) {
            alert('Nave selecionada não encontrada!');
            return;
        }
        // Usar o primeiro recepcionista disponível
        const receptionists = this.controlCenter.receptionistService.getAllReceptionists();
        const receptionistId = receptionists.length > 0 ? receptionists[0].getId() : 1;
        try {
            const ticket = this.controlCenter.receptionistService.processNewRequest(receptionistId, spaceshipId, `[${selectedSpaceship.getOrbitalSector()}] ${selectedSpaceship.getName()} - ${selectedSpaceship.getMissionCode()}: ${problemDescription}`, humansInvolved, this.currentPriority);
            if (ticket) {
                this.showSuccessMessage(ticket, selectedSpaceship.getName());
                this.hideRequestForm();
                this.updateQueueStatus();
            }
        }
        catch (error) {
            this.showErrorMessage('Erro ao processar solicitação: ' + error);
        }
    }
    showSuccessMessage(ticket, spaceshipName) {
        alert(`✅ Solicitação criada com sucesso!\nTicket #${ticket.getId()}\nNave: ${spaceshipName}\nPrioridade: ${ticket.getPriority()}`);
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
    loadSpaceships() {
        const spaceshipSelect = document.getElementById('spaceshipSelect');
        if (!spaceshipSelect)
            return;
        const naves = this.controlCenter.spaceshipService.getAllSpaceships();
        spaceshipSelect.innerHTML = '';
        if (naves.length === 0) {
            spaceshipSelect.innerHTML = '<option value="">Nenhuma nave cadastrada</option>';
            return;
        }
        // Adicionar opção padrão
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = 'Selecione uma nave';
        spaceshipSelect.appendChild(defaultOption);
        // Adicionar naves
        naves.forEach(nave => {
            const option = document.createElement('option');
            option.value = nave.getId().toString();
            option.textContent = `🚀 ${nave.getName()} - ${nave.getMissionCode()} (${nave.getOrbitalSector()})`;
            spaceshipSelect.appendChild(option);
        });
    }
}
