import { Priority } from "../enums/Priority.js";

export class Ticket {
  private id: number = Ticket.generateID();
  private createdAt: Date = new Date();
  private completedAt: Date | null = null;
  private static lastID: number = 0;

  constructor(
    private receptionistId: number,
    private spaceshipId: number,
    private description: string, // Descrição do problema
    private humansInvolved: boolean, // Humanos feridos ou não
    private priority: Priority,
    private specialistId?: number,
  ) { }

  public static generateID(): number {
    return ++Ticket.lastID;
  }

  public completeTicket(): void {
    if (!this.completedAt) {
      this.completedAt = new Date();
    }
  }

  public reopenTicket(): void {
    this.completedAt = null;
  }

  public getDetailedInfo(): string {
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


  public toString(): string {
    const completedInfo = this.isCompleted() ?
      `✅ Concluído em: ${this.getCompletedAtFormatted()}` :
      '⏳ Pendente';

    return `Ticket #${this.id} - ${this.priority} - ${completedInfo}`;
  }

  // Formatação da data no formato dd/mm/aaaa
  public getCompletedAtFormatted(): string | null {
    if (!this.completedAt) return null;

    const day = this.completedAt.getDate().toString().padStart(2, '0');
    const month = (this.completedAt.getMonth() + 1).toString().padStart(2, '0');
    const year = this.completedAt.getFullYear();

    return `${day}/${month}/${year}`;
  }

  public getCreatedAtFormatted(): string {
    const day = this.createdAt.getDate().toString().padStart(2, '0');
    const month = (this.createdAt.getMonth() + 1).toString().padStart(2, '0');
    const year = this.createdAt.getFullYear();

    return `${day}/${month}/${year}`;
  }
  
  public getId(): number { return this.id; }
  public getReceptionistId(): number { return this.receptionistId; }
  public getSpaceshipId(): number { return this.spaceshipId; }
  public getDescription(): string { return this.description; }
  public getHumansInvolved(): boolean { return this.humansInvolved; }
  public getPriority(): Priority { return this.priority; }
  public getSpecialistId(): number | undefined { return this.specialistId; }
  public getCreatedAt(): Date { return this.createdAt; }
  public getCompletedAt(): Date | null { return this.completedAt; }
  public isCompleted(): boolean { return this.completedAt !== null }

  public setSpecialistId(specialistId: number): void { this.specialistId = specialistId; }
}