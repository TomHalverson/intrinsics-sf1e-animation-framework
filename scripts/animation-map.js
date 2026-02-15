// ============================================
// Intrinsics SF1E Animation Framework
// Default Animation Mappings
// ============================================
//
// This file defines the default mapping from weapon categories, weapon types,
// and damage types to JavaScript animation scripts in the animations/ folder.
//
// Each animation is a JS file that exports a default async function:
//
//   export default async function(seq, context) {
//     seq.effect()
//       .file("jb2a.laser_beam.01.red")
//       .atLocation(context.sourceToken)
//       .stretchTo(context.targetToken)
//       .scale(context.scale);
//   }
//
// The framework calls the script, passing a fresh Sequencer Sequence and
// a context object with tokens, hit/miss, scale, speed, etc.
//
// Users can override any mapping with a Foundry macro (by name or ID)
// via the config UI or per-item right-click menu.
//
// Animation script resolution priority:
//   1. Per-item macro override
//   2. Custom category macro override (user config)
//   3. Default category animation script (.js)
//   4. Default weapon type animation script (.js)
//   5. Damage type animation script (.js)
//   6. JB2A fallback (if JB2A installed)
// ============================================

const MODULE_PATH = 'modules/intrinsics-sf1e-animation-framework';

/**
 * Default animation mappings keyed by weapon category (system.weaponCategory).
 * These are the SF1E special weapon categories for ranged weapons.
 *
 * Each entry can specify:
 *   - script:  Path to a JS animation script (relative to module root)
 *   - type:    'ranged' | 'melee' | 'cone' | 'aoe' — how the animation plays
 *   - scale:   (optional) Default scale
 *   - speed:   (optional) Default speed (ms for projectile travel)
 */
export const CATEGORY_ANIMATIONS = {
  // --- Ranged weapon categories (by damage/energy type) ---
  laser: {
    script: 'animations/laser/laser.js',
    type: 'ranged',
    scale: 1.0,
    speed: 800
  },

  plasma: {
    script: 'animations/plasma/plasma.js',
    type: 'ranged',
    scale: 1.0,
    speed: 1000
  },

  projectile: {
    script: 'animations/projectile/projectile.js',
    type: 'ranged',
    scale: 0.6,
    speed: 500
  },

  flame: {
    script: 'animations/flame/flame.js',
    type: 'ranged',
    scale: 1.2,
    speed: 900
  },

  cryo: {
    script: 'animations/cryo/cryo.js',
    type: 'ranged',
    scale: 1.0,
    speed: 900
  },

  shock: {
    script: 'animations/shock/shock.js',
    type: 'ranged',
    scale: 1.0,
    speed: 400
  },

  sonic: {
    script: 'animations/sonic/sonic.js',
    type: 'ranged',
    scale: 1.2,
    speed: 700
  },

  disintegrator: {
    script: 'animations/disintegrator/disintegrator.js',
    type: 'ranged',
    scale: 1.0,
    speed: 600
  },

  disruption: {
    script: 'animations/disruption/disruption.js',
    type: 'ranged',
    scale: 1.0,
    speed: 800
  },

  uncategorized: {
    script: 'animations/generic/generic.js',
    type: 'ranged',
    scale: 0.8,
    speed: 800
  }
};

/**
 * Animations keyed by weapon type (system.weaponType).
 * These represent the physical class of weapon.
 * Used as a fallback when no category-specific animation script is found.
 */
export const WEAPON_TYPE_ANIMATIONS = {
  // --- Melee ---
  basicM: {
    script: 'animations/melee/basic_melee.js',
    type: 'melee',
    scale: 1.0,
    speed: 300
  },

  advancedM: {
    script: 'animations/melee/advanced_melee.js',
    type: 'melee',
    scale: 1.2,
    speed: 300
  },

  // --- Ranged ---
  smallA: {
    script: 'animations/projectile/small_arms.js',
    type: 'ranged',
    scale: 0.5,
    speed: 500
  },

  longA: {
    script: 'animations/projectile/longarms.js',
    type: 'ranged',
    scale: 0.7,
    speed: 400
  },

  heavy: {
    script: 'animations/projectile/heavy.js',
    type: 'ranged',
    scale: 1.0,
    speed: 600
  },

  sniper: {
    script: 'animations/projectile/sniper.js',
    type: 'ranged',
    scale: 0.5,
    speed: 300
  },

  grenade: {
    script: 'animations/grenade/grenade.js',
    type: 'ranged',
    scale: 0.8,
    speed: 1200
  },

  special: {
    script: 'animations/generic/generic.js',
    type: 'ranged',
    scale: 0.8,
    speed: 800
  },

  solarian: {
    script: 'animations/solarian/solarian.js',
    type: 'melee',
    scale: 1.2,
    speed: 400
  }
};

/**
 * Damage-type-based animations as a tertiary fallback.
 * Keyed by the sfrpg damage type string.
 */
export const DAMAGE_TYPE_ANIMATIONS = {
  fire: {
    script: 'animations/flame/flame.js',
    type: 'ranged',
    scale: 1.0,
    speed: 900
  },
  cold: {
    script: 'animations/cryo/cryo.js',
    type: 'ranged',
    scale: 1.0,
    speed: 900
  },
  electricity: {
    script: 'animations/shock/shock.js',
    type: 'ranged',
    scale: 1.0,
    speed: 400
  },
  acid: {
    script: 'animations/generic/generic.js',
    type: 'ranged',
    scale: 0.8,
    speed: 1000
  },
  sonic: {
    script: 'animations/sonic/sonic.js',
    type: 'ranged',
    scale: 1.2,
    speed: 700
  },
  bludgeoning: {
    script: 'animations/melee/basic_melee.js',
    type: 'melee',
    scale: 1.0,
    speed: 300
  },
  piercing: {
    script: 'animations/melee/basic_melee.js',
    type: 'melee',
    scale: 0.8,
    speed: 300
  },
  slashing: {
    script: 'animations/melee/basic_melee.js',
    type: 'melee',
    scale: 1.0,
    speed: 300
  }
};

/**
 * JB2A fallback mappings.
 * Used when the user has JB2A installed but no animation scripts are found.
 * These use JB2A's Sequencer database paths.
 */
export const JB2A_FALLBACKS = {
  laser:         'jb2a.laser_beam.01.red',
  plasma:        'jb2a.energy_beam.normal.bluepink',
  projectile:    'jb2a.bullet.01.orange',
  flame:         'jb2a.fire_bolt.orange',
  cryo:          'jb2a.ray_of_frost.blue',
  shock:         'jb2a.chain_lightning.primary.blue',
  sonic:         'jb2a.thunderwave.center.blue',
  disintegrator: 'jb2a.disintegrate.green',
  disruption:    'jb2a.eldritch_blast.purple',
  uncategorized: 'jb2a.magic_missile.purple',

  // Weapon types
  basicM:        'jb2a.melee_generic.slash.01.orange',
  advancedM:     'jb2a.melee_generic.slash.02.orange',
  smallA:        'jb2a.bullet.01.orange',
  longA:         'jb2a.bullet.02.orange',
  heavy:         'jb2a.bullet.02.orange',
  sniper:        'jb2a.bullet.01.orange',
  grenade:       'jb2a.throwable.throw.boulder.01',
  special:       'jb2a.magic_missile.purple',
  solarian:      'jb2a.melee_generic.slash.01.yellow',

  // Damage types
  fire:          'jb2a.fire_bolt.orange',
  cold:          'jb2a.ray_of_frost.blue',
  electricity:   'jb2a.chain_lightning.primary.blue',
  acid:          'jb2a.magic_missile.green',
  sonic_dmg:     'jb2a.thunderwave.center.blue',
  bludgeoning:   'jb2a.melee_generic.slash.01.orange',
  piercing:      'jb2a.melee_generic.slash.01.orange',
  slashing:      'jb2a.melee_generic.slash.01.orange'
};

/**
 * Get the module's animation base path.
 * @returns {string}
 */
export function getModulePath() {
  return MODULE_PATH;
}
