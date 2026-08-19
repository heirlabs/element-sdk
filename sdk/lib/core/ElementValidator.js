"use strict";
/**
 * ElementValidator
 * Validates element manifests and code
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ElementValidator = void 0;
const permissionKeys = {
    network: true,
    storage: true,
    notifications: true,
    clipboard: true,
    canReceiveFrom: true,
    canSendTo: true,
    portfolio: true,
    transactions: true,
    aiChat: true,
    wallet: true,
    maxMemory: true,
    maxCpu: true,
    maxStorageSize: true,
    camera: true,
    microphone: true,
    geolocation: true,
    fullscreen: true
};
const allowedPermissionKeys = new Set(Object.keys(permissionKeys));
class ElementValidator {
    /**
     * Validate a element manifest
     */
    static validateManifest(manifest) {
        const errors = [];
        const warnings = [];
        // Validate metadata
        if (!manifest.metadata) {
            errors.push({
                code: 'MISSING_METADATA',
                message: 'Element manifest must include metadata'
            });
        }
        else {
            // Check required metadata fields
            const requiredFields = ['id', 'name', 'version', 'author', 'description', 'category'];
            requiredFields.forEach(field => {
                if (!(field in manifest.metadata)) {
                    errors.push({
                        code: 'MISSING_METADATA_FIELD',
                        message: `Metadata must include ${field}`,
                        field: `metadata.${field}`
                    });
                }
            });
            // Validate ID format
            if (manifest.metadata.id && !/^[a-z0-9-]+$/.test(manifest.metadata.id)) {
                errors.push({
                    code: 'INVALID_ID_FORMAT',
                    message: 'Element ID must contain only lowercase letters, numbers, and hyphens',
                    field: 'metadata.id'
                });
            }
            // Validate version format
            if (manifest.metadata.version && !/^\d+\.\d+\.\d+$/.test(manifest.metadata.version)) {
                errors.push({
                    code: 'INVALID_VERSION_FORMAT',
                    message: 'Version must follow semantic versioning (e.g., 1.0.0)',
                    field: 'metadata.version'
                });
            }
            // Validate sizes
            if (manifest.metadata.minSize && manifest.metadata.maxSize) {
                if (manifest.metadata.minSize.width > manifest.metadata.maxSize.width ||
                    manifest.metadata.minSize.height > manifest.metadata.maxSize.height) {
                    errors.push({
                        code: 'INVALID_SIZE_CONSTRAINTS',
                        message: 'Minimum size cannot be larger than maximum size',
                        field: 'metadata.minSize'
                    });
                }
            }
            // Validate price
            if (manifest.metadata.price !== undefined) {
                if (manifest.metadata.price < 0) {
                    errors.push({
                        code: 'INVALID_PRICE',
                        message: 'Price cannot be negative',
                        field: 'metadata.price'
                    });
                }
                if (manifest.metadata.price > 10000) {
                    warnings.push({
                        code: 'HIGH_PRICE',
                        message: 'Price seems unusually high',
                        field: 'metadata.price'
                    });
                }
            }
        }
        // Validate permissions
        if (!manifest.permissions) {
            errors.push({
                code: 'MISSING_PERMISSIONS',
                message: 'Element manifest must include permissions'
            });
        }
        else {
            Object.keys(manifest.permissions).forEach(key => {
                if (!allowedPermissionKeys.has(key)) {
                    errors.push({
                        code: 'UNKNOWN_PERMISSION',
                        message: `Unknown permission ${key} is not supported`,
                        field: `permissions.${key}`
                    });
                }
            });
            // Check for excessive permissions
            const permissionCount = Object.values(manifest.permissions).filter(v => v === true).length;
            if (permissionCount > 5) {
                warnings.push({
                    code: 'EXCESSIVE_PERMISSIONS',
                    message: 'Element requests many permissions, which may concern users'
                });
            }
            // Validate resource limits
            if (manifest.permissions.maxMemory && manifest.permissions.maxMemory > 100) {
                warnings.push({
                    code: 'HIGH_MEMORY_LIMIT',
                    message: 'Memory limit exceeds recommended 100MB',
                    field: 'permissions.maxMemory'
                });
            }
            if (manifest.permissions.maxCpu && manifest.permissions.maxCpu > 50) {
                warnings.push({
                    code: 'HIGH_CPU_LIMIT',
                    message: 'CPU limit exceeds recommended 50%',
                    field: 'permissions.maxCpu'
                });
            }
        }
        // Validate dependencies
        if (manifest.dependencies) {
            Object.entries(manifest.dependencies).forEach(([pkg, version]) => {
                // Check for insecure packages
                const insecurePackages = ['eval', 'child_process', 'fs'];
                if (insecurePackages.some(p => pkg.includes(p))) {
                    errors.push({
                        code: 'INSECURE_DEPENDENCY',
                        message: `Dependency ${pkg} may pose security risks`,
                        field: `dependencies.${pkg}`
                    });
                }
                // Validate version format
                if (typeof version !== 'string') {
                    errors.push({
                        code: 'INVALID_DEPENDENCY_VERSION',
                        message: `Invalid version for dependency ${pkg}`,
                        field: `dependencies.${pkg}`
                    });
                }
            });
        }
        // Validate build configuration
        if (manifest.build) {
            if (!manifest.build.entry) {
                errors.push({
                    code: 'MISSING_BUILD_ENTRY',
                    message: 'Build configuration must specify entry point',
                    field: 'build.entry'
                });
            }
            if (!manifest.build.output) {
                errors.push({
                    code: 'MISSING_BUILD_OUTPUT',
                    message: 'Build configuration must specify output',
                    field: 'build.output'
                });
            }
        }
        return {
            valid: errors.length === 0,
            errors,
            warnings
        };
    }
    /**
     * Validate element code
     */
    static validateCode(code) {
        const errors = [];
        const warnings = [];
        // Check for dangerous patterns
        const dangerousPatterns = [
            { pattern: /eval\s*\(/, message: 'Use of eval() is not allowed' },
            { pattern: /Function\s*\(/, message: 'Use of Function constructor is not allowed' },
            { pattern: /innerHTML\s*=/, message: 'Direct innerHTML assignment is not allowed' },
            { pattern: /document\.write/, message: 'Use of document.write is not allowed' },
            { pattern: /__proto__/, message: 'Prototype pollution attempts are not allowed' }
        ];
        dangerousPatterns.forEach(({ pattern, message }) => {
            if (pattern.test(code)) {
                errors.push({
                    code: 'DANGEROUS_CODE',
                    message
                });
            }
        });
        // Check for suspicious patterns
        const suspiciousPatterns = [
            { pattern: /localStorage/, message: 'Direct localStorage access detected, use element API instead' },
            { pattern: /fetch\s*\(/, message: 'Direct fetch calls detected, ensure network permission is requested' },
            { pattern: /XMLHttpRequest/, message: 'XMLHttpRequest detected, ensure network permission is requested' }
        ];
        suspiciousPatterns.forEach(({ pattern, message }) => {
            if (pattern.test(code)) {
                warnings.push({
                    code: 'SUSPICIOUS_CODE',
                    message
                });
            }
        });
        // Check code size
        if (code.length > 1000000) {
            errors.push({
                code: 'CODE_TOO_LARGE',
                message: 'Element code exceeds 1MB limit'
            });
        }
        else if (code.length > 500000) {
            warnings.push({
                code: 'LARGE_CODE_SIZE',
                message: 'Element code is large and may affect performance'
            });
        }
        return {
            valid: errors.length === 0,
            errors,
            warnings
        };
    }
    /**
     * Validate element name
     */
    static validateName(name) {
        // Must be 3-50 characters
        if (name.length < 3 || name.length > 50)
            return false;
        // Must start with a letter
        if (!/^[a-zA-Z]/.test(name))
            return false;
        // Can contain letters, numbers, spaces, and hyphens
        if (!/^[a-zA-Z0-9\s-]+$/.test(name))
            return false;
        return true;
    }
}
exports.ElementValidator = ElementValidator;
