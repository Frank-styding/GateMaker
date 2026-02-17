// EventEmitter.ts

// Tipo auxiliar para definir el manejador (callback)
type Listener<T> = (data: T) => void;

export class EventEmitter<EventMap> {
  // Almacenamos los listeners en un Map donde:
  // Clave: Nombre del evento
  // Valor: Array de funciones (Set es más lento para iterar, Array es mejor para emitir rápido)
  private listeners: Map<keyof EventMap, Listener<any>[]> = new Map();

  /**
   * Suscribirse a un evento
   * @returns Una función para desuscribirse (unsub)
   */
  public on<K extends keyof EventMap>(
    event: K,
    listener: Listener<EventMap[K]>,
  ): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    const list = this.listeners.get(event)!;
    list.push(listener);

    // Devolvemos una función para cancelar la suscripción fácilmente
    return () => this.off(event, listener);
  }

  /**
   * Desuscribirse de un evento
   */
  public off<K extends keyof EventMap>(
    event: K,
    listener: Listener<EventMap[K]>,
  ): void {
    const list = this.listeners.get(event);
    if (!list) return;

    // Filtramos para eliminar el listener
    // OPTIMIZACIÓN: Si tienes miles de listeners, usar splice con indexOf es más rápido que filter
    const index = list.indexOf(listener);
    if (index !== -1) {
      list.splice(index, 1);
    }

    // Limpieza de memoria si no quedan listeners
    if (list.length === 0) {
      this.listeners.delete(event);
    }
  }

  /**
   * Emitir un evento
   */
  public emit<K extends keyof EventMap>(event: K, data: EventMap[K]): void {
    const list = this.listeners.get(event);
    if (!list) return;

    // Hacemos una copia superficial del array [...list] para iterar.
    // ¿Por qué? Porque si un listener hace .off() mientras emitimos,
    // el bucle for original se rompería o saltaría elementos.
    const runList = [...list];

    for (let i = 0; i < runList.length; i++) {
      runList[i](data);
    }
  }

  /**
   * Suscribirse una sola vez
   */
  public once<K extends keyof EventMap>(
    event: K,
    listener: Listener<EventMap[K]>,
  ): void {
    const wrapper = (data: EventMap[K]) => {
      this.off(event, wrapper); // Se borra a sí mismo
      listener(data);
    };
    this.on(event, wrapper);
  }

  /**
   * Borrar todos los eventos (útil al cambiar de escena/nivel)
   */
  public clear(): void {
    this.listeners.clear();
  }
}
