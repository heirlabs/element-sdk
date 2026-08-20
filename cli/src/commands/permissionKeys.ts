/** Keys of SDK `ElementPermissions` (sdk/src/interfaces/index.ts). */
export const VALID_PERMISSION_KEYS = [
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

export type ValidPermissionKey = (typeof VALID_PERMISSION_KEYS)[number];

export function isValidPermissionKey(key: string): key is ValidPermissionKey {
  return (VALID_PERMISSION_KEYS as readonly string[]).includes(key);
}
