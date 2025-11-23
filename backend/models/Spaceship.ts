export class Spaceship {
  private id: number = Spaceship.generateID();
  private static lastID: number = 0;

  constructor(
    private name: string,
    private missionCode: string,
    private orbitalSector: string,
  ) { }

  public static generateID(): number {
    return ++Spaceship.lastID;
  }

  public toString(): string {
    return `Spaceship { ID: ${this.id}, Name: ${this.name}, Mission Code: ${this.missionCode}, Orbital Sector: ${this.orbitalSector} }`;
  } 

  public getId(): number { return this.id; }
  public getName(): string { return this.name; }
  public getMissionCode(): string { return this.missionCode; }
  public getOrbitalSector(): string { return this.orbitalSector; }

  public setName(name: string): void { this.name = name; }
  public setMissionCode(missionCode: string): void { this.missionCode = missionCode; }
  public setOrbitalSerctor(orbitalSector: string): void { this.orbitalSector = orbitalSector; }
}