/* eslint-disable */
/**
 * Patch 002: Synchronize War Tab with Map Perimeter NPCs
 *
 * Replaces procedural random rivals in ParchmentWarCouncil with the actual
 * persistent map perimeter settlements (gameState.rivalSettlements).
 */

export const id = '002_sync_war_tab_with_map_npcs';
export const description = 'Binds War Council target list directly to live map NPC settlements';

export const transforms = {
  'src/components/combat/ParchmentWarCouncil.jsx': (ast, { t, template, traverse }) => {
    traverse(ast, {
      // 1. Initialize rivals state from gameState.rivalSettlements instead of generateRivals()
      VariableDeclarator(path) {
        if (
          path.node.id?.type === 'ArrayPattern' &&
          path.node.id.elements?.[0]?.name === 'rivals' &&
          path.node.init?.callee?.name === 'useState'
        ) {
          path.node.init = template.expression(`
            useState(() => {
              if (gameState && Array.isArray(gameState.rivalSettlements) && gameState.rivalSettlements.length > 0) {
                return gameState.rivalSettlements;
              }
              return generateRivals(stats?.overallRating || 100);
            })
          `)();
        }
      },

      // 2. Inject useEffect to keep rivals synced whenever gameState.rivalSettlements updates (e.g. spying reveals)
      FunctionDeclaration(path) {
        if (path.node.id?.name === 'ParchmentWarCouncil') {
          const body = path.get('body');
          const alreadyHasSyncEffect = body.node.body.some(
            (stmt) =>
              t.isExpressionStatement(stmt) &&
              t.isCallExpression(stmt.expression) &&
              stmt.expression.callee?.property?.name === 'useEffect' &&
              stmt.expression.arguments?.[0]?.body?.body?.some(
                (s) => t.isExpressionStatement(s) && s.expression?.callee?.name === 'setRivals'
              )
          );

          if (!alreadyHasSyncEffect) {
            const syncEffect = template.statement(`
              React.useEffect(() => {
                if (gameState && Array.isArray(gameState.rivalSettlements) && gameState.rivalSettlements.length > 0) {
                  setRivals(gameState.rivalSettlements);
                }
              }, [gameState?.rivalSettlements]);
            `)();
            body.node.body.splice(4, 0, syncEffect);
          }
        }
      },
    });
  },
};
