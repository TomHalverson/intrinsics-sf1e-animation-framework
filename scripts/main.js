// ============================================
// Intrinsics SF1E Animation Framework
// Main Entry Point
// ============================================
//
// Auto-detects SF1E weapon attacks and plays
// matching animations from attacker → target
// using Sequencer.
//
// Hook priority:
//   1. sfrpg 'attackRolled' hook (preferred)
//   2. 'createChatMessage' fallback
//
// Animation resolution priority:
//   1. Per-item override
//   2. Custom category mapping (user config)
//   3. Default weapon category animation
//   4. Default weapon type animation
//   5. Damage type animation
//   6. JB2A fallback
// ============================================

import { MODULE_ID, registerSettings, getSetting, setSetting } from './settings.js';
import { AnimationEngine } from './animation-engine.js';
import { extractWeaponInfo, resolveAnimation } from './weapon-resolver.js';

let engine = null;

// Keep a reference for the API
const _weaponResolverRef = { extractWeaponInfo, resolveAnimation };

// ==================================================
// Module Initialization
// ==================================================

Hooks.once('init', () => {
  console.log(`[ISAF] Intrinsics SF1E Animation Framework | Initializing...`);

  // Register all settings
  registerSettings();
});

Hooks.once('ready', () => {
  // --- Dependency check: Sequencer ---
  if (!game.modules.get('sequencer')?.active) {
    ui.notifications.error(
      game.i18n.localize('ISAF.Notifications.SequencerMissing'),
      { permanent: true }
    );
    console.error('[ISAF] Sequencer module is not active. Animation framework disabled.');
    return;
  }

  // --- System check: sfrpg ---
  if (game.system.id !== 'sfrpg') {
    console.warn('[ISAF] This module is designed for the Starfinder 1E (sfrpg) system.');
  }

  // --- Initialize the animation engine ---
  engine = new AnimationEngine();
  engine.registerHooks();

  // --- Register context menu integration for per-item overrides ---
  _registerItemContextMenu();

  console.log(`[ISAF] Intrinsics SF1E Animation Framework | Ready.`);
  console.log(`[ISAF] Animations enabled: ${getSetting('enabled')}`);
  console.log(`[ISAF] Debug mode: ${getSetting('debugMode')}`);
});

// ==================================================
// Per-Item Override via Context Menu
// ==================================================

/**
 * Add a right-click context menu option on weapon items in character sheets
 * to set a per-item animation override.
 */
function _registerItemContextMenu() {
  // Hook into the item sheet header buttons for sfrpg
  Hooks.on('getItemSheetHeaderButtons', (sheet, buttons) => {
    if (!game.user.isGM) return;

    const item = sheet.item;
    if (!item || item.type !== 'weapon') return;

    buttons.unshift({
      label: 'Set Animation',
      class: 'isaf-set-animation',
      icon: 'fas fa-film',
      onclick: () => _openItemOverrideDialog(item)
    });
  });
}

/**
 * Open a dialog to set a per-item animation override.
 * @param {Item} item
 */
async function _openItemOverrideDialog(item) {
  const overrides = _getItemOverrides();
  const existing = overrides[item.uuid] ?? {};

  const content = `
    <form>
      <div class="form-group">
        <label>Animation File</label>
        <div class="form-fields">
          <input type="text" name="animation" value="${existing.animation ?? ''}"
                 placeholder="Path to .webm animation file or JB2A database path" />
        </div>
      </div>
      <div class="form-group">
        <label>Sound File</label>
        <div class="form-fields">
          <input type="text" name="sound" value="${existing.sound ?? ''}"
                 placeholder="Path to .ogg / .mp3 sound file (optional)" />
        </div>
      </div>
      <div class="form-group">
        <label>Scale</label>
        <div class="form-fields">
          <input type="number" name="scale" value="${existing.scale ?? 1.0}" step="0.1" min="0.1" max="5.0" />
        </div>
      </div>
      <div class="form-group">
        <label>Speed (ms)</label>
        <div class="form-fields">
          <input type="number" name="speed" value="${existing.speed ?? 800}" step="50" min="100" max="5000" />
        </div>
      </div>
    </form>
  `;

  new Dialog({
    title: `Animation Override: ${item.name}`,
    content,
    buttons: {
      save: {
        label: 'Save',
        icon: '<i class="fas fa-save"></i>',
        callback: async (html) => {
          const animation = html.find('[name="animation"]').val().trim();
          const sound = html.find('[name="sound"]').val().trim();
          const scale = parseFloat(html.find('[name="scale"]').val()) || 1.0;
          const speed = parseInt(html.find('[name="speed"]').val()) || 800;

          if (animation) {
            overrides[item.uuid] = {
              animation,
              sound: sound || null,
              scale,
              speed,
              type: (item.system.actionType === 'mwak' || item.system.actionType === 'msak') ? 'melee' : 'ranged',
              itemName: item.name
            };
          } else {
            // Clear override if animation is empty
            delete overrides[item.uuid];
          }

          await setSetting('itemOverrides', JSON.stringify(overrides));
          ui.notifications.info(`Animation override ${animation ? 'saved' : 'cleared'} for ${item.name}.`);
        }
      },
      clear: {
        label: 'Clear Override',
        icon: '<i class="fas fa-trash"></i>',
        callback: async () => {
          delete overrides[item.uuid];
          await setSetting('itemOverrides', JSON.stringify(overrides));
          ui.notifications.info(`Animation override cleared for ${item.name}.`);
        }
      },
      cancel: {
        label: 'Cancel',
        icon: '<i class="fas fa-times"></i>'
      }
    },
    default: 'save'
  }).render(true);
}

/**
 * Parse item overrides from settings.
 * @returns {Object}
 */
function _getItemOverrides() {
  try {
    return JSON.parse(getSetting('itemOverrides') || '{}');
  } catch {
    return {};
  }
}

// ==================================================
// API — expose for macros and other modules
// ==================================================

Hooks.once('ready', () => {
  // Expose module API on the module object
  const moduleData = game.modules.get(MODULE_ID);
  if (moduleData) {
    moduleData.api = {
      /**
       * Manually trigger an animation for a weapon attack.
       * @param {Token} sourceToken
       * @param {Token} targetToken
       * @param {string} animationPath - Sequencer file path or JB2A database path
       * @param {Object} [options={}]
       * @param {number} [options.scale=1.0]
       * @param {number} [options.speed=800]
       * @param {string} [options.sound]
       * @param {number} [options.volume=0.5]
       */
      playAnimation: async (sourceToken, targetToken, animationPath, options = {}) => {
        if (typeof Sequence === 'undefined') {
          console.error('[ISAF] Sequencer not available.');
          return;
        }

        const seq = new Sequence(MODULE_ID);
        seq.effect()
          .file(animationPath)
          .atLocation(sourceToken)
          .stretchTo(targetToken)
          .scale(options.scale ?? 1.0)
          .speed(options.speed ?? 800)
          .zIndex(10);

        if (options.sound) {
          seq.sound()
            .file(options.sound)
            .volume(options.volume ?? 0.5);
        }

        await seq.play();
      },

      /**
       * Get the resolved animation data for a weapon item.
       * @param {Item} item
       * @returns {Object|null}
       */
      getAnimationForWeapon: (item) => {
        // Uses the already-imported functions from module scope
        const { extractWeaponInfo, resolveAnimation } = _weaponResolverRef;
        const info = extractWeaponInfo(item);
        return resolveAnimation(info);
      },

      /** The animation engine instance */
      engine
    };
  }
});
