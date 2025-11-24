import { LinkedList } from "../models/LinkedList.js";
import { Spaceship } from "../models/Spaceship.js";

export class SpaceshipService {
  private spaceships: LinkedList<Spaceship> = new LinkedList<Spaceship>();

  constructor() { }

  public createSpaceship(name: string, missionCode: string, orbitalSector: string): Spaceship {
    const spaceship = new Spaceship(name, missionCode, orbitalSector);
    this.spaceships.append(spaceship);
    return spaceship;
  }

  public getSpaceshipById(id: number): Spaceship | null {
    return this.spaceships.getById(id);
  }

  public getAllSpaceships(): Spaceship[] {
    const spaceships: Spaceship[] = [];
    let current = this.spaceships.getHead();
    while (current) {
      spaceships.push(current.getData());
      current = current.getNext();
    }
    return spaceships;
  }

  public getSpaceshipByName(name: string): Spaceship | null {
    let current = this.spaceships.getHead();
    while (current) {
      if (current.getData().getName() === name) {
        return current.getData();
      }
      current = current.getNext();
    }
    return null;
  }

  public deleteSpaceship(id: number): boolean {
    return this.spaceships.removeById(id);
  }

  public getSpaceshipsCount(): number {
    let count = 0;
    let current = this.spaceships.getHead();
    while (current) {
      count++;
      current = current.getNext();
    }
    return count;
  }

  public updateSpaceship(id: number, updates: { name?: string; missionCode?: string; orbitalSector?: string }): boolean {
    const spaceship = this.getSpaceshipById(id);
    if (!spaceship) return false;

    if (updates.name) spaceship.setName(updates.name);
    if (updates.missionCode) spaceship.setMissionCode(updates.missionCode);
    if (updates.orbitalSector) spaceship.setOrbitalSerctor(updates.orbitalSector);

    return true;
  }

  public getSpaceshipsBySector(sector: string): Spaceship[] {
    const spaceships: Spaceship[] = [];
    let current = this.spaceships.getHead();
    while (current) {
      if (current.getData().getOrbitalSector() === sector) {
        spaceships.push(current.getData());
      }
      current = current.getNext();
    }
    return spaceships;
  }
}