/**
 * ElementAPIProxy
 * Handles API calls from elements with permission checks
 */

import { 
  ElementAPI, 
  ElementPermissions,
  TokenBalance,
  NotificationOptions,
  AIImageAnalysis,
  AITokenAnalysis
} from '../interfaces';

export class ElementAPIProxy implements ElementAPI {
  private permissions: ElementPermissions;
  private elementId: string;
  private actualAPI: ElementAPI;

  constructor(elementId: string, permissions: ElementPermissions, actualAPI: ElementAPI) {
    this.elementId = elementId;
    this.permissions = permissions;
    this.actualAPI = actualAPI;
  }

  async getPortfolio(): Promise<TokenBalance[]> {
    if (!this.permissions.portfolio) {
      throw new Error('Portfolio permission not granted');
    }
    return this.actualAPI.getPortfolio();
  }

  async getTransactions(limit?: number): Promise<any[]> {
    if (!this.permissions.transactions) {
      throw new Error('Transactions permission not granted');
    }
    return this.actualAPI.getTransactions(limit);
  }

  async getPrices(symbols: string[]): Promise<Record<string, number>> {
    if (!this.permissions.network) {
      throw new Error('Network permission not granted');
    }
    return this.actualAPI.getPrices(symbols);
  }

  async saveData(key: string, value: any): Promise<void> {
    if (!this.permissions.storage) {
      throw new Error('Storage permission not granted');
    }
    // Prefix key with element ID to isolate storage
    const prefixedKey = `${this.elementId}:${key}`;
    return this.actualAPI.saveData(prefixedKey, value);
  }

  async loadData(key: string): Promise<any> {
    if (!this.permissions.storage) {
      throw new Error('Storage permission not granted');
    }
    // Prefix key with element ID to isolate storage
    const prefixedKey = `${this.elementId}:${key}`;
    return this.actualAPI.loadData(prefixedKey);
  }

  sendNotification(options: NotificationOptions): void {
    if (!this.permissions.notifications) {
      throw new Error('Notifications permission not granted');
    }
    this.actualAPI.sendNotification(options);
  }

  async analyzeImage(imageData: string): Promise<AIImageAnalysis> {
    if (!this.permissions.aiChat) {
      throw new Error('AI chat permission not granted');
    }
    return this.actualAPI.analyzeImage(imageData);
  }

  async analyzeToken(tokenAddress: string): Promise<AITokenAnalysis> {
    if (!this.permissions.aiChat) {
      throw new Error('AI chat permission not granted');
    }
    return this.actualAPI.analyzeToken(tokenAddress);
  }

  emit(event: string, data: any): void {
    const canSendTo = this.permissions.canSendTo;
    if (!Array.isArray(canSendTo) || canSendTo.length === 0) {
      throw new Error('Element cannot send events');
    }

    const payload: { source: string; data: any; destinations?: string[] } = {
      source: this.elementId,
      data
    };

    // '*' is a wildcard grant. Specific IDs are attached so the host can enforce
    // routing; never treat a non-empty list as an implicit broadcast.
    if (!canSendTo.includes('*')) {
      payload.destinations = [...canSendTo];
    }

    this.actualAPI.emit(event, payload);
  }

  on(event: string, handler: (data: any) => void): () => void {
    // Wrap handler to check permissions
    const wrappedHandler = (payload: any) => {
      // Check if this element can receive from the source
      const canReceive = this.permissions.canReceiveFrom.includes('*') ||
                        this.permissions.canReceiveFrom.includes(payload.source);
      
      if (canReceive) {
        handler(payload.data);
      }
    };

    return this.actualAPI.on(event, wrappedHandler);
  }
} 