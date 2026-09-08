/**
 * Patch 006: Fix React ReferenceError BSOD and Finalize Perimeter Kingdom Sync
 *
 * 1. Replaces React.useCallback/useEffect calls with direct imported hooks in useGameState.js.
 * 2. Ensures all React hook imports are explicitly bound in useGameState.js and ParchmentWarCouncil.jsx.
 * 3. Removes any dangling out-of-scope rival references from JSX.
 * 4. Ensures initialState.bloodFeuds is completely empty.
 */

export const id = '006_fix_react_reference_and_perimeter_sync';
export const description = 'Fixes React ReferenceError BSOD and ensures clean perimeter kingdom synchronization';

export const transforms = {
  'src/hooks/useGameState.js': (ast, { t, traverse }) => {
    traverse(ast, {
      // 1. Replace any React.hook calls with direct hook identifiers
      MemberExpression(path) {
        if (path.node.object?.name === 'React') {
          const propName = path.node.property?.name;
          if (['useCallback', 'useEffect', 'useState', 'useMemo', 'useRef'].includes(propName)) {
            path.replaceWith(t.identifier(propName));
          }
        }
      },

      // 2. Ensure all used hooks are declared in the react import declaration
      Program(path) {
        const reactImport = path.node.body.find(
          (stmt) => t.isImportDeclaration(stmt) && stmt.source.value === 'react'
        );

        if (reactImport) {
          const requiredHooks = ['useState', 'useEffect', 'useCallback', 'useMemo', 'useRef'];
          requiredHooks.forEach((hook) => {
            const isImported = reactImport.specifiers.some(
              (spec) => t.isImportSpecifier(spec) && spec.local.name === hook
            );
            if (!isImported) {
              reactImport.specifiers.push(t.importSpecifier(t.identifier(hook), t.identifier(hook)));
            }
          });
        }
      },
    });
  },

  'src/components/combat/ParchmentWarCouncil.jsx': (ast, { t, template, traverse }) => {
    traverse(ast, {
      // 1. Replace any React.hook calls with direct hook identifiers
      MemberExpression(path) {
        if (path.node.object?.name === 'React') {
          const propName = path.node.property?.name;
          if (['useCallback', 'useEffect', 'useState', 'useMemo', 'useRef'].includes(propName)) {
            path.replaceWith(t.identifier(propName));
          }
        }
      },

      // 2. Ensure named hooks are properly imported from react
      Program(path) {
        const reactImport = path.node.body.find(
          (stmt) => t.isImportDeclaration(stmt) && stmt.source.value === 'react'
        );

        if (reactImport) {
          const requiredHooks = ['useState', 'useEffect', 'useCallback'];
          requiredHooks.forEach((hook) => {
            const isImported = reactImport.specifiers.some(
              (spec) => t.isImportSpecifier(spec) && spec.local.name === hook
            );
            if (!isImported) {
              reactImport.specifiers.push(t.importSpecifier(t.identifier(hook), t.identifier(hook)));
            }
          });
        }
      },

      // 3. Safety check: neutralize any out-of-scope rival member accesses in JSX
      JSXExpressionContainer(path) {
        const expr = path.node.expression;
        if (
          t.isMemberExpression(expr) &&
          expr.object?.name === 'rival' &&
          !path.scope.hasBinding('rival')
        ) {
          path.replaceWith(t.jsxExpressionContainer(t.nullLiteral()));
        }
      },

      // 4. Ensure War targets initialize from live gameState.rivalSettlements
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
