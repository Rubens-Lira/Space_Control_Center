import { TicketService } from "./TicketService.js";
import { ReceptionistService } from "./ReceptionistService.js";
import { SpecialistService } from "./SpecialistService.js";
import { SpaceshipService } from "./SpaceshipService.js";
import { Priority } from "../enums/Priority.js";
import { Ticket } from "../models/Ticket.js";

export class StatisticsService {
  constructor(
    private ticketService: TicketService,
    private receptionistService: ReceptionistService,
    private specialistService: SpecialistService,
    private spaceshipService: SpaceshipService
  ) { }

  // ========== ESTATÍSTICAS PRINCIPAIS ==========

  // 1. Número total de solicitações por dia
  public getDailyRequests(): { date: string, count: number }[] {
    const allTickets = this.ticketService.getAllTickets();
    const dailyCount = new Map<string, number>();

    allTickets.forEach(ticket => {
      const dateKey = ticket.getCreatedAt().toISOString().split('T')[0];
      const count = dailyCount.get(dateKey) || 0;
      dailyCount.set(dateKey, count + 1);
    });

    return Array.from(dailyCount.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 7);
  }

  // 2. Quantidade de atendimentos por tipo de prioridade
  public getTicketsByPriority(): Map<Priority, number> {
    const result = new Map<Priority, number>();
    const allTickets = this.ticketService.getAllTickets();

    allTickets.forEach(ticket => {
      const priority = ticket.getPriority();
      const count = result.get(priority) || 0;
      result.set(priority, count + 1);
    });

    Object.values(Priority).forEach(priority => {
      if (!result.has(priority)) {
        result.set(priority, 0);
      }
    });

    return result;
  }

  // 3. Quantidade de tickets processados por operador técnico - CORRIGIDO
  public getTicketsByReceptionist(): Map<number, { name: string, count: number }> {
    const result = new Map<number, { name: string, count: number }>();
    const receptionists = this.receptionistService.getAllReceptionists();
    const allTickets = this.ticketService.getAllTickets();

    // Inicializar todos os recepcionistas com contagem 0
    receptionists.forEach(receptionist => {
      const receptionistId = receptionist.getId();
      const receptionistName = receptionist.getName();
      result.set(receptionistId, { name: receptionistName, count: 0 });
    });

    // Contar tickets por recepcionista - APENAS tickets que foram processados
    allTickets.forEach(ticket => {
      const receptionistId = ticket.getReceptionistId();

      // Verificar se o ticket foi realmente processado (tem especialista designado ou está completo)
      const wasProcessed = ticket.getSpecialistId() !== undefined || ticket.isCompleted();

      if (receptionistId && result.has(receptionistId) && wasProcessed) {
        const current = result.get(receptionistId)!;
        result.set(receptionistId, { ...current, count: current.count + 1 });
      }
    });

    return result;
  }

  // 4. Quantidade de atendimentos finalizados por especialista
  public getCompletedTicketsBySpecialist(): Map<number, { name: string, count: number }> {
    const result = new Map<number, { name: string, count: number }>();
    const specialists = this.specialistService.getAllSpecialists();
    const allTickets = this.ticketService.getAllTickets();

    specialists.forEach(specialist => {
      const specialistId = specialist.getId();
      const specialistName = specialist.getName();
      result.set(specialistId, { name: specialistName, count: 0 });
    });

    allTickets.forEach(ticket => {
      const ticketStatus = ticket.isCompleted();
      const specialistId = ticket.getSpecialistId();

      if (ticketStatus && specialistId && result.has(specialistId)) {
        const current = result.get(specialistId)!;
        result.set(specialistId, { ...current, count: current.count + 1 });
      }
    });

    return result;
  }

  // 5. Nave com maior número de chamados
  public getSpaceshipWithMostTickets(): { name: string, count: number } | null {
    const allTickets = this.ticketService.getAllTickets();
    const spaceshipCount = new Map<number, number>();

    allTickets.forEach(ticket => {
      const spaceshipId = ticket.getSpaceshipId();
      if (spaceshipId) {
        const count = spaceshipCount.get(spaceshipId) || 0;
        spaceshipCount.set(spaceshipId, count + 1);
      }
    });

    if (spaceshipCount.size === 0) return null;

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
      const spaceshipName = spaceship ? spaceship.getName() : `Nave ${maxSpaceshipId}`;
      return { name: spaceshipName, count: maxCount };
    }

    return null;
  }

  // ========== ESTATÍSTICAS AVANÇADAS ==========

  // Top 5 naves com mais tickets
  public getTopSpaceships(limit: number = 5): { name: string, count: number }[] {
    const allTickets = this.ticketService.getAllTickets();
    const spaceshipCount = new Map<number, number>();

    allTickets.forEach(ticket => {
      const spaceshipId = ticket.getSpaceshipId();
      if (spaceshipId) {
        const count = spaceshipCount.get(spaceshipId) || 0;
        spaceshipCount.set(spaceshipId, count + 1);
      }
    });

    return Array.from(spaceshipCount.entries())
      .map(([spaceshipId, count]) => {
        const spaceship = this.spaceshipService.getSpaceshipById(spaceshipId);
        const name = spaceship ? spaceship.getName() : `Nave ${spaceshipId}`;
        return { name, count };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }

  // Top 3 recepcionistas com mais tickets processados - NOVO MÉTODO ESPECÍFICO
  public getTopReceptionists(limit: number = 3): { name: string, count: number }[] {
    const receptionistStats = this.getTicketsByReceptionist();

    return Array.from(receptionistStats.entries())
      .map(([id, data]) => data)
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }

  // Estatísticas por status
  public getTicketsByStatus(): Map<string, number> {
    const result = new Map<string, number>();
    const allTickets = this.ticketService.getAllTickets();

    allTickets.forEach(ticket => {
      const status = ticket.isCompleted() ? 'COMPLETED' : 'PENDING';
      const count = result.get(status) || 0;
      result.set(status, count + 1);
    });

    return result;
  }

  // Tempo médio de atendimento
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

  // Taxa de conclusão
  public getCompletionRate(): number {
    const allTickets = this.ticketService.getAllTickets();
    const completedTickets = allTickets.filter(ticket => ticket.isCompleted());

    return allTickets.length > 0
      ? (completedTickets.length / allTickets.length) * 100
      : 0;
  }

  // Estatísticas de especialistas por especialidade
  public getSpecialistsPerformance(): Map<string, { total: number, completed: number, rate: number }> {
    const result = new Map<string, { total: number, completed: number, rate: number }>();
    const specialists = this.specialistService.getAllSpecialists();
    const allTickets = this.ticketService.getAllTickets();

    specialists.forEach(specialist => {
      const specialty = specialist.getSpecialty();
      const specialistId = specialist.getId();

      const specialistTickets = allTickets.filter(ticket =>
        ticket.getSpecialistId() === specialistId
      );

      const completedTickets = specialistTickets.filter(ticket =>
        ticket.isCompleted()
      );

      const current = result.get(specialty) || { total: 0, completed: 0, rate: 0 };

      result.set(specialty, {
        total: current.total + specialistTickets.length,
        completed: current.completed + completedTickets.length,
        rate: specialistTickets.length > 0 ?
          ((completedTickets.length / specialistTickets.length) * 100) : 0
      });
    });

    return result;
  }

  // ========== DASHBOARD COMPLETO ==========

  public getDashboardData() {
    const allTickets = this.ticketService.getAllTickets();
    const today = new Date();
    const todayString = today.toISOString().split('T')[0];

    const todayTickets = allTickets.filter(ticket => {
      const ticketDate = ticket.getCreatedAt().toISOString().split('T')[0];
      return ticketDate === todayString;
    });

    const completionRate = this.getCompletionRate();

    return {
      // Dados gerais
      general: {
        totalTickets: allTickets.length,
        totalSpaceships: this.spaceshipService.getAllSpaceships().length,
        totalReceptionists: this.receptionistService.getAllReceptionists().length,
        totalSpecialists: this.specialistService.getAllSpecialists().length,
        completionRate: Math.round(completionRate)
      },

      // Tickets
      tickets: {
        byPriority: this.getTicketsByPriority(),
        byStatus: this.getTicketsByStatus(),
        daily: this.getDailyRequests(),
        today: {
          total: todayTickets.length,
          completed: todayTickets.filter(t => t.isCompleted()).length,
          emergency: todayTickets.filter(t => t.getPriority() === Priority.EMERGENCY).length
        }
      },

      // Performance
      performance: {
        avgTime: this.getAverageProcessingTime(),
        specialistPerformance: this.getSpecialistsPerformance()
      },

      // Rankings - CORRIGIDO: usando o novo método getTopReceptionists
      rankings: {
        topSpaceships: this.getTopSpaceships(5),
        topReceptionists: this.getTopReceptionists(3), // CORRIGIDO
        topSpecialists: Array.from(this.getCompletedTicketsBySpecialist().entries())
          .map(([id, data]) => data)
          .sort((a, b) => b.count - a.count)
          .slice(0, 3)
      },

      // Estatísticas em tempo real
      realTime: {
        queueSize: allTickets.filter(t => !t.isCompleted()).length,
        availableSpecialists: this.specialistService.getAllSpecialists().length,
        activeEmergencies: allTickets.filter(t =>
          t.getPriority() === Priority.EMERGENCY && !t.isCompleted()
        ).length
      }
    };
  }

  // Método para gerar relatório completo
  public generateReport(): string {
    const dashboard = this.getDashboardData();

    return `
RELATÓRIO DO CENTRO DE CONTROLE ESPACIAL
=========================================

ESTATÍSTICAS GERAIS:
-------------------
• Total de Tickets: ${dashboard.general.totalTickets}
• Naves Cadastradas: ${dashboard.general.totalSpaceships}
• Especialistas: ${dashboard.general.totalSpecialists}
• Recepcionistas: ${dashboard.general.totalReceptionists}
• Taxa de Conclusão: ${dashboard.general.completionRate}%

ATIVIDADE DO DIA:
----------------
• Tickets Hoje: ${dashboard.tickets.today.total}
• Concluídos Hoje: ${dashboard.tickets.today.completed}
• Emergências Hoje: ${dashboard.tickets.today.emergency}

FILA ATUAL:
----------
• Tickets na Fila: ${dashboard.realTime.queueSize}
• Total de Especialistas: ${dashboard.realTime.availableSpecialists}
• Emergências Ativas: ${dashboard.realTime.activeEmergencies}

TOP PERFORMERS:
--------------
• Nave Mais Ativa: ${dashboard.rankings.topSpaceships[0]?.name || 'N/A'} (${dashboard.rankings.topSpaceships[0]?.count || 0})
• Recepcionista Top: ${dashboard.rankings.topReceptionists[0]?.name || 'N/A'} (${dashboard.rankings.topReceptionists[0]?.count || 0})
• Especialista Top: ${dashboard.rankings.topSpecialists[0]?.name || 'N/A'} (${dashboard.rankings.topSpecialists[0]?.count || 0})

TEMPO MÉDIO: ${dashboard.performance.avgTime} minutos
    `;
  }
}