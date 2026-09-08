/**
 * Patch 004: High-RICE Strategic NPC AI Overhaul (Combinatorial Tribute Revision)
 *
 * Implements:
 * - Dynamic Aggro & Provocation Index (Exposed Wealth / Defenses)
 * - Telegraphed War Horns & Scout Warning Phase
 * - Faction Personalities with Combinatorial Multi-Resource Extortion Demands
 * - Defeat Demoralization & Extended Peace Pacts (+600s cooldown)
 */

export const id = '004_ai_strategy_high_rice_overhaul';
export const description = 'Implements Provocation Index, telegraphed warhorns, combinatorial extortion tribute, and demoralization';

export const transforms = {
  'src/constants/initialState.js': (ast, { t, traverse }) => {
    traverse(ast, {
      ObjectExpression(path) {
        const isInitialState = path.node.properties.some(
          (p) => t.isObjectProperty(p) && (p.key?.name === 'calendar' || p.key?.name === 'resources')
        );
        if (!isInitialState) return;

        const hasImpendingRaid = path.node.properties.some(
          (p) => t.isObjectProperty(p) && p.key?.name === 'impendingRaid'
        );
        if (!hasImpendingRaid) {
          path.node.properties.push(
            t.objectProperty(t.identifier('impendingRaid'), t.nullLiteral())
          );
        }
      },
    });
  },

  'src/utils/rivals.js': (ast, { t, template, traverse }) => {
    traverse(ast, {
      Program(path) {
        // Strip previous declarations if present to avoid duplication
        path.node.body = path.node.body.filter(
          (stmt) =>
            !(
              (t.isFunctionDeclaration(stmt) || (t.isExportNamedDeclaration(stmt) && t.isFunctionDeclaration(stmt.declaration))) &&
              ['getFactionExtortionDemand', 'calculateProvocationIndex', 'checkIncomingRaid'].includes(
                stmt.id?.name || stmt.declaration?.id?.name
              )
            )
        );

        const aiFunctions = template.statements(`
          export function calculateProvocationIndex(state) {
            if (!state) return 0;
            const gold = state.resources?.gold || 0;
            const food = state.resources?.food || 0;
            const wood = state.resources?.wood || 0;
            const stone = state.resources?.stone || 0;
            const flora = state.resources?.flora || 0;
            const totalWealth = gold + food + Math.floor((wood + stone + flora) * 0.4);
            const troops = state.troops?.total || 0;
            const wallLevel = state.buildings?.barracks?.level || 0;
            const defenseStrength = (troops * 3) + (wallLevel * 20) + 15;
            return totalWealth / Math.max(1, defenseStrength);
          }

          export function getFactionExtortionDemand(rival, state) {
            const faction = (rival?.faction || 'orcs').toLowerCase();
            const res = state?.resources || {};
            const pool = ['gold', 'food', 'wood', 'stone', 'flora'];

            const weights = {
              gold: 1,
              food: 1,
              wood: 1,
              stone: 1,
              flora: 1,
            };

            if (faction.includes('orc') || faction.includes('cinder')) {
              weights.food = 7;
              weights.wood = 3;
              weights.stone = 2;
            } else if (faction.includes('dwarf') || faction.includes('ironforge')) {
              weights.gold = 7;
              weights.stone = 4;
              weights.wood = 2;
            } else if (faction.includes('elf') || faction.includes('tide')) {
              weights.flora = 7;
              weights.wood = 4;
              weights.food = 2;
            } else {
              weights.gold = 4;
              weights.food = 4;
            }

            const rollCount = Math.random();
            const numDemands = rollCount < 0.35 ? 1 : (rollCount < 0.75 ? 2 : 3);
            const chosenResources = [];
            const available = [...pool];

            for (let i = 0; i < numDemands && available.length > 0; i++) {
              const totalWeight = available.reduce((acc, r) => acc + (weights[r] || 1), 0);
              let selector = Math.random() * totalWeight;
              let picked = available[0];
              for (const r of available) {
                selector -= (weights[r] || 1);
                if (selector <= 0) {
                  picked = r;
                  break;
                }
              }
              chosenResources.push(picked);
              const idx = available.indexOf(picked);
              if (idx > -1) available.splice(idx, 1);
            }

            const resourceLabels = {
              gold: 'Gold',
              food: 'Sustenance',
              wood: 'Wood',
              stone: 'Stone',
              flora: 'Flora',
            };

            const items = chosenResources.map((resource) => {
              const currentStock = res[resource] || 0;
              const ratio = 0.12 + Math.random() * 0.16;
              const minBase = resource === 'flora' ? 8 : (resource === 'gold' ? 20 : 15);
              const amount = Math.max(minBase, Math.min(Math.floor(currentStock * ratio), 120));
              return {
                resource,
                amount,
                label: resourceLabels[resource] || resource,
              };
            });

            const summary = items.map((it) => it.amount + ' ' + it.label).join(' & ');

            return {
              items,
              summary,
              factionName: rival?.name || 'Rival Clan',
            };
          }

          export function checkIncomingRaid(state) {
            if (!state) return null;
            const currentDay = state.calendar?.day ?? state.day ?? 1;
            if (currentDay < 5) return null;
            if ((state.raidCooldown || 0) > 0) return null;
            if (state.impendingRaid || state.incomingRaid) return null;

            const provocation = calculateProvocationIndex(state);
            if (provocation < 1.35) return null;

            const roll = Math.random();
            const raidChance = Math.min(0.75, (provocation - 1.0) * 0.15);
            if (roll > raidChance) return null;

            const rivals = (state.rivalSettlements && state.rivalSettlements.length > 0)
              ? state.rivalSettlements
              : generateRivals(100);

            const selectedRival = rivals[Math.floor(Math.random() * rivals.length)];
            const demand = getFactionExtortionDemand(selectedRival, state);

            return {
              rival: selectedRival,
              threatLevel: Math.round(provocation * 10) / 10,
              warningTicks: 30,
              maxWarningTicks: 30,
              demand,
            };
          }
        `)();

        path.node.body.push(...aiFunctions);
      },
    });
  },

  'src/hooks/useGameState.js': (ast, { t, template, traverse }) => {
    traverse(ast, {
      Program(path) {
        const requiredImports = ['checkIncomingRaid', 'calculateProvocationIndex', 'getFactionExtortionDemand'];
        let rivalsImportDecl = null;

        for (const stmt of path.node.body) {
          if (t.isImportDeclaration(stmt) && (stmt.source.value.includes('rivals') || stmt.source.value.includes('utils'))) {
            rivalsImportDecl = stmt;
            break;
          }
        }

        if (rivalsImportDecl) {
          const existingSpecifiers = rivalsImportDecl.specifiers
            .filter((s) => t.isImportSpecifier(s))
            .map((s) => s.local.name);

          requiredImports.forEach((name) => {
            if (!existingSpecifiers.includes(name)) {
              rivalsImportDecl.specifiers.push(
                t.importSpecifier(t.identifier(name), t.identifier(name))
              );
            }
          });
        } else {
          path.node.body.unshift(
            t.importDeclaration(
              requiredImports.map((name) => t.importSpecifier(t.identifier(name), t.identifier(name))),
              t.stringLiteral('../utils/rivals.js')
            )
          );
        }
      },

      Function(path) {
        const fnName = path.node.id?.name || path.parentPath?.node?.id?.name;
        if (fnName !== 'useGameState') return;

        const body = path.get('body');
        if (!body.isBlockStatement()) return;

        const hasHandler = body.node.body.some(
          (stmt) =>
            t.isVariableDeclaration(stmt) &&
            stmt.declarations.some((d) => d.id?.name === 'handlePayExtortionTribute')
        );

        if (!hasHandler) {
          const tributeFn = template.statement(`
            const handlePayExtortionTribute = React.useCallback(() => {
              setGameState((prev) => {
                const impending = prev.impendingRaid;
                if (!impending || !impending.demand) return prev;
                const { items, summary, factionName } = impending.demand;
                if (!Array.isArray(items) || items.length === 0) return prev;

                const canAffordAll = items.every(
                  (item) => (prev.resources?.[item.resource] || 0) >= item.amount
                );
                if (!canAffordAll) return prev;

                const nextResources = { ...prev.resources };
                items.forEach((item) => {
                  nextResources[item.resource] = Math.max(0, (nextResources[item.resource] || 0) - item.amount);
                });

                return {
                  ...prev,
                  resources: nextResources,
                  impendingRaid: null,
                  incomingRaid: null,
                  raidCooldown: 400,
                  chronicle: [
                    {
                      id: 'tribute-' + Date.now(),
                      title: 'Tribute Paid',
                      description: 'Paid ' + (summary || 'supplies') + ' to ' + factionName + '. War horns fall silent.',
                      timestamp: Date.now(),
                      type: 'diplomacy',
                    },
                    ...(prev.chronicle || []),
                  ],
                };
              });
            }, []);
          `)();

          const retIdx = body.node.body.findIndex((stmt) => t.isReturnStatement(stmt));
          if (retIdx !== -1) {
            body.node.body.splice(retIdx, 0, tributeFn);
          } else {
            body.node.body.push(tributeFn);
          }
        }

        // Return handlePayExtortionTribute from useGameState
        path.traverse({
          ReturnStatement(retPath) {
            if (t.isObjectExpression(retPath.node.argument)) {
              const hasProp = retPath.node.argument.properties.some(
                (p) => t.isObjectProperty(p) && p.key?.name === 'handlePayExtortionTribute'
              );
              if (!hasProp) {
                retPath.node.argument.properties.push(
                  t.objectProperty(
                    t.identifier('handlePayExtortionTribute'),
                    t.identifier('handlePayExtortionTribute'),
                    false,
                    true
                  )
                );
              }
            }
          },
        });

        // Demoralization (+600s cooldown on victory)
        path.traverse({
          VariableDeclarator(varPath) {
            if (varPath.node.id?.name === 'handleDefendRaid') {
              varPath.traverse({
                ObjectExpression(objPath) {
                  const hasCooldown = objPath.node.properties.find(
                    (p) => t.isObjectProperty(p) && p.key?.name === 'raidCooldown'
                  );
                  if (hasCooldown) {
                    hasCooldown.value = template.expression(`600`)();
                  }
                },
              });
            }
          },
        });

        // Target exclusively the game loop tick inside setInterval
        path.traverse({
          CallExpression(callPath) {
            if (callPath.node.callee?.name !== 'setGameState') return;

            const isInsideInterval = Boolean(
              callPath.findParent(
                (p) => p.isCallExpression() && p.node.callee?.name === 'setInterval'
              )
            );
            if (!isInsideInterval) return;

            const updater = callPath.node.arguments[0];
            if (!t.isFunction(updater) && !t.isArrowFunctionExpression(updater)) return;

            const updaterBody = updater.body;
            if (!t.isBlockStatement(updaterBody)) return;

            updaterBody.body.forEach((stmt) => {
              if (t.isReturnStatement(stmt) && t.isObjectExpression(stmt.argument)) {
                const props = stmt.argument.properties;
                const paramName = updater.params[0]?.name || 'prev';

                const existingImpending = props.find(
                  (p) => t.isObjectProperty(p) && p.key?.name === 'impendingRaid'
                );
                const impendingExpr = template.expression(`
                  ${paramName}.impendingRaid
                    ? (${paramName}.impendingRaid.warningTicks > 1
                        ? { ...${paramName}.impendingRaid, warningTicks: ${paramName}.impendingRaid.warningTicks - 1 }
                        : null)
                    : ((${paramName}.incomingRaid || (${paramName}.raidCooldown || 0) > 0 || ((${paramName}.calendar?.day ?? 1) < 5))
                        ? null
                        : checkIncomingRaid(${paramName}))
                `)();

                if (existingImpending) {
                  existingImpending.value = impendingExpr;
                } else {
                  props.push(t.objectProperty(t.identifier('impendingRaid'), impendingExpr));
                }

                const existingIncoming = props.find(
                  (p) => t.isObjectProperty(p) && p.key?.name === 'incomingRaid'
                );
                const incomingExpr = template.expression(`
                  (${paramName}.impendingRaid && ${paramName}.impendingRaid.warningTicks <= 1)
                    ? ${paramName}.impendingRaid.rival
                    : (${paramName}.incomingRaid || null)
                `)();

                if (existingIncoming) {
                  existingIncoming.value = incomingExpr;
                } else {
                  props.push(t.objectProperty(t.identifier('incomingRaid'), incomingExpr));
                }
              }
            });
          },
        });
      },
    });
  },

  'App.jsx': (ast, { t, template, traverse, ensureObjectPatternProp }) => {
    traverse(ast, {
      FunctionDeclaration(path) {
        if (path.node.id?.name === 'App') {
          path.traverse({
            VariableDeclarator(varPath) {
              if (
                varPath.node.id?.type === 'ObjectPattern' &&
                varPath.node.init?.callee?.name === 'useGameState'
              ) {
                ensureObjectPatternProp(varPath.node.id, 'handlePayExtortionTribute');
              }
            },
          });

          path.traverse({
            JSXElement(jsxPath) {
              const elName = jsxPath.node.openingElement.name?.name;
              if (
                elName === 'DeskSurface' ||
                (elName === 'div' &&
                  jsxPath.node.openingElement.attributes.some(
                    (a) => a.name?.name === 'className' && a.value?.value?.includes('min-h-screen')
                  ))
              ) {
                const children = jsxPath.node.children;
                const alreadyHasBanner = children.some(
                  (c) =>
                    t.isJSXElement(c) &&
                    c.openingElement.attributes.some(
                      (a) => a.name?.name === 'data-testid' && a.value?.value === 'warhorn-banner'
                    )
                );

                if (!alreadyHasBanner) {
                  const bannerExpr = template.expression(`
                    gameState.impendingRaid ? (
                      <div
                        data-testid="warhorn-banner"
                        className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-lg bg-[#3a1a14] border-2 border-[#b87333] rounded-xl p-3 text-amber-100 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-3 animate-pulse"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-xl">📯</span>
                          <div>
                            <p className="text-xs font-black uppercase tracking-wider text-amber-200">
                              Warhorns Echo: {gameState.impendingRaid.rival?.name} Approaches!
                            </p>
                            <p className="text-[10px] text-amber-300">
                              Arrives in {gameState.impendingRaid.warningTicks}s • Threat: {gameState.impendingRaid.threatLevel}x
                            </p>
                          </div>
                        </div>
                        {gameState.impendingRaid.demand ? (
                          <button
                            onClick={handlePayExtortionTribute}
                            className="text-[10px] font-bold py-1.5 px-2.5 rounded bg-amber-700 hover:bg-amber-600 text-amber-100 border border-amber-500 whitespace-nowrap shadow transition active:scale-95"
                          >
                            Pay Tribute ({gameState.impendingRaid.demand.summary})
                          </button>
                        ) : null}
                      </div>
                    ) : null
                  `, { plugins: ['jsx'] })();

                  children.unshift(t.jsxExpressionContainer(bannerExpr));
                }
              }
            },
          });
        }
      },
    });
  },
};
