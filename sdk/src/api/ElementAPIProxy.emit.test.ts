import { ElementAPIProxy } from './ElementAPIProxy';
import { ElementAPI, ElementPermissions } from '../interfaces';

function createPermissions(
  overrides: Partial<ElementPermissions> = {}
): ElementPermissions {
  return {
    network: false,
    storage: false,
    notifications: false,
    clipboard: false,
    canReceiveFrom: [],
    canSendTo: [],
    portfolio: false,
    transactions: false,
    aiChat: false,
    wallet: false,
    ...overrides
  };
}

function createMockAPI(): jest.Mocked<ElementAPI> {
  return {
    getPortfolio: jest.fn(),
    getTransactions: jest.fn(),
    getPrices: jest.fn(),
    saveData: jest.fn(),
    loadData: jest.fn(),
    sendNotification: jest.fn(),
    analyzeImage: jest.fn(),
    analyzeToken: jest.fn(),
    emit: jest.fn(),
    on: jest.fn()
  };
}

describe('ElementAPIProxy.emit canSendTo allow-list', () => {
  const elementId = 'sender-element';

  it('denies emit when canSendTo is empty and does not call actualAPI.emit', () => {
    const actualAPI = createMockAPI();
    const proxy = new ElementAPIProxy(
      elementId,
      createPermissions({ canSendTo: [] }),
      actualAPI
    );

    expect(() => proxy.emit('ping', { hello: true })).toThrow(
      'Element cannot send events'
    );
    expect(actualAPI.emit).not.toHaveBeenCalled();
  });

  it('denies emit when canSendTo is missing and does not call actualAPI.emit', () => {
    const actualAPI = createMockAPI();
    const permissions = createPermissions();
    delete (permissions as Partial<ElementPermissions>).canSendTo;
    const proxy = new ElementAPIProxy(elementId, permissions, actualAPI);

    expect(() => proxy.emit('ping', { hello: true })).toThrow(
      'Element cannot send events'
    );
    expect(actualAPI.emit).not.toHaveBeenCalled();
  });

  it('allows emit when canSendTo includes wildcard *', () => {
    const actualAPI = createMockAPI();
    const proxy = new ElementAPIProxy(
      elementId,
      createPermissions({ canSendTo: ['*'] }),
      actualAPI
    );

    proxy.emit('ping', { hello: true });

    expect(actualAPI.emit).toHaveBeenCalledTimes(1);
    expect(actualAPI.emit).toHaveBeenCalledWith('ping', {
      source: elementId,
      data: { hello: true }
    });
  });

  it('attaches destinations from a specific canSendTo list', () => {
    const actualAPI = createMockAPI();
    const canSendTo = ['trusted-element', 'other-element'];
    const proxy = new ElementAPIProxy(
      elementId,
      createPermissions({ canSendTo }),
      actualAPI
    );

    proxy.emit('ping', { hello: true });

    expect(actualAPI.emit).toHaveBeenCalledTimes(1);
    expect(actualAPI.emit).toHaveBeenCalledWith('ping', {
      source: elementId,
      destinations: ['trusted-element', 'other-element'],
      data: { hello: true }
    });
    const payload = actualAPI.emit.mock.calls[0][1];
    expect(payload.destinations).not.toBe(canSendTo);
  });
});
