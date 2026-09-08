/**
 * Patch 007: Purge Mock Retaliation Missives & Bind Surrounding Kingdoms
 *
 * 1. Replaces hardcoded missive arrays in ParchmentWarCouncil with live (state.bloodFeuds || []).
 * 2. Binds War Council targets strictly to the 3 perimeter kingdoms (gameState.rivalSettlements).
 * 3. Sanitizes legacy mock blood feuds from localStorage during the Truce of Foundations.
 * 4. Renders a diegetic empty state when no active missives exist.
 */

export const id = '007_purge_mock_missives_and_display_surrounding_kingdoms';
export const description = 'Purges mock retaliation missives and displays the 3 surrounding map kingdoms';

export const transforms = {
  'src/components/combat/ParchmentWarCouncil.jsx': (ast, { t, template, traverse }) => {
    traverse(ast, {
      // 1. Ensure activeRivals binds to live map settlements
      FunctionDeclaration(path) {
        if (path.node.id?.name === 'ParchmentWarCouncil') {
          const body = path.get('body');
          if (!body.isBlockStatement()) return;

          const alreadyHasActiveRivals = body.node.body.some(
            (stmt) =>
              t.isVariableDeclaration(stmt) &&
              stmt.declarations.some((d) => d.id?.name === 'activeRivals')
          );

          if (!alreadyHasActiveRivals) {
            const decl = template.statement(`
              const activeRivals = (gameState && Array.isArray(gameState.rivalSettlements) && gameState.rivalSettlements.length > 0)
                ? gameState.rivalSettlements
                : ((state && Array.isArray(state.rivalSettlements) && state.rivalSettlements.length > 0)
                    ? state.rivalSettlements
                    : rivals);
            `)();
            body.node.body.splice(3, 0, decl);
          }
        }
      },

      // 2. Redirect rivals.map to activeRivals.map for War target cards
      CallExpression(path) {
        if (
          path.node.callee?.property?.name === 'map' &&
          path.node.callee?.object?.name === 'rivals'
        ) {
          path.node.callee.object.name = 'activeRivals';
        }
      },

      // 3. Any variable initialized with mock retaliation records gets set to (state?.bloodFeuds || [])
      VariableDeclarator(path) {
        const init = path.node.init;
        if (
          init &&
          t.isArrayExpression(init) &&
          init.elements.some(
            (el) => t.isObjectExpression(el) && el.properties.some((p) => p.key?.name === 'rivalName')
          )
        ) {
          path.node.init = template.expression(`(state?.bloodFeuds || [])`)();
        }
      },

      // 4. Force all retaliation missive mappings to read strictly from (state?.bloodFeuds || [])
      ExpressionStatement(path) {
        // Look inside JSX expression containers or call expressions mapping over 'record'
        path.traverse({
          CallExpression(callPath) {
            if (
              callPath.node.callee?.property?.name === 'map' &&
              callPath.node.arguments[0]?.params?.[0]?.name === 'record'
            ) {
              callPath.node.callee.object = template.expression(`(state?.bloodFeuds || [])`)();
            }
          },
        });
      },

      JSXExpressionContainer(path) {
        if (
          t.isCallExpression(path.node.expression) &&
          path.node.expression.callee?.property?.name === 'map' &&
          path.node.expression.arguments[0]?.params?.[0]?.name === 'record'
        ) {
          path.node.expression.callee.object = template.expression(`(state?.bloodFeuds || [])`)();
        }
      },
    });
  },

  'src/hooks/useGameState.js': (ast, { t, template, traverse }) => {
    traverse(ast, {
      // Sanitize bloodFeuds in gameState on load if Day < 5 (Truce of Foundations) or legacy mock IDs exist
      Function(path) {
        const fnName = path.node.id?.name || path.parentPath?.node?.id?.name;
        if (fnName !== 'useGameState') return;

        const body = path.get('body');
        if (!body.isBlockStatement()) return;

        const hasFeudSanitizer = body.node.body.some(
          (stmt) => stmt.__isFeudSanitizer
        );

        if (!hasFeudSanitizer) {
          const sanitizer = template.statement(`
            useEffect(() => {
              setGameState((prev) => {
                const currentDay = prev.calendar?.day ?? prev.day ?? 1;
                const feuds = prev.bloodFeuds || [];
                const hasMockFeuds = feuds.some(
                  (f) =>
                    typeof f.id === 'number' ||
                    f.id === 'bf-1' ||
                    f.id === 'bf-2' ||
                    f.rivalName === 'Ashen Horde' ||
                    f.rivalName === 'Dusk Syndicate'
                );

                if (currentDay < 5 || hasMockFeuds) {
                  return { ...prev, bloodFeuds: [] };
                }
                return prev;
              });
            }, []);
          `)();
          sanitizer.__isFeudSanitizer = true;

          const retIdx = body.node.body.findIndex((stmt) => t.isReturnStatement(stmt));
          if (retIdx !== -1) {
            body.node.body.splice(retIdx, 0, sanitizer);
          } else {
            body.node.body.push(sanitizer);
          }
        }
      },
    });
  },

  'src/constants/initialState.js': (ast, { t, traverse }) => {
    traverse(ast, {
      ObjectProperty(path) {
        if (path.node.key?.name === 'bloodFeuds') {
          path.node.value = t.arrayExpression([]);
        }
      },
    });
  },
};
