import { TicketService } from "./TicketService.js";
import { ReceptionistService } from "./ReceptionistService.js";
import { SpecialistService } from "./SpecialistService.js";
import { SpaceshipService } from "./SpaceshipService.js";
import { Priority } from "../enums/Priority.js";

export class StatisticsService {
  constructor(
    private ticketService: TicketService,
    private receptionistService: ReceptionistService,
    private specialistService: SpecialistService,
    private spaceshipService: SpaceshipService
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
  public getSpaceshipWithMostTickets(): { spaceshipId: number, count: number, name?: string } | null {
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

    if (maxSpaceshipId) {
      const spaceship = this.spaceshipService.getSpaceshipById(maxSpaceshipId);
      return {
        spaceshipId: maxSpaceshipId,
        count: maxCount,
        name: spaceship?.getName()
      };
    }

    return null;
  }

  // Estatísticas de naves cadastradas
  public getSpaceshipStats(): {
    total: number;
    bySector: Map<string, number>;
    mostActive: { spaceshipId: number, count: number, name?: string } | null;
  } {
    const spaceships = this.spaceshipService.getAllSpaceships();
    const bySector = new Map<string, number>();

    spaceships.forEach(spaceship => {
      const sector = spaceship.getOrbitalSector();
      const count = bySector.get(sector) || 0;
      bySector.set(sector, count + 1);
    });

    return {
      total: spaceships.length,
      bySector: bySector,
      mostActive: this.getSpaceshipWithMostTickets()
    };
  }

  // Estatísticas de especialistas por especialidade
  public getSpecialistsBySpecialty(): Map<string, number> {
    const result = new Map<string, number>();
    const specialists = this.specialistService.getAllSpecialists();

    specialists.forEach(specialist => {
      const specialty = specialist.getSpecialty();
      const count = result.get(specialty) || 0;
      result.set(specialty, count + 1);
    });

    return result;
  }

  // Tempo médio de atendimento (em minutos)
  public getAverageProcessingTime(): number {
    const allTickets = this.ticketService.getAllTickets();
    const completedTickets = allTickets.filter(ticket => ticket.isCompleted());

    if (completedTickets.length === 0) return 0;

    const totalTime = completedTickets.reduce((sum, ticket) => {
      const processingTime = ticket.getProcessingTime();
      return sum + (processingTime || 0);
    }, 0);

    return Math.round(totalTime / completedTickets.length);
  }

  // Taxa de conclusão por prioridade
  public getCompletionRateByPriority(): Map<Priority, number> {
    const result = new Map<Priority, number>();
    const allTickets = this.ticketService.getAllTickets();

    Object.values(Priority).forEach(priority => {
      const priorityTickets = allTickets.filter(ticket => ticket.getPriority() === priority);
      const completedTickets = priorityTickets.filter(ticket => ticket.isCompleted());

      const completionRate = priorityTickets.length > 0
        ? (completedTickets.length / priorityTickets.length) * 100
        : 0;

      result.set(priority, Math.round(completionRate));
    });

    return result;
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
      priorityBreakdown: this.getTicketsByPriority(),
      spaceshipStats: this.getSpaceshipStats(),
      averageProcessingTime: this.getAverageProcessingTime()
    };
  }

  // Dashboard completo
  public getDashboardData() {
    return {
      general: {
        totalTickets: this.getTotalRequests(),
        totalSpaceships: this.spaceshipService.getSpaceshipsCount(),
        totalReceptionists: this.receptionistService.getAllReceptionists().length,
        totalSpecialists: this.specialistService.getAllSpecialists().length
      },
      tickets: {
        byPriority: this.getTicketsByPriority(),
        completionRate: this.getCompletionRateByPriority(),
        averageTime: this.getAverageProcessingTime()
      },
      spaceships: this.getSpaceshipStats(),
      specialists: {
        bySpecialty: this.getSpecialistsBySpecialty(),
        performance: this.getCompletedTicketsBySpecialist()
      },
      daily: this.getDailyStats()
    };
  }
}