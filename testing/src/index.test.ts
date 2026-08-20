import { createTestElement } from './index';

const SDK_PERMISSION_KEYS = [
  'network',
  'storage',
  'notifications',
  'clipboard',
  'canReceiveFrom',
  'canSendTo',
  'portfolio',
  'transactions',
  'aiChat',
  'wallet',
  'maxMemory',
  'maxCpu',
] as const;

const DEFAULT_BOOLEAN_KEYS = [
  'network',
  'storage',
  'notifications',
  'clipboard',
  'portfolio',
  'transactions',
  'aiChat',
  'wallet',
] as const;

describe('createTestElement permissions', () => {
  it('defaults every boolean permission to false', () => {
    const element = createTestElement();

    for (const key of DEFAULT_BOOLEAN_KEYS) {
      expect(element.permissions[key]).toBe(false);
    }
  });

  it('defaults canReceiveFrom and canSendTo to empty arrays', () => {
    const element = createTestElement();

    expect(element.permissions.canReceiveFrom).toEqual([]);
    expect(element.permissions.canSendTo).toEqual([]);
  });

  it('does not set maxMemory or maxCpu unless overridden', () => {
    const element = createTestElement();

    expect(Object.prototype.hasOwnProperty.call(element.permissions, 'maxMemory')).toBe(
      false
    );
    expect(Object.prototype.hasOwnProperty.call(element.permissions, 'maxCpu')).toBe(
      false
    );
    expect('maxMemory' in element.permissions).toBe(false);
    expect('maxCpu' in element.permissions).toBe(false);
  });

  it('does not share default allow-list arrays across instances', () => {
    const first = createTestElement();
    const second = createTestElement();

    first.permissions.canReceiveFrom.push('other-element');
    first.permissions.canSendTo.push('other-element');

    expect(second.permissions.canReceiveFrom).toEqual([]);
    expect(second.permissions.canSendTo).toEqual([]);
  });

  it('applies known permission overrides including resource limits', () => {
    const element = createTestElement({
      permissions: {
        storage: true,
        network: true,
        canReceiveFrom: ['alpha'],
        canSendTo: ['beta'],
        maxMemory: 32,
        maxCpu: 10,
      },
    });

    expect(element.permissions.storage).toBe(true);
    expect(element.permissions.network).toBe(true);
    expect(element.permissions.canReceiveFrom).toEqual(['alpha']);
    expect(element.permissions.canSendTo).toEqual(['beta']);
    expect(element.permissions.maxMemory).toBe(32);
    expect(element.permissions.maxCpu).toBe(10);
    expect(element.permissions.wallet).toBe(false);
  });

  it('keeps only SDK permission keys on the merged result', () => {
    const element = createTestElement({
      permissions: {
        wallet: true,
        maxMemory: 8,
      },
    });

    expect(Object.keys(element.permissions).sort()).toEqual(
      [...SDK_PERMISSION_KEYS.filter((key) => key !== 'maxCpu')].sort()
    );
  });

  it('throws naming each unknown permission key', () => {
    expect(() =>
      createTestElement({
        permissions: {
          camera: true,
          admin: true,
        },
      })
    ).toThrow(/Unknown permission key\(s\): camera, admin/);
  });

  it('rejects types-package extras and former non-SDK keys', () => {
    for (const key of [
      'camera',
      'microphone',
      'geolocation',
      'fullscreen',
      'maxStorageSize',
      'ai',
      'messaging',
    ]) {
      expect(() => createTestElement({ permissions: { [key]: true } })).toThrow(
        new RegExp(`Unknown permission key\\(s\\): ${key}`)
      );
    }
  });

  it('rejects prototype-pollution keys without mutating Object.prototype', () => {
    const payload = JSON.parse('{"__proto__": {"polluted": true}, "admin": true}');

    expect(() => createTestElement({ permissions: payload })).toThrow(
      /Unknown permission key\(s\): __proto__, admin/
    );
    expect(Object.prototype.hasOwnProperty('polluted')).toBe(false);
    expect(({} as { polluted?: boolean }).polluted).toBeUndefined();
  });

  it('uses a null-prototype permissions object', () => {
    const element = createTestElement();

    expect(Object.getPrototypeOf(element.permissions)).toBeNull();
  });

  it('still merges metadata overrides', () => {
    const element = createTestElement({
      metadata: { id: 'custom-element', name: 'Custom' },
    });

    expect(element.metadata.id).toBe('custom-element');
    expect(element.metadata.name).toBe('Custom');
    expect(element.metadata.version).toBe('1.0.0');
  });
});
