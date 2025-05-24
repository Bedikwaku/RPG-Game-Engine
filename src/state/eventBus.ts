type Listener<T = void> = (payload: T) => void;

class EventBus {
  private listeners: Map<string, Listener<any>[]> = new Map();

  public subscribe<T = void>(event: string, listener: Listener<T>): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(listener);
  }

  public unsubscribe<T = void>(event: string, listener: Listener<T>): void {
    const list = this.listeners.get(event);
    if (!list) return;
    const index = list.indexOf(listener);
    if (index !== -1) {
      list.splice(index, 1);
    }
  }

  public publish<T = void>(event: string, payload: T): void {
    console.debug(`Publishing event: ${event}`);
    const list = this.listeners.get(event) ?? [];
    console.debug(`Listeners for event: ${list}`);
    if (!list) return;
    list.forEach((listener) => listener(payload));
  }
}

export const eventBus = new EventBus();
