import { DefaiElement } from './DefaiElement';
import {
  ElementContext,
  ElementMetadata,
  ElementPermissions,
  ElementSettings,
  ElementSize
} from '../interfaces';

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

function createMetadata(): ElementMetadata {
  return {
    id: 'test-element',
    name: 'Test Element',
    version: '1.0.0',
    author: 'Test',
    description: 'Test element',
    category: 'Utilities',
    tags: ['test'],
    icon: '🧪',
    minSize: { width: 300, height: 200 },
    maxSize: { width: 800, height: 600 },
    defaultSize: { width: 400, height: 300 },
    tierRequired: 'free'
  };
}

class TestElement extends DefaiElement {
  readonly metadata = createMetadata();
  permissions: ElementPermissions;

  constructor(permissions: ElementPermissions = createPermissions()) {
    super();
    this.permissions = permissions;
  }

  onMount(_context: ElementContext): void {}
  onUnmount(): void {}
  onResize(_size: ElementSize): void {}
  onSettingsChange(_settings: ElementSettings): void {}

  public emitToOthersPublic(event: string, data: any): void {
    this.emitToOthers(event, data);
  }

  public onFromOthersPublic(event: string, handler: (data: any) => void): () => void {
    return this.onFromOthers(event, handler);
  }
}

function createMockContext(): {
  context: ElementContext;
  emit: jest.Mock;
  on: jest.Mock;
} {
  const emit = jest.fn();
  const on = jest.fn().mockReturnValue(jest.fn());
  const context: ElementContext = {
    api: {
      getPortfolio: jest.fn(),
      getTransactions: jest.fn(),
      getPrices: jest.fn(),
      saveData: jest.fn(),
      loadData: jest.fn(),
      sendNotification: jest.fn(),
      analyzeImage: jest.fn(),
      analyzeToken: jest.fn(),
      emit,
      on
    },
    userId: 'user-1',
    userTier: 'free',
    theme: 'light',
    locale: 'en-US',
    containerSize: { width: 400, height: 300 }
  };
  return { context, emit, on };
}

describe('DefaiElement inter-element comms', () => {
  it('emitToOthers throws when the element is not mounted', () => {
    const element = new TestElement(createPermissions({ canSendTo: ['*'] }));
    const { emit } = createMockContext();

    expect(() => element.emitToOthersPublic('ping', { hello: true })).toThrow(
      'Element not mounted'
    );
    expect(emit).not.toHaveBeenCalled();
  });

  it('emitToOthers throws when canSendTo is empty', async () => {
    const element = new TestElement(createPermissions({ canSendTo: [] }));
    const { context, emit } = createMockContext();
    await element._mount(context);

    expect(() => element.emitToOthersPublic('ping', { hello: true })).toThrow(
      'Element cannot send events'
    );
    expect(emit).not.toHaveBeenCalled();
  });

  it('emitToOthers throws when canSendTo is missing', async () => {
    const permissions = createPermissions();
    delete (permissions as Partial<ElementPermissions>).canSendTo;
    const element = new TestElement(permissions);
    const { context, emit } = createMockContext();
    await element._mount(context);

    expect(() => element.emitToOthersPublic('ping', { hello: true })).toThrow(
      'Element cannot send events'
    );
    expect(emit).not.toHaveBeenCalled();
  });

  it('emitToOthers passes original data without wrapping source', async () => {
    const element = new TestElement(createPermissions({ canSendTo: ['*'] }));
    const { context, emit } = createMockContext();
    await element._mount(context);

    const data = { hello: true };
    element.emitToOthersPublic('ping', data);

    expect(emit).toHaveBeenCalledTimes(1);
    expect(emit).toHaveBeenCalledWith('ping', data);
    expect(emit.mock.calls[0][1]).toBe(data);
    expect(emit.mock.calls[0][1]).not.toEqual(
      expect.objectContaining({ source: 'test-element', data })
    );
  });

  it('onFromOthers throws when the element is not mounted', () => {
    const element = new TestElement();
    const { on } = createMockContext();

    expect(() => element.onFromOthersPublic('ping', () => undefined)).toThrow(
      'Element not mounted'
    );
    expect(on).not.toHaveBeenCalled();
  });

  it('onFromOthers delivers already-unwrapped payload to the handler', async () => {
    const element = new TestElement();
    const { context, on } = createMockContext();
    await element._mount(context);

    const handler = jest.fn();
    const unsubscribe = jest.fn();
    on.mockReturnValue(unsubscribe);

    const returned = element.onFromOthersPublic('ping', handler);

    expect(on).toHaveBeenCalledTimes(1);
    expect(on.mock.calls[0][0]).toBe('ping');
    expect(returned).toBe(unsubscribe);

    const wrappedHandler = on.mock.calls[0][1] as (payload: any) => void;
    const unwrapped = { message: 'hello' };
    wrappedHandler(unwrapped);

    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler).toHaveBeenCalledWith(unwrapped);
    expect(handler.mock.calls[0][0]).toBe(unwrapped);
  });
});
