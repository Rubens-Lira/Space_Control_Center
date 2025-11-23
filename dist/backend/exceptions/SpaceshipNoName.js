export class SpaceshipNoName extends Error {
    constructor(message = "Nome da nave não pode estar vazio") {
        super(message);
        this.name = "SpaceshipNoName";
    }
}
