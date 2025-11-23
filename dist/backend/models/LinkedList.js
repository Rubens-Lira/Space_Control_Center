import { Node } from "./Node";
export class LinkedList {
    constructor() {
        this.head = null;
    }
    append(data) {
        const node = new Node(data);
        if (!this.head) {
            this.head = node;
            return;
        }
        else {
            let current = this.head;
            while (current.getNext()) {
                current = current.getNext();
            }
            current.setNext(node);
        }
    }
    getById(id) {
        let current = this.head;
        while (current && current.getData().getId() <= id) {
            if (current.getData().getId() === id) {
                return current.getData();
            }
            current = current.getNext();
        }
        return null;
    }
    removeById(id) {
        if (!this.head) {
            return false;
        }
        if (this.head.getData().getId() === id) {
            this.head = this.head.getNext();
            return true;
        }
        let current = this.head;
        while (current.getNext() && current.getData().getId() <= id) {
            if (current.getNext().getData().getId() === id) {
                current.setNext(current.getNext().getNext());
                return true;
            }
            current = current.getNext();
        }
        return false;
    }
    getHead() { return this.head; }
    setHead(head) { this.head = head; }
}
