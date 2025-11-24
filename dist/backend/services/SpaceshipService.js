import { LinkedList } from "../models/LinkedList.js";
import { Spaceship } from "../models/Spaceship.js";
export class SpaceshipService {
    constructor() {
        this.spaceships = new LinkedList();
    }
    createSpaceship(name, missionCode, orbitalSector) {
        const spaceship = new Spaceship(name, missionCode, orbitalSector);
        this.spaceships.append(spaceship);
        return spaceship;
    }
    getSpaceshipById(id) {
        return this.spaceships.getById(id);
    }
    getAllSpaceships() {
        const spaceships = [];
        let current = this.spaceships.getHead();
        while (current) {
            spaceships.push(current.getData());
            current = current.getNext();
        }
        return spaceships;
    }
    getSpaceshipByName(name) {
        let current = this.spaceships.getHead();
        while (current) {
            if (current.getData().getName() === name) {
                return current.getData();
            }
            current = current.getNext();
        }
        return null;
    }
    deleteSpaceship(id) {
        return this.spaceships.removeById(id);
    }
    getSpaceshipsCount() {
        let count = 0;
        let current = this.spaceships.getHead();
        while (current) {
            count++;
            current = current.getNext();
        }
        return count;
    }
    updateSpaceship(id, updates) {
        const spaceship = this.getSpaceshipById(id);
        if (!spaceship)
            return false;
        if (updates.name)
            spaceship.setName(updates.name);
        if (updates.missionCode)
            spaceship.setMissionCode(updates.missionCode);
        if (updates.orbitalSector)
            spaceship.setOrbitalSerctor(updates.orbitalSector);
        return true;
    }
    getSpaceshipsBySector(sector) {
        const spaceships = [];
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
