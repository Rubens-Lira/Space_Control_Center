export class Triagem {
    constructor(controlCenter) {
        this.currentTicket = null;
        this.autoRefreshInterval = null;
        this.controlCenter = controlCenter;
    }
    initialize() {
        this.setupNavigation();
        this.setupTabs();
        this.loadReceptionists();
        this.loadSpecialists();
        this.updateDisplay();
        this.startAutoRefresh();
    }
    cleanup() {
        if (this.autoRefreshInterval) {
            clearInterval(this.autoRefreshInterval);
        }
    }
    setupNavigation() {
        const navButtons = document.querySelectorAll('.nav-btn');
        navButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const target = e.target;
                const module = target.dataset.module;
                navButtons.forEach(btn => btn.classList.remove('active'));
                target.classList.add('active');
                this.showModule(module);
            });
        });
    }
    showModule(moduleName) {
        const modules = document.querySelectorAll('.module-content');
        modules.forEach(module => module.classList.remove('active'));
        const targetModule = document.getElementById(moduleName);
        targetModule?.classList.add('active');
    }
    setupTabs() {
        const tabButtons = document.querySelectorAll('.tab-btn');
        tabButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const target = e.target;
                const priority = target.dataset.priority;
                tabButtons.forEach(btn => btn.classList.remove('active'));
                target.classList.add('active');
                this.updateTicketsList(priority);
            });
        });
    }
    loadReceptionists() {
        const receptionistSelect = document.getElementById('triagemReceptionist');
        if (!receptionistSelect)
            return;
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
    loadSpecialists() {
        const specialistSelect = document.getElementById('triagemSpecialist');
        if (!specialistSelect)
            return;
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
    getSpecialtyLabel(specialty) {
        const specialties = {
            'COMMUNICATIONS': 'Comunicações',
            'POWER': 'Sistemas de Energia',
            'NAVIGATION': 'Navegação',
            'LIFE_SUPPORT': 'Suporte de Vida'
        };
        return specialties[specialty] || specialty;
    }
    updateDisplay() {
        this.updateStats();
        this.updateTicketsList('all');
    }
    updateStats() {
        const queueElement = document.getElementById('triagemQueue');
        const emergenciesElement = document.getElementById('triagemEmergencies');
        if (queueElement && emergenciesElement) {
            const stats = this.controlCenter.ticketService.getQueueStats();
            queueElement.textContent = `Fila: ${stats.total} tickets`;
            emergenciesElement.textContent = `Emergências: ${stats.emergency}`;
        }
    }
    updateTicketsList(priorityFilter) {
        const ticketsList = document.getElementById('ticketsList');
        if (!ticketsList)
            return;
        ticketsList.innerHTML = '';
        const allTickets = this.controlCenter.ticketService.getAllTickets();
        // Filtrar tickets: apenas não designados para especialistas e não completados
        const pendingTickets = allTickets.filter(ticket => !ticket.getSpecialistId() && !ticket.isCompleted());
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
    createTicketElement(ticket) {
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
    selectTicket(ticket) {
        this.currentTicket = ticket;
        this.showTicketDetails(ticket);
        document.querySelectorAll('.ticket-item').forEach(item => {
            item.classList.remove('selected');
        });
        document.querySelector(`[data-ticket-id="${ticket.getId()}"]`)?.classList.add('selected');
    }
    showTicketDetails(ticket) {
        const currentTicketElement = document.getElementById('currentTicket');
        const atendimentoForm = document.getElementById('atendimentoForm');
        if (!currentTicketElement || !atendimentoForm)
            return;
        currentTicketElement.classList.add('hidden');
        atendimentoForm.classList.remove('hidden');
        const spaceship = this.controlCenter.spaceshipService.getSpaceshipById(ticket.getSpaceshipId());
        // Preencher dados do ticket no formulário
        document.getElementById('triagemSpaceshipName').value = spaceship?.getName() || 'Nave não encontrada';
        document.getElementById('triagemMissionCode').value = spaceship?.getMissionCode() || 'N/A';
        document.getElementById('triagemOrbitalSector').value = spaceship?.getOrbitalSector() || 'N/A';
        document.getElementById('triagemPriority').value = this.getPriorityLabel(ticket.getPriority());
        document.getElementById('triagemDescription').value = ticket.getDescription();
        document.getElementById('triagemHumansInvolved').checked = ticket.getHumansInvolved();
        // Recarregar selects
        this.loadReceptionists();
        this.loadSpecialists();
        // Configurar botão de finalizar
        const completeButton = document.querySelector('.btn-complete');
        if (completeButton) {
            completeButton.onclick = () => {
                this.finalizarTriagem(ticket);
            };
        }
        // Configurar botão de cancelar
        const cancelButton = document.querySelector('.btn-cancel');
        if (cancelButton) {
            cancelButton.onclick = () => {
                this.cancelarAtendimento();
            };
        }
    }
    finalizarTriagem(ticket) {
        const receptionistSelect = document.getElementById('triagemReceptionist');
        const specialistSelect = document.getElementById('triagemSpecialist');
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
                const success = this.controlCenter.specialistService.assignTicketToSpecialist(ticket.getId(), specialistId);
                if (success) {
                    alert(`✅ Triagem finalizada com sucesso!\n\nTicket #${ticket.getId()}\nRecepcionista: ${receptionist.getName()}\nDesignado para: ${specialist.getName()}`);
                    this.cancelarAtendimento();
                    this.updateDisplay();
                }
                else {
                    alert('❌ Erro ao finalizar triagem. O ticket pode já ter sido designado.');
                }
            }
            catch (error) {
                alert(`❌ Erro ao finalizar triagem: ${error}`);
            }
        }
    }
    cancelarAtendimento() {
        this.currentTicket = null;
        const currentTicketElement = document.getElementById('currentTicket');
        const atendimentoForm = document.getElementById('atendimentoForm');
        if (currentTicketElement && atendimentoForm) {
            currentTicketElement.classList.remove('hidden');
            atendimentoForm.classList.add('hidden');
            // Resetar os selects
            const receptionistSelect = document.getElementById('triagemReceptionist');
            const specialistSelect = document.getElementById('triagemSpecialist');
            if (receptionistSelect)
                receptionistSelect.value = '';
            if (specialistSelect)
                specialistSelect.value = '';
        }
        // Remover destaque dos tickets
        document.querySelectorAll('.ticket-item').forEach(item => {
            item.classList.remove('selected');
        });
    }
    getPriorityLabel(priority) {
        const labels = {
            'EMERGENCY': '🟥 EMERGÊNCIA',
            'HIGH': '🟧 ALTA PRIORIDADE',
            'NORMAL': '🟩 NORMAL'
        };
        return labels[priority];
    }
    getTimeAgo(date) {
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        if (diffMins < 1)
            return 'Agora mesmo';
        if (diffMins < 60)
            return `${diffMins} min atrás`;
        const diffHours = Math.floor(diffMins / 60);
        if (diffHours < 24)
            return `${diffHours} h atrás`;
        const diffDays = Math.floor(diffHours / 24);
        return `${diffDays} dias atrás`;
    }
    startAutoRefresh() {
        this.autoRefreshInterval = setInterval(() => {
            this.updateDisplay();
        }, 10000); // Atualiza a cada 10 segundos
    }
}
