import { TicketService } from "./services/TicketService.js";
import { ReceptionistService } from "./services/ReceptionistService.js";
import { SpecialistService } from "./services/SpecialistService.js";
import { StatisticsService } from "./services/StatisticsService.js";
import { SpaceshipService } from "./services/SpaceshipService.js";
export class SpaceControlCenter {
    constructor() {
        this.ticketService = new TicketService();
        this.spaceshipService = new SpaceshipService();
        this.receptionistService = new ReceptionistService(this.ticketService);
        this.specialistService = new SpecialistService(this.ticketService);
        this.statisticsService = new StatisticsService(this.ticketService, this.receptionistService, this.specialistService, this.spaceshipService);
        this.initializeDefaultData();
    }
    initializeDefaultData() {
        // Inicializar alguns recepcionistas
        this.receptionistService.createReceptionist("Dylan");
        this.receptionistService.createReceptionist("Keila");
        this.receptionistService.createReceptionist("Rubens");
        // Inicializar alguns especialistas
        this.specialistService.createSpecialist("Catarina", "COMMUNICATIONS");
        this.specialistService.createSpecialist("Laura", "LIFE_SUPPORT");
        this.specialistService.createSpecialist("Izabele", "NAVIGATION");
        this.specialistService.createSpecialist("Vitamilho", "POWER");
        // Inicializar algumas naves
        this.spaceshipService.createSpaceship("Orion", "EXP-001", "Setor Alpha");
        this.spaceshipService.createSpaceship("Artemis", "LUN-202", "Setor Beta");
        this.spaceshipService.createSpaceship("Enterprise", "STF-005", "Setor Gamma");
    }
}
