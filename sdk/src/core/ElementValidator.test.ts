import { ElementValidator } from './ElementValidator';
import { ElementManifest, ElementPermissions } from '../interfaces';

const permissions: ElementPermissions = {
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

function manifestWithPermissions(
  manifestPermissions: ElementManifest['permissions']
): ElementManifest {
  return {
    metadata: {
      id: 'validator-test',
      name: 'Validator Test',
      version: '1.0.0',
      author: 'Test Author',
      description: 'Validator test element',
      category: 'Utilities',
      tags: [],
      icon: 'test',
      minSize: { width: 100, height: 100 },
      maxSize: { width: 500, height: 500 },
      defaultSize: { width: 200, height: 200 },
      tierRequired: 'free'
    },
    permissions: manifestPermissions
  };
}

describe('ElementValidator permission keys', () => {
  it('rejects every unknown permission key', () => {
    const result = ElementValidator.validateManifest(
      manifestWithPermissions({ ...permissions, filesystem: true, camera: false } as ElementPermissions)
    );

    expect(result.valid).toBe(false);
    expect(result.errors).toEqual(expect.arrayContaining([
      {
        code: 'UNKNOWN_PERMISSION',
        message: 'Unknown permission: filesystem',
        field: 'permissions.filesystem'
      },
      {
        code: 'UNKNOWN_PERMISSION',
        message: 'Unknown permission: camera',
        field: 'permissions.camera'
      }
    ]));
  });

  it('accepts the complete declared permission contract', () => {
    const result = ElementValidator.validateManifest(
      manifestWithPermissions({ ...permissions, maxMemory: 50, maxCpu: 10 })
    );

    expect(result.errors).toEqual([]);
    expect(result.valid).toBe(true);
  });
});
