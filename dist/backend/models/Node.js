export class Node {
    constructor(data, next = null) {
        this.data = data;
        this.next = next;
    }
    getData() { return this.data; }
    getNext() { return this.next; }
    setData(data) { this.data = data; }
    setNext(next) { this.next = next; }
}
