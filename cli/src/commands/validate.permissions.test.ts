import {
  VALID_PERMISSION_KEYS,
  isValidPermissionKey,
} from './permissionKeys';

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

describe('CLI validate permission keys', () => {
  it('allows only SDK ElementPermissions keys', () => {
    expect([...VALID_PERMISSION_KEYS].sort()).toEqual(
      [...SDK_PERMISSION_KEYS].sort()
    );
  });

  it('accepts every SDK permission key', () => {
    for (const key of SDK_PERMISSION_KEYS) {
      expect(isValidPermissionKey(key)).toBe(true);
    }
  });

  it('rejects former CLI keys that are not on ElementPermissions', () => {
    expect(isValidPermissionKey('ai')).toBe(false);
    expect(isValidPermissionKey('messaging')).toBe(false);
  });

  it('rejects unknown and types-package extra keys', () => {
    expect(isValidPermissionKey('camera')).toBe(false);
    expect(isValidPermissionKey('microphone')).toBe(false);
    expect(isValidPermissionKey('geolocation')).toBe(false);
    expect(isValidPermissionKey('fullscreen')).toBe(false);
    expect(isValidPermissionKey('maxStorageSize')).toBe(false);
    expect(isValidPermissionKey('notARealPermission')).toBe(false);
  });
});
