/**
 * ElementValidator tests — permission key validation
 * Regression test for: validator accepts unknown permission keys
 */
import { ElementValidator } from '../src/core/ElementValidator';
import { ElementManifest } from '../src/interfaces';

function validManifest(overrides: Partial<ElementManifest> = {}): ElementManifest {
  return {
    metadata: {
      id: 'test-element',
      name: 'Test Element',
      version: '1.0.0',
      author: 'tester',
      description: 'A test element',
      category: 'widget',
      tags: [],
      icon: 'icon.svg',
      minSize: { width: 100, height: 100 },
      maxSize: { width: 200, height: 200 },
      defaultSize: { width: 150, height: 150 },
      tierRequired: 'free',
    },
    permissions: {
      network: true,
      storage: false,
      notifications: false,
      clipboard: false,
      canReceiveFrom: [],
      canSendTo: [],
      portfolio: false,
      transactions: false,
      aiChat: false,
      wallet: false,
    },
    ...overrides,
  } as ElementManifest;
}

describe('ElementValidator.validateManifest permission keys', () => {
  it('accepts a manifest with only declared permission keys', () => {
    const result = ElementValidator.validateManifest(validManifest());
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('rejects an unknown permission key (deny-by-default)', () => {
    const manifest = validManifest();
    // Inject an undeclared capability, as an untrusted manifest would
    (manifest.permissions as any).filesystem = true;
    const result = ElementValidator.validateManifest(manifest);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.code === 'UNKNOWN_PERMISSION')).toBe(true);
  });

  it('rejects multiple unknown permission keys with field-specific errors', () => {
    const manifest = validManifest();
    (manifest.permissions as any).filesystem = true;
    (manifest.permissions as any).camera = true;
    const result = ElementValidator.validateManifest(manifest);
    expect(result.valid).toBe(false);
    const unknownErrors = result.errors.filter(e => e.code === 'UNKNOWN_PERMISSION');
    expect(unknownErrors).toHaveLength(2);
  });

  it('accepts declared keys alongside resource limits', () => {
    const manifest = validManifest({
      permissions: {
        ...validManifest().permissions,
        maxMemory: 64,
        maxCpu: 25,
      },
    });
    const result = ElementValidator.validateManifest(manifest);
    expect(result.valid).toBe(true);
  });
});
