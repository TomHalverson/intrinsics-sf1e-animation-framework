// ============================================
// Intrinsics SF1E Animation Framework
// Weapon Resolver — extracts weapon metadata
// from sfrpg items and resolves the best
// animation match.
// ============================================

import { CATEGORY_ANIMATIONS, WEAPON_TYPE_ANIMATIONS, DAMAGE_TYPE_ANIMATIONS, JB2A_FALLBACKS } from './animation-map.js';
import { getSetting, MODULE_ID } from './settings.js';

/**
 * @typedef {Object} WeaponInfo
 * @property {string|null}  weaponCategory  - e.g. "laser", "plasma", "projectile"
 * @property {string|null}  weaponType      - e.g. "smallA", "longA", "heavy", "basicM"
 * @property {string|null}  actionType      - e.g. "rwak", "mwak", "rsak", "msak"
 * @property {string|null}  primaryDamageType - first damage type from damage.parts
 * @property {string|null}  itemId          - the item's UUID for per-item overrides
 * @property {string}       itemName        - display name
 */

/**
 * Extract structured weapon information from an sfrpg Item.
 * @param {Item} item - The sfrpg weapon item
 * @returns {WeaponInfo}
 */
export function extractWeaponInfo(item) {
  if (!item?.system) {
    return {
      weaponCategory: null,
      weaponType: null,
      actionType: null,
      primaryDamageType: null,
      itemId: null,
      itemName: item?.name ?? 'Unknown'
    };
  }

  const sys = item.system;

  // Extract primary damage type from the first damage part
  let primaryDamageType = null;
  if (sys.damage?.parts?.length > 0) {
    const firstPart = sys.damage.parts[0];
    // sfrpg damage parts can be arrays [formula, type] or objects {formula, types}
    if (Array.isArray(firstPart)) {
      primaryDamageType = firstPart[1] ?? null;
    } else if (firstPart?.types) {
      // types is an object like {fire: true, electricity: true}
      const activeTypes = Object.entries(firstPart.types)
        .filter(([, v]) => v)
        .map(([k]) => k);
      primaryDamageType = activeTypes[0] ?? null;
    } else if (typeof firstPart === 'string') {
      primaryDamageType = firstPart;
    }
  }

  return {
    weaponCategory: sys.weaponCategory ?? null,
    weaponType: sys.weaponType ?? null,
    actionType: sys.actionType ?? null,
    primaryDamageType,
    itemId: item.uuid ?? item.id ?? null,
    itemName: item.name ?? 'Unknown'
  };
}

/**
 * Determine if this is a melee or ranged attack.
 * @param {WeaponInfo} info
 * @returns {'melee'|'ranged'}
 */
export function getAttackMode(info) {
  if (info.actionType === 'mwak' || info.actionType === 'msak') return 'melee';
  if (info.weaponType === 'basicM' || info.weaponType === 'advancedM') return 'melee';
  return 'ranged';
}

/**
 * Resolve the animation data for a weapon, checking (in priority order):
 *   1. Per-item macro override (stored in settings)
 *   2. Custom category macro override (stored in settings)
 *   3. Default category animation script (.js)  ← skips "uncategorized"
 *   4. Default weapon type animation script (.js)
 *  4b. "uncategorized" category fallback
 *   5. Damage type animation script (.js)
 *   6. JB2A fallback (if JB2A is installed)
 *   7. null (no animation found)
 *
 * Returned object may contain:
 *   - macro:     Foundry macro name/ID (if override)
 *   - script:    Path to JS animation script (default)
 *   - animation: Legacy Sequencer/JB2A file path (fallback)
 *   - type, scale, speed, etc.
 *
 * @param {WeaponInfo} info
 * @returns {Object|null} Animation data object or null
 */
export function resolveAnimation(info) {
  const debug = getSetting('debugMode');

  if (debug) {
    console.log(`[ISAF] Resolving animation for: ${info.itemName}`, info);
  }

  // 1. Per-item macro override
  const itemOverrides = _getItemOverrides();
  if (info.itemId && itemOverrides[info.itemId]) {
    if (debug) console.log(`[ISAF] → Using per-item override for ${info.itemId}`);
    return itemOverrides[info.itemId];
  }

  // 2. Custom category macro override
  const customMappings = _getCustomMappings();
  if (info.weaponCategory && customMappings[info.weaponCategory]) {
    if (debug) console.log(`[ISAF] → Using custom mapping for category: ${info.weaponCategory}`);
    return customMappings[info.weaponCategory];
  }

  // 3. Default category animation script
  //    Use the weapon's energy category (laser, plasma, flame, etc.) when it's
  //    a meaningful category. Skip "uncategorized" so melee weapons like a
  //    survival knife (weaponType=basicM, category=uncategorized) fall through
  //    to the weapon type check below.
  if (info.weaponCategory && info.weaponCategory !== 'uncategorized' && CATEGORY_ANIMATIONS[info.weaponCategory]) {
    const anim = CATEGORY_ANIMATIONS[info.weaponCategory];
    if (debug) console.log(`[ISAF] → Using default category script: ${info.weaponCategory}`);
    return anim;
  }

  // 4. Default weapon type animation script
  //    Matches the physical weapon class (basicM, advancedM, longA, smallA, etc.).
  //    This is the primary resolver for melee weapons and the fallback for ranged
  //    weapons whose category was "uncategorized" or missing.
  if (info.weaponType && WEAPON_TYPE_ANIMATIONS[info.weaponType]) {
    const anim = WEAPON_TYPE_ANIMATIONS[info.weaponType];
    if (debug) console.log(`[ISAF] → Using weapon type script: ${info.weaponType}`);
    return anim;
  }

  // 4b. "uncategorized" category fallback — only if weapon type also didn't match
  if (info.weaponCategory === 'uncategorized' && CATEGORY_ANIMATIONS['uncategorized']) {
    const anim = CATEGORY_ANIMATIONS['uncategorized'];
    if (debug) console.log(`[ISAF] → Using uncategorized fallback script`);
    return anim;
  }

  // 5. Damage type animation script
  if (info.primaryDamageType && DAMAGE_TYPE_ANIMATIONS[info.primaryDamageType]) {
    const anim = DAMAGE_TYPE_ANIMATIONS[info.primaryDamageType];
    if (debug) console.log(`[ISAF] → Using damage type script: ${info.primaryDamageType}`);
    return anim;
  }

  // 6. JB2A fallback
  if (_hasJB2A()) {
    const jb2aKey = info.weaponCategory ?? info.weaponType ?? info.primaryDamageType;
    const jb2aPath = jb2aKey ? JB2A_FALLBACKS[jb2aKey] : null;
    if (jb2aPath) {
      if (debug) console.log(`[ISAF] → Using JB2A fallback: ${jb2aPath}`);
      const mode = getAttackMode(info);
      return {
        animation: jb2aPath,
        type: mode,
        scale: 1.0,
        speed: mode === 'melee' ? 300 : 800,
        isJB2A: true
      };
    }
  }

  // 7. No animation found
  if (debug) console.log(`[ISAF] → No animation found for: ${info.itemName}`);
  return null;
}

// --- Private Helpers ---

/**
 * Check if JB2A (free or patreon) is installed and active.
 * @returns {boolean}
 */
function _hasJB2A() {
  return (
    game.modules.get('jb2a_patreon')?.active ||
    game.modules.get('JB2A_DnD5e')?.active ||
    false
  );
}

/**
 * Load custom category mappings from settings.
 * @returns {Object}
 */
function _getCustomMappings() {
  try {
    const raw = getSetting('customMappings');
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    console.warn('[ISAF] Failed to parse custom mappings:', e);
    return {};
  }
}

/**
 * Load per-item overrides from settings.
 * @returns {Object}
 */
function _getItemOverrides() {
  try {
    const raw = getSetting('itemOverrides');
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    console.warn('[ISAF] Failed to parse item overrides:', e);
    return {};
  }
}
