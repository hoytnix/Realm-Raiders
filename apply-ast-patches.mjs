/* eslint-disable */
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
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
const IS_DRY_RUN = process.argv.includes('--dry-run');

const PARSER_CONFIG = {
  sourceType: 'module',
  plugins: ['jsx', 'typescript'],
};

const transformedRelativeFiles = new Set();

function transformFileInDirectory(baseDir, relativeFilePath, visitor) {
  const absolutePath = path.join(baseDir, relativeFilePath);
  if (!fs.existsSync(absolutePath)) {
    console.warn(`[WARN] File not found in sandbox: ${relativeFilePath}`);
    return;
  }

  const code = fs.readFileSync(absolutePath, 'utf8');
  const ast = parse(code, PARSER_CONFIG);

  traverse(ast, visitor);

  const output = generate(ast, { retainLines: false, compact: false }, code);
  fs.writeFileSync(absolutePath, output.code, 'utf8');
  transformedRelativeFiles.add(relativeFilePath);
  console.log(`[AST PROCESSED] ${relativeFilePath}`);
}

function ensureObjectPatternProp(pattern, propName, defaultValue = null) {
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
}

// ---------------------------------------------------------------------------
// 1. AST Transformation Pipeline
// ---------------------------------------------------------------------------
function runTransformations(targetDir) {
  // 1A. Patch src/hooks/useGameState.js
  transformFileInDirectory(targetDir, 'src/hooks/useGameState.js', {
    VariableDeclarator(p) {
      if (p.node.id?.name === 'initialState' || p.node.id?.name === 'INITIAL_STATE') {
        if (t.isObjectExpression(p.node.init)) {
          const hasRevealedRivals = p.node.init.properties.some(
            (prop) => t.isObjectProperty(prop) && (prop.key.name === 'revealedRivals' || prop.key.value === 'revealedRivals')
          );
          if (!hasRevealedRivals) {
            p.node.init.properties.push(
              t.objectProperty(
                t.identifier('revealedRivals'),
                template.ast(`({
                  'ironforge-outpost': false,
                  'cinder-camp': false,
                  'tide-watch': false,
                  ironforge: false,
                  cinder: false,
                  tidewatch: false
                })`).expression
              )
            );
          }
        }
      }

      if (p.node.id?.name === 'assignWorkerToBuilding') {
        p.node.init = template.ast(`
          (buildingId, villagerId = null) => {
            setGameState((prev) => {
              const villagers = prev.villagers || [];
              const unassigned = villagers.filter((v) => v.role === 'Unassigned');

              if (!villagerId && unassigned.length === 0) {
                return prev;
              }

              const targetVillager = villagerId
                ? villagers.find((v) => v.id === villagerId)
                : unassigned[0];

              if (!targetVillager) return prev;

              const targetBuilding = (prev.buildings || []).find((b) => b.id === buildingId);
              if (!targetBuilding) return prev;

              const maxCapacity = (targetBuilding.tier || 1) * 2;
              const currentWorkers = targetBuilding.assignedWorkersCount || 0;
              if (currentWorkers >= maxCapacity) return prev;

              let role = 'Farming';
              if (targetBuilding.type === 'LUMBER_MILL') role = 'Forestry';
              if (targetBuilding.type === 'QUARRY') role = 'Masonry';
              if (targetBuilding.type === 'SPRING') role = 'Waterbearing';

              return {
                ...prev,
                villagers: villagers.map((v) =>
                  v.id === targetVillager.id ? { ...v, role, assignedBuildingId: buildingId } : v
                ),
                buildings: prev.buildings.map((b) =>
                  b.id === buildingId ? { ...b, assignedWorkersCount: currentWorkers + 1 } : b
                ),
              };
            });
          }
        `).expression;
      }
    },

    FunctionDeclaration(p) {
      if (p.node.id?.name === 'useGameState') {
        const block = p.node.body;

        const helpersToInject = [
          {
            name: 'assignVillagerRole',
            code: `
              const assignVillagerRole = (villagerId, role) => {
                setGameState((prev) => ({
                  ...prev,
                  villagers: (prev.villagers || []).map((v) =>
                    v.id === villagerId
                      ? { ...v, role, assignedBuildingId: role === 'Unassigned' ? null : v.assignedBuildingId }
                      : v
                  ),
                }));
              };
            `,
          },
          {
            name: 'recruitLaborer',
            code: `
              const recruitLaborer = () => {
                setGameState((prev) => {
                  const cost = 10;
                  if ((prev.resources?.gold || 0) < cost) return prev;
                  const count = (prev.villagers || []).length + 1;
                  return {
                    ...prev,
                    resources: { ...prev.resources, gold: prev.resources.gold - cost },
                    villagers: [
                      ...(prev.villagers || []),
                      {
                        id: 'vil_' + Date.now() + '_' + count,
                        name: 'Citizen ' + count,
                        role: 'Unassigned',
                        assignedBuildingId: null,
                        morale: 100,
                      },
                    ],
                  };
                });
              };
            `,
          },
          {
            name: 'dispatchSpy',
            code: `
              const dispatchSpy = (rivalId) => {
                setGameState((prev) => {
                  const spies = (prev.villagers || []).filter((v) => v.role === 'Spy');
                  if (spies.length === 0) return prev;
                  return {
                    ...prev,
                    revealedRivals: {
                      ...(prev.revealedRivals || {}),
                      [rivalId]: true,
                    },
                    chronicleLogs: [
                      {
                        id: 'spy_' + Date.now(),
                        timestamp: 'Day ' + (prev.chronometer?.day || 1) + ', 26 ADX',
                        text: 'Infiltration successful: ' + String(rivalId).toUpperCase() + ' revealed from fog of war.',
                      },
                      ...(prev.chronicleLogs || []),
                    ],
                  };
                });
              };
            `,
          },
        ];

        helpersToInject.forEach(({ name, code }) => {
          if (!p.scope.hasBinding(name)) {
            block.body.unshift(template.ast(code));
          }
        });

        p.traverse({
          IfStatement(ifPath) {
            const testCode = generate(ifPath.node.test).code;
            if (testCode.includes('Math.random') && (testCode.includes('raid') || testCode.includes('0.0'))) {
              const hasGuard = generate(ifPath.parentPath.node).code.includes('currentDay < 5');
              if (!hasGuard) {
                ifPath.insertBefore(
                  template.ast(`
                    const currentDay = gameState?.chronometer?.day || 1;
                    const hasBarracks = (gameState?.buildings || []).some((b) => b.type === 'BARRACKS' && b.tier >= 1);
                    const hasWealth = (gameState?.resources?.gold || 0) >= 80 || (gameState?.resources?.sustenance || 0) >= 100;
                    if (currentDay < 5 && !hasBarracks) return;
                    if (!hasWealth && Math.random() < 0.85) return;
                  `)
                );
              }
            }
          },
        });

        const returnStatement = block.body.find((n) => t.isReturnStatement(n));
        if (returnStatement && t.isObjectExpression(returnStatement.argument)) {
          ['assignVillagerRole', 'recruitLaborer', 'dispatchSpy'].forEach((fnName) => {
            const hasProp = returnStatement.argument.properties.some(
              (prop) => t.isObjectProperty(prop) && prop.key?.name === fnName
            );
            if (!hasProp) {
              returnStatement.argument.properties.push(
                t.objectProperty(t.identifier(fnName), t.identifier(fnName), false, true)
              );
            }
          });
        }
      }
    },
  });

  // 1B. Patch App.jsx
  transformFileInDirectory(targetDir, 'App.jsx', {
    VariableDeclarator(p) {
      if (
        t.isCallExpression(p.node.init) &&
        p.node.init.callee?.name === 'useGameState' &&
        t.isObjectPattern(p.node.id)
      ) {
        ['assignVillagerRole', 'recruitLaborer', 'dispatchSpy'].forEach((name) => {
          ensureObjectPatternProp(p.node.id, name);
        });
      }
    },

    JSXElement(p) {
      const tagName = p.node.openingElement.name?.name;
      const attrs = p.node.openingElement.attributes;

      if (tagName === 'ParchmentCitadelMap') {
        if (!attrs.some((a) => t.isJSXAttribute(a) && a.name?.name === 'revealedRivals')) {
          attrs.push(
            t.jsxAttribute(
              t.jsxIdentifier('revealedRivals'),
              t.jsxExpressionContainer(template.ast(`gameState?.revealedRivals`).expression)
            )
          );
        }
        if (!attrs.some((a) => t.isJSXAttribute(a) && a.name?.name === 'onDispatchSpy')) {
          attrs.push(
            t.jsxAttribute(
              t.jsxIdentifier('onDispatchSpy'),
              t.jsxExpressionContainer(template.ast(`dispatchSpy`).expression)
            )
          );
        }
      }

      if (tagName === 'ParchmentWarCouncil') {
        if (!attrs.some((a) => t.isJSXAttribute(a) && a.name?.name === 'gameState')) {
          attrs.push(
            t.jsxAttribute(
              t.jsxIdentifier('gameState'),
              t.jsxExpressionContainer(template.ast(`gameState`).expression)
            )
          );
        }
        if (!attrs.some((a) => t.isJSXAttribute(a) && a.name?.name === 'onAssignRole')) {
          attrs.push(
            t.jsxAttribute(
              t.jsxIdentifier('onAssignRole'),
              t.jsxExpressionContainer(template.ast(`assignVillagerRole`).expression)
            )
          );
        }
        if (!attrs.some((a) => t.isJSXAttribute(a) && a.name?.name === 'onRecruitLaborer')) {
          attrs.push(
            t.jsxAttribute(
              t.jsxIdentifier('onRecruitLaborer'),
              t.jsxExpressionContainer(template.ast(`recruitLaborer`).expression)
            )
          );
        }
      }

      if (tagName === 'BuildingInspector') {
        if (!attrs.some((a) => t.isJSXAttribute(a) && a.name?.name === 'villagers')) {
          attrs.push(
            t.jsxAttribute(
              t.jsxIdentifier('villagers'),
              t.jsxExpressionContainer(template.ast(`gameState?.villagers || []`).expression)
            )
          );
        }
      }
    },
  });

  // 1C. Patch src/components/citadel/ParchmentCitadelMap.jsx
  transformFileInDirectory(targetDir, 'src/components/citadel/ParchmentCitadelMap.jsx', {
    FunctionDeclaration(p) {
      if (p.node.id?.name === 'ParchmentCitadelMap') {
        ensureObjectPatternProp(p.node.params[0], 'revealedRivals');
        ensureObjectPatternProp(p.node.params[0], 'onDispatchSpy');
      }
    },
    VariableDeclarator(p) {
      if (
        p.node.id?.name === 'ParchmentCitadelMap' &&
        (t.isArrowFunctionExpression(p.node.init) || t.isFunctionExpression(p.node.init))
      ) {
        ensureObjectPatternProp(p.node.init.params[0], 'revealedRivals');
        ensureObjectPatternProp(p.node.init.params[0], 'onDispatchSpy');
      }
    },
    JSXElement(p) {
      if (p.node.openingElement.name?.name === 'CitadelSvgGrid') {
        const attrs = p.node.openingElement.attributes;
        if (!attrs.some((a) => t.isJSXAttribute(a) && a.name?.name === 'revealedRivals')) {
          attrs.push(
            t.jsxAttribute(
              t.jsxIdentifier('revealedRivals'),
              t.jsxExpressionContainer(template.ast(`revealedRivals`).expression)
            )
          );
        }
        if (!attrs.some((a) => t.isJSXAttribute(a) && a.name?.name === 'onDispatchSpy')) {
          attrs.push(
            t.jsxAttribute(
              t.jsxIdentifier('onDispatchSpy'),
              t.jsxExpressionContainer(template.ast(`onDispatchSpy`).expression)
            )
          );
        }
      }
    },
  });

  // 1D. Patch src/components/citadel/BuildingInspector.jsx
  transformFileInDirectory(targetDir, 'src/components/citadel/BuildingInspector.jsx', {
    FunctionDeclaration(p) {
      if (p.node.id?.name === 'BuildingInspector') {
        ensureObjectPatternProp(p.node.params[0], 'villagers', t.arrayExpression([]));
        if (!p.scope.hasBinding('unassignedCount')) {
          p.node.body.body.unshift(
            template.ast(`const unassignedCount = (villagers || []).filter((v) => v.role === 'Unassigned').length;`)
          );
        }
      }
    },
    VariableDeclarator(p) {
      if (
        p.node.id?.name === 'BuildingInspector' &&
        (t.isArrowFunctionExpression(p.node.init) || t.isFunctionExpression(p.node.init))
      ) {
        ensureObjectPatternProp(p.node.init.params[0], 'villagers', t.arrayExpression([]));
        if (t.isBlockStatement(p.node.init.body) && !p.scope.hasBinding('unassignedCount')) {
          p.node.init.body.body.unshift(
            template.ast(`const unassignedCount = (villagers || []).filter((v) => v.role === 'Unassigned').length;`)
          );
        }
      }
    },
    JSXElement(p) {
      const code = generate(p.node).code;

      if (code.includes('onAssignWorker') && p.node.openingElement.name?.name === 'button') {
        const attrs = p.node.openingElement.attributes;
        if (!attrs.some((a) => t.isJSXAttribute(a) && a.name?.name === 'disabled')) {
          attrs.push(
            t.jsxAttribute(
              t.jsxIdentifier('disabled'),
              t.jsxExpressionContainer(
                template.ast(`unassignedCount === 0 || (selectedBuilding?.assignedWorkersCount >= (selectedBuilding?.tier || 1) * 2)`).expression
              )
            )
          );
        }
      }

      if (code.includes('35G • 15W')) {
        const dynamicBadge = template.ast(`
          <span className="text-[9px] text-amber-200/80 font-mono mt-0.5 block">
            {bld.cost?.gold ? \`\${bld.cost.gold}G \` : ''}
            {bld.cost?.wood ? \`• \${bld.cost.wood}W \` : ''}
            {bld.cost?.stone ? \`• \${bld.cost.stone}S \` : ''}
            {bld.cost?.flora ? \`• \${bld.cost.flora}F\` : ''}
          </span>
        `, { plugins: ['jsx'] }).expression;
        p.replaceWith(dynamicBadge);
      }
    },
  });

  // 1E. Patch src/components/chronicle/ParchmentChronicleTome.jsx
  transformFileInDirectory(targetDir, 'src/components/chronicle/ParchmentChronicleTome.jsx', {
    JSXElement(p) {
      if (p.node.openingElement.name?.name === 'button') {
        const text = generate(p.node).code.toLowerCase();
        if (text.includes('rebirth') || text.includes('citadel rebirth')) {
          p.remove();
        }
      }
    },
    LogicalExpression(p) {
      if (generate(p.node.left).code.includes('rebirth')) {
        p.replaceWith(t.nullLiteral());
      }
    },
    ConditionalExpression(p) {
      if (generate(p.node.test).code.includes('rebirth')) {
        p.replaceWith(p.node.alternate);
      }
    },
  });

  // 1F. Patch src/components/combat/ParchmentWarCouncil.jsx
  const warCouncilVisitor = {
    JSXElement(jsxPath) {
      const classAttr = jsxPath.node.openingElement.attributes.find(
        (a) => t.isJSXAttribute(a) && a.name?.name === 'className'
      );
      if (classAttr && typeof classAttr.value?.value === 'string' && classAttr.value.value.includes('war-council')) {
        const alreadyInjected = jsxPath.node.children.some(
          (c) => t.isJSXElement(c) && generate(c).code.includes('Citizens & Garrison Roster')
        );
        if (!alreadyInjected) {
          const navHeader = template.ast(`
            <div className="flex items-center justify-center gap-2 border-b border-[#8b6534]/40 pb-3 mb-4">
              <button
                onClick={() => setWarCouncilTab('campaigns')}
                className={\`px-4 py-1.5 rounded text-xs font-serif tracking-widest uppercase transition-all \${
                  warCouncilTab === 'campaigns'
                    ? 'bg-[#8b6534] text-[#fff2d6] font-bold shadow-md'
                    : 'bg-[#2a1d13]/60 text-[#bda88e] hover:text-[#ffd99e]'
                }\`}
              >
                War Campaigns
              </button>
              <button
                onClick={() => setWarCouncilTab('roster')}
                className={\`px-4 py-1.5 rounded text-xs font-serif tracking-widest uppercase transition-all \${
                  warCouncilTab === 'roster'
                    ? 'bg-[#8b6534] text-[#fff2d6] font-bold shadow-md'
                    : 'bg-[#2a1d13]/60 text-[#bda88e] hover:text-[#ffd99e]'
                }\`}
              >
                Citizens & Garrison Roster
              </button>
            </div>
          `, { plugins: ['jsx'] }).expression;

          const rosterView = template.ast(`
            {warCouncilTab === 'roster' && (
              <div className="w-full flex-1 overflow-y-auto space-y-3 pr-1">
                <div className="flex justify-between items-center bg-[#24170d]/80 p-3 rounded border border-[#6b4e2a]">
                  <div>
                    <span className="text-xs font-serif text-[#ffd99e] uppercase tracking-wider block">Garrison & Labor Force</span>
                    <span className="text-[11px] text-[#9c8466]">Total Population: {(gameState?.villagers || []).length} • Idle: {(gameState?.villagers || []).filter((v) => v.role === 'Unassigned').length}</span>
                  </div>
                  {onRecruitLaborer && (
                    <button
                      onClick={onRecruitLaborer}
                      className="px-3 py-1.5 bg-[#4a2e16] hover:bg-[#6b421f] text-[#ffd99e] border border-[#a87d44] rounded text-xs font-serif active:scale-95"
                    >
                      Levy Citizen (+10G)
                    </button>
                  )}
                </div>

                <div className="space-y-2">
                  {(gameState?.villagers || []).map((v) => (
                    <div key={v.id} className="flex items-center justify-between p-2.5 bg-[#1b120a]/80 border border-[#4a341e] rounded text-xs">
                      <div>
                        <div className="font-serif text-[#ecd3a7] font-semibold">{v.name}</div>
                        <div className="text-[10px] text-[#937b60]">Role: <span className="text-[#deb87a]">{v.role}</span></div>
                      </div>
                      <div className="flex gap-1">
                        {['Farming', 'Forestry', 'Masonry', 'Soldier', 'Spy'].map((roleOption) => (
                          <button
                            key={roleOption}
                            onClick={() => onAssignRole && onAssignRole(v.id, roleOption)}
                            className={\`px-2 py-0.5 text-[10px] rounded border transition-colors \${
                              v.role === roleOption
                                ? 'bg-[#8b6534] text-[#fff2d6] border-[#d4a860]'
                                : 'bg-[#2a1b10] text-[#a48c71] border-[#442c18] hover:text-[#deb87a]'
                            }\`}
                          >
                            {roleOption}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          `, { plugins: ['jsx'] });

          jsxPath.node.children.unshift(navHeader);
          jsxPath.node.children.push(rosterView);
        }
      }
    },
  };

  transformFileInDirectory(targetDir, 'src/components/combat/ParchmentWarCouncil.jsx', {
    FunctionDeclaration(p) {
      if (p.node.id?.name === 'ParchmentWarCouncil') {
        ensureObjectPatternProp(p.node.params[0], 'gameState');
        ensureObjectPatternProp(p.node.params[0], 'onAssignRole');
        ensureObjectPatternProp(p.node.params[0], 'onRecruitLaborer');

        if (!p.scope.hasBinding('warCouncilTab')) {
          p.node.body.body.unshift(template.ast(`const [warCouncilTab, setWarCouncilTab] = React.useState('campaigns');`));
        }
        p.traverse(warCouncilVisitor);
      }
    },
    VariableDeclarator(p) {
      if (
        p.node.id?.name === 'ParchmentWarCouncil' &&
        (t.isArrowFunctionExpression(p.node.init) || t.isFunctionExpression(p.node.init))
      ) {
        ensureObjectPatternProp(p.node.init.params[0], 'gameState');
        ensureObjectPatternProp(p.node.init.params[0], 'onAssignRole');
        ensureObjectPatternProp(p.node.init.params[0], 'onRecruitLaborer');

        if (!p.scope.hasBinding('warCouncilTab')) {
          if (t.isBlockStatement(p.node.init.body)) {
            p.node.init.body.body.unshift(template.ast(`const [warCouncilTab, setWarCouncilTab] = React.useState('campaigns');`));
          }
        }
        p.traverse(warCouncilVisitor);
      }
    },
  });

  // 1G. Patch src/components/citadel/CitadelSvgGrid.jsx
  transformFileInDirectory(targetDir, 'src/components/citadel/CitadelSvgGrid.jsx', {
    JSXElement(p) {
      const classAttr = p.node.openingElement.attributes.find(
        (a) => t.isJSXAttribute(a) && a.name?.name === 'className'
      );
      if (classAttr && typeof classAttr.value?.value === 'string' && classAttr.value.value.includes('rival-settlement')) {
        const alreadyHasFog = p.node.children.some(
          (c) => t.isJSXElement(c) && generate(c).code.includes('fog-of-war-overlay')
        );
        if (!alreadyHasFog) {
          const fogNode = template.ast(`
            {(!revealedRivals || !revealedRivals[rival.id]) && (
              <g
                className="fog-of-war-overlay pointer-events-auto cursor-pointer"
                onClick={() => onDispatchSpy && onDispatchSpy(rival.id)}
              >
                <rect x="-80" y="-80" width="160" height="160" fill="#241b12" opacity="0.9" rx="8" />
                <text x="0" y="-10" textAnchor="middle" fill="#d2b078" fontSize="11" fontFamily="serif" fontWeight="bold">
                  ☁ SHROUDED IN FOG
                </text>
                <text x="0" y="14" textAnchor="middle" fill="#998063" fontSize="9" fontFamily="sans-serif">
                  Click to Dispatch Spy
                </text>
              </g>
            )}
          `, { plugins: ['jsx'] });

          p.node.children.push(fogNode);
        }
      }
    },
  });
}

// ---------------------------------------------------------------------------
// 2. Sandbox Verification & Committal
// ---------------------------------------------------------------------------
function main() {
  const sandboxDir = fs.mkdtempSync(path.join(os.tmpdir(), 'realm-raiders-sandbox-'));
  console.log(`\n[SANDBOX] Initialized isolated staging at: ${sandboxDir}`);

  try {
    console.log('[SANDBOX] Copying project files into sandbox environment...');
    fs.cpSync(PROJECT_ROOT, sandboxDir, {
      recursive: true,
      filter: (src) => {
        const rel = path.relative(PROJECT_ROOT, src);
        if (!rel) return true;
        const rootSegment = rel.split(path.sep)[0];
        return !['node_modules', '.git', 'dist', '.cache'].includes(rootSegment);
      },
    });

    const sourceNodeModules = path.join(PROJECT_ROOT, 'node_modules');
    const targetNodeModules = path.join(sandboxDir, 'node_modules');
    if (fs.existsSync(sourceNodeModules)) {
      fs.symlinkSync(sourceNodeModules, targetNodeModules, 'junction');
    }

    console.log('[SANDBOX] Running AST transformations inside sandbox...');
    runTransformations(sandboxDir);

    console.log('\n[VERIFY] Executing `pnpm lint` in sandbox...');
    try {
      execSync('pnpm lint', {
        cwd: sandboxDir,
        stdio: 'inherit',
        env: { ...process.env, CI: 'true' },
      });
      console.log('[VERIFY PASS] `pnpm lint` completed with 0 errors.');
    } catch (lintErr) {
      console.error('\n[VERIFY FAIL] Sandbox failed `pnpm lint`. Aborting changes.');
      process.exit(1);
    }

    console.log('\n[VERIFY] Executing `pnpm build` in sandbox...');
    try {
      execSync('pnpm build', {
        cwd: sandboxDir,
        stdio: 'inherit',
        env: { ...process.env, CI: 'true' },
      });
      console.log('[VERIFY PASS] `pnpm build` completed with 0 errors.');
    } catch (buildErr) {
      console.error('\n[VERIFY FAIL] Sandbox failed `pnpm build`. Aborting changes.');
      process.exit(1);
    }

    if (IS_DRY_RUN) {
      console.log('\n[DRY RUN COMPLETE] Sandbox verified all tests. Source files left unmodified.');
    } else {
      console.log('\n[APPLYING] Sandbox validation successful. Copying verified files to workspace...');
      for (const relFile of transformedRelativeFiles) {
        const sourcePath = path.join(sandboxDir, relFile);
        const destinationPath = path.join(PROJECT_ROOT, relFile);
        fs.copyFileSync(sourcePath, destinationPath);
        console.log(`[SAVED] ${relFile}`);
      }
      console.log('\n=== All verified AST improvements committed to workspace! ===');
    }
  } finally {
    try {
      fs.rmSync(sandboxDir, { recursive: true, force: true });
      console.log('[SANDBOX] Temporary directory dismantled cleanly.\n');
    } catch (cleanErr) {
      // ignore cleanup errors
    }
  }
}

main();
