/* eslint-disable */
export const id = '001_overhaul_npc_raids_and_roster';
export const description = 'Overhaul NPC raids, add FoW espionage, embed War roster, and fix laborer limits';

export const transforms = {
  // 1. src/hooks/useGameState.js
  'src/hooks/useGameState.js': (ast, { t, template, traverse, ensureObjectPatternProp }) => {
    traverse(ast, {
      VariableDeclarator(p) {
        // Ensure revealedRivals is in initial state
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

        // Strict assignWorker bounds
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

          const helpers = [
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

          helpers.forEach(({ name, code }) => {
            if (!p.scope.hasBinding(name)) {
              block.body.unshift(template.ast(code));
            }
          });

          // Day-5 Grace Period Guard
          p.traverse({
            IfStatement(ifPath) {
              const testCode = astHelpers.generate(ifPath.node.test).code;
              if (testCode.includes('Math.random') && (testCode.includes('raid') || testCode.includes('0.0'))) {
                const hasGuard = astHelpers.generate(ifPath.parentPath.node).code.includes('currentDay < 5');
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

          // Return properties
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
  },

  // 2. App.jsx
  'App.jsx': (ast, { t, template, traverse, ensureObjectPatternProp }) => {
    traverse(ast, {
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
  },

  // 3. src/components/citadel/ParchmentCitadelMap.jsx
  'src/components/citadel/ParchmentCitadelMap.jsx': (ast, { t, template, traverse, ensureObjectPatternProp }) => {
    traverse(ast, {
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
  },

  // 4. src/components/citadel/BuildingInspector.jsx
  'src/components/citadel/BuildingInspector.jsx': (ast, { t, template, traverse, generate, ensureObjectPatternProp }) => {
    traverse(ast, {
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
  },

  // 5. src/components/chronicle/ParchmentChronicleTome.jsx
  'src/components/chronicle/ParchmentChronicleTome.jsx': (ast, { t, traverse, generate }) => {
    traverse(ast, {
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
  },

  // 6. src/components/combat/ParchmentWarCouncil.jsx
  'src/components/combat/ParchmentWarCouncil.jsx': (ast, { t, template, traverse, generate, ensureObjectPatternProp }) => {
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

    traverse(ast, {
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
  },

  // 7. src/components/citadel/CitadelSvgGrid.jsx
  'src/components/citadel/CitadelSvgGrid.jsx': (ast, { t, template, traverse, generate }) => {
    traverse(ast, {
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
  },
};
