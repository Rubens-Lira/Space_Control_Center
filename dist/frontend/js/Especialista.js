export class Especialista {
    constructor(controlCenter) {
        this.currentSpecialist = null;
        this.currentTicket = null;
        this.autoRefreshInterval = null;
        this.controlCenter = controlCenter;
    }
    initialize() {
        this.setupNavigation();
        this.loadEspecialistasSelect();
        this.setupEventListeners();
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
                if (module === 'especialista') {
                    navButtons.forEach(btn => btn.classList.remove('active'));
                    target.classList.add('active');
                    this.showModule(module);
                    this.updateDisplay();
                }
            });
        });
    }
    showModule(moduleName) {
        const modules = document.querySelectorAll('.module-content');
        modules.forEach(module => module.classList.remove('active'));
        const targetModule = document.getElementById(moduleName);
        targetModule?.classList.add('active');
    }
    loadEspecialistasSelect() {
        const selectEspecialista = document.getElementById('selectEspecialista');
        if (!selectEspecialista)
            return;
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
            const target = e.target;
            const specialistId = target.value;
            if (specialistId) {
                const specialist = this.controlCenter.specialistService.getSpecialistById(parseInt(specialistId));
                if (specialist) {
                    this.currentSpecialist = specialist;
                    this.loadTicketsEspecialista(specialist.getId());
                }
            }
            else {
                this.currentSpecialist = null;
                this.clearTicketsList();
            }
        });
    }
    loadTicketsEspecialista(specialistId) {
        const ticketsList = document.getElementById('ticketsListEspecialista');
        const ticketsPendentes = document.getElementById('ticketsPendentes');
        const ticketsConcluidos = document.getElementById('ticketsConcluidos');
        if (!ticketsList || !ticketsPendentes || !ticketsConcluidos)
            return;
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
    createTicketEspecialistaElement(ticket, isCompleted) {
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
    selectTicketForAtendimento(ticket) {
        this.currentTicket = ticket;
        this.showTicketDetails(ticket);
        document.querySelectorAll('.ticket-especialista-item').forEach(item => {
            item.classList.remove('selected');
        });
        document.querySelector(`[data-ticket-id="${ticket.getId()}"]`)?.classList.add('selected');
    }
    showTicketDetails(ticket) {
        const currentAtendimento = document.getElementById('currentAtendimento');
        const atendimentoForm = document.getElementById('atendimentoEspecialistaForm');
        if (!currentAtendimento || !atendimentoForm)
            return;
        currentAtendimento.classList.add('hidden');
        atendimentoForm.classList.remove('hidden');
        const spaceship = this.controlCenter.spaceshipService.getSpaceshipById(ticket.getSpaceshipId());
        // Preencher dados do ticket no formulário
        document.getElementById('especialistaNave').value = spaceship?.getName() || 'Nave não encontrada';
        document.getElementById('especialistaTicket').value = `#${ticket.getId()}`;
        document.getElementById('especialistaPrioridade').value = this.getPriorityLabel(ticket.getPriority());
        document.getElementById('especialistaSetor').value = spaceship?.getOrbitalSector() || 'N/A';
        document.getElementById('especialistaDescricao').value = ticket.getDescription();
        document.getElementById('especialistaTripulacao').checked = ticket.getHumansInvolved();
        // Limpar campo de solução
        document.getElementById('especialistaSolucao').value = '';
    }
    setupEventListeners() {
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
    finalizarAtendimento() {
        if (!this.currentSpecialist || !this.currentTicket) {
            alert('Selecione um especialista e um ticket primeiro!');
            return;
        }
        const solucaoInput = document.getElementById('especialistaSolucao');
        const solucao = solucaoInput.value.trim();
        if (!solucao) {
            alert('Por favor, descreva a solução aplicada antes de finalizar o atendimento!');
            solucaoInput.focus();
            return;
        }
        if (confirm(`Finalizar atendimento do Ticket #${this.currentTicket.getId()}?\n\nSolução: ${solucao}`)) {
            try {
                const success = this.controlCenter.specialistService.completeTicketForSpecialist(this.currentSpecialist.getId(), this.currentTicket.getId());
                if (success) {
                    alert(`✅ Atendimento finalizado com sucesso!\nTicket #${this.currentTicket.getId()}\nEspecialista: ${this.currentSpecialist.getName()}`);
                    // Registrar no histórico
                    this.registrarNoHistorico(this.currentTicket, solucao);
                    // Atualizar a lista de tickets
                    if (this.currentSpecialist) {
                        this.loadTicketsEspecialista(this.currentSpecialist.getId());
                    }
                    this.cancelarAtendimento();
                }
                else {
                    alert('❌ Erro ao finalizar atendimento');
                }
            }
            catch (error) {
                alert(`❌ Erro ao finalizar atendimento: ${error}`);
            }
        }
    }
    cancelarAtendimento() {
        this.currentTicket = null;
        const currentAtendimento = document.getElementById('currentAtendimento');
        const atendimentoForm = document.getElementById('atendimentoEspecialistaForm');
        if (currentAtendimento && atendimentoForm) {
            currentAtendimento.classList.remove('hidden');
            atendimentoForm.classList.add('hidden');
        }
        // Remover destaque dos tickets
        document.querySelectorAll('.ticket-especialista-item').forEach(item => {
            item.classList.remove('selected');
        });
    }
    clearTicketsList() {
        const ticketsList = document.getElementById('ticketsListEspecialista');
        const ticketsPendentes = document.getElementById('ticketsPendentes');
        const ticketsConcluidos = document.getElementById('ticketsConcluidos');
        if (ticketsList)
            ticketsList.innerHTML = '<p class="no-tickets">Selecione um especialista para ver os tickets</p>';
        if (ticketsPendentes)
            ticketsPendentes.textContent = 'Pendentes: 0';
        if (ticketsConcluidos)
            ticketsConcluidos.textContent = 'Concluídos: 0';
    }
    registrarNoHistorico(ticket, solucao) {
        const historicoList = document.getElementById('historicoList');
        if (!historicoList)
            return;
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
    updateDisplay() {
        this.updateStats();
    }
    updateStats() {
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
    getSpecialtyLabel(specialty) {
        const specialties = {
            'COMMUNICATIONS': '📡 Comunicações',
            'POWER': '⚡ Sistemas de Energia',
            'NAVIGATION': '🧭 Navegação',
            'LIFE_SUPPORT': '💨 Suporte de Vida'
        };
        return specialties[specialty] || specialty;
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
        this.autoRefreshInterval = setInterval(() => {
            this.updateDisplay();
            // Atualizar a lista de tickets se houver um especialista selecionado
            if (this.currentSpecialist) {
                this.loadTicketsEspecialista(this.currentSpecialist.getId());
            }
        }, 10000); // Atualiza a cada 10 segundos
    }
}
