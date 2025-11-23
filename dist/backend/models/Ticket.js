export class Ticket {
    constructor(receptionistId, spaceshipId, description, // Descrição do problema
    humansInvolved, // Humanos feridos ou não
    priority, specialistId) {
        this.receptionistId = receptionistId;
        this.spaceshipId = spaceshipId;
        this.description = description;
        this.humansInvolved = humansInvolved;
        this.priority = priority;
        this.specialistId = specialistId;
        this.id = Ticket.generateID();
        this.createdAt = new Date();
        this.completedAt = null;
    }
    static generateID() {
        return ++Ticket.lastID;
    }
    completeTicket() {
        if (!this.completedAt) {
            this.completedAt = new Date();
        }
    }
    reopenTicket() {
        this.completedAt = null;
    }
    getDetailedInfo() {
        return `
      Ticket #${this.id}
      Prioridade: ${this.priority}
      Criado em: ${this.getCreatedAtFormatted()}
      Status: ${this.isCompleted() ? 'Concluído' : 'Pendente'}
      ${this.isCompleted() ? `Concluído em: ${this.getCompletedAtFormatted()}` : ''}
      Receptionista: ${this.receptionistId}
      Nave: ${this.spaceshipId}
      Especialista: ${this.specialistId || 'Não designado'}
      Humanos envolvidos: ${this.humansInvolved ? 'Sim' : 'Não'}
      Descrição: ${this.description}
    `.trim();
    }
    toString() {
        const completedInfo = this.isCompleted() ?
            `✅ Concluído em: ${this.getCompletedAtFormatted()}` :
            '⏳ Pendente';
        return `Ticket #${this.id} - ${this.priority} - ${completedInfo}`;
    }
    // Formatação da data no formato dd/mm/aaaa
    getCompletedAtFormatted() {
        if (!this.completedAt)
            return null;
        const day = this.completedAt.getDate().toString().padStart(2, '0');
        const month = (this.completedAt.getMonth() + 1).toString().padStart(2, '0');
        const year = this.completedAt.getFullYear();
        return `${day}/${month}/${year}`;
    }
    getCreatedAtFormatted() {
        const day = this.createdAt.getDate().toString().padStart(2, '0');
        const month = (this.createdAt.getMonth() + 1).toString().padStart(2, '0');
        const year = this.createdAt.getFullYear();
        return `${day}/${month}/${year}`;
    }
    getId() { return this.id; }
    getReceptionistId() { return this.receptionistId; }
    getSpaceshipId() { return this.spaceshipId; }
    getDescription() { return this.description; }
    getHumansInvolved() { return this.humansInvolved; }
    getPriority() { return this.priority; }
    getSpecialistId() { return this.specialistId; }
    getCreatedAt() { return this.createdAt; }
    getCompletedAt() { return this.completedAt; }
    isCompleted() { return this.completedAt !== null; }
    setSpecialistId(specialistId) { this.specialistId = specialistId; }
}
Ticket.lastID = 0;
