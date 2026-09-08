/* eslint-disable */
/**
 * Patch 003: Truce of Foundations & Fair NPC Raid Strategy
 *
 * Enforces:
 * 1. Truce of Foundations: Complete raid immunity before Day 5 (Harvestide 5, 26 ADX).
 * 2. Plunder Wealth Threshold: Rivals will not attack realms with < 350 combined Gold & Food.
 * 3. Initial & Post-Raid Cooldowns: Starts with a 300s buffer; resets to 300s upon raid resolution.
 */

export const id = '003_truce_of_foundations_raid_fix';
export const description = 'Enforces Day 5 Truce of Foundations, plunder wealth gating, and raid cooldowns';

export const transforms = {
  'src/constants/initialState.js': (ast, { t, traverse }) => {
    traverse(ast, {
      ObjectExpression(path) {
        const isInitialState = path.node.properties.some(
          (p) => t.isObjectProperty(p) && (p.key?.name === 'calendar' || p.key?.name === 'resources')
        );
        if (!isInitialState) return;

        // 1. Initialize incomingRaid to null
        const raidProp = path.node.properties.find(
          (p) => t.isObjectProperty(p) && p.key?.name === 'incomingRaid'
        );
        if (raidProp) {
          raidProp.value = t.nullLiteral();
        } else {
          path.node.properties.push(
            t.objectProperty(t.identifier('incomingRaid'), t.nullLiteral())
          );
        }

        // 2. Initialize raidCooldown to 300 seconds
        const cooldownProp = path.node.properties.find(
          (p) => t.isObjectProperty(p) && p.key?.name === 'raidCooldown'
        );
        if (cooldownProp) {
          cooldownProp.value = t.numericLiteral(300);
        } else {
          path.node.properties.push(
            t.objectProperty(t.identifier('raidCooldown'), t.numericLiteral(300))
          );
        }

        // 3. Mark Truce of Foundations active
        const hasTruce = path.node.properties.some(
          (p) => t.isObjectProperty(p) && p.key?.name === 'truceOfFoundations'
        );
        if (!hasTruce) {
          path.node.properties.push(
            t.objectProperty(t.identifier('truceOfFoundations'), t.booleanLiteral(true))
          );
        }
      },
    });
  },

  'src/hooks/useGameState.js': (ast, { t, template, generate, traverse }) => {
    traverse(ast, {
      // Top-level visitor: gate incomingRaid assignments inside state updates
      ObjectProperty(path) {
        if (path.node.key?.name === 'incomingRaid') {
          if (t.isNullLiteral(path.node.value)) return;
          if (path.node.__truceGated) return;
          path.node.__truceGated = true;

          const originalCode = generate(path.node.value).code;
          if (originalCode.includes('calendar?.day') || originalCode.includes('Truce')) return;

          // Determine the enclosing updater function's parameter name dynamically
          const funcParent = path.getFunctionParent();
          const firstParam = funcParent?.node?.params?.[0];
          const paramName = (firstParam && t.isIdentifier(firstParam)) ? firstParam.name : 'prev';

          path.node.value = template.expression(`
            (
              ((${paramName}?.calendar?.day ?? ${paramName}?.day ?? 1) < 5) ||
              ((${paramName}?.raidCooldown || 0) > 0) ||
              ((((${paramName}?.resources?.gold || 0) + (${paramName}?.resources?.food || 0))) < 350)
            ) ? null : (${originalCode})
          `)();
        }

        if (path.node.key?.name === 'raidCooldown') {
          if (path.node.__cooldownGated) return;
          path.node.__cooldownGated = true;

          const originalCode = generate(path.node.value).code;
          if (originalCode.includes('calendar?.day')) return;

          const funcParent = path.getFunctionParent();
          const firstParam = funcParent?.node?.params?.[0];
          const paramName = (firstParam && t.isIdentifier(firstParam)) ? firstParam.name : 'prev';

          path.node.value = template.expression(`
            ((${paramName}?.calendar?.day ?? ${paramName}?.day ?? 1) < 5)
              ? Math.max(300, (${paramName}?.raidCooldown || 300))
              : (${originalCode})
          `)();
        }
      },

      // Use NodePath.prototype.traverse to safely attach cooldown to raid conclusion handlers
      Function(path) {
        const fnName = path.node.id?.name || path.parentPath?.node?.id?.name || '';
        if (fnName === 'handleDefendRaid' || fnName === 'handleDismissRaid' || fnName === 'resolveRaid') {
          path.traverse({
            ObjectProperty(propPath) {
              if (propPath.node.key?.name === 'incomingRaid' && t.isNullLiteral(propPath.node.value)) {
                const parentObj = propPath.parentPath;
                if (parentObj.isObjectExpression()) {
                  const hasCooldown = parentObj.node.properties.some(
                    (p) => t.isObjectProperty(p) && p.key?.name === 'raidCooldown'
                  );
                  if (!hasCooldown) {
                    parentObj.node.properties.push(
                      t.objectProperty(t.identifier('raidCooldown'), t.numericLiteral(300))
                    );
                  }
                }
              }
            },
          });
        }
      },
    });
  },

  'src/utils/rivals.js': (ast, { t, template, traverse }) => {
    traverse(ast, {
      Function(path) {
        let fnName = path.node.id?.name;
        if (!fnName && path.parentPath?.isVariableDeclarator()) {
          fnName = path.parentPath.node.id?.name;
        }
        if (!fnName) return;

        const isRaidEvaluator =
          fnName.toLowerCase().includes('raid') &&
          !fnName.toLowerCase().includes('outcome') &&
          !fnName.toLowerCase().includes('battle') &&
          (fnName.startsWith('check') ||
            fnName.startsWith('roll') ||
            fnName.startsWith('should') ||
            fnName.startsWith('evaluate') ||
            fnName.startsWith('generate'));

        if (!isRaidEvaluator) return;

        const body = path.get('body');
        if (!body.isBlockStatement()) return;

        const firstParam = path.node.params[0];
        if (!firstParam || !t.isIdentifier(firstParam)) return;
        const stateParam = firstParam.name;

        const alreadyGuarded = body.node.body.some((s) => s.__isTruceGuard);
        if (alreadyGuarded) return;

        const guard = template.statement(`
          if (${stateParam}) {
            const currentDay = ${stateParam}.calendar?.day ?? ${stateParam}.day ?? 1;
            if (currentDay < 5) return null;
            if ((${stateParam}.raidCooldown || 0) > 0) return null;
            const wealth = (${stateParam}.resources?.gold || 0) + (${stateParam}.resources?.food || 0);
            if (wealth < 350) return null;
          }
        `)();
        guard.__isTruceGuard = true;
        body.node.body.unshift(guard);
      },
    });
  },
};
