/**
 * Patch 005: Bind War Tab Directly to Surrounding Map Kingdoms
 *
 * 1. Purges mock/seed entries from bloodFeuds in initialState.js.
 * 2. Binds ParchmentWarCouncil targets to gameState.rivalSettlements (Cinder Camp, Ironforge Outpost, Tide-Watch Keep).
 * 3. Shows perimeter coordinates and Fog of War status safely inside rivals.map.
 * 4. Renders a diegetic empty state when no active retaliation missives exist.
 */

export const id = '005_war_tab_surrounding_kingdoms';
export const description = 'Replaces mock retaliation missives and procedural war targets with the 3 surrounding map kingdoms';

export const transforms = {
  'src/constants/initialState.js': (ast, { t, traverse }) => {
    traverse(ast, {
      ObjectProperty(path) {
        if (path.node.key?.name === 'bloodFeuds') {
          path.node.value = t.arrayExpression([]);
        }
      },
    });
  },

  'src/components/combat/ParchmentWarCouncil.jsx': (ast, { t, template, traverse }) => {
    traverse(ast, {
      // 1. Initialize rivals state from persistent map settlements
      VariableDeclarator(path) {
        if (
          path.node.id?.type === 'ArrayPattern' &&
          path.node.id.elements?.[0]?.name === 'rivals' &&
          path.node.init?.callee?.name === 'useState'
        ) {
          path.node.init = template.expression(`
            useState(() => {
              const settlements = gameState?.rivalSettlements || state?.rivalSettlements;
              if (Array.isArray(settlements) && settlements.length > 0) {
                return settlements;
              }
              return generateRivals(stats?.overallRating || 100);
            })
          `)();
        }
      },

      // 2. Keep rivals synced as Fog of War clears or garrisons update
      FunctionDeclaration(path) {
        if (path.node.id?.name === 'ParchmentWarCouncil') {
          const body = path.get('body');
          if (!body.isBlockStatement()) return;

          const alreadyHasSync = body.node.body.some(
            (stmt) =>
              t.isExpressionStatement(stmt) &&
              t.isCallExpression(stmt.expression) &&
              stmt.expression.callee?.property?.name === 'useEffect' &&
              stmt.expression.arguments?.[0]?.body?.body?.some(
                (s) => t.isExpressionStatement(s) && s.expression?.callee?.name === 'setRivals'
              )
          );

          if (!alreadyHasSync) {
            const syncEffect = template.statement(`
              React.useEffect(() => {
                const settlements = gameState?.rivalSettlements || state?.rivalSettlements;
                if (Array.isArray(settlements) && settlements.length > 0) {
                  setRivals(settlements);
                }
              }, [gameState?.rivalSettlements, state?.rivalSettlements]);
            `)();
            body.node.body.splice(2, 0, syncEffect);
          }
        }
      },

      // 3. Render position and fog badges ONLY inside rivals.map where rival is strictly in scope
      JSXElement(path) {
        const opening = path.node.openingElement;
        const isHeader = opening.name.name === 'h4' || opening.name.name === 'h3';
        if (!isHeader) return;

        // Ensure this header is directly inside the rivals.map callback
        const isRivalsMap = Boolean(
          path.findParent(
            (p) =>
              p.isCallExpression() &&
              p.node.callee?.property?.name === 'map' &&
              p.node.callee?.object?.name === 'rivals'
          )
        );
        if (!isRivalsMap) return;
        if (!path.scope.hasBinding('rival')) return;

        const parent = path.parentPath;
        if (parent && parent.isJSXElement() && !parent.node.__hasBorderInfo) {
          parent.node.__hasBorderInfo = true;
          const badge = template.ast(`
            <div className="flex items-center gap-1.5 mt-0.5 text-[9px] font-mono">
              {rival.gridX !== undefined && rival.gridY !== undefined ? (
                <span className="text-[#8c6239] bg-[#ebdcc1] px-1 py-0.2 rounded border border-[#c4a482]/60">
                  Pos: [{rival.gridX}, {rival.gridY}]
                </span>
              ) : null}
              <span className={rival.discovered ? 'text-emerald-800 font-bold' : 'text-stone-600 italic'}>
                {rival.discovered ? '👁️ Surveyed' : '🌫️ Veiled in Fog'}
              </span>
            </div>
          `, { plugins: ['jsx'] });
          parent.node.children.push(badge);
        }
      },

      // 4. Intercepted Retaliation Missives empty state guard
      JSXOpeningElement(path) {
        if (
          (path.node.name.name === 'h3' || path.node.name.name === 'h4') &&
          path.parentPath?.node?.children?.some(
            (c) => t.isJSXText(c) && c.value.includes('Intercepted Retaliation Missives')
          )
        ) {
          const container = path.parentPath.parentPath;
          if (container && container.isJSXElement() && !container.node.__hasEmptyMissiveNotice) {
            container.node.__hasEmptyMissiveNotice = true;
            const missiveSection = template.expression(`
              (!state.bloodFeuds || state.bloodFeuds.length === 0) ? (
                <div className="p-3 text-center text-xs italic text-[#7a5c3d] bg-[#ebdcc1]/40 rounded-xl border border-[#c4a482]/40 my-2">
                  No active retaliation missives intercepted. The three surrounding perimeter kingdoms watch your borders warily.
                </div>
              ) : null
            `, { plugins: ['jsx'] })();

            const idx = container.node.children.indexOf(path.parentPath.node);
            container.node.children.splice(idx + 1, 0, t.jsxExpressionContainer(missiveSection));
          }
        }
      },
    });
  },
};
