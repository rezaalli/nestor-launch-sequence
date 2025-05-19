/**
 * Simple event emitter implementation
 */

type EventCallback = (...args: any[]) => void;

export class EventEmitter {
  private events: Record<string, EventCallback[]> = {};

  /**
   * Subscribe to an event
   * @param eventName Event name to subscribe to
   * @param callback Callback function to execute when event is emitted
   * @returns Unsubscribe function
   */
  on(eventName: string, callback: EventCallback): () => void {
    if (!this.events[eventName]) {
      this.events[eventName] = [];
    }
    
    this.events[eventName].push(callback);
    
    // Return unsubscribe function
    return () => {
      this.events[eventName] = this.events[eventName].filter(cb => cb !== callback);
      
      // Clean up empty event arrays
      if (this.events[eventName].length === 0) {
        delete this.events[eventName];
      }
    };
  }

  /**
   * Emit an event
   * @param eventName Event name to emit
   * @param args Arguments to pass to the callbacks
   */
  emit(eventName: string, ...args: any[]): void {
    if (!this.events[eventName]) return;
    
    this.events[eventName].forEach(callback => {
      try {
        callback(...args);
      } catch (error) {
        console.error(`Error in event handler for ${eventName}:`, error);
      }
    });
  }

  /**
   * Remove all subscribers for an event
   * @param eventName Event name to clear
   */
  clear(eventName?: string): void {
    if (eventName) {
      delete this.events[eventName];
    } else {
      this.events = {};
    }
  }

  /**
   * Get number of subscribers for an event
   * @param eventName Event name to check
   */
  count(eventName: string): number {
    return this.events[eventName]?.length || 0;
  }
} 