import { LinkedList } from "../models/LinkedList.js";
import { Specialist } from "../models/Specialist.js";
import { TicketService } from "./TicketService.js";
import { Ticket } from "../models/Ticket.js";

export class SpecialistService {
  private specialists: LinkedList<Specialist> = new LinkedList<Specialist>();

  constructor(private ticketService: TicketService) { }

  public createSpecialist(name: string, specialty: string): Specialist {
    const specialist = new Specialist(specialty, name);
    this.specialists.append(specialist);
    return specialist;
  }

  public getSpecialistById(id: number): Specialist | null {
    return this.specialists.getById(id);
  }

  public getAllSpecialists(): Specialist[] {
    const specialists: Specialist[] = [];
    let current = this.specialists.getHead();
    while (current) {
      specialists.push(current.getData());
      current = current.getNext();
    }
    return specialists;
  }

  public getSpecialistsBySpecialty(specialty: string): Specialist[] {
    const specialists: Specialist[] = [];
    let current = this.specialists.getHead();

    while (current) {
      if (current.getData().getSpecialty() === specialty) {
        specialists.push(current.getData());
      }
      current = current.getNext();
    }
    return specialists;
  }

  public assignTicketToSpecialist(ticketId: number, specialistId: number): boolean {
    return this.ticketService.assignToSpecialist(ticketId, specialistId);
  }

  public getSpecialistTickets(specialistId: number): Ticket[] {
    return this.ticketService.getTicketsBySpecialist(specialistId);
  }

  public getSpecialistPendingTickets(specialistId: number): Ticket[] {
    const tickets = this.getSpecialistTickets(specialistId);
    return tickets.filter(ticket => !ticket.isCompleted());
  }

  public completeTicketForSpecialist(specialistId: number, ticketId: number): boolean {
    const ticket = this.ticketService.getTicketById(ticketId);
    if (ticket && ticket.getSpecialistId() === specialistId) {
      ticket.completeTicket();
      return true;
    }
    return false;
  }

  public getSpecialistStats(specialistId: number) {
    const tickets = this.getSpecialistTickets(specialistId);
    const completedTickets = tickets.filter(t => t.isCompleted());

    return {
      totalAssigned: tickets.length,
      completed: completedTickets.length,
      pending: tickets.length - completedTickets.length,
      completionRate: tickets.length > 0 ? (completedTickets.length / tickets.length) * 100 : 0
    };
  }
}