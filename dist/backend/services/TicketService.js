import { LinkedList } from "../models/LinkedList";
import { Ticket } from "../models/Ticket";
import { Priority } from "../enums/Priority";
export class TicketService {
    constructor() {
        this.allTickets = new LinkedList();
        this.emergencyQueue = new LinkedList();
        this.highPriorityQueue = new LinkedList();
        this.normalQueue = new LinkedList();
    }
    createTicket(receptionistId, spaceshipId, description, humansInvolved, priority) {
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
    getNextTicketForReceptionist() {
        // Prioridade: EMERGENCY -> HIGH -> NORMAL
        if (this.emergencyQueue.getHead()) {
            return this.emergencyQueue.getHead().getData();
        }
        if (this.highPriorityQueue.getHead()) {
            return this.highPriorityQueue.getHead().getData();
        }
        return this.normalQueue.getHead()?.getData() || null;
    }
    assignToSpecialist(ticketId, specialistId) {
        const ticket = this.allTickets.getById(ticketId);
        if (ticket && !ticket.getSpecialistId()) {
            ticket.setSpecialistId(specialistId);
            this.removeFromWaitingQueue(ticket);
            return true;
        }
        return false;
    }
    removeFromWaitingQueue(ticket) {
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
    getTicketById(ticketId) {
        return this.allTickets.getById(ticketId);
    }
    getAllTickets() {
        const tickets = [];
        let current = this.allTickets.getHead();
        while (current) {
            tickets.push(current.getData());
            current = current.getNext();
        }
        return tickets;
    }
    getTicketsByPriority(priority) {
        const tickets = [];
        let current = this.allTickets.getHead();
        while (current) {
            if (current.getData().getPriority() === priority) {
                tickets.push(current.getData());
            }
            current = current.getNext();
        }
        return tickets;
    }
    getTicketsBySpecialist(specialistId) {
        const tickets = [];
        let current = this.allTickets.getHead();
        while (current) {
            if (current.getData().getSpecialistId() === specialistId) {
                tickets.push(current.getData());
            }
            current = current.getNext();
        }
        return tickets;
    }
    completeTicket(ticketId) {
        const ticket = this.allTickets.getById(ticketId);
        if (ticket) {
            ticket.completeTicket();
            return true;
        }
        return false;
    }
    getQueueStats() {
        return {
            emergency: this.getQueueSize(this.emergencyQueue),
            highPriority: this.getQueueSize(this.highPriorityQueue),
            normal: this.getQueueSize(this.normalQueue),
            total: this.getQueueSize(this.allTickets)
        };
    }
    getQueueSize(queue) {
        let count = 0;
        let current = queue.getHead();
        while (current) {
            count++;
            current = current.getNext();
        }
        return count;
    }
}
