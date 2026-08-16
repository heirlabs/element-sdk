import { ElementSandbox } from './ElementSandbox';
import { ElementPermissions } from '../interfaces';

/**
 * `createAPIProxy` is private and returns the JS source string injected into
 * the sandboxed iframe as `window.elementAPI`. It's tested directly (via a
 * cast) rather than through `loadElement`, since building the srcdoc HTML
 * requires a DOM (`document.createElement('iframe')`) that this package's
 * jest setup doesn't provide, and the method itself never touches the DOM.
 */
function proxyMethodNames(permissions: ElementPermissions): string[] {
  const sandbox = new ElementSandbox('test-element', permissions);
  const source = (sandbox as unknown as { createAPIProxy(): string }).createAPIProxy();
  // Each exposed method is emitted as a top-level `name: function(...args) {`
  // entry; the generated function bodies never contain that exact sequence
  // themselves, so this reliably recovers just the proxy's own keys without
  // needing a full (non-JSON) object-literal parser.
  return Array.from(source.matchAll(/(\w+): function\(/g), (match) => match[1]);
}

const NO_PERMISSIONS: ElementPermissions = {
  network: false,
  storage: false,
  notifications: false,
  clipboard: false,
  canReceiveFrom: [],
  canSendTo: [],
  portfolio: false,
  transactions: false,
  aiChat: false,
  wallet: false
};

describe('ElementSandbox createAPIProxy permission scoping', () => {
  it('exposes no gated methods when no permissions are granted', () => {
    const methods = proxyMethodNames(NO_PERMISSIONS);
    expect(methods).toEqual(['on']);
  });

  it('exposes only getPortfolio when portfolio permission is granted', () => {
    const methods = proxyMethodNames({ ...NO_PERMISSIONS, portfolio: true });
    expect(methods).toEqual(expect.arrayContaining(['getPortfolio', 'on']));
    expect(methods).not.toContain('getTransactions');
    expect(methods).not.toContain('saveData');
  });

  it('exposes saveData and loadData together when storage permission is granted', () => {
    const methods = proxyMethodNames({ ...NO_PERMISSIONS, storage: true });
    expect(methods).toEqual(expect.arrayContaining(['saveData', 'loadData', 'on']));
    expect(methods).not.toContain('getPortfolio');
  });

  it('exposes analyzeImage and analyzeToken together when aiChat permission is granted', () => {
    const methods = proxyMethodNames({ ...NO_PERMISSIONS, aiChat: true });
    expect(methods).toEqual(expect.arrayContaining(['analyzeImage', 'analyzeToken', 'on']));
  });

  it('exposes emit only when canSendTo is non-empty', () => {
    const withoutTargets = proxyMethodNames(NO_PERMISSIONS);
    expect(withoutTargets).not.toContain('emit');

    const withTargets = proxyMethodNames({ ...NO_PERMISSIONS, canSendTo: ['other-element'] });
    expect(withTargets).toContain('emit');
  });

  it('exposes every gated method when every corresponding permission is granted', () => {
    const methods = proxyMethodNames({
      ...NO_PERMISSIONS,
      network: true,
      storage: true,
      notifications: true,
      portfolio: true,
      transactions: true,
      aiChat: true,
      canSendTo: ['*']
    });
    expect(methods).toEqual(
      expect.arrayContaining([
        'getPortfolio',
        'getTransactions',
        'getPrices',
        'saveData',
        'loadData',
        'sendNotification',
        'analyzeImage',
        'analyzeToken',
        'emit',
        'on'
      ])
    );
    expect(methods).toHaveLength(10);
  });
});
