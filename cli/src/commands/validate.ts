import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import ora from 'ora';
import { isValidPermissionKey } from './permissionKeys';

export { VALID_PERMISSION_KEYS, isValidPermissionKey } from './permissionKeys';

export interface ValidateOptions {
  strict: boolean;
  config?: string;
  fix: boolean;
}

export class ValidateCommand {
  constructor(private options: ValidateOptions) {}

  async execute(): Promise<void> {
    const spinner = ora('Validating element...').start();
    
    try {
      const issues: Array<{ type: 'error' | 'warning'; message: string }> = [];
      
      // Check manifest.json
      await this.validateManifest(issues);
      
      // Check package.json
      await this.validatePackageJson(issues);
      
      // Check entry point
      await this.validateEntryPoint(issues);
      
      // Check required files
      await this.validateRequiredFiles(issues);

      // Report results
      const errors = issues.filter(i => i.type === 'error');
      const warnings = issues.filter(i => i.type === 'warning');

      if (errors.length > 0) {
        spinner.fail('Validation failed');
        console.log();
        console.log(chalk.red('❌ Errors:'));
        errors.forEach(error => {
          console.log(`  ${chalk.red('•')} ${error.message}`);
        });
      } else {
        spinner.succeed('Validation passed');
      }

      if (warnings.length > 0) {
        console.log();
        console.log(chalk.yellow('⚠️  Warnings:'));
        warnings.forEach(warning => {
          console.log(`  ${chalk.yellow('•')} ${warning.message}`);
        });
      }

      if (errors.length === 0 && warnings.length === 0) {
        console.log();
        console.log(chalk.green('🎉 Element validation passed with no issues!'));
      }

      console.log();

      if (errors.length > 0) {
        throw new Error('Validation failed');
      }

    } catch (error) {
      spinner.fail('Validation failed');
      throw error;
    }
  }

  private async validateManifest(issues: Array<{ type: 'error' | 'warning'; message: string }>): Promise<void> {
    try {
      const manifestPath = path.join(process.cwd(), 'manifest.json');
      
      if (!await fs.pathExists(manifestPath)) {
        issues.push({
          type: 'error',
          message: 'manifest.json is required'
        });
        return;
      }

      const manifest = await fs.readJson(manifestPath);
      
      // Required fields
      const requiredFields = ['id', 'name', 'version', 'description', 'category'];
      for (const field of requiredFields) {
        if (!manifest[field]) {
          issues.push({
            type: 'error',
            message: `manifest.json missing required field: ${field}`
          });
        }
      }

      // Validate permissions against SDK ElementPermissions keys
      if (manifest.permissions) {
        for (const permission of Object.keys(manifest.permissions)) {
          if (!isValidPermissionKey(permission)) {
            issues.push({
              type: 'error',
              message: `Unknown permission in manifest.json: ${permission}`
            });
          }
        }
      }

         } catch (error) {
       issues.push({
         type: 'error',
         message: `Failed to parse manifest.json: ${error instanceof Error ? error.message : String(error)}`
       });
     }
  }

  private async validatePackageJson(issues: Array<{ type: 'error' | 'warning'; message: string }>): Promise<void> {
    try {
      const packagePath = path.join(process.cwd(), 'package.json');
      
      if (!await fs.pathExists(packagePath)) {
        issues.push({
          type: 'error',
          message: 'package.json is required'
        });
        return;
      }

      const pkg = await fs.readJson(packagePath);
      
      // Check SDK dependency
      if (!pkg.dependencies || !pkg.dependencies['@defai/element-sdk']) {
        issues.push({
          type: 'error',
          message: 'package.json must include @defai/element-sdk dependency'
        });
      }

         } catch (error) {
       issues.push({
         type: 'error',
         message: `Failed to parse package.json: ${error instanceof Error ? error.message : String(error)}`
       });
     }
  }

  private async validateEntryPoint(issues: Array<{ type: 'error' | 'warning'; message: string }>): Promise<void> {
    const entryPoints = ['src/index.tsx', 'src/index.ts'];
    
    let hasEntryPoint = false;
    for (const entryPoint of entryPoints) {
      if (await fs.pathExists(path.join(process.cwd(), entryPoint))) {
        hasEntryPoint = true;
        break;
      }
    }

    if (!hasEntryPoint) {
      issues.push({
        type: 'error',
        message: 'No entry point found (src/index.tsx or src/index.ts required)'
      });
    }
  }

  private async validateRequiredFiles(issues: Array<{ type: 'error' | 'warning'; message: string }>): Promise<void> {
    const requiredFiles = ['tsconfig.json'];
    
    for (const file of requiredFiles) {
      if (!await fs.pathExists(path.join(process.cwd(), file))) {
        issues.push({
          type: 'warning',
          message: `Recommended file missing: ${file}`
        });
      }
    }
  }
} 