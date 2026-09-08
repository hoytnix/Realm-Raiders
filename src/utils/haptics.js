/**
 * Web Vibration API Tactile Feedback Utility
 * Provides diegetic physical weight to touch interactions.
 */
export const haptics = {
  /**
   * Short, light pulse (10ms) on building selection, tab switch, or button tap
   */
  light: () => {
    if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
      try {
        navigator.vibrate(10);
      } catch (_) {}
    }
  },

  /**
   * Medium double-pulse (20ms, 40ms) when collecting harvests or sweep-harvesting
   */
  harvest: () => {
    if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
      try {
        navigator.vibrate([20, 40, 20]);
      } catch (_) {}
    }
  },

  /**
   * Heavy thud (50ms) when stamping a Royal Decree or launching a catapult strike
   */
  heavy: () => {
    if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
      try {
        navigator.vibrate(50);
      } catch (_) {}
    }
  }
};
