// ============================================
// Intrinsics SF1E Animation Framework
// Animation Engine — plays animations via
// Sequencer based on weapon attack data.
// ============================================

import { MODULE_ID, getSetting } from './settings.js';
import { extractWeaponInfo, resolveAnimation, getAttackMode } from './weapon-resolver.js';

/**
 * AnimationEngine handles intercepting attack rolls from the sfrpg system
 * and playing the appropriate Sequencer animations.
 */
export class AnimationEngine {
  constructor() {
    /** @type {number} Throttle — minimum ms between animations for same source */
    this._throttleMs = 200;
    /** @type {Map<string, number>} Last animation time per token ID */
    this._lastAnimTime = new Map();
  }

  // ==================================================
  // Initialization
  // ==================================================

  /**
   * Register all hooks for intercepting attacks.
   */
  registerHooks() {
    // --- Primary hook: sfrpg's dedicated attackRolled hook ---
    Hooks.on('attackRolled', (data) => this._onAttackRolled(data));

    // --- Fallback hook: createChatMessage for systems that may not fire attackRolled ---
    Hooks.on('createChatMessage', (message) => this._onChatMessage(message));

    console.log(`[ISAF] AnimationEngine hooks registered.`);
  }

  // ==================================================
  // Hook Handlers
  // ==================================================

  /**
   * Handle the sfrpg-specific attackRolled hook.
   * This is the preferred hook — it gives us direct access to the actor and item.
   *
   * @param {Object} data
   * @param {Actor}  data.actor        - The attacking actor
   * @param {Item}   data.item         - The weapon/spell item (may be null)
   * @param {Roll}   data.roll         - The Roll object
   * @param {Object} data.formula      - {base, final}
   * @param {Object} data.rollMetadata - Additional roll context
   */
  async _onAttackRolled({ actor, item, roll, formula, rollMetadata }) {
    if (!this._shouldAnimate()) return;
    if (!item) return;

    // Only the triggering user should play the animation
    // (prevents duplicate animations from other connected clients)
    if (!this._isAnimationOwner(actor)) return;

    const debug = getSetting('debugMode');
    if (debug) console.log('[ISAF] attackRolled hook fired', { actor: actor?.name, item: item?.name });

    // Mark that we handled this attack via the dedicated hook
    // so the createChatMessage fallback skips it
    this._lastHandledAttack = {
      actorId: actor?.id,
      itemId: item?.id,
      timestamp: Date.now()
    };

    // Check hit/miss if the setting requires it
    const onlyOnHit = getSetting('onlyOnHit');
    let isHit = true; // Default to true; we may not know yet at this point

    // The roll result can tell us if it hit
    if (roll && rollMetadata?.targetToken) {
      const rollTotal = roll.total;
      const targetAC = rollMetadata.targetToken?.actor?.system?.attributes?.eac?.value
                    ?? rollMetadata.targetToken?.actor?.system?.attributes?.kac?.value
                    ?? null;
      if (targetAC !== null) {
        isHit = rollTotal >= targetAC;
      }
    }

    if (onlyOnHit && !isHit) {
      if (getSetting('missAnimation')) {
        await this._playAnimation(actor, item, false);
      }
      return;
    }

    await this._playAnimation(actor, item, isHit);
  }

  /**
   * Fallback: Handle createChatMessage for attack rolls.
   * Only fires if the attackRolled hook did NOT already handle this attack.
   *
   * @param {ChatMessage} message
   */
  async _onChatMessage(message) {
    if (!this._shouldAnimate()) return;

    // Check if this is an sfrpg attack roll
    const flags = message.flags?.sfrpg;
    if (!flags) return;

    // Only process attack-type rolls
    const isAttack = flags.rollType === 'attack' ||
                     message.flavor?.toLowerCase().includes('attack');
    if (!isAttack) return;

    // Check if the dedicated hook already handled this
    if (this._lastHandledAttack) {
      const elapsed = Date.now() - this._lastHandledAttack.timestamp;
      if (elapsed < 2000) {
        // Likely the same attack — skip
        return;
      }
    }

    // Try to extract actor and item from the message
    const speaker = message.speaker;
    if (!speaker?.token && !speaker?.actor) return;

    const actor = game.actors.get(speaker.actor) ?? null;
    const item = actor?.items?.get(flags.itemId) ?? null;
    if (!item) return;

    if (!this._isAnimationOwner(actor)) return;

    const debug = getSetting('debugMode');
    if (debug) console.log('[ISAF] createChatMessage fallback fired', { actor: actor?.name, item: item?.name });

    // Determine hit/miss from flags
    const isHit = flags.rollSuccess !== false;
    const onlyOnHit = getSetting('onlyOnHit');

    if (onlyOnHit && !isHit) {
      if (getSetting('missAnimation')) {
        await this._playAnimation(actor, item, false);
      }
      return;
    }

    await this._playAnimation(actor, item, isHit);
  }

  // ==================================================
  // Animation Playback
  // ==================================================

  /**
   * Resolve and play the animation for a weapon attack.
   *
   * @param {Actor} actor  - The attacking actor
   * @param {Item}  item   - The weapon item
   * @param {boolean} isHit - Whether the attack hit
   */
  async _playAnimation(actor, item, isHit = true) {
    const debug = getSetting('debugMode');

    // 1. Resolve the source token
    const sourceToken = this._getActorToken(actor);
    if (!sourceToken) {
      if (debug) console.log('[ISAF] No source token found for actor:', actor?.name);
      return;
    }

    // 2. Throttle check
    if (!this._throttleCheck(sourceToken.id)) return;

    // 3. Get target tokens
    const targets = this._getTargets();
    if (targets.length === 0) {
      if (debug) console.log('[ISAF] No targets selected, skipping animation.');
      return;
    }

    // 4. Extract weapon info and resolve animation
    const weaponInfo = extractWeaponInfo(item);
    const animData = resolveAnimation(weaponInfo);

    if (!animData) {
      if (debug) console.log(`[ISAF] No animation found for weapon: ${weaponInfo.itemName}`);
      return;
    }

    // 5. Get global settings
    const globalScale = getSetting('animationScale');
    const globalSpeed = getSetting('animationSpeed');
    const soundEnabled = getSetting('soundEnabled');
    const soundVolume = getSetting('soundVolume');

    const finalScale = (animData.scale ?? 1.0) * globalScale;
    const finalSpeed = (animData.speed ?? 800) / globalSpeed;
    const attackMode = animData.type ?? getAttackMode(weaponInfo);

    if (debug) {
      console.log(`[ISAF] Playing animation:`, {
        weapon: weaponInfo.itemName,
        category: weaponInfo.weaponCategory,
        animation: animData.animation,
        mode: attackMode,
        scale: finalScale,
        speed: finalSpeed,
        targets: targets.length,
        isHit
      });
    }

    // 6. Play the animation for each target
    for (const targetToken of targets) {
      try {
        await this._playSequencerAnimation({
          sourceToken,
          targetToken,
          animData,
          attackMode,
          finalScale,
          finalSpeed,
          soundEnabled,
          soundVolume,
          isHit
        });
      } catch (err) {
        console.error(`[ISAF] Error playing animation:`, err);
      }
    }
  }

  /**
   * Execute a single Sequencer animation from source to target.
   *
   * @param {Object} params
   * @param {Token}  params.sourceToken
   * @param {Token}  params.targetToken
   * @param {Object} params.animData
   * @param {string} params.attackMode   - 'melee' | 'ranged'
   * @param {number} params.finalScale
   * @param {number} params.finalSpeed   - in ms
   * @param {boolean} params.soundEnabled
   * @param {number} params.soundVolume
   * @param {boolean} params.isHit
   */
  async _playSequencerAnimation({
    sourceToken, targetToken, animData, attackMode,
    finalScale, finalSpeed, soundEnabled, soundVolume, isHit
  }) {
    // Ensure Sequencer is available
    if (typeof Sequence === 'undefined') {
      console.error('[ISAF] Sequencer not available. Is the Sequencer module active?');
      return;
    }

    const seq = new Sequence(MODULE_ID);

    if (attackMode === 'melee') {
      // --- Melee Animation ---
      // Play effect on the target location (no projectile travel)
      const effect = seq.effect()
        .file(animData.animation)
        .atLocation(sourceToken)
        .stretchTo(targetToken)
        .scale(finalScale)
        .zIndex(10);

      if (!isHit) {
        // Miss: reduce opacity and rotate slightly
        effect.opacity(0.4)
          .randomRotation();
      }

    } else {
      // --- Ranged Animation ---
      // Projectile travels from source to target
      const effect = seq.effect()
        .file(animData.animation)
        .atLocation(sourceToken)
        .stretchTo(targetToken)
        .scale(finalScale)
        .speed(finalSpeed)
        .zIndex(10);

      if (!isHit) {
        // Miss: offset the endpoint and reduce opacity
        const missOffset = this._calculateMissOffset(sourceToken, targetToken);
        effect.opacity(0.5)
          .missed();
      }
    }

    // --- Sound ---
    if (soundEnabled && animData.sound) {
      seq.sound()
        .file(animData.sound)
        .volume(soundVolume)
        .delay(attackMode === 'ranged' ? 0 : 100);
    }

    // Play the sequence
    await seq.play();
  }

  // ==================================================
  // Token Resolution
  // ==================================================

  /**
   * Find the token on the canvas that represents the given actor.
   * Prefers a controlled token, then falls back to any token owned by the actor.
   *
   * @param {Actor} actor
   * @returns {Token|null}
   */
  _getActorToken(actor) {
    if (!actor || !canvas.tokens) return null;

    // Check controlled tokens first
    const controlled = canvas.tokens.controlled;
    for (const token of controlled) {
      if (token.actor?.id === actor.id) return token;
    }

    // Fall back to finding any token for this actor on the scene
    const sceneTokens = canvas.tokens.placeables;
    for (const token of sceneTokens) {
      if (token.actor?.id === actor.id) return token;
    }

    return null;
  }

  /**
   * Get the current user's targeted tokens.
   * @returns {Token[]}
   */
  _getTargets() {
    return Array.from(game.user.targets).filter(t => t && canvas.tokens.placeables.includes(t));
  }

  // ==================================================
  // Utility
  // ==================================================

  /**
   * Check if animations should run at all.
   * @returns {boolean}
   */
  _shouldAnimate() {
    // Master toggle
    if (!getSetting('enabled')) return false;

    // Sequencer must be active
    if (!game.modules.get('sequencer')?.active) return false;

    // Must be on a canvas with tokens
    if (!canvas?.tokens) return false;

    return true;
  }

  /**
   * Determine if the current user is the one who should play the animation.
   * We want only the attacking user (or the GM if the attacker is unowned) to trigger it.
   *
   * @param {Actor} actor
   * @returns {boolean}
   */
  _isAnimationOwner(actor) {
    if (!actor) return false;

    // If the current user owns the actor, they should play the animation
    if (actor.isOwner) return true;

    // If no player owns the actor (NPC), only the active GM should play it
    const hasPlayerOwner = game.users.contents.some(
      u => !u.isGM && actor.testUserPermission(u, 'OWNER')
    );
    if (!hasPlayerOwner && game.user.isGM) return true;

    return false;
  }

  /**
   * Simple throttle to prevent animation spam from rapid attacks.
   * @param {string} tokenId
   * @returns {boolean} true if animation should proceed
   */
  _throttleCheck(tokenId) {
    const now = Date.now();
    const last = this._lastAnimTime.get(tokenId) ?? 0;
    if (now - last < this._throttleMs) return false;
    this._lastAnimTime.set(tokenId, now);
    return true;
  }

  /**
   * Calculate a miss offset — the projectile should land near but not on the target.
   * Returns a pixel offset.
   *
   * @param {Token} source
   * @param {Token} target
   * @returns {{x: number, y: number}}
   */
  _calculateMissOffset(source, target) {
    const gridSize = canvas.grid.size ?? 100;
    const angle = Math.atan2(
      target.center.y - source.center.y,
      target.center.x - source.center.x
    );
    // Perpendicular offset, randomly left or right
    const perpAngle = angle + (Math.random() > 0.5 ? Math.PI / 2 : -Math.PI / 2);
    const distance = gridSize * (0.5 + Math.random() * 0.5);
    return {
      x: Math.cos(perpAngle) * distance,
      y: Math.sin(perpAngle) * distance
    };
  }
}
