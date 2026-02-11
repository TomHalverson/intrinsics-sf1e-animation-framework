// ============================================
// Intrinsics SF1E Animation Framework
// Default Animation Mappings
// ============================================
//
// This file defines the default mapping from weapon categories, weapon types,
// damage types, and action types to Sequencer-compatible animation file paths.
//
// Users can place their own animation files in:
//   modules/intrinsics-sf1e-animation-framework/animations/
//
// The module path prefix for custom animations:
//   modules/intrinsics-sf1e-animation-framework/animations/{category}/{file}.webm
//
// JB2A paths (if user has JB2A installed) use the format:
//   jb2a.{effect_name}.{variant}
//
// You can use EITHER a JB2A database path OR a direct file path to a .webm file.
// ============================================

const MODULE_PATH = 'modules/intrinsics-sf1e-animation-framework';

/**
 * Default animation mappings keyed by weapon category (system.weaponCategory).
 * These are the SF1E special weapon categories for ranged weapons.
 *
 * Each entry can specify:
 *   - animation:  Sequencer file path or JB2A database path
 *   - sound:      (optional) Sound file path
 *   - scale:      (optional) Scale override
 *   - speed:      (optional) Speed override (ms for projectile travel)
 *   - type:       'ranged' | 'melee' | 'cone' | 'aoe' — how the animation plays
 *   - missed:     (optional) Animation variant for misses
 */
export const CATEGORY_ANIMATIONS = {
  // --- Ranged weapon categories (by damage/energy type) ---
  laser: {
    animation: `${MODULE_PATH}/animations/laser/laser_beam.webm`,
    sound: `${MODULE_PATH}/animations/laser/laser_fire.ogg`,
    type: 'ranged',
    scale: 1.0,
    speed: 800
  },

  plasma: {
    animation: `${MODULE_PATH}/animations/plasma/plasma_bolt.webm`,
    sound: `${MODULE_PATH}/animations/plasma/plasma_fire.ogg`,
    type: 'ranged',
    scale: 1.0,
    speed: 1000
  },

  projectile: {
    animation: `${MODULE_PATH}/animations/projectile/bullet.webm`,
    sound: `${MODULE_PATH}/animations/projectile/gunshot.ogg`,
    type: 'ranged',
    scale: 0.6,
    speed: 500
  },

  flame: {
    animation: `${MODULE_PATH}/animations/flame/flame_jet.webm`,
    sound: `${MODULE_PATH}/animations/flame/flame_burst.ogg`,
    type: 'ranged',
    scale: 1.2,
    speed: 900
  },

  cryo: {
    animation: `${MODULE_PATH}/animations/cryo/cryo_beam.webm`,
    sound: `${MODULE_PATH}/animations/cryo/cryo_fire.ogg`,
    type: 'ranged',
    scale: 1.0,
    speed: 900
  },

  shock: {
    animation: `${MODULE_PATH}/animations/shock/shock_arc.webm`,
    sound: `${MODULE_PATH}/animations/shock/shock_zap.ogg`,
    type: 'ranged',
    scale: 1.0,
    speed: 400
  },

  sonic: {
    animation: `${MODULE_PATH}/animations/sonic/sonic_wave.webm`,
    sound: `${MODULE_PATH}/animations/sonic/sonic_blast.ogg`,
    type: 'ranged',
    scale: 1.2,
    speed: 700
  },

  disintegrator: {
    animation: `${MODULE_PATH}/animations/disintegrator/disintegrate_beam.webm`,
    sound: `${MODULE_PATH}/animations/disintegrator/disintegrate.ogg`,
    type: 'ranged',
    scale: 1.0,
    speed: 600
  },

  disruption: {
    animation: `${MODULE_PATH}/animations/disruption/disruption_pulse.webm`,
    sound: `${MODULE_PATH}/animations/disruption/disruption.ogg`,
    type: 'ranged',
    scale: 1.0,
    speed: 800
  },

  uncategorized: {
    animation: `${MODULE_PATH}/animations/generic/energy_bolt.webm`,
    sound: `${MODULE_PATH}/animations/generic/energy_fire.ogg`,
    type: 'ranged',
    scale: 0.8,
    speed: 800
  }
};

/**
 * Animations keyed by weapon type (system.weaponType).
 * These represent the physical class of weapon.
 * Used as a fallback when no category-specific animation is found.
 */
export const WEAPON_TYPE_ANIMATIONS = {
  // --- Melee ---
  basicM: {
    animation: `${MODULE_PATH}/animations/melee/basic_melee.webm`,
    sound: `${MODULE_PATH}/animations/melee/melee_swing.ogg`,
    type: 'melee',
    scale: 1.0,
    speed: 300
  },

  advancedM: {
    animation: `${MODULE_PATH}/animations/melee/advanced_melee.webm`,
    sound: `${MODULE_PATH}/animations/melee/melee_heavy.ogg`,
    type: 'melee',
    scale: 1.2,
    speed: 300
  },

  // --- Ranged ---
  smallA: {
    animation: `${MODULE_PATH}/animations/projectile/bullet.webm`,
    sound: `${MODULE_PATH}/animations/projectile/pistol_fire.ogg`,
    type: 'ranged',
    scale: 0.5,
    speed: 500
  },

  longA: {
    animation: `${MODULE_PATH}/animations/projectile/bullet.webm`,
    sound: `${MODULE_PATH}/animations/projectile/rifle_fire.ogg`,
    type: 'ranged',
    scale: 0.7,
    speed: 400
  },

  heavy: {
    animation: `${MODULE_PATH}/animations/projectile/heavy_round.webm`,
    sound: `${MODULE_PATH}/animations/projectile/heavy_fire.ogg`,
    type: 'ranged',
    scale: 1.0,
    speed: 600
  },

  sniper: {
    animation: `${MODULE_PATH}/animations/projectile/sniper_round.webm`,
    sound: `${MODULE_PATH}/animations/projectile/sniper_fire.ogg`,
    type: 'ranged',
    scale: 0.5,
    speed: 300
  },

  grenade: {
    animation: `${MODULE_PATH}/animations/grenade/grenade_toss.webm`,
    sound: `${MODULE_PATH}/animations/grenade/grenade_throw.ogg`,
    type: 'ranged',
    scale: 0.8,
    speed: 1200
  },

  special: {
    animation: `${MODULE_PATH}/animations/generic/energy_bolt.webm`,
    sound: `${MODULE_PATH}/animations/generic/energy_fire.ogg`,
    type: 'ranged',
    scale: 0.8,
    speed: 800
  },

  solarian: {
    animation: `${MODULE_PATH}/animations/solarian/solar_strike.webm`,
    sound: `${MODULE_PATH}/animations/solarian/solar_fire.ogg`,
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
    animation: `${MODULE_PATH}/animations/flame/flame_jet.webm`,
    type: 'ranged',
    scale: 1.0,
    speed: 900
  },
  cold: {
    animation: `${MODULE_PATH}/animations/cryo/cryo_beam.webm`,
    type: 'ranged',
    scale: 1.0,
    speed: 900
  },
  electricity: {
    animation: `${MODULE_PATH}/animations/shock/shock_arc.webm`,
    type: 'ranged',
    scale: 1.0,
    speed: 400
  },
  acid: {
    animation: `${MODULE_PATH}/animations/generic/acid_bolt.webm`,
    type: 'ranged',
    scale: 0.8,
    speed: 1000
  },
  sonic: {
    animation: `${MODULE_PATH}/animations/sonic/sonic_wave.webm`,
    type: 'ranged',
    scale: 1.2,
    speed: 700
  },
  bludgeoning: {
    animation: `${MODULE_PATH}/animations/melee/basic_melee.webm`,
    type: 'melee',
    scale: 1.0,
    speed: 300
  },
  piercing: {
    animation: `${MODULE_PATH}/animations/melee/basic_melee.webm`,
    type: 'melee',
    scale: 0.8,
    speed: 300
  },
  slashing: {
    animation: `${MODULE_PATH}/animations/melee/basic_melee.webm`,
    type: 'melee',
    scale: 1.0,
    speed: 300
  }
};

/**
 * JB2A fallback mappings.
 * Used when the user has JB2A installed but has not provided custom animation files.
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
