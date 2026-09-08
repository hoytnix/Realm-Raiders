#!/usr/bin/env node
/* eslint-disable */
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import crypto from 'node:crypto';
import { execSync } from 'node:child_process';
import { parse } from '@babel/parser';
import traversePkg from '@babel/traverse';
import generatePkg from '@babel/generator';
import templatePkg from '@babel/template';
import * as t from '@babel/types';

const traverse = traversePkg.default || traversePkg;
const generate = generatePkg.default || generatePkg;
const template = templatePkg.default || templatePkg;

// ============================================================================
// 1. CONFIGURATION & RUNTIME DEFAULTS (Patchiest Model Layer)
// ============================================================================
const PROJECT_ROOT = process.cwd();
const CONFIG_FILE = path.join(PROJECT_ROOT, '.patchiestrc.json');

const DEFAULT_CONFIG = {
  patchesDir: 'patches',
  registryFile: '.ast-patches.json',
  snapshotDir: '.ast-snapshots',
  verificationSteps: [
    { name: 'lint', cmd: 'pnpm lint' },
    { name: 'typecheck', cmd: 'pnpm typecheck' },
    { name: 'build', cmd: 'pnpm build' },
  ],
  parserConfig: {
    sourceType: 'module',
    plugins: ['jsx', 'typescript', 'decorators-legacy', 'classProperties'],
  },
  ignoreSegments: ['node_modules', '.git', 'dist', '.cache', '.ast-snapshots', 'coverage'],
};

function loadConfig() {
  if (fs.existsSync(CONFIG_FILE)) {
    try {
      const userConfig = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
      return { ...DEFAULT_CONFIG, ...userConfig };
    } catch (e) {
      console.warn(`[WARN] Failed to parse .patchiestrc.json. Falling back to defaults.`);
    }
  }
  return DEFAULT_CONFIG;
}

const CONFIG = loadConfig();
const PATCHES_DIR = path.join(PROJECT_ROOT, CONFIG.patchesDir);
const REGISTRY_FILE = path.join(PROJECT_ROOT, CONFIG.registryFile);
const SNAPSHOTS_DIR = path.join(PROJECT_ROOT, CONFIG.snapshotDir);

// ============================================================================
// 2. EXTENDED AST HELPER TOOLKIT (Patchiest Helpers Layer)
// ============================================================================
export const astHelpers = {
  t,
  template,
  traverse,
  generate,
  parse: (code) => parse(code, CONFIG.parserConfig),

  ensureImport(ast, { source, imported = null, local = null, isDefault = false, isNamespace = false }) {
    let importDecl = ast.program.body.find(
      (node) => t.isImportDeclaration(node) && node.source.value === source
    );

    const localName = local || imported;

    if (!importDecl) {
      let specifiers = [];
      if (isDefault) {
        specifiers.push(t.importDefaultSpecifier(t.identifier(localName)));
      } else if (isNamespace) {
        specifiers.push(t.importNamespaceSpecifier(t.identifier(localName)));
      } else if (imported) {
        specifiers.push(t.importSpecifier(t.identifier(localName), t.identifier(imported)));
      }
      importDecl = t.importDeclaration(specifiers, t.stringLiteral(source));
      ast.program.body.unshift(importDecl);
      return;
    }

    if (isDefault) {
      const hasDefault = importDecl.specifiers.some((s) => t.isImportDefaultSpecifier(s));
      if (!hasDefault) {
        importDecl.specifiers.unshift(t.importDefaultSpecifier(t.identifier(localName)));
      }
    } else if (isNamespace) {
      const hasNamespace = importDecl.specifiers.some((s) => t.isImportNamespaceSpecifier(s));
      if (!hasNamespace) {
        importDecl.specifiers.push(t.importNamespaceSpecifier(t.identifier(localName)));
      }
    } else if (imported) {
      const exists = importDecl.specifiers.some(
        (s) => t.isImportSpecifier(s) && s.imported.name === imported
      );
      if (!exists) {
        importDecl.specifiers.push(
          t.importSpecifier(t.identifier(localName), t.identifier(imported))
        );
      }
    }
  },

  removeImport(ast, source, importedName = null) {
    ast.program.body = ast.program.body.filter((node) => {
      if (!t.isImportDeclaration(node) || node.source.value !== source) return true;
      if (!importedName) return false; // Remove entire declaration

      node.specifiers = node.specifiers.filter((s) => {
        if (t.isImportSpecifier(s) && s.imported.name === importedName) return false;
        if (t.isImportDefaultSpecifier(s) && s.local.name === importedName) return false;
        return true;
      });
      return node.specifiers.length > 0;
    });
  },

  ensureObjectPatternProp(pattern, propName, defaultValue = null) {
    if (!t.isObjectPattern(pattern)) return;
    const exists = pattern.properties.some(
      (p) => (t.isObjectProperty(p) || t.isRestElement(p)) && p.key?.name === propName
    );
    if (!exists) {
      if (defaultValue) {
        pattern.properties.push(
          t.objectProperty(
            t.identifier(propName),
            t.assignmentPattern(t.identifier(propName), defaultValue)
          )
        );
      } else {
        pattern.properties.push(
          t.objectProperty(t.identifier(propName), t.identifier(propName), false, true)
        );
      }
    }
  },

  ensureJSXAttribute(openingElement, attrName, valueExpression) {
    const exists = openingElement.attributes.some(
      (a) => t.isJSXAttribute(a) && a.name?.name === attrName
    );
    if (!exists) {
      const attrValue = t.isStringLiteral(valueExpression)
        ? valueExpression
        : t.jsxExpressionContainer(valueExpression);
      openingElement.attributes.push(t.jsxAttribute(t.jsxIdentifier(attrName), attrValue));
    }
  },

  removeJSXAttribute(openingElement, attrName) {
    openingElement.attributes = openingElement.attributes.filter(
      (a) => !(t.isJSXAttribute(a) && a.name?.name === attrName)
    );
  },

  findJSXElements(ast, tagName) {
    const elements = [];
    traverse(ast, {
      JSXOpeningElement(path) {
        if (path.node.name.name === tagName) {
          elements.push(path);
        }
      },
    });
    return elements;
  },

  injectHookReturnProp(functionDeclaration, propName) {
    const body = functionDeclaration.body?.body || [];
    const returnStmt = body.find((n) => t.isReturnStatement(n));
    if (returnStmt && t.isObjectExpression(returnStmt.argument)) {
      const exists = returnStmt.argument.properties.some(
        (p) => t.isObjectProperty(p) && p.key?.name === propName
      );
      if (!exists) {
        returnStmt.argument.properties.push(
          t.objectProperty(t.identifier(propName), t.identifier(propName), false, true)
        );
      }
    }
  },

  insertStatement(astBody, statement, position = 'end', targetMatchFn = null) {
    if (position === 'start') {
      astBody.unshift(statement);
    } else if (position === 'end') {
      astBody.push(statement);
    } else if (targetMatchFn && typeof targetMatchFn === 'function') {
      const index = astBody.findIndex(targetMatchFn);
      if (index !== -1) {
        const insertIdx = position === 'before' ? index : index + 1;
        astBody.splice(insertIdx, 0, statement);
      } else {
        astBody.push(statement);
      }
    }
  },
};

// ============================================================================
// 3. REGISTRY & LEDGER SYSTEM (Patchiest Registry Layer)
// ============================================================================
function computeFileHash(filePath) {
  if (!fs.existsSync(filePath)) return null;
  const buffer = fs.readFileSync(filePath);
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

function getRegistry() {
  if (!fs.existsSync(REGISTRY_FILE)) {
    return { schemaVersion: 2, applied: [] };
  }
  try {
    return JSON.parse(fs.readFileSync(REGISTRY_FILE, 'utf8'));
  } catch (e) {
    return { schemaVersion: 2, applied: [] };
  }
}

function saveRegistry(registry) {
  fs.writeFileSync(REGISTRY_FILE, JSON.stringify(registry, null, 2) + '\n', 'utf8');
}

async function loadPatches() {
  if (!fs.existsSync(PATCHES_DIR)) {
    fs.mkdirSync(PATCHES_DIR, { recursive: true });
    return [];
  }

  const files = fs.readdirSync(PATCHES_DIR)
    .filter((f) => f.endsWith('.mjs') || f.endsWith('.js'))
    .sort();

  const patches = [];
  for (const file of files) {
    const patchPath = path.join(PATCHES_DIR, file);
    const mod = await import(`file://${patchPath}`);
    patches.push({
      file,
      path: patchPath,
      id: mod.id || path.basename(file, path.extname(file)),
      description: mod.description || 'No description provided',
      transforms: mod.transforms || {},
      sha256: computeFileHash(patchPath),
    });
  }
  return patches;
}

// ============================================================================
// 4. SNAPSHOT & ROLLBACK SUBSYSTEM
// ============================================================================
function createSnapshot(patchId, relativeFiles) {
  const snapshotTimestamp = Date.now();
  const snapshotPath = path.join(SNAPSHOTS_DIR, `${patchId}_${snapshotTimestamp}`);
  fs.mkdirSync(snapshotPath, { recursive: true });

  const manifest = { patchId, timestamp: snapshotTimestamp, files: [] };

  for (const rel of relativeFiles) {
    const src = path.join(PROJECT_ROOT, rel);
    if (fs.existsSync(src)) {
      const dest = path.join(snapshotPath, rel);
      fs.mkdirSync(path.dirname(dest), { recursive: true });
      fs.copyFileSync(src, dest);
      manifest.files.push({ relativePath: rel, originalHash: computeFileHash(src) });
    }
  }

  fs.writeFileSync(path.join(snapshotPath, 'manifest.json'), JSON.stringify(manifest, null, 2));
  return snapshotPath;
}

function restoreSnapshot(patchId) {
  if (!fs.existsSync(SNAPSHOTS_DIR)) return false;

  const entries = fs.readdirSync(SNAPSHOTS_DIR)
    .filter((d) => d.startsWith(`${patchId}_`))
    .sort()
    .reverse();

  if (entries.length === 0) return false;

  const targetSnapshot = path.join(SNAPSHOTS_DIR, entries[0]);
  const manifest = JSON.parse(fs.readFileSync(path.join(targetSnapshot, 'manifest.json'), 'utf8'));

  for (const fileInfo of manifest.files) {
    const src = path.join(targetSnapshot, fileInfo.relativePath);
    const dest = path.join(PROJECT_ROOT, fileInfo.relativePath);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(src, dest);
    console.log(`  ↺ Restored: ${fileInfo.relativePath}`);
  }

  return true;
}

// ============================================================================
// 5. ENGINE & VERIFICATION PIPELINE (Patchiest Core Engine)
// ============================================================================
function transformFileInSandbox(sandboxDir, relativeFilePath, transformFn) {
  const fullPath = path.join(sandboxDir, relativeFilePath);
  if (!fs.existsSync(fullPath)) {
    throw new Error(`Target file does not exist: ${relativeFilePath}`);
  }

  const code = fs.readFileSync(fullPath, 'utf8');
  const ast = parse(code, CONFIG.parserConfig);

  transformFn(ast, { ...astHelpers, code });

  const output = generate(ast, { retainLines: false, compact: false }, code);
  fs.writeFileSync(fullPath, output.code, 'utf8');
  console.log(`  ✓ Transformed: ${relativeFilePath}`);
}

function verifySandboxEnvironment(sandboxDir, verificationSteps) {
  for (const step of verificationSteps) {
    console.log(`\n[VERIFY] Executing '${step.name}' via \`${step.cmd}\`...`);
    try {
      execSync(step.cmd, {
        cwd: sandboxDir,
        stdio: 'inherit',
        env: { ...process.env, CI: 'true', NODE_ENV: 'test' },
      });
      console.log(`[PASS] ${step.name} succeeded.`);
    } catch (e) {
      throw new Error(`Verification step '${step.name}' failed.`);
    }
  }
}

async function runEngine(options = {}) {
  const {
    dryRun = false,
    force = false,
    targetPatchId = null,
    skipVerify = false,
    verifyOnly = false,
  } = options;

  const registry = getRegistry();
  const allPatches = await loadPatches();

  if (verifyOnly) {
    console.log('[VERIFY ONLY] Executing verification pipeline on current repository state...');
    verifySandboxEnvironment(PROJECT_ROOT, CONFIG.verificationSteps);
    console.log('[VERIFY PASS] Workspace verified with 0 errors.');
    return;
  }

  const pendingPatches = allPatches.filter((p) => {
    if (targetPatchId && p.id !== targetPatchId) return false;
    const isApplied = registry.applied.some((a) => a.id === p.id);
    return force || !isApplied;
  });

  if (pendingPatches.length === 0) {
    console.log('[INFO] No pending patches to apply.');
    return;
  }

  console.log(`\n[PATCHIEST] Preparing execution pipeline for ${pendingPatches.length} patch(es):`);
  pendingPatches.forEach((p) => console.log(`  • [${p.id}] ${p.description}`));

  const sandboxDir = fs.mkdtempSync(path.join(os.tmpdir(), 'patchiest-sandbox-'));
  console.log(`\n[SANDBOX] Isolation space provisioned: ${sandboxDir}`);

  const touchedFiles = new Set();
  const patchFileMap = new Map();

  try {
    fs.cpSync(PROJECT_ROOT, sandboxDir, {
      recursive: true,
      filter: (src) => {
        const rel = path.relative(PROJECT_ROOT, src);
        if (!rel) return true;
        const firstSegment = rel.split(path.sep)[0];
        return !CONFIG.ignoreSegments.includes(firstSegment);
      },
    });

    const srcNodeModules = path.join(PROJECT_ROOT, 'node_modules');
    const targetNodeModules = path.join(sandboxDir, 'node_modules');
    if (fs.existsSync(srcNodeModules)) {
      const symlinkType = os.platform() === 'win32' ? 'junction' : 'dir';
      fs.symlinkSync(srcNodeModules, targetNodeModules, symlinkType);
    }

    for (const patch of pendingPatches) {
      console.log(`\n[APPLYING] ${patch.id} (${patch.file})...`);
      const patchTouched = [];
      for (const [relPath, transformFn] of Object.entries(patch.transforms)) {
        transformFileInSandbox(sandboxDir, relPath, transformFn);
        touchedFiles.add(relPath);
        patchTouched.push(relPath);
      }
      patchFileMap.set(patch.id, patchTouched);
    }

    if (!skipVerify) {
      verifySandboxEnvironment(sandboxDir, CONFIG.verificationSteps);
    } else {
      console.log('\n[SKIP] Verification steps bypassed via flags.');
    }

    if (dryRun) {
      console.log('\n[DRY RUN] All AST mutations and verifications passed. No changes written.');
    } else {
      console.log('\n[ATOMIC COMMIT] Writing verified AST modifications to workspace...');

      for (const patch of pendingPatches) {
        const files = patchFileMap.get(patch.id) || [];
        createSnapshot(patch.id, files);
      }

      for (const relFile of touchedFiles) {
        const srcPath = path.join(sandboxDir, relFile);
        const destPath = path.join(PROJECT_ROOT, relFile);
        fs.mkdirSync(path.dirname(destPath), { recursive: true });
        fs.copyFileSync(srcPath, destPath);
        console.log(`  ✓ Written: ${relFile}`);
      }

      for (const patch of pendingPatches) {
        const existingIdx = registry.applied.findIndex((a) => a.id === patch.id);
        const record = {
          id: patch.id,
          file: patch.file,
          description: patch.description,
          appliedAt: new Date().toISOString(),
          sha256: patch.sha256,
          modifiedFiles: patchFileMap.get(patch.id) || [],
        };

        if (existingIdx >= 0) {
          registry.applied[existingIdx] = record;
        } else {
          registry.applied.push(record);
        }
      }

      saveRegistry(registry);
      console.log(`  ✓ Updated synchronization ledger (${CONFIG.registryFile})`);
      console.log('\n=== Execution Completed Successfully ===\n');
    }
  } catch (error) {
    console.error(`\n[EXECUTION HALTED] ${error.message}`);
    process.exit(1);
  } finally {
    try {
      fs.rmSync(sandboxDir, { recursive: true, force: true });
      console.log('[SANDBOX] Ephemeral sandbox cleaned.');
    } catch (e) {}
  }
}

// ============================================================================
// 6. ROLLBACK HANDLER
// ============================================================================
async function runRollback(targetPatchId = null) {
  const registry = getRegistry();

  if (registry.applied.length === 0) {
    console.log('[INFO] No applied patches found in ledger to roll back.');
    return;
  }

  let patchToRevert;
  if (targetPatchId) {
    patchToRevert = registry.applied.find((p) => p.id === targetPatchId);
    if (!patchToRevert) {
      console.error(`[ERROR] Patch '${targetPatchId}' is not recorded as applied.`);
      process.exit(1);
    }
  } else {
    patchToRevert = registry.applied[registry.applied.length - 1];
  }

  console.log(`\n[ROLLBACK] Reverting patch [${patchToRevert.id}]...`);
  const success = restoreSnapshot(patchToRevert.id);

  if (!success) {
    console.error(`[ERROR] Could not find snapshot to restore patch '${patchToRevert.id}'.`);
    process.exit(1);
  }

  registry.applied = registry.applied.filter((p) => p.id !== patchToRevert.id);
  saveRegistry(registry);

  console.log(`  ✓ Unregistered from ledger (${CONFIG.registryFile})`);
  console.log(`\n[ROLLBACK COMPLETE] Successfully reverted ${patchToRevert.id}.\n`);
}

// ============================================================================
// 7. CLI COMMAND SURFACE (Patchiest Dispatcher)
// ============================================================================
async function printStatus() {
  const registry = getRegistry();
  const allPatches = await loadPatches();

  console.log('\n========================= Patchiest Registry Status =========================');
  if (allPatches.length === 0) {
    console.log('No patches discovered in patches directory.\n');
    return;
  }

  allPatches.forEach((patch) => {
    const appliedEntry = registry.applied.find((a) => a.id === patch.id);
    let status = '[PENDING]';

    if (appliedEntry) {
      const isDrifted = appliedEntry.sha256 !== patch.sha256;
      status = isDrifted ? '[DRIFT DETECTED]' : `[APPLIED: ${appliedEntry.appliedAt.split('T')[0]}]`;
    }

    console.log(`${status.padEnd(25)} ${patch.id.padEnd(20)} ${patch.description}`);
  });
  console.log('=============================================================================\n');
}

function createNewPatch(name, templateType = 'default') {
  if (!name) {
    console.error('[ERROR] Patch name required: node patchiest.mjs new <name> [--template <type>]');
    process.exit(1);
  }

  if (!fs.existsSync(PATCHES_DIR)) {
    fs.mkdirSync(PATCHES_DIR, { recursive: true });
  }

  const count = fs.readdirSync(PATCHES_DIR).length + 1;
  const prefix = String(count).padStart(3, '0');
  const safeName = name.toLowerCase().replace(/[^a-z0-9_]/g, '_');
  const fileName = `${prefix}_${safeName}.mjs`;
  const targetPath = path.join(PATCHES_DIR, fileName);

  let templateBody = '';
  if (templateType === 'jsx') {
    templateBody = `export const transforms = {
  'src/Component.tsx': (ast, { ensureImport, ensureJSXAttribute, findJSXElements }) => {
    // 1. Ensure dependent imports
    ensureImport(ast, { source: 'clsx', imported: 'clsx', isDefault: true });

    // 2. Locate opening elements and guarantee attributes
    const elements = findJSXElements(ast, 'button');
    elements.forEach((elemPath) => {
      ensureJSXAttribute(elemPath.node, 'data-patched', astHelpers.t.stringLiteral('true'));
    });
  },
};`;
  } else {
    templateBody = `export const transforms = {
  // 'src/index.ts': (ast, { t, template, traverse, ensureImport }) => {
  //   ensureImport(ast, { source: '@/config', imported: 'APP_CONFIG' });
  // },
};`;
  }

  const boilerplate = `/* eslint-disable */
export const id = '${prefix}_${safeName}';
export const description = 'AST migration for ${safeName}';

${templateBody}
`;

  fs.writeFileSync(targetPath, boilerplate, 'utf8');
  console.log(`[GENERATED] Patch created: ${path.relative(PROJECT_ROOT, targetPath)}`);
}

async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'apply';

  switch (command) {
    case 'status':
      await printStatus();
      break;

    case 'new': {
      const name = args[1];
      const templateIdx = args.indexOf('--template');
      const templateType = templateIdx !== -1 ? args[templateIdx + 1] : 'default';
      createNewPatch(name, templateType);
      break;
    }

    case 'rollback': {
      const patchIdx = args.indexOf('--patch');
      const targetId = patchIdx !== -1 ? args[patchIdx + 1] : null;
      await runRollback(targetId);
      break;
    }

    case 'verify':
      await runEngine({ verifyOnly: true });
      break;

    case 'apply':
    default: {
      const dryRun = args.includes('--dry-run');
      const force = args.includes('--force');
      const skipVerify = args.includes('--skip-verify');
      const targetIndex = args.indexOf('--patch');
      const targetPatchId = targetIndex !== -1 ? args[targetIndex + 1] : null;

      await runEngine({ dryRun, force, targetPatchId, skipVerify });
      break;
    }
  }
}

main();
