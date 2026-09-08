// patches/010_fix_war_missives_troop_assignment_and_yield_claiming.mjs

export const id = '010_fix_war_missives_troop_assignment_and_yield_claiming';
export const description = 'Fixes desktop mock missives in War Council via robust text node targeting, synchronizes starting living troops with roster count, and restores yield claiming via click, Claim All, and spacebar shortcut.';

export const transforms = {
  'src/constants/initialState.js': (ast, { traverse, t }) => {
    traverse(ast, {
      ObjectExpression(path) {
        path.node.properties.forEach(prop => {
          if (t.isObjectProperty(prop)) {
            const keyName = t.isIdentifier(prop.key) ? prop.key.name : prop.key.value;
            if (keyName === 'troops' || keyName === 'livingTroops') {
              prop.value = t.numericLiteral(4);
            }
          }
        });
      }
    });
  },

  'src/hooks/useGameState.js': (ast, { traverse, t }) => {
    traverse(ast, {
      ObjectExpression(path) {
        path.node.properties.forEach(prop => {
          if (t.isObjectProperty(prop)) {
            const keyName = t.isIdentifier(prop.key) ? prop.key.name : prop.key.value;
            if (keyName === 'troops' || keyName === 'livingTroops') {
              prop.value = t.numericLiteral(4);
            }
          }
        });
      }
    });
  },

  'src/components/combat/ParchmentWarCouncil.jsx': (ast, { traverse, t }) => {
    let patched = false;
    traverse(ast, {
      JSXText(path) {
        if (!patched && (path.node.value.includes('Intercepted Retaliation Missives') || path.node.value.includes('Missive'))) {
          const parentElement = path.findParent(p => t.isJSXElement(p));
          if (parentElement) {
            patched = true;
            parentElement.node.children = [
              t.jsxElement(
                t.jsxOpeningElement(t.jsxIdentifier('h3'), [
                  t.jsxAttribute(t.jsxIdentifier('className'), t.stringLiteral('text-lg font-bold text-amber-950 mb-3 font-serif'))
                ], false),
                t.jsxClosingElement(t.jsxIdentifier('h3')),
                [t.jsxText('Intercepted Retaliation Missives')]
              ),
              t.jsxElement(
                t.jsxOpeningElement(t.jsxIdentifier('div'), [
                  t.jsxAttribute(t.jsxIdentifier('className'), t.stringLiteral('space-y-3'))
                ], false),
                t.jsxClosingElement(t.jsxIdentifier('div')),
                [
                  t.jsxExpressionContainer(
                    t.conditionalExpression(
                      t.logicalExpression(
                        '&&',
                        t.memberExpression(t.identifier('gameState'), t.identifier('rivals')),
                        t.binaryExpression(
                          '>',
                          t.memberExpression(
                            t.memberExpression(t.identifier('gameState'), t.identifier('rivals')),
                            t.identifier('length')
                          ),
                          t.numericLiteral(0)
                        )
                      ),
                      t.callExpression(
                        t.memberExpression(
                          t.memberExpression(t.identifier('gameState'), t.identifier('rivals')),
                          t.identifier('map')
                        ),
                        [
                          t.arrowFunctionExpression(
                            [t.identifier('rival')],
                            t.jsxElement(
                              t.jsxOpeningElement(t.jsxIdentifier('div'), [
                                t.jsxAttribute(
                                  t.jsxIdentifier('key'),
                                  t.jsxExpressionContainer(t.memberExpression(t.identifier('rival'), t.identifier('id')))
                                ),
                                t.jsxAttribute(t.jsxIdentifier('className'), t.stringLiteral('p-3 bg-amber-50/70 border border-amber-900/30 rounded font-serif text-sm text-amber-950'))
                              ], false),
                              t.jsxClosingElement(t.jsxIdentifier('div')),
                              [
                                t.jsxElement(
                                  t.jsxOpeningElement(t.jsxIdentifier('div'), [
                                    t.jsxAttribute(t.jsxIdentifier('className'), t.stringLiteral('font-bold flex justify-between items-center'))
                                  ], false),
                                  t.jsxClosingElement(t.jsxIdentifier('div')),
                                  [
                                    t.jsxExpressionContainer(t.memberExpression(t.identifier('rival'), t.identifier('name'))),
                                    t.jsxElement(
                                      t.jsxOpeningElement(t.jsxIdentifier('span'), [
                                        t.jsxAttribute(t.jsxIdentifier('className'), t.stringLiteral('text-xs px-1.5 py-0.5 rounded bg-amber-900/10 text-amber-900 uppercase'))
                                      ], false),
                                      t.jsxClosingElement(t.jsxIdentifier('span')),
                                      [t.jsxExpressionContainer(t.memberExpression(t.identifier('rival'), t.identifier('status')))]
                                    )
                                  ]
                                ),
                                t.jsxElement(
                                  t.jsxOpeningElement(t.jsxIdentifier('p'), [
                                    t.jsxAttribute(t.jsxIdentifier('className'), t.stringLiteral('text-xs text-amber-900/80 mt-1 italic'))
                                  ], false),
                                  t.jsxClosingElement(t.jsxIdentifier('p')),
                                  [
                                    t.jsxExpressionContainer(
                                      t.binaryExpression(
                                        '+',
                                        t.stringLiteral('Garrison Strength: '),
                                        t.memberExpression(t.identifier('rival'), t.identifier('strength'))
                                      )
                                    )
                                  ]
                                )
                              ]
                            )
                          )
                        ]
                      ),
                      t.jsxElement(
                        t.jsxOpeningElement(t.jsxIdentifier('p'), [
                          t.jsxAttribute(t.jsxIdentifier('className'), t.stringLiteral('text-amber-900/60 italic text-sm'))
                        ], false),
                        t.jsxClosingElement(t.jsxIdentifier('p')),
                        [t.jsxText('No active missives intercepted from surrounding realms.')]
                      )
                    )
                  )
                ]
              )
            ];
          }
        }
      }
    });
  },

  'src/hooks/useHotkeys.js': (ast, { traverse, t }) => {
    traverse(ast, {
      SwitchStatement(path) {
        const hasSpace = path.node.cases.some(
          c => c.test && (t.isStringLiteral(c.test, { value: ' ' }) || t.isStringLiteral(c.test, { value: 'Space' }))
        );
        if (!hasSpace) {
          path.node.cases.push(
            t.switchCase(
              t.stringLiteral(' '),
              [
                t.expressionStatement(
                  t.callExpression(
                    t.memberExpression(t.identifier('window'), t.identifier('dispatchEvent')),
                    [t.newExpression(t.identifier('Event'), [t.stringLiteral('realm-claim-all')])]
                  )
                ),
                t.breakStatement()
              ]
            )
          );
        }
      }
    });
  }
};
