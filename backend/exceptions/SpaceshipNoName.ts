export class SpaceshipNoName extends Error {
  constructor(message: string = "Nome da nave não pode estar vazio") {
    super(message);
    this.name = "SpaceshipNoName";
  }
}