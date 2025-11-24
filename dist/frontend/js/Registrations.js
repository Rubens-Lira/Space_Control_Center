export class Registrations {
    constructor(controlCenter) {
        this.controlCenter = controlCenter;
    }
    initialize() {
        this.setupTabs();
        this.loadData();
        this.setupFormHandlers();
    }
    setupTabs() {
        const tabButtons = document.querySelectorAll('.cadastro-tab');
        tabButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const target = e.target;
                const tabName = target.dataset.tab;
                // Atualizar tabs
                tabButtons.forEach(btn => btn.classList.remove('active'));
                target.classList.add('active');
                // Mostrar conteúdo da tab
                this.showTab(tabName);
            });
        });
    }
    showTab(tabName) {
        // Esconder todos os conteúdos
        const tabContents = document.querySelectorAll('.tab-content');
        tabContents.forEach(content => content.classList.remove('active'));
        // Mostrar conteúdo selecionado
        const targetTab = document.getElementById(`${tabName}Tab`);
        targetTab?.classList.add('active');
    }
    loadData() {
        this.loadNaves();
        this.loadReceptionists();
        this.loadSpecialists();
    }
    loadNaves() {
        const navesList = document.getElementById('navesList');
        if (!navesList)
            return;
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
    loadReceptionists() {
        const receptionistsList = document.getElementById('receptionistsList');
        if (!receptionistsList)
            return;
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
    loadSpecialists() {
        const specialistsList = document.getElementById('specialistsList');
        if (!specialistsList)
            return;
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
    setupFormHandlers() {
        // Formulário de Naves
        const naveForm = document.getElementById('naveForm');
        if (naveForm) {
            naveForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.cadastrarNave();
            });
        }
        // Formulário de Recepcionistas
        const receptionistForm = document.getElementById('receptionistForm');
        if (receptionistForm) {
            receptionistForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.cadastrarReceptionist();
            });
        }
        // Formulário de Especialistas
        const specialistForm = document.getElementById('specialistForm');
        if (specialistForm) {
            specialistForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.cadastrarSpecialist();
            });
        }
    }
    cadastrarNave() {
        const nome = document.getElementById('naveNome').value;
        const missao = document.getElementById('naveMissao').value;
        const setor = document.getElementById('naveOrbitalSector').value;
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
            document.getElementById('naveForm').reset();
            this.loadNaves();
        }
        catch (error) {
            alert(`❌ Erro ao cadastrar nave: ${error}`);
        }
    }
    cadastrarReceptionist() {
        const nome = document.getElementById('receptionistNome').value;
        if (!nome) {
            alert('Preencha o nome do recepcionista!');
            return;
        }
        try {
            this.controlCenter.receptionistService.createReceptionist(nome);
            alert(`✅ Recepcionista "${nome}" cadastrado com sucesso!`);
            // Limpar formulário e atualizar lista
            document.getElementById('receptionistForm').reset();
            this.loadReceptionists();
        }
        catch (error) {
            alert(`❌ Erro ao cadastrar recepcionista: ${error}`);
        }
    }
    cadastrarSpecialist() {
        const nome = document.getElementById('specialistNome').value;
        const especialidade = document.getElementById('specialistEspecialidade').value;
        if (!nome || !especialidade) {
            alert('Preencha nome e especialidade!');
            return;
        }
        try {
            this.controlCenter.specialistService.createSpecialist(nome, especialidade);
            alert(`✅ Especialista "${nome}" cadastrado com sucesso!\nEspecialidade: ${especialidade}`);
            // Limpar formulário e atualizar lista
            document.getElementById('specialistForm').reset();
            this.loadSpecialists();
        }
        catch (error) {
            alert(`❌ Erro ao cadastrar especialista: ${error}`);
        }
    }
    setupDeleteHandlers() {
        // Configurar eventos de delete para naves
        const deleteButtons = document.querySelectorAll('.btn-delete[data-type="nave"]');
        deleteButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const target = e.target;
                const id = parseInt(target.dataset.id);
                this.deletarNave(id);
            });
        });
    }
    deletarNave(id) {
        if (!confirm('Tem certeza que deseja excluir esta nave?')) {
            return;
        }
        try {
            const success = this.controlCenter.spaceshipService.deleteSpaceship(id);
            if (success) {
                alert('✅ Nave excluída com sucesso!');
                this.loadNaves(); // Recarregar a lista
            }
            else {
                alert('❌ Nave não encontrada');
            }
        }
        catch (error) {
            alert(`❌ Erro ao excluir nave: ${error}`);
        }
    }
}
