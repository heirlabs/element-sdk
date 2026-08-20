/**
 * ElementEventEmitter
 * Enhanced event emitter for elements
 */

import { EventEmitter } from 'events';

export class ElementEventEmitter extends EventEmitter {
  private eventHistory: Array<{ event: string; data: any; timestamp: number }> = [];
  private maxHistorySize: number = 100;

  constructor() {
    super();
  }

  /**
   * Emit an event and record it in history
   */
  emit(event: string | symbol, ...args: any[]): boolean {
    // Record event in history
    if (typeof event === 'string') {
      this.eventHistory.push({
        event,
        data: args[0],
        timestamp: Date.now()
      });

      // Trim history if needed
      if (this.eventHistory.length > this.maxHistorySize) {
        this.eventHistory.shift();
      }
    }

    return super.emit(event, ...args);
  }

  /**
   * Get event history as shallow copies of each record so callers cannot
   * mutate stored entries.
   */
  getHistory(event?: string): Array<{ event: string; data: any; timestamp: number }> {
    const records = event
      ? this.eventHistory.filter(e => e.event === event)
      : this.eventHistory;
    return records.map(({ event: name, data, timestamp }) => ({
      event: name,
      data,
      timestamp
    }));
  }

  /**
   * Clear event history
   */
  clearHistory(): void {
    this.eventHistory = [];
  }

  /**
   * Set maximum history size
   */
  setMaxHistorySize(size: number): void {
    if (!Number.isFinite(size) || size < 0 || !Number.isInteger(size)) {
      throw new TypeError(
        'maxHistorySize must be a finite non-negative integer'
      );
    }
    this.maxHistorySize = size;
    // Trim existing history if needed
    while (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory.shift();
    }
  }

  /**
   * Once with timeout
   */
  onceWithTimeout(event: string, handler: (...args: any[]) => void, timeout: number): void {
    const timeoutId = setTimeout(() => {
      this.removeListener(event, wrappedHandler);
      handler(new Error('Event timeout'));
    }, timeout);

    const wrappedHandler = (...args: any[]) => {
      clearTimeout(timeoutId);
      handler(...args);
    };

    this.once(event, wrappedHandler);
  }

  /**
   * Wait for event (promise-based)
   */
  waitFor(event: string, timeout?: number): Promise<any> {
    return new Promise((resolve, reject) => {
      if (timeout) {
        this.onceWithTimeout(event, (result) => {
          if (result instanceof Error) {
            reject(result);
          } else {
            resolve(result);
          }
        }, timeout);
      } else {
        this.once(event, resolve);
      }
    });
  }
} 