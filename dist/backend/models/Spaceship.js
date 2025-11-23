export class Spaceship {
    constructor(name, missionCode, orbitalSector) {
        this.name = name;
        this.missionCode = missionCode;
        this.orbitalSector = orbitalSector;
        this.id = Spaceship.generateID();
    }
    static generateID() {
        return ++Spaceship.lastID;
    }
    toString() {
        return `Spaceship { ID: ${this.id}, Name: ${this.name}, Mission Code: ${this.missionCode}, Orbital Sector: ${this.orbitalSector} }`;
    }
    getId() { return this.id; }
    getName() { return this.name; }
    getMissionCode() { return this.missionCode; }
    getOrbitalSector() { return this.orbitalSector; }
    setName(name) { this.name = name; }
    setMissionCode(missionCode) { this.missionCode = missionCode; }
    setOrbitalSerctor(orbitalSector) { this.orbitalSector = orbitalSector; }
}
Spaceship.lastID = 0;
