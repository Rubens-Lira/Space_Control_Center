import { TicketService } from "./services/TicketService";
import { ReceptionistService } from "./services/ReceptionistService";
import { SpecialistService } from "./services/SpecialistService";
import { StatisticsService } from "./services/StatisticsService";

export class SpaceControlCenter {
  public ticketService: TicketService;
  public receptionistService: ReceptionistService;
  public specialistService: SpecialistService;
  public statisticsService: StatisticsService;

  constructor() {
    this.ticketService = new TicketService();
    this.receptionistService = new ReceptionistService(this.ticketService);
    this.specialistService = new SpecialistService(this.ticketService);
    this.statisticsService = new StatisticsService(
      this.ticketService,
      this.receptionistService,
      this.specialistService
    );

    this.initializeDefaultData();
  }

  private initializeDefaultData(): void {
    // Inicializar alguns recepcionistas
    this.receptionistService.createReceptionist("Operador Alpha");
    this.receptionistService.createReceptionist("Operador Beta");

    // Inicializar alguns especialistas
    this.specialistService.createSpecialist("Catarina", "COMMUNICATIONS");
    this.specialistService.createSpecialist("Laura", "POWER");
    this.specialistService.createSpecialist("Izabele", "NAVIGATION");
    this.specialistService.createSpecialist("Vitamilho", "LIFE_SUPPORT");
  }
}