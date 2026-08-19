/** Tests manifest permission validation against declared and undeclared capabilities. */

import { ElementValidator } from "./ElementValidator";
import { ElementManifest } from "../interfaces";

function makeManifest(
  permissions: ElementManifest["permissions"]
): ElementManifest {
  return {
    metadata: {
      id: "safe-element",
      name: "Safe Element",
      version: "1.0.0",
      author: "test",
      description: "test",
      category: "Utilities",
      tags: [],
      icon: "test",
      minSize: { width: 100, height: 100 },
      maxSize: { width: 200, height: 200 },
      defaultSize: { width: 100, height: 100 },
      tierRequired: "free",
    },
    permissions,
  };
}

const noPermissions = {
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
};

describe("ElementValidator permission validation", () => {
  it("rejects undeclared permission keys", () => {
    const manifest = makeManifest({
      ...noPermissions,
      filesystem: true,
    } as ElementManifest["permissions"] & { filesystem: boolean });

    const result = ElementValidator.validateManifest(manifest);

    expect(result.valid).toBe(false);
    expect(result.errors).toContainEqual({
      code: "UNKNOWN_PERMISSION",
      message: "Unknown permission filesystem is not supported",
      field: "permissions.filesystem",
    });
  });

  it("accepts manifests containing only declared permissions", () => {
    const permissions = {
      ...noPermissions,
      maxMemory: 100,
      maxCpu: 50,
      maxStorageSize: 5,
      camera: false,
      microphone: false,
      geolocation: false,
      fullscreen: false,
    } as ElementManifest["permissions"] & {
      maxStorageSize: number;
      camera: boolean;
      microphone: boolean;
      geolocation: boolean;
      fullscreen: boolean;
    };

    const result = ElementValidator.validateManifest(makeManifest(permissions));

    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
  });
});
