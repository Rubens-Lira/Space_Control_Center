import { LinkedList } from "../models/LinkedList";
import { Ticket } from "../models/Ticket";
import { Priority } from "../enums/Priority";

export class TicketService {
  private allTickets: LinkedList<Ticket> = new LinkedList<Ticket>();
  private emergencyQueue: LinkedList<Ticket> = new LinkedList<Ticket>();
  private highPriorityQueue: LinkedList<Ticket> = new LinkedList<Ticket>();
  private normalQueue: LinkedList<Ticket> = new LinkedList<Ticket>();

  public createTicket(
    receptionistId: number,
    spaceshipId: number,
    description: string,
    humansInvolved: boolean,
    priority: Priority
  ): Ticket {
    const ticket = new Ticket(receptionistId, spaceshipId, description, humansInvolved, priority);

    // Adiciona na fila de prioridade apropriada
    switch (priority) {
      case Priority.EMERGENCY:
        this.emergencyQueue.append(ticket);
        break;
      case Priority.HIGH:
        this.highPriorityQueue.append(ticket);
        break;
      case Priority.NORMAL:
        this.normalQueue.append(ticket);
        break;
    }

    this.allTickets.append(ticket);
    return ticket;
  }

  public getNextTicketForReceptionist(): Ticket | null {
    // Prioridade: EMERGENCY -> HIGH -> NORMAL
    if (this.emergencyQueue.getHead()) {
      return this.emergencyQueue.getHead()!.getData();
    }
    if (this.highPriorityQueue.getHead()) {
      return this.highPriorityQueue.getHead()!.getData();
    }
    return this.normalQueue.getHead()?.getData() || null;
  }

  public assignToSpecialist(ticketId: number, specialistId: number): boolean {
    const ticket = this.allTickets.getById(ticketId);
    if (ticket && !ticket.getSpecialistId()) {
      ticket.setSpecialistId(specialistId);
      this.removeFromWaitingQueue(ticket);
      return true;
    }
    return false;
  }

  private removeFromWaitingQueue(ticket: Ticket): void {
    switch (ticket.getPriority()) {
      case Priority.EMERGENCY:
        this.emergencyQueue.removeById(ticket.getId());
        break;
      case Priority.HIGH:
        this.highPriorityQueue.removeById(ticket.getId());
        break;
      case Priority.NORMAL:
        this.normalQueue.removeById(ticket.getId());
        break;
    }
  }

  public getTicketById(ticketId: number): Ticket | null {
    return this.allTickets.getById(ticketId);
  }

  public getAllTickets(): Ticket[] {
    const tickets: Ticket[] = [];
    let current = this.allTickets.getHead();
    while (current) {
      tickets.push(current.getData());
      current = current.getNext();
    }
    return tickets;
  }

  public getTicketsByPriority(priority: Priority): Ticket[] {
    const tickets: Ticket[] = [];
    let current = this.allTickets.getHead();

    while (current) {
      if (current.getData().getPriority() === priority) {
        tickets.push(current.getData());
      }
      current = current.getNext();
    }
    return tickets;
  }

  public getTicketsBySpecialist(specialistId: number): Ticket[] {
    const tickets: Ticket[] = [];
    let current = this.allTickets.getHead();

    while (current) {
      if (current.getData().getSpecialistId() === specialistId) {
        tickets.push(current.getData());
      }
      current = current.getNext();
    }
    return tickets;
  }

  public completeTicket(ticketId: number): boolean {
    const ticket = this.allTickets.getById(ticketId);
    if (ticket) {
      ticket.completeTicket();
      return true;
    }
    return false;
  }

  public getQueueStats() {
    return {
      emergency: this.getQueueSize(this.emergencyQueue),
      highPriority: this.getQueueSize(this.highPriorityQueue),
      normal: this.getQueueSize(this.normalQueue),
      total: this.getQueueSize(this.allTickets)
    };
  }

  private getQueueSize(queue: LinkedList<any>): number {
    let count = 0;
    let current = queue.getHead();
    while (current) {
      count++;
      current = current.getNext();
    }
    return count;
  }
}