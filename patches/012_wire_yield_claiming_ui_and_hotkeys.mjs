// patches/012_fix_yield_claiming_actions.mjs

export const id = '012_fix_yield_claiming_actions';
export const description = 'Defines claimYield and claimAll actions at the top of useGameState scope, exposing them safely to prevent undefined reference errors.';

export const transforms = {
  'src/hooks/useGameState.js': (ast, { traverse, t }) => {
    traverse(ast, {
      FunctionDeclaration(path) {
        if (path.node.id && path.node.id.name === 'useGameState') {
          const body = path.node.body.body;

          let hasClaimYield = false;
          let hasClaimAll = false;

          path.traverse({
            Identifier(idPath) {
              if (idPath.node.name === 'claimYield') hasClaimYield = true;
              if (idPath.node.name === 'claimAll') hasClaimAll = true;
            }
          });

          if (!hasClaimYield) {
            body.unshift(
              t.variableDeclaration('const', [
                t.variableDeclarator(
                  t.identifier('claimYield'),
                  t.arrowFunctionExpression(
                    [t.identifier('buildingId')],
                    t.blockStatement([
                      t.expressionStatement(
                        t.callExpression(
                          t.identifier('setGameState'),
                          [
                            t.arrowFunctionExpression(
                              [t.identifier('prev')],
                              t.objectExpression([
                                t.spreadElement(t.identifier('prev')),
                                t.objectProperty(
                                  t.identifier('buildings'),
                                  t.callExpression(
                                    t.memberExpression(
                                      t.memberExpression(t.identifier('prev'), t.identifier('buildings')),
                                      t.identifier('map')
                                    ),
                                    [
                                      t.arrowFunctionExpression(
                                        [t.identifier('b')],
                                        t.conditionalExpression(
                                          t.binaryExpression(
                                            '===',
                                            t.memberExpression(t.identifier('b'), t.identifier('id')),
                                            t.identifier('buildingId')
                                          ),
                                          t.objectExpression([
                                            t.spreadElement(t.identifier('b')),
                                            t.objectProperty(t.identifier('yieldAmount'), t.numericLiteral(0)),
                                            t.objectProperty(t.identifier('pendingYield'), t.numericLiteral(0))
                                          ]),
                                          t.identifier('b')
                                        )
                                      )
                                    ]
                                  )
                                )
                              ])
                            )
                          ]
                        )
                      )
                    ])
                  )
                )
              ])
            );
          }

          if (!hasClaimAll) {
            body.unshift(
              t.variableDeclaration('const', [
                t.variableDeclarator(
                  t.identifier('claimAll'),
                  t.arrowFunctionExpression(
                    [],
                    t.blockStatement([
                      t.expressionStatement(
                        t.callExpression(
                          t.identifier('setGameState'),
                          [
                            t.arrowFunctionExpression(
                              [t.identifier('prev')],
                              t.objectExpression([
                                t.spreadElement(t.identifier('prev')),
                                t.objectProperty(
                                  t.identifier('buildings'),
                                  t.callExpression(
                                    t.memberExpression(
                                      t.memberExpression(t.identifier('prev'), t.identifier('buildings')),
                                      t.identifier('map')
                                    ),
                                    [
                                      t.arrowFunctionExpression(
                                        [t.identifier('b')],
                                        t.objectExpression([
                                          t.spreadElement(t.identifier('b')),
                                          t.objectProperty(t.identifier('yieldAmount'), t.numericLiteral(0)),
                                          t.objectProperty(t.identifier('pendingYield'), t.numericLiteral(0))
                                        ])
                                      )
                                    ]
                                  )
                                )
                              ])
                            )
                          ]
                        )
                      )
                    ])
                  )
                )
              ])
            );
          }
        }
      }
    });
  }
};
