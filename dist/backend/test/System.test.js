"use strict";
// import { SpaceControlCenter } from "../SpaceControlCenter";
// import { Priority } from "../enums/Priority";
// export class SystemTest {
//   private controlCenter: SpaceControlCenter;
//   constructor() {
//     this.controlCenter = new SpaceControlCenter();
//     this.runAllTests();
//   }
//   private runAllTests(): void {
//     console.log("🚀 INICIANDO TESTES DO CENTRO DE CONTROLE ESPACIAL\n");
//     this.testReceptionists();
//     this.testSpecialists();
//     this.testTicketFlow();
//     this.testStatistics();
//     console.log("\n✅ TODOS OS TESTES CONCLUÍDOS");
//   }
//   private testReceptionists(): void {
//     console.log("\n--- TESTANDO RECEPCIONISTAS ---");
//     // Criar recepcionistas
//     const recepcionista1 = this.controlCenter.receptionistService.createReceptionist("Dylan");
//     const recepcionista2 = this.controlCenter.receptionistService.createReceptionist("Keila");
//     console.log(`✅ Recepcionistas criados: ${recepcionista1.getName()}, ${recepcionista2.getName()}`);
//     // Buscar recepcionista por ID
//     const recepcionistaEncontrado = this.controlCenter.receptionistService.getReceptionistById(1);
//     console.log(`✅ Recepcionista encontrado: ${recepcionistaEncontrado?.toString()}`);
//   }
//   private testSpecialists(): void {
//     console.log("\n--- TESTANDO ESPECIALISTAS ---");
//     // Criar especialistas
//     const especialista1 = this.controlCenter.specialistService.createSpecialist("Catarina", "COMMUNICATIONS");
//     const especialista2 = this.controlCenter.specialistService.createSpecialist("Laura", "POWER");
//     console.log(`✅ Especialistas criados: ${especialista1.getName()}, ${especialista2.getName()}`);
//     // Buscar por especialidade
//     const especialistasComms = this.controlCenter.specialistService.getSpecialistsBySpecialty("COMMUNICATIONS");
//     console.log(`✅ Especialistas em COMMUNICATIONS: ${especialistasComms.length}`);
//   }
//   private testTicketFlow(): void {
//     console.log("\n--- TESTANDO FLUXO DE TICKETS ---");
//     // 1. Recepcionista cria tickets
//     const ticket1 = this.controlCenter.receptionistService.processNewRequest(
//       1, // receptionistId
//       1, // spaceshipId
//       "Falha crítica no sistema de comunicação",
//       true, // humansInvolved
//       Priority.EMERGENCY
//     );
//     const ticket2 = this.controlCenter.receptionistService.processNewRequest(
//       2, // receptionistId  
//       2, // spaceshipId
//       "Problema no painel de energia",
//       false, // humansInvolved
//       Priority.HIGH
//     );
//     const ticket3 = this.controlCenter.receptionistService.processNewRequest(
//       1, // receptionistId
//       3, // spaceshipId  
//       "Consulta de rotina de dados",
//       false, // humansInvolved
//       Priority.NORMAL
//     );
//     console.log(`✅ Tickets criados: ${ticket1?.getId()}, ${ticket2?.getId()}, ${ticket3?.getId()}`);
//     // 2. Ver próximo ticket para triagem (deve ser a EMERGENCY)
//     const proximoTicket = this.controlCenter.receptionistService.getNextTicketToProcess();
//     console.log(`✅ Próximo ticket para triagem: ${proximoTicket?.toString()}`);
//     // 3. Designar tickets para especialistas
//     const designacao1 = this.controlCenter.specialistService.assignTicketToSpecialist(1, 1); // Ticket 1 → Especialista 1
//     const designacao2 = this.controlCenter.specialistService.assignTicketToSpecialist(2, 2); // Ticket 2 → Especialista 2
//     console.log(`✅ Tickets designados: Ticket 1 → ${designacao1}, Ticket 2 → ${designacao2}`);
//     // 4. Ver tickets dos especialistas (agora pelo SpecialistService)
//     const ticketsEspecialista1 = this.controlCenter.specialistService.getSpecialistTickets(1);
//     const ticketsEspecialista2 = this.controlCenter.specialistService.getSpecialistTickets(2);
//     console.log(`✅ Tickets do Especialista 1: ${ticketsEspecialista1.length}`);
//     console.log(`✅ Tickets do Especialista 2: ${ticketsEspecialista2.length}`);
//     // 5. Ver tickets PENDENTES dos especialistas
//     const pendentesEspecialista1 = this.controlCenter.specialistService.getSpecialistPendingTickets(1);
//     console.log(`✅ Tickets PENDENTES do Especialista 1: ${pendentesEspecialista1.length}`);
//     // 6. Especialista completa um ticket
//     const conclusao = this.controlCenter.specialistService.completeTicketForSpecialist(1, 1);
//     console.log(`✅ Ticket 1 concluído: ${conclusao}`);
//     // 7. Verificar status do ticket concluído
//     const ticketConcluido = this.controlCenter.ticketService.getTicketById(1);
//     console.log(`✅ Status do Ticket 1: ${ticketConcluido?.isCompleted() ? 'CONCLUÍDO' : 'PENDENTE'}`);
//     console.log(`✅ Data de conclusão: ${ticketConcluido?.getCompletedAtFormatted()}`);
//     // 8. Ver tickets pendentes APÓS conclusão
//     const pendentesAposConclusao = this.controlCenter.specialistService.getSpecialistPendingTickets(1);
//     console.log(`✅ Tickets PENDENTES do Especialista 1 após conclusão: ${pendentesAposConclusao.length}`);
//   }
//   private testStatistics(): void {
//     console.log("\n--- TESTANDO ESTATÍSTICAS ---");
//     // Estatísticas gerais
//     const stats = this.controlCenter.statisticsService.getDailyStats();
//     console.log(`📊 Estatísticas do Dia:`);
//     console.log(`   - Total de tickets: ${stats.totalToday}`);
//     console.log(`   - Concluídos: ${stats.completedToday}`);
//     console.log(`   - Na fila: ${stats.queueStats.total}`);
//     // Tickets por prioridade
//     const porPrioridade = this.controlCenter.statisticsService.getTicketsByPriority();
//     console.log(`📊 Tickets por Prioridade:`);
//     porPrioridade.forEach((quantidade: number, prioridade: Priority) => {
//       console.log(`   - ${prioridade}: ${quantidade}`);
//     });
//     // Recepcionistas com mais tickets
//     const porReceptionist = this.controlCenter.statisticsService.getTicketsByReceptionist();
//     console.log(`📊 Tickets por Recepcionista:`);
//     porReceptionist.forEach((quantidade: number, receptionistId: number) => {
//       console.log(`   - Recepcionista ${receptionistId}: ${quantidade} tickets`);
//     });
//     // Nave com mais chamados
//     const naveTop = this.controlCenter.statisticsService.getSpaceshipWithMostTickets();
//     if (naveTop) {
//       console.log(`🏆 Nave com mais chamados: ID ${naveTop.spaceshipId} (${naveTop.count} tickets)`);
//     }
//     // Stats dos especialistas
//     const especialista1 = this.controlCenter.specialistService.getSpecialistById(1);
//     if (especialista1) {
//       const statsEspecialista = this.controlCenter.specialistService.getSpecialistStats(1);
//       console.log(`📊 Estatísticas do ${especialista1.getName()}:`);
//       console.log(`   - Total designado: ${statsEspecialista.totalAssigned}`);
//       console.log(`   - Concluídos: ${statsEspecialista.completed}`);
//       console.log(`   - Pendentes: ${statsEspecialista.pending}`);
//       console.log(`   - Taxa de conclusão: ${statsEspecialista.completionRate.toFixed(1)}%`);
//     }
//   }
// }
// // Executar os testes
// new SystemTest();
