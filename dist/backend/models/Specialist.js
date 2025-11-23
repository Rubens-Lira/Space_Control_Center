export class Specialist {
    constructor(specialty, name) {
        this.specialty = specialty;
        this.name = name;
        this.id = Specialist.generateID();
    }
    static generateID() {
        return ++Specialist.lastID;
    }
    toString() {
        return `Specialist { ID: ${this.id}, Name: ${this.name}, Specialty: ${this.specialty} }`;
    }
    getId() { return this.id; }
    getName() { return this.name; }
    getSpecialty() { return this.specialty; }
    setName(name) { this.name = name; }
    setSpecialty(specialty) { this.specialty = specialty; }
}
Specialist.lastID = 0;
