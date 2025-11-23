import { TicketService } from "./services/TicketService.js";
import { ReceptionistService } from "./services/ReceptionistService.js";
import { SpecialistService } from "./services/SpecialistService.js";
import { StatisticsService } from "./services/StatisticsService.js";
export class SpaceControlCenter {
    constructor() {
        this.ticketService = new TicketService();
        this.receptionistService = new ReceptionistService(this.ticketService);
        this.specialistService = new SpecialistService(this.ticketService);
        this.statisticsService = new StatisticsService(this.ticketService, this.receptionistService, this.specialistService);
        this.initializeDefaultData();
    }
    initializeDefaultData() {
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
