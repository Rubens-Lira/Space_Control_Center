export class Receptionist {
    constructor(name) {
        this.name = name;
        this.id = Receptionist.generateID();
    }
    static generateID() {
        return ++Receptionist.lastID;
    }
    toString() {
        return `Receptionist { ID: ${this.id}, Name: ${this.name} }`;
    }
    getId() { return this.id; }
    getName() { return this.name; }
    setName(name) { this.name = name; }
}
Receptionist.lastID = 0;
