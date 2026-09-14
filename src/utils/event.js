export default class EventEmitter {
  constructor() {
    this.eventHandlers = new Map();
  }

  /**
   * Register an event handler.
   * @param {string} event
   * @param {Function} callback
   * @returns {Function} Unsubscribe function
   */
  on(event, callback) {
    if (typeof callback !== "function") {
      throw new TypeError("callback must be a function");
    }

    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, new Set());
    }

    this.eventHandlers.get(event).add(callback);

    return () => this.off(event, callback);
  }

  /**
   * Register a handler that runs only once.
   * @param {string} event
   * @param {Function} callback
   * @returns {Function} Unsubscribe function
   */
  once(event, callback) {
    const wrapper = async data => {
      this.off(event, wrapper);
      return callback(data);
    };

    return this.on(event, wrapper);
  }

  /**
   * Remove an event handler.
   * @param {string} event
   * @param {Function} callback
   */
  off(event, callback) {
    const callbacks = this.eventHandlers.get(event);

    if (!callbacks) {
      return;
    }

    callbacks.delete(callback);

    if (callbacks.size === 0) {
      this.eventHandlers.delete(event);
    }
  }

  /**
   * Emit an event and wait for all handlers.
   * @param {string} event
   * @param {*} payload
   * @param {boolean} ignoreErrors
   */
  async emit(event, payload = null, ignoreErrors = true) {
    const callbacks = this.eventHandlers.get(event);

    if (!callbacks) {
      return;
    }

    // Snapshot prevents modification during iteration
    // from affecting the current emit cycle.
    for (const callback of [...callbacks]) {
      try {
        await callback(payload);
      } catch (error) {
        if (!ignoreErrors) {
          throw error;
        }
      }
    }
  }

  /**
   * Remove all handlers for an event.
   * If no event is supplied, remove everything.
   */
  removeAll(event) {
    if (event !== undefined) {
      this.eventHandlers.delete(event);
    } else {
      this.eventHandlers.clear();
    }
  }

  /**
   * Check whether an event has handlers.
   */
  has(event) {
    return this.eventHandlers.has(event);
  }

  /**
   * Get number of handlers for an event.
   */
  listenerCount(event) {
    return this.eventHandlers.get(event)?.size ?? 0;
  }
}
