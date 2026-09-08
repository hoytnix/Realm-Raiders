export const id = '009_save_version_control_and_migrations';
export const description = 'Implement save-file schema version control, migrations, and breaking reset guards';

export const transforms = {
  'src/constants/initialState.js': (ast, { t, traverse }) => {
    let stateIdentifierName = null;

    // 1. Discover the existing root state identifier
    traverse(ast, {
      VariableDeclarator(path) {
        const name = path.node.id?.name;
        if (
          name === 'INITIAL_STATE' ||
          name === 'initialState' ||
          name === 'initialGameState' ||
          name === 'defaultState'
        ) {
          stateIdentifierName = name;
          if (t.isObjectExpression(path.node.init)) {
            const hasVersion = path.node.init.properties.some(
              (prop) => t.isObjectProperty(prop) && prop.key?.name === 'saveVersion'
            );
            if (!hasVersion) {
              path.node.init.properties.unshift(
                t.objectProperty(t.identifier('saveVersion'), t.identifier('CURRENT_SAVE_VERSION'))
              );
            }
          }
        }
      },
    });

    traverse(ast, {
      Program(path) {
        // Guarantee version constants exist and are exported
        if (!path.scope.hasBinding('CURRENT_SAVE_VERSION')) {
          path.node.body.unshift(
            t.exportNamedDeclaration(
              t.variableDeclaration('const', [
                t.variableDeclarator(t.identifier('CURRENT_SAVE_VERSION'), t.numericLiteral(1)),
              ])
            ),
            t.exportNamedDeclaration(
              t.variableDeclaration('const', [
                t.variableDeclarator(t.identifier('MIN_COMPATIBLE_SAVE_VERSION'), t.numericLiteral(1)),
              ])
            )
          );
        }

        // Guarantee named export 'INITIAL_STATE' exists
        const hasInitialStateExport = path.node.body.some(
          (node) =>
            t.isExportNamedDeclaration(node) &&
            ((node.declaration &&
              t.isVariableDeclaration(node.declaration) &&
              node.declaration.declarations.some((d) => d.id?.name === 'INITIAL_STATE')) ||
              (node.specifiers &&
                node.specifiers.some(
                  (s) => (s.exported?.name || s.exported?.value) === 'INITIAL_STATE'
                )))
        );

        if (!hasInitialStateExport) {
          if (stateIdentifierName && stateIdentifierName !== 'INITIAL_STATE') {
            // Alias existing state identifier to INITIAL_STATE
            path.node.body.push(
              t.exportNamedDeclaration(null, [
                t.exportSpecifier(
                  t.identifier(stateIdentifierName),
                  t.identifier('INITIAL_STATE')
                ),
              ])
            );
          } else if (!stateIdentifierName) {
            // Fallback empty state skeleton if no recognizable binding was found
            path.node.body.push(
              t.exportNamedDeclaration(
                t.variableDeclaration('const', [
                  t.variableDeclarator(
                    t.identifier('INITIAL_STATE'),
                    t.objectExpression([
                      t.objectProperty(
                        t.identifier('saveVersion'),
                        t.identifier('CURRENT_SAVE_VERSION')
                      ),
                    ])
                  ),
                ])
              )
            );
          }
        }
      },
    });
  },

  'src/hooks/useGameState.js': (ast, { t, template, traverse, ensureImport }) => {
    ensureImport(ast, {
      source: '../constants/initialState.js',
      imported: 'INITIAL_STATE',
    });
    ensureImport(ast, {
      source: '../constants/initialState.js',
      imported: 'CURRENT_SAVE_VERSION',
    });
    ensureImport(ast, {
      source: '../constants/initialState.js',
      imported: 'MIN_COMPATIBLE_SAVE_VERSION',
    });

    traverse(ast, {
      Program(path) {
        if (!path.scope.hasBinding('migrateSaveState')) {
          const buildMigrationFn = template.statement(
            `
            function migrateSaveState(rawState) {
              if (!rawState || typeof rawState !== 'object') {
                return INITIAL_STATE;
              }
              const version = typeof rawState.saveVersion === 'number' ? rawState.saveVersion : 0;
              if (version < MIN_COMPATIBLE_SAVE_VERSION) {
                console.warn(
                  '[Save Migration] Save version ' + version + ' is below minimum supported ' + MIN_COMPATIBLE_SAVE_VERSION + '. Resetting kingdom realm.'
                );
                return INITIAL_STATE;
              }
              let state = { ...rawState };
              state.saveVersion = CURRENT_SAVE_VERSION;
              return state;
            }
            `,
            { placeholderPattern: false }
          );

          path.node.body.push(buildMigrationFn());
        }
      },
      CallExpression(path) {
        if (
          t.isMemberExpression(path.node.callee) &&
          path.node.callee.object.name === 'JSON' &&
          path.node.callee.property.name === 'parse'
        ) {
          const parent = path.parentPath;
          if (
            parent &&
            t.isLogicalExpression(parent.node) &&
            parent.node.operator === '||'
          ) {
            parent.replaceWith(
              t.callExpression(t.identifier('migrateSaveState'), [path.node])
            );
          }
        }
      },
    });
  },
};
