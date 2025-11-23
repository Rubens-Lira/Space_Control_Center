export class Node<T> {
  constructor (
    private data: T,
    private next: Node<T> | null = null
  ) {}

  public getData(): T { return this.data; }
  public getNext(): Node<T> | null { return this.next; }

  public setData(data: T): void { this.data = data; }
  public setNext(next: Node<T> | null): void { this.next = next; } 
}