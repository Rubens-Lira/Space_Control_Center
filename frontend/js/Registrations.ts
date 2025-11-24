import { SpaceControlCenter } from "../..//backend/SpaceControlCenter.js";

export class Registrations {
  private controlCenter: SpaceControlCenter;

  constructor(controlCenter: SpaceControlCenter) {
    this.controlCenter = controlCenter;
  }

  public initialize(): void {
    this.setupTabs();
    this.loadData();
    this.setupFormHandlers();
  }

  private setupTabs(): void {
    const tabButtons = document.querySelectorAll('.cadastro-tab');
    tabButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        const target = e.target as HTMLButtonElement;
        const tabName = target.dataset.tab;

        // Atualizar tabs
        tabButtons.forEach(btn => btn.classList.remove('active'));
        target.classList.add('active');

        // Mostrar conteúdo da tab
        this.showTab(tabName!);
      });
    });
  }

  private showTab(tabName: string): void {
    // Esconder todos os conteúdos
    const tabContents = document.querySelectorAll('.tab-content');
    tabContents.forEach(content => content.classList.remove('active'));

    // Mostrar conteúdo selecionado
    const targetTab = document.getElementById(`${tabName}Tab`);
    targetTab?.classList.add('active');
  }

  private loadData(): void {
    this.loadNaves();
    this.loadReceptionists();
    this.loadSpecialists();
  }

  private loadNaves(): void {
    const navesList = document.getElementById('navesList');
    if (!navesList) return;

    // Buscar naves do backend
    const naves = this.controlCenter.spaceshipService.getAllSpaceships();

    if (naves.length === 0) {
      navesList.innerHTML = '<p class="no-data">Nenhuma nave cadastrada</p>';
      return;
    }

    navesList.innerHTML = naves.map(nave => `
    <div class="list-item" data-id="${nave.getId()}">
      <div class="item-info">
        <span class="item-name">🚀 ${nave.getName()}</span>
        <span class="item-details">ID: ${nave.getId()} | Missão: ${nave.getMissionCode()} | Setor: ${nave.getOrbitalSector()}</span>
      </div>
      <button class="btn-delete" data-type="nave" data-id="${nave.getId()}">🗑️</button>
    </div>
  `).join('');

    // Configurar eventos de delete
    this.setupDeleteHandlers();
  }

  private loadReceptionists(): void {
    const receptionistsList = document.getElementById('receptionistsList');
    if (!receptionistsList) return;

    const receptionists = this.controlCenter.receptionistService.getAllReceptionists();

    if (receptionists.length === 0) {
      receptionistsList.innerHTML = '<p class="no-data">Nenhum recepcionista cadastrado</p>';
      return;
    }

    receptionistsList.innerHTML = receptionists.map(receptionist => `
      <div class="list-item">
        <span>👨‍💼 ${receptionist.getName()}</span>
        <span>ID: ${receptionist.getId()}</span>
        <button class="btn-delete" data-id="${receptionist.getId()}">🗑️</button>
      </div>
    `).join('');
  }

  private loadSpecialists(): void {
    const specialistsList = document.getElementById('specialistsList');
    if (!specialistsList) return;

    const specialists = this.controlCenter.specialistService.getAllSpecialists();

    if (specialists.length === 0) {
      specialistsList.innerHTML = '<p class="no-data">Nenhum especialista cadastrado</p>';
      return;
    }

    specialistsList.innerHTML = specialists.map(specialist => `
      <div class="list-item">
        <span>👩‍🔬 ${specialist.getName()}</span>
        <span>Especialidade: ${specialist.getSpecialty()}</span>
        <button class="btn-delete" data-id="${specialist.getId()}">🗑️</button>
      </div>
    `).join('');
  }

  private setupFormHandlers(): void {
    // Formulário de Naves
    const naveForm = document.getElementById('naveForm') as HTMLFormElement;
    if (naveForm) {
      naveForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.cadastrarNave();
      });
    }

    // Formulário de Recepcionistas
    const receptionistForm = document.getElementById('receptionistForm') as HTMLFormElement;
    if (receptionistForm) {
      receptionistForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.cadastrarReceptionist();
      });
    }

    // Formulário de Especialistas
    const specialistForm = document.getElementById('specialistForm') as HTMLFormElement;
    if (specialistForm) {
      specialistForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.cadastrarSpecialist();
      });
    }
  }

  private cadastrarNave(): void {
    const nome = (document.getElementById('naveNome') as HTMLInputElement).value;
    const missao = (document.getElementById('naveMissao') as HTMLInputElement).value;
    const setor = (document.getElementById('naveOrbitalSector') as HTMLInputElement).value;

    if (!nome || !missao || !setor) {
      alert('Preencha nome, missão e setor orbital da nave!');
      return;
    }

    try {
      // Verificar se já existe nave com mesmo nome
      const naveExistente = this.controlCenter.spaceshipService.getSpaceshipByName(nome);
      if (naveExistente) {
        alert(`❌ Já existe uma nave cadastrada com o nome "${nome}"`);
        return;
      }

      // Cadastrar no backend usando SpaceshipService
      const nave = this.controlCenter.spaceshipService.createSpaceship(nome, missao, setor);

      alert(`✅ Nave "${nome}" cadastrada com sucesso!\nID: ${nave.getId()}\nMissão: ${missao}\nSetor: ${setor}`);

      // Limpar formulário e atualizar lista
      (document.getElementById('naveForm') as HTMLFormElement).reset();
      this.loadNaves();
    } catch (error) {
      alert(`❌ Erro ao cadastrar nave: ${error}`);
    }
  }


  private cadastrarReceptionist(): void {
    const nome = (document.getElementById('receptionistNome') as HTMLInputElement).value;

    if (!nome) {
      alert('Preencha o nome do recepcionista!');
      return;
    }

    try {
      this.controlCenter.receptionistService.createReceptionist(nome);
      alert(`✅ Recepcionista "${nome}" cadastrado com sucesso!`);

      // Limpar formulário e atualizar lista
      (document.getElementById('receptionistForm') as HTMLFormElement).reset();
      this.loadReceptionists();
    } catch (error) {
      alert(`❌ Erro ao cadastrar recepcionista: ${error}`);
    }
  }

  private cadastrarSpecialist(): void {
    const nome = (document.getElementById('specialistNome') as HTMLInputElement).value;
    const especialidade = (document.getElementById('specialistEspecialidade') as HTMLSelectElement).value;

    if (!nome || !especialidade) {
      alert('Preencha nome e especialidade!');
      return;
    }

    try {
      this.controlCenter.specialistService.createSpecialist(nome, especialidade);
      alert(`✅ Especialista "${nome}" cadastrado com sucesso!\nEspecialidade: ${especialidade}`);

      // Limpar formulário e atualizar lista
      (document.getElementById('specialistForm') as HTMLFormElement).reset();
      this.loadSpecialists();
    } catch (error) {
      alert(`❌ Erro ao cadastrar especialista: ${error}`);
    }
  }

  private setupDeleteHandlers(): void {
    // Configurar eventos de delete para naves
    const deleteButtons = document.querySelectorAll('.btn-delete[data-type="nave"]');
    deleteButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        const target = e.target as HTMLButtonElement;
        const id = parseInt(target.dataset.id!);
        this.deletarNave(id);
      });
    });
  }

  private deletarNave(id: number): void {
    if (!confirm('Tem certeza que deseja excluir esta nave?')) {
      return;
    }

    try {
      const success = this.controlCenter.spaceshipService.deleteSpaceship(id);

      if (success) {
        alert('✅ Nave excluída com sucesso!');
        this.loadNaves(); // Recarregar a lista
      } else {
        alert('❌ Nave não encontrada');
      }
    } catch (error) {
      alert(`❌ Erro ao excluir nave: ${error}`);
    }
  }
}