import { Identifiable } from "../interfaces/Identifiable";
import { Node } from "./Node";

export class LinkedList<T extends Identifiable> {
  private head: Node<T> | null = null;

  public append(data: T): void {
    const node = new Node<T>(data);
    if (!this.head) {
      this.head = node;
      return;
    } else {
      let current = this.head;
      while (current.getNext()) {
        current = current.getNext()!;
      }
      current.setNext(node);
    }
  }

  public getById(id: number): T | null {
    let current = this.head;
    while (current && current.getData().getId() <= id) {
      if (current.getData().getId() === id) {
        return current.getData();
      }
      current = current.getNext();
    }
    return null;
  }

  public removeById(id: number): boolean {
    if (!this.head) {
      return false;
    }

    if (this.head.getData().getId() === id) {
      this.head = this.head.getNext();
      return true;
    }

    let current = this.head;
    while (current.getNext() && current.getData().getId() <= id) {
      if (current.getNext()!.getData().getId() === id) {
        current.setNext(current.getNext()!.getNext());
        return true;
      }
      current = current.getNext()!;
    }
    return false;
  }

  public getHead(): Node<T> | null { return this.head; }
  public setHead(head: Node<T> | null): void { this.head = head; }
}