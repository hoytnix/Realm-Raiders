/**
 * Patch 008: Worker Staffing Production Invariant & Sub-Geometric Amortization Scaling
 */

export const id = '008_worker_staffing_and_amortization_balance';
export const description = 'Enforce >= 1 worker staffing invariant for production and calibrate alpha 1.58 / beta 1.36 amortization';

export const transforms = {
  'src/constants/buildings.js': (ast, { t, traverse }) => {
    traverse(ast, {
      Program(path) {
        if (!path.scope.hasBinding('AMORTIZATION_CONFIG')) {
          path.node.body.push(
            t.exportNamedDeclaration(
              t.variableDeclaration('const', [
                t.variableDeclarator(
                  t.identifier('AMORTIZATION_CONFIG'),
                  t.objectExpression([
                    t.objectProperty(t.identifier('COST_EXPONENT_ALPHA'), t.numericLiteral(1.58)),
                    t.objectProperty(t.identifier('YIELD_EXPONENT_BETA'), t.numericLiteral(1.36)),
                    t.objectProperty(t.identifier('TARGET_PROGRESSION_HOURS'), t.numericLiteral(700)),
                  ])
                ),
              ])
            )
          );
        }
      },
      VariableDeclarator(path) {
        if (path.node.id.name === 'AMORTIZATION_CONFIG') {
          path.node.init = t.objectExpression([
            t.objectProperty(t.identifier('COST_EXPONENT_ALPHA'), t.numericLiteral(1.58)),
            t.objectProperty(t.identifier('YIELD_EXPONENT_BETA'), t.numericLiteral(1.36)),
            t.objectProperty(t.identifier('TARGET_PROGRESSION_HOURS'), t.numericLiteral(700)),
          ]);
        }
      },
    });
  },

  'src/hooks/useGameState.js': (ast, { t, traverse, ensureImport }) => {
    ensureImport(ast, {
      source: '../constants/buildings.js',
      imported: 'AMORTIZATION_CONFIG',
    });

    traverse(ast, {
      FunctionDeclaration(path) {
        if (path.node.id && path.node.id.name === 'calculateBuildingProduction') {
          path.get('body').replaceWith(
            t.blockStatement([
              t.variableDeclaration('const', [
                t.variableDeclarator(
                  t.identifier('assigned'),
                  t.logicalExpression('||', t.memberExpression(t.identifier('building'), t.identifier('assignedWorkers')), t.numericLiteral(0))
                ),
              ]),
              t.ifStatement(
                t.binaryExpression('<', t.identifier('assigned'), t.numericLiteral(1)),
                t.blockStatement([
                  t.returnStatement(t.numericLiteral(0)),
                ])
              ),
              t.variableDeclaration('const', [
                t.variableDeclarator(
                  t.identifier('tier'),
                  t.logicalExpression('||', t.memberExpression(t.identifier('building'), t.identifier('level')), t.numericLiteral(1))
                ),
                t.variableDeclarator(
                  t.identifier('beta'),
                  t.memberExpression(t.identifier('AMORTIZATION_CONFIG'), t.identifier('YIELD_EXPONENT_BETA'))
                ),
                t.variableDeclarator(
                  t.identifier('baseRate'),
                  t.logicalExpression('||', t.memberExpression(t.identifier('building'), t.identifier('baseProduction')), t.numericLiteral(1))
                ),
              ]),
              t.variableDeclaration('const', [
                t.variableDeclarator(
                  t.identifier('scaledYield'),
                  t.binaryExpression(
                    '*',
                    t.identifier('baseRate'),
                    t.callExpression(
                      t.memberExpression(t.identifier('Math'), t.identifier('pow')),
                      [t.identifier('beta'), t.binaryExpression('-', t.identifier('tier'), t.numericLiteral(1))]
                    )
                  )
                ),
              ]),
              t.returnStatement(
                t.binaryExpression('*', t.identifier('scaledYield'), t.identifier('assigned'))
              ),
            ])
          );
        }
      },
    });
  },

  'src/components/citadel/BuildingHoverTooltip.jsx': (ast, { t, traverse }) => {
    traverse(ast, {
      JSXElement(path) {
        const opening = path.node.openingElement;
        if (opening.name.name === 'div' && path.node.children.some(child => child.value && child.value.includes('Production'))) {
          const alreadyInjected = path.node.children.some(
            child => t.isJSXExpressionContainer(child) && 
                     child.expression?.left?.left?.property?.name === 'assignedWorkers'
          );

          if (!alreadyInjected) {
            path.node.children.push(
              t.jsxExpressionContainer(
                t.logicalExpression(
                  '&&',
                  t.binaryExpression('===', t.memberExpression(t.identifier('building'), t.identifier('assignedWorkers')), t.numericLiteral(0)),
                  t.jsxElement(
                    t.jsxOpeningElement(t.jsxIdentifier('div'), [
                      t.jsxAttribute(t.jsxIdentifier('className'), t.stringLiteral('text-rose-400 text-xs italic mt-1')),
                    ]),
                    t.jsxClosingElement(t.jsxIdentifier('div')),
                    [t.jsxText('⚠ Unstaffed: Requires ≥ 1 laborer to produce')]
                  )
                )
              )
            );
          }
        }
      },
    });
  },
};
