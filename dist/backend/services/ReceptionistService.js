import { LinkedList } from "../models/LinkedList";
import { Receptionist } from "../models/Receptionist";
import { Priority } from "../enums/Priority";
export class ReceptionistService {
    constructor(ticketService) {
        this.ticketService = ticketService;
        this.receptionists = new LinkedList();
    }
    createReceptionist(name) {
        const receptionist = new Receptionist(name);
        this.receptionists.append(receptionist);
        return receptionist;
    }
    getReceptionistById(id) {
        return this.receptionists.getById(id);
    }
    getAllReceptionists() {
        const receptionists = [];
        let current = this.receptionists.getHead();
        while (current) {
            receptionists.push(current.getData());
            current = current.getNext();
        }
        return receptionists;
    }
    processNewRequest(receptionistId, spaceshipId, description, humansInvolved, priority) {
        const receptionist = this.getReceptionistById(receptionistId);
        if (!receptionist)
            return null;
        return this.ticketService.createTicket(receptionistId, spaceshipId, description, humansInvolved, priority);
    }
    getNextTicketToProcess() {
        return this.ticketService.getNextTicketForReceptionist();
    }
    getReceptionistStats(receptionistId) {
        const allTickets = this.ticketService.getAllTickets();
        const receptionistTickets = allTickets.filter(ticket => ticket.getReceptionistId() === receptionistId);
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
