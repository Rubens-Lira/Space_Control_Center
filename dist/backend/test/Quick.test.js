import { SpaceControlCenter } from "../SpaceControlCenter";
import { Priority } from "../enums/Priority";
// Teste rápido do sistema
const centroControle = new SpaceControlCenter();
// Criar alguns tickets
centroControle.receptionistService.processNewRequest(1, 1, "Emergência!", true, Priority.EMERGENCY);
centroControle.receptionistService.processNewRequest(2, 2, "Problema urgente", false, Priority.HIGH);
// Designar para especialistas
centroControle.specialistService.assignTicketToSpecialist(1, 1);
// Ver estatísticas
const stats = centroControle.statisticsService.getDailyStats();
console.log("🎯 Sistema funcionando!");
console.log(`Tickets hoje: ${stats.totalToday}`);
console.log(`Na fila: ${stats.queueStats.emergency} emergências`);
