import { ElementValidator } from '../src/core/ElementValidator';

describe('ElementValidator permissions', () => {
  it('rejects unknown permission keys (deny-by-default)', () => {
    const manifest = {
      name: 'test',
      version: '1.0.0',
      permissions: {
        network: false,
        filesystem: true, // undeclared capability
      },
    } as any;

    const result = ElementValidator.validateManifest(manifest);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.code === 'UNKNOWN_PERMISSION')).toBe(true);
  });

  it('accepts only known permission keys', () => {
    const manifest = {
      name: 'test',
      version: '1.0.0',
      permissions: {
        network: true,
        storage: false,
      },
    } as any;

    const result = ElementValidator.validateManifest(manifest);
    expect(result.errors.filter(e => e.code === 'UNKNOWN_PERMISSION').length).toBe(0);
  });

  it('reports the unknown key name in the error', () => {
    const manifest = {
      name: 'test',
      version: '1.0.0',
      permissions: {
        network: false,
        clipboard: true,
        camera: true,
      },
    } as any;

    const result = ElementValidator.validateManifest(manifest);
    const unknown = result.errors.find(e => e.code === 'UNKNOWN_PERMISSION');
    expect(unknown).toBeDefined();
    expect(unknown?.message).toContain('camera');
    expect(unknown?.field).toBe('permissions.camera');
  });
});
