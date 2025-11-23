import { LinkedList } from "../models/LinkedList.js";
import { Specialist } from "../models/Specialist.js";
export class SpecialistService {
    constructor(ticketService) {
        this.ticketService = ticketService;
        this.specialists = new LinkedList();
    }
    createSpecialist(name, specialty) {
        const specialist = new Specialist(specialty, name);
        this.specialists.append(specialist);
        return specialist;
    }
    getSpecialistById(id) {
        return this.specialists.getById(id);
    }
    getAllSpecialists() {
        const specialists = [];
        let current = this.specialists.getHead();
        while (current) {
            specialists.push(current.getData());
            current = current.getNext();
        }
        return specialists;
    }
    getSpecialistsBySpecialty(specialty) {
        const specialists = [];
        let current = this.specialists.getHead();
        while (current) {
            if (current.getData().getSpecialty() === specialty) {
                specialists.push(current.getData());
            }
            current = current.getNext();
        }
        return specialists;
    }
    assignTicketToSpecialist(ticketId, specialistId) {
        return this.ticketService.assignToSpecialist(ticketId, specialistId);
    }
    getSpecialistTickets(specialistId) {
        return this.ticketService.getTicketsBySpecialist(specialistId);
    }
    getSpecialistPendingTickets(specialistId) {
        const tickets = this.getSpecialistTickets(specialistId);
        return tickets.filter(ticket => !ticket.isCompleted());
    }
    completeTicketForSpecialist(specialistId, ticketId) {
        const ticket = this.ticketService.getTicketById(ticketId);
        if (ticket && ticket.getSpecialistId() === specialistId) {
            ticket.completeTicket();
            return true;
        }
        return false;
    }
    getSpecialistStats(specialistId) {
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
