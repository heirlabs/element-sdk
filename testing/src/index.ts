/**
 * @defai/element-testing
 * Testing utilities for DEFAI elements
 */

export { createMockContext } from '@defai/element-sdk';

/** Keys of SDK `ElementPermissions` (sdk/src/interfaces/index.ts). */
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

const SDK_PERMISSION_KEY_SET: ReadonlySet<string> = new Set(SDK_PERMISSION_KEYS);

function copyOwnProperties(source: object): Record<string, unknown> {
  const copy = Object.create(null) as Record<string, unknown>;
  for (const key of Object.keys(source)) {
    copy[key] = (source as Record<string, unknown>)[key];
  }
  return copy;
}

function mergePermissions(overrides?: object): Record<string, unknown> {
  const permissions = Object.create(null) as Record<string, unknown>;
  permissions.network = false;
  permissions.storage = false;
  permissions.notifications = false;
  permissions.clipboard = false;
  permissions.canReceiveFrom = [];
  permissions.canSendTo = [];
  permissions.portfolio = false;
  permissions.transactions = false;
  permissions.aiChat = false;
  permissions.wallet = false;

  if (overrides == null) {
    return permissions;
  }

  const overrideCopy = copyOwnProperties(overrides);
  const unknownKeys = Object.keys(overrideCopy).filter(
    (key) => !SDK_PERMISSION_KEY_SET.has(key)
  );

  if (unknownKeys.length > 0) {
    throw new Error(`Unknown permission key(s): ${unknownKeys.join(', ')}`);
  }

  for (const key of SDK_PERMISSION_KEYS) {
    if (Object.prototype.hasOwnProperty.call(overrideCopy, key)) {
      permissions[key] = overrideCopy[key];
    }
  }

  return permissions;
}

export function createTestElement(overrides?: any): {
  metadata: any;
  permissions: any;
} {
  return {
    metadata: {
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
      tierRequired: 'free',
      ...overrides?.metadata
    },
    permissions: mergePermissions(overrides?.permissions)
  };
}
