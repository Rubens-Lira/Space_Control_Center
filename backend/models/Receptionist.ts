export class Receptionist {
  private id: number = Receptionist.generateID();
  private static lastID: number = 0;

  constructor(private name: string) { }

  public static generateID(): number {
    return ++Receptionist.lastID;
  }

  public toString() {
    return `Receptionist { ID: ${this.id}, Name: ${this.name} }`;
  }

  public getId(): number { return this.id; }
  public getName(): string { return this.name; }

  public setName(name: string): void { this.name = name; }
}