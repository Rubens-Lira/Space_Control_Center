import { Priority } from "../enums/Priority";
export class StatisticsService {
    constructor(ticketService, receptionistService, specialistService) {
        this.ticketService = ticketService;
        this.receptionistService = receptionistService;
        this.specialistService = specialistService;
    }
    // Número total de solicitações
    getTotalRequests() {
        const allTickets = this.ticketService.getAllTickets();
        return allTickets.length;
    }
    // Quantidade de atendimentos por tipo de prioridade
    getTicketsByPriority() {
        const result = new Map();
        Object.values(Priority).forEach(priority => {
            const tickets = this.ticketService.getTicketsByPriority(priority);
            result.set(priority, tickets.length);
        });
        return result;
    }
    // Quantidade de tickets processados por operador técnico
    getTicketsByReceptionist() {
        const result = new Map();
        const receptionists = this.receptionistService.getAllReceptionists();
        receptionists.forEach(receptionist => {
            const stats = this.receptionistService.getReceptionistStats(receptionist.getId());
            result.set(receptionist.getId(), stats.totalProcessed);
        });
        return result;
    }
    // Quantidade de atendimentos finalizados por especialista
    getCompletedTicketsBySpecialist() {
        const result = new Map();
        const specialists = this.specialistService.getAllSpecialists();
        specialists.forEach(specialist => {
            const stats = this.specialistService.getSpecialistStats(specialist.getId());
            result.set(specialist.getId(), stats.completed);
        });
        return result;
    }
    // Nave com maior número de chamados
    getSpaceshipWithMostTickets() {
        const allTickets = this.ticketService.getAllTickets();
        const spaceshipCount = new Map();
        allTickets.forEach(ticket => {
            const count = spaceshipCount.get(ticket.getSpaceshipId()) || 0;
            spaceshipCount.set(ticket.getSpaceshipId(), count + 1);
        });
        let maxSpaceshipId = null;
        let maxCount = 0;
        spaceshipCount.forEach((count, spaceshipId) => {
            if (count > maxCount) {
                maxCount = count;
                maxSpaceshipId = spaceshipId;
            }
        });
        return maxSpaceshipId ? { spaceshipId: maxSpaceshipId, count: maxCount } : null;
    }
    // Estatísticas gerais do dia
    getDailyStats() {
        const allTickets = this.ticketService.getAllTickets();
        const today = new Date();
        const todayTickets = allTickets.filter(ticket => {
            const ticketDate = ticket.getCreatedAt();
            return ticketDate.toDateString() === today.toDateString();
        });
        return {
            totalToday: todayTickets.length,
            completedToday: todayTickets.filter(t => t.isCompleted()).length,
            queueStats: this.ticketService.getQueueStats(),
            priorityBreakdown: this.getTicketsByPriority()
        };
    }
}
