import { TicketService } from "./TicketService.js";
import { ReceptionistService } from "./ReceptionistService.js";
import { SpecialistService } from "./SpecialistService.js";
import { Priority } from "../enums/Priority.js";

export class StatisticsService {
  constructor(
    private ticketService: TicketService,
    private receptionistService: ReceptionistService,
    private specialistService: SpecialistService
  ) { }

  // Número total de solicitações
  public getTotalRequests(): number {
    const allTickets = this.ticketService.getAllTickets();
    return allTickets.length;
  }

  // Quantidade de atendimentos por tipo de prioridade
  public getTicketsByPriority(): Map<Priority, number> {
    const result = new Map<Priority, number>();

    Object.values(Priority).forEach(priority => {
      const tickets = this.ticketService.getTicketsByPriority(priority);
      result.set(priority, tickets.length);
    });

    return result;
  }

  // Quantidade de tickets processados por operador técnico
  public getTicketsByReceptionist(): Map<number, number> {
    const result = new Map<number, number>();
    const receptionists = this.receptionistService.getAllReceptionists();

    receptionists.forEach(receptionist => {
      const stats = this.receptionistService.getReceptionistStats(receptionist.getId());
      result.set(receptionist.getId(), stats.totalProcessed);
    });

    return result;
  }

  // Quantidade de atendimentos finalizados por especialista
  public getCompletedTicketsBySpecialist(): Map<number, number> {
    const result = new Map<number, number>();
    const specialists = this.specialistService.getAllSpecialists();

    specialists.forEach(specialist => {
      const stats = this.specialistService.getSpecialistStats(specialist.getId());
      result.set(specialist.getId(), stats.completed);
    });

    return result;
  }

  // Nave com maior número de chamados
  public getSpaceshipWithMostTickets(): { spaceshipId: number, count: number } | null {
    const allTickets = this.ticketService.getAllTickets();
    const spaceshipCount = new Map<number, number>();

    allTickets.forEach(ticket => {
      const count = spaceshipCount.get(ticket.getSpaceshipId()) || 0;
      spaceshipCount.set(ticket.getSpaceshipId(), count + 1);
    });

    let maxSpaceshipId: number | null = null;
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
  public getDailyStats() {
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