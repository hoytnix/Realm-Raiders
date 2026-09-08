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

const PROJECT_ROOT = process.cwd();
const PATCHES_DIR = path.join(PROJECT_ROOT, 'patches');
const REGISTRY_FILE = path.join(PROJECT_ROOT, '.ast-patches.json');

const PARSER_CONFIG = {
  sourceType: 'module',
  plugins: ['jsx', 'typescript'],
};

// ============================================================================
// AST Utility Toolkit (Injected into Patch Transformers)
// ============================================================================
export const astHelpers = {
  t,
  template,
  traverse,
  generate,
  parse: (code) => parse(code, PARSER_CONFIG),

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
      openingElement.attributes.push(
        t.jsxAttribute(
          t.jsxIdentifier(attrName),
          t.jsxExpressionContainer(valueExpression)
        )
      );
    }
  },

  injectHookReturnProp(functionDeclaration, propName) {
    const returnStmt = functionDeclaration.body.body.find((n) => t.isReturnStatement(n));
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
};

// ============================================================================
// Patch Registry & Ledger Management
// ============================================================================
function getRegistry() {
  if (!fs.existsSync(REGISTRY_FILE)) {
    return { version: 1, applied: [] };
  }
  try {
    return JSON.parse(fs.readFileSync(REGISTRY_FILE, 'utf8'));
  } catch (e) {
    return { version: 1, applied: [] };
  }
}

function saveRegistry(registry) {
  fs.writeFileSync(REGISTRY_FILE, JSON.stringify(registry, null, 2) + '\n', 'utf8');
}

function computeFileHash(filePath) {
  const fileBuffer = fs.readFileSync(filePath);
  return crypto.createHash('sha256').update(fileBuffer).digest('hex');
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
// Sandbox & Transformation Runner
// ============================================================================
function transformFileInSandbox(sandboxDir, relativeFilePath, transformFn) {
  const fullPath = path.join(sandboxDir, relativeFilePath);
  if (!fs.existsSync(fullPath)) {
    console.warn(`[WARN] Target file not found: ${relativeFilePath}`);
    return;
  }

  const code = fs.readFileSync(fullPath, 'utf8');
  const ast = parse(code, PARSER_CONFIG);

  transformFn(ast, { ...astHelpers, code });

  const output = generate(ast, { retainLines: false, compact: false }, code);
  fs.writeFileSync(fullPath, output.code, 'utf8');
  console.log(`  -> Applied transform to ${relativeFilePath}`);
}

async function runEngine(options = {}) {
  const { dryRun = false, force = false, targetPatchId = null } = options;
  const registry = getRegistry();
  const allPatches = await loadPatches();

  if (allPatches.length === 0) {
    console.log('[INFO] No patch files found in ./patches directory.');
    return;
  }

  const pendingPatches = allPatches.filter((p) => {
    if (targetPatchId && p.id !== targetPatchId) return false;
    const isApplied = registry.applied.some((a) => a.id === p.id);
    return force || !isApplied;
  });

  if (pendingPatches.length === 0) {
    console.log('[INFO] All patches are up-to-date. Nothing to apply.');
    return;
  }

  console.log(`\n[PATCH ENGINE] Found ${pendingPatches.length} pending patch(es):`);
  pendingPatches.forEach((p) => console.log(`  - [${p.id}] ${p.description}`));

  // Initialize Isolated Sandbox
  const sandboxDir = fs.mkdtempSync(path.join(os.tmpdir(), 'realm-raiders-sandbox-'));
  console.log(`\n[SANDBOX] Initialized staging environment at: ${sandboxDir}`);

  const touchedRelativeFiles = new Set();

  try {
    fs.cpSync(PROJECT_ROOT, sandboxDir, {
      recursive: true,
      filter: (src) => {
        const rel = path.relative(PROJECT_ROOT, src);
        if (!rel) return true;
        const rootSegment = rel.split(path.sep)[0];
        return !['node_modules', '.git', 'dist', '.cache'].includes(rootSegment);
      },
    });

    const srcNodeModules = path.join(PROJECT_ROOT, 'node_modules');
    const targetNodeModules = path.join(sandboxDir, 'node_modules');
    if (fs.existsSync(srcNodeModules)) {
      fs.symlinkSync(srcNodeModules, targetNodeModules, 'junction');
    }

    // Sequentially apply patches in the sandbox
    for (const patch of pendingPatches) {
      console.log(`\n[APPLYING] ${patch.id} (${patch.file})...`);
      for (const [relPath, transformFn] of Object.entries(patch.transforms)) {
        transformFileInSandbox(sandboxDir, relPath, transformFn);
        touchedRelativeFiles.add(relPath);
      }
    }

    // Step 1: Sandbox Lint Verification
    console.log('\n[VERIFY] Executing `pnpm lint` in sandbox...');
    try {
      execSync('pnpm lint', {
        cwd: sandboxDir,
        stdio: 'inherit',
        env: { ...process.env, CI: 'true' },
      });
      console.log('[VERIFY PASS] `pnpm lint` passed with 0 errors.');
    } catch (e) {
      console.error('\n[VERIFY FAIL] Sandbox failed `pnpm lint`. Aborting all patches.');
      process.exit(1);
    }

    // Step 2: Sandbox Build Verification
    console.log('\n[VERIFY] Executing `pnpm build` in sandbox...');
    try {
      execSync('pnpm build', {
        cwd: sandboxDir,
        stdio: 'inherit',
        env: { ...process.env, CI: 'true' },
      });
      console.log('[VERIFY PASS] `pnpm build` completed successfully.');
    } catch (e) {
      console.error('\n[VERIFY FAIL] Sandbox failed `pnpm build`. Aborting all patches.');
      process.exit(1);
    }

    // Step 3: Atomic Flush to Workspace
    if (dryRun) {
      console.log('\n[DRY RUN COMPLETE] All checks passed. Source workspace left untouched.');
    } else {
      console.log('\n[COMMIT] Flushing verified files to project workspace...');
      for (const relFile of touchedRelativeFiles) {
        const srcPath = path.join(sandboxDir, relFile);
        const destPath = path.join(PROJECT_ROOT, relFile);
        fs.mkdirSync(path.dirname(destPath), { recursive: true });
        fs.copyFileSync(srcPath, destPath);
        console.log(`  ✓ Written: ${relFile}`);
      }

      // Record to Ledger
      for (const patch of pendingPatches) {
        const idx = registry.applied.findIndex((a) => a.id === patch.id);
        const record = {
          id: patch.id,
          file: patch.file,
          description: patch.description,
          appliedAt: new Date().toISOString(),
          sha256: patch.sha256,
        };
        if (idx >= 0) {
          registry.applied[idx] = record;
        } else {
          registry.applied.push(record);
        }
      }
      saveRegistry(registry);
      console.log(`  ✓ Updated registry ledger (.ast-patches.json)`);
      console.log('\n=== All patches successfully verified and applied! ===\n');
    }
  } finally {
    try {
      fs.rmSync(sandboxDir, { recursive: true, force: true });
      console.log('[SANDBOX] Cleaned up temporary staging directory.');
    } catch (e) {}
  }
}

// ============================================================================
// CLI Command Surface
// ============================================================================
async function printStatus() {
  const registry = getRegistry();
  const allPatches = await loadPatches();

  console.log('\n=================== Realm Raiders AST Patches ===================');
  if (allPatches.length === 0) {
    console.log('No patches found in ./patches\n');
    return;
  }

  allPatches.forEach((patch) => {
    const appliedEntry = registry.applied.find((a) => a.id === patch.id);
    const status = appliedEntry
      ? `[APPLIED: ${appliedEntry.appliedAt.split('T')[0]}]`
      : '[PENDING]';
    console.log(`${status.padEnd(23)} ${patch.id} - ${patch.description}`);
  });
  console.log('=================================================================\n');
}

function createNewPatch(name) {
  if (!name) {
    console.error('[ERROR] Please specify a patch name: node apply-ast-patches.mjs new <name>');
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

  const boilerplate = `/* eslint-disable */
export const id = '${prefix}_${safeName}';
export const description = 'Describe your AST transformation here';

export const transforms = {
  // 'src/components/MyComponent.jsx': (ast, { t, template, traverse, ensureObjectPatternProp }) => {
  //   traverse(ast, {
  //     JSXElement(path) {
  //       // your transformation logic
  //     }
  //   });
  // },
};
`;

  fs.writeFileSync(targetPath, boilerplate, 'utf8');
  console.log(`[CREATED] New patch generated at: patches/${fileName}`);
}

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  if (command === 'status') {
    await printStatus();
    return;
  }

  if (command === 'new') {
    createNewPatch(args[1]);
    return;
  }

  const dryRun = args.includes('--dry-run');
  const force = args.includes('--force');
  const targetIndex = args.indexOf('--patch');
  const targetPatchId = targetIndex !== -1 ? args[targetIndex + 1] : null;

  await runEngine({ dryRun, force, targetPatchId });
}

main();
