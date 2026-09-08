/**
 * Web Vibration API Tactile Feedback Utility
 * Provides diegetic physical weight to touch interactions.
 */
export const haptics = {
  enabled: true,

  setEnabled: function(val) {
    this.enabled = !!val;
  },

  /**
   * Short, light pulse (10ms) on building selection, tab switch, or button tap
   */
  light: function() {
    if (!this.enabled) return;
    if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
      try {
        navigator.vibrate(10);
      } catch (_) {}
    }
  },

  /**
   * Medium double-pulse (20ms, 40ms) when collecting harvests or sweep-harvesting
   */
  harvest: function() {
    if (!this.enabled) return;
    if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
      try {
        navigator.vibrate([20, 40, 20]);
      } catch (_) {}
    }
  },

  /**
   * Heavy thud (50ms) when stamping a Royal Decree or launching a catapult strike
   */
  heavy: function() {
    if (!this.enabled) return;
    if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
      try {
        navigator.vibrate(50);
      } catch (_) {}
    }
  },

  /**
   * Selection pulse (alias for light pulse)
   */
  selection: function() {
    this.light();
  }
};

/**
 * Universal haptic trigger helper
 * @param {'selection' | 'light' | 'harvest' | 'heavy' | 'decree'} type
 */
export function triggerHaptic(type = 'selection') {
  if (type === 'heavy' || type === 'decree') {
    haptics.heavy();
  } else if (type === 'harvest') {
    haptics.harvest();
  } else {
    haptics.light();
  }
}
