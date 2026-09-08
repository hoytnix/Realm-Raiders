// patches/011_fix_yield_claiming_and_spacebar.mjs

export const id = '011_fix_yield_claiming_and_spacebar';
export const description = 'Implements robust yield claiming actions, claim all batch handlers, and global spacebar event listeners for resource collection[cite: 4].';

export const transforms = {
  'src/hooks/useGameState.js': (ast, { traverse, t }) => {
    traverse(ast, {
      FunctionDeclaration(path) {
        if (path.node.id && path.node.id.name === 'useGameState') {
          path.traverse({
            ReturnStatement(retPath) {
              const arg = retPath.node.argument;
              if (t.isObjectExpression(arg)) {
                const hasClaimYield = arg.properties.some(
                  p => t.isObjectProperty(p) && (t.isIdentifier(p.key, { name: 'claimYield' }) || t.isStringLiteral(p.key, { value: 'claimYield' }))
                );
                if (!hasClaimYield) {
                  arg.properties.push(
                    t.objectProperty(
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
                  );
                }

                const hasClaimAll = arg.properties.some(
                  p => t.isObjectProperty(p) && (t.isIdentifier(p.key, { name: 'claimAll' }) || t.isStringLiteral(p.key, { value: 'claimAll' }))
                );
                if (!hasClaimAll) {
                  arg.properties.push(
                    t.objectProperty(
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
                  );
                }
              }
            }
          });
        }
      }
    });
  },

  'src/hooks/useHotkeys.js': (ast, { traverse, t }) => {
    traverse(ast, {
      FunctionDeclaration(path) {
        if (path.node.id && path.node.id.name === 'useHotkeys') {
          const body = path.node.body.body;
          const hasEffect = body.some(stmt => t.isExpressionStatement(stmt) && t.isCallExpression(stmt.expression) && t.isIdentifier(stmt.expression.callee, { name: 'useEffect' }));
          if (!hasEffect) {
            body.push(
              t.expressionStatement(
                t.callExpression(
                  t.identifier('useEffect'),
                  [
                    t.arrowFunctionExpression(
                      [],
                      t.blockStatement([
                        t.variableDeclaration('const', [
                          t.variableDeclarator(
                            t.identifier('handleKeyDown'),
                            t.arrowFunctionExpression(
                              [t.identifier('e')],
                              t.blockStatement([
                                t.ifStatement(
                                  t.binaryExpression(
                                    '===',
                                    t.memberExpression(t.identifier('e'), t.identifier('code')),
                                    t.stringLiteral('Space')
                                  ),
                                  t.blockStatement([
                                    t.expressionStatement(
                                      t.callExpression(
                                        t.memberExpression(t.identifier('window'), t.identifier('dispatchEvent')),
                                        [t.newExpression(t.identifier('Event'), [t.stringLiteral('realm-claim-all')])]
                                      )
                                    )
                                  ])
                                )
                              ])
                            )
                          )
                        ]),
                        t.expressionStatement(
                          t.callExpression(
                            t.memberExpression(
                              t.identifier('window'),
                              t.identifier('addEventListener')
                            ),
                            [t.stringLiteral('keydown'), t.identifier('handleKeyDown')]
                          )
                        ),
                        t.returnStatement(
                          t.arrowFunctionExpression(
                            [],
                            t.blockStatement([
                              t.expressionStatement(
                                t.callExpression(
                                  t.memberExpression(
                                    t.identifier('window'),
                                    t.identifier('removeEventListener')
                                  ),
                                  [t.stringLiteral('keydown'), t.identifier('handleKeyDown')]
                                )
                              )
                            ])
                          )
                        )
                      ])
                    ),
                    t.arrayExpression([])
                  ]
                )
              )
            );
          }
        }
      }
    });
  }
};
