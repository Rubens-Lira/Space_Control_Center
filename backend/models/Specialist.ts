export class Specialist {
  private id: number = Specialist.generateID();
  private static lastID: number = 0;

  constructor(private specialty: string, private name: string) { }

  public static generateID(): number {
    return ++Specialist.lastID;
  }

  public toString() {
    return `Specialist { ID: ${this.id}, Name: ${this.name}, Specialty: ${this.specialty} }`;
  }

  public getId(): number { return this.id; }
  public getName(): string { return this.name; }
  public getSpecialty(): string { return this.specialty; }

  public setName(name: string): void { this.name = name; }
  public setSpecialty(specialty: string): void { this.specialty = specialty; }
}