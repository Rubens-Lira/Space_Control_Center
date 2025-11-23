import { LinkedList } from "../models/LinkedList.js";
import { Receptionist } from "../models/Receptionist.js";
import { TicketService } from "./TicketService.js";
import { Priority } from "../enums/Priority.js";
import { Ticket } from "../models/Ticket.js";

export class ReceptionistService {
  private receptionists: LinkedList<Receptionist> = new LinkedList<Receptionist>();

  constructor(private ticketService: TicketService) { }

  public createReceptionist(name: string): Receptionist {
    const receptionist = new Receptionist(name);
    this.receptionists.append(receptionist);
    return receptionist;
  }

  public getReceptionistById(id: number): Receptionist | null {
    return this.receptionists.getById(id);
  }

  public getAllReceptionists(): Receptionist[] {
    const receptionists: Receptionist[] = [];
    let current = this.receptionists.getHead();
    while (current) {
      receptionists.push(current.getData());
      current = current.getNext();
    }
    return receptionists;
  }

  public processNewRequest(
    receptionistId: number,
    spaceshipId: number,
    description: string,
    humansInvolved: boolean,
    priority: Priority
  ): Ticket | null {
    const receptionist = this.getReceptionistById(receptionistId);
    if (!receptionist) return null;

    return this.ticketService.createTicket(
      receptionistId,
      spaceshipId,
      description,
      humansInvolved,
      priority
    );
  }

  public getNextTicketToProcess(): Ticket | null {
    return this.ticketService.getNextTicketForReceptionist();
  }

  public getReceptionistStats(receptionistId: number) {
    const allTickets = this.ticketService.getAllTickets();
    const receptionistTickets = allTickets.filter(ticket =>
      ticket.getReceptionistId() === receptionistId
    );

    return {
      totalProcessed: receptionistTickets.length,
      byPriority: {
        emergency: receptionistTickets.filter(t => t.getPriority() === Priority.EMERGENCY).length,
        high: receptionistTickets.filter(t => t.getPriority() === Priority.HIGH).length,
        normal: receptionistTickets.filter(t => t.getPriority() === Priority.NORMAL).length
      }
    };
  }
}