export class Triagem {
    constructor(controlCenter) {
        this.currentTicket = null;
        this.controlCenter = controlCenter;
    }
    initialize() {
        this.setupNavigation();
        this.setupTabs();
        this.loadReceptionists();
        this.updateDisplay();
        this.startAutoRefresh();
    }
    setupNavigation() {
        const navButtons = document.querySelectorAll('.nav-btn');
        navButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const target = e.target;
                const module = target.dataset.module;
                // Remover classe active de todos os botões
                navButtons.forEach(btn => btn.classList.remove('active'));
                // Adicionar classe active ao botão clicado
                target.classList.add('active');
                // Mostrar módulo correspondente
                this.showModule(module);
            });
        });
    }
    showModule(moduleName) {
        // Esconder todos os módulos
        const modules = document.querySelectorAll('.module-content');
        modules.forEach(module => module.classList.remove('active'));
        // Mostrar módulo selecionado
        const targetModule = document.getElementById(moduleName);
        targetModule?.classList.add('active');
    }
    setupTabs() {
        const tabButtons = document.querySelectorAll('.tab-btn');
        tabButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const target = e.target;
                const priority = target.dataset.priority;
                // Atualizar tabs
                tabButtons.forEach(btn => btn.classList.remove('active'));
                target.classList.add('active');
                // Atualizar lista de tickets
                this.updateTicketsList(priority);
            });
        });
    }
    loadReceptionists() {
        const select = document.getElementById('triagemReceptionist');
        if (!select)
            return;
        select.innerHTML = '';
        const receptionists = this.controlCenter.receptionistService.getAllReceptionists();
        receptionists.forEach(receptionist => {
            const option = document.createElement('option');
            option.value = receptionist.getId().toString();
            option.textContent = receptionist.getName();
            select.appendChild(option);
        });
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
        ticketDiv.className = `ticket-item ${ticket.getPriority()}`;
        ticketDiv.setAttribute('data-ticket-id', ticket.getId().toString());
        const priorityLabel = this.getPriorityLabel(ticket.getPriority());
        const timeAgo = this.getTimeAgo(ticket.getCreatedAt());
        ticketDiv.innerHTML = `
            <div class="ticket-header">
                <span class="ticket-id">Ticket #${ticket.getId()}</span>
                <span class="ticket-priority ${ticket.getPriority()}">${priorityLabel}</span>
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
    selectTicket(ticket) {
        this.currentTicket = ticket;
        this.showTicketDetails(ticket);
        // Destacar ticket selecionado
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
        // Mostrar formulário e esconder "nenhum ticket"
        currentTicketElement.classList.add('hidden');
        atendimentoForm.classList.remove('hidden');
        // Preencher dados do ticket no formulário
        document.getElementById('triagemSpaceshipName').value = `Nave ${ticket.getSpaceshipId()}`;
        document.getElementById('triagemMissionCode').value = `MISS-${ticket.getSpaceshipId()}`;
        document.getElementById('triagemOrbitalSector').value = 'Setor Alpha';
        document.getElementById('triagemDescription').value = ticket.getDescription();
        document.getElementById('triagemHumansInvolved').checked = ticket.getHumansInvolved();
        // Configurar submit do formulário
        atendimentoForm.onsubmit = (e) => {
            e.preventDefault();
            this.finalizarTriagem(ticket);
        };
        // Configurar botão de designar
        const assignButton = document.querySelector('.btn-assign');
        assignButton.onclick = () => {
            this.designarParaEspecialista(ticket);
        };
        // Configurar botão de cancelar
        const cancelButton = document.querySelector('.btn-cancel');
        cancelButton.onclick = () => {
            this.cancelarAtendimento();
        };
    }
    finalizarTriagem(ticket) {
        // Em um sistema real, aqui salvaríamos os dados da nave
        // Por enquanto, apenas marcamos como processado
        alert(`✅ Triagem finalizada para Ticket #${ticket.getId()}`);
        this.cancelarAtendimento();
        // Atualizar display
        this.updateDisplay();
    }
    designarParaEspecialista(ticket) {
        // Em um sistema real, mostraríamos uma lista de especialistas
        // Por enquanto, designamos para o primeiro especialista disponível
        const specialists = this.controlCenter.specialistService.getAllSpecialists();
        if (specialists.length > 0) {
            const specialist = specialists[0];
            const success = this.controlCenter.specialistService.assignTicketToSpecialist(ticket.getId(), specialist.getId());
            if (success) {
                alert(`✅ Ticket #${ticket.getId()} designado para ${specialist.getName()}`);
                this.cancelarAtendimento();
                this.updateDisplay();
            }
            else {
                alert('❌ Erro ao designar ticket');
            }
        }
        else {
            alert('❌ Nenhum especialista disponível');
        }
    }
    cancelarAtendimento() {
        this.currentTicket = null;
        const currentTicketElement = document.getElementById('currentTicket');
        const atendimentoForm = document.getElementById('atendimentoForm');
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
    getPriorityLabel(priority) {
        const labels = {
            'EMERGENCY': '🟥 EMERGÊNCIA',
            'HIGH': '🟧 ALTA',
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
        // Atualizar a cada 10 segundos
        setInterval(() => {
            this.updateDisplay();
        }, 10000);
    }
}
