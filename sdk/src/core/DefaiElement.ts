/**
 * DefaiElement base class
 * All elements must extend this class
 */

import { EventEmitter } from 'events';
import {
  ElementMetadata,
  ElementPermissions,
  ElementContext,
  ElementSize,
  ElementState,
  ElementSettings,
  ElementLifecycleEvent
} from '../interfaces';

export abstract class DefaiElement extends EventEmitter {
  // Abstract properties that must be defined by element implementations
  abstract readonly metadata: ElementMetadata;
  abstract readonly permissions: ElementPermissions;

  // Element state
  protected state: ElementState = {};
  protected context?: ElementContext;
  private mounted: boolean = false;

  constructor() {
    super();
  }

  // Lifecycle methods to be implemented by elements
  abstract onMount(context: ElementContext): void | Promise<void>;
  abstract onUnmount(): void | Promise<void>;
  abstract onResize(size: ElementSize): void | Promise<void>;
  abstract onSettingsChange(settings: ElementSettings): void | Promise<void>;

  // Optional lifecycle methods
  onFocus?(): void | Promise<void>;
  onBlur?(): void | Promise<void>;
  onError?(error: Error): void | Promise<void>;

  // State management
  protected setState(newState: Partial<ElementState>): void {
    this.state = { ...this.state, ...newState };
    this.emit('stateChange', this.state);
  }

  protected getState(): ElementState {
    return { ...this.state };
  }

  // Data persistence
  protected async saveData(key: string, value: any): Promise<void> {
    if (!this.context) {
      throw new Error('Element not mounted');
    }
    if (!this.permissions.storage) {
      throw new Error('Storage permission not granted');
    }
    return this.context.api.saveData(key, value);
  }

  protected async loadData(key: string): Promise<any> {
    if (!this.context) {
      throw new Error('Element not mounted');
    }
    if (!this.permissions.storage) {
      throw new Error('Storage permission not granted');
    }
    return this.context.api.loadData(key);
  }

  // Inter-element communication
  protected emitToOthers(event: string, data: any): void {
    if (!this.context) {
      throw new Error('Element not mounted');
    }
    const canSendTo = this.permissions.canSendTo;
    if (!Array.isArray(canSendTo) || canSendTo.length === 0) {
      throw new Error('Element cannot send events');
    }
    // Proxy already wraps {source, data}; pass the original payload only.
    this.context.api.emit(event, data);
  }

  protected onFromOthers(event: string, handler: (data: any) => void): () => void {
    if (!this.context) {
      throw new Error('Element not mounted');
    }
    // Proxy already unwraps to payload.data and enforces canReceiveFrom.
    return this.context.api.on(event, (payload) => {
      handler(payload);
    });
  }

  // Internal lifecycle management
  async _mount(context: ElementContext): Promise<void> {
    if (this.mounted) {
      throw new Error('Element already mounted');
    }
    this.context = context;
    this.mounted = true;
    this.emit('lifecycle', { event: 'mount' } as { event: ElementLifecycleEvent });
    await this.onMount(context);
  }

  async _unmount(): Promise<void> {
    if (!this.mounted) {
      throw new Error('Element not mounted');
    }
    this.emit('lifecycle', { event: 'unmount' } as { event: ElementLifecycleEvent });
    await this.onUnmount();
    this.mounted = false;
    this.context = undefined;
  }

  async _resize(size: ElementSize): Promise<void> {
    if (!this.mounted) {
      throw new Error('Element not mounted');
    }
    this.emit('lifecycle', { event: 'resize' } as { event: ElementLifecycleEvent });
    await this.onResize(size);
  }

  async _settingsChange(settings: ElementSettings): Promise<void> {
    if (!this.mounted) {
      throw new Error('Element not mounted');
    }
    this.emit('lifecycle', { event: 'settingsChange' } as { event: ElementLifecycleEvent });
    await this.onSettingsChange(settings);
  }

  // Utility methods
  protected get isMounted(): boolean {
    return this.mounted;
  }

  protected get currentContext(): ElementContext | undefined {
    return this.context;
  }
} 