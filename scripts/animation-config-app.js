// ============================================
// Intrinsics SF1E Animation Framework
// Animation Configuration Application
// ============================================

import { MODULE_ID, getSetting, setSetting } from './settings.js';
import { CATEGORY_ANIMATIONS, WEAPON_TYPE_ANIMATIONS, DAMAGE_TYPE_ANIMATIONS, getModulePath } from './animation-map.js';

/**
 * FormApplication for configuring animation mappings.
 * Accessible via module settings → "Configure Animations" button.
 */
export class AnimationConfigApp extends FormApplication {

  /** @override */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      id: 'isaf-animation-config',
      title: game.i18n.localize('ISAF.Config.Title'),
      template: `modules/${MODULE_ID}/templates/animation-config.hbs`,
      classes: ['isaf-config'],
      width: 700,
      height: 'auto',
      resizable: true,
      tabs: [{ navSelector: '.tabs', contentSelector: '.tab-content', initial: 'categories' }]
    });
  }

  /** @override */
  getData() {
    const customMappings = this._getCustomMappings();
    const itemOverrides = this._getItemOverrides();

    // Build category rows
    const categoryRows = Object.entries(CATEGORY_ANIMATIONS).map(([key, data]) => ({
      key,
      label: game.i18n.localize(`ISAF.Config.CategoryLabel.${key}`),
      defaultAnimation: data.animation,
      defaultSound: data.sound ?? '',
      customAnimation: customMappings[key]?.animation ?? '',
      customSound: customMappings[key]?.sound ?? '',
      scale: customMappings[key]?.scale ?? data.scale ?? 1.0,
      speed: customMappings[key]?.speed ?? data.speed ?? 800
    }));

    // Build weapon type rows
    const weaponTypeRows = Object.entries(WEAPON_TYPE_ANIMATIONS).map(([key, data]) => ({
      key,
      label: game.i18n.localize(`ISAF.Config.CategoryLabel.${key}`),
      defaultAnimation: data.animation,
      defaultSound: data.sound ?? '',
      customAnimation: customMappings[`type_${key}`]?.animation ?? '',
      customSound: customMappings[`type_${key}`]?.sound ?? '',
      scale: customMappings[`type_${key}`]?.scale ?? data.scale ?? 1.0,
      speed: customMappings[`type_${key}`]?.speed ?? data.speed ?? 800
    }));

    // Build item override rows
    const overrideRows = Object.entries(itemOverrides).map(([itemId, data]) => ({
      itemId,
      itemName: data.itemName ?? itemId,
      animation: data.animation ?? '',
      sound: data.sound ?? '',
      scale: data.scale ?? 1.0,
      speed: data.speed ?? 800
    }));

    return {
      categoryRows,
      weaponTypeRows,
      overrideRows,
      modulePath: getModulePath()
    };
  }

  /** @override */
  async _updateObject(event, formData) {
    const customMappings = {};

    // Process form data — fields are named like "cat_{key}_animation", "cat_{key}_sound", etc.
    for (const [field, value] of Object.entries(formData)) {
      const catMatch = field.match(/^cat_(.+?)_(animation|sound|scale|speed)$/);
      if (catMatch) {
        const [, key, prop] = catMatch;
        if (!customMappings[key]) customMappings[key] = {};
        customMappings[key][prop] = prop === 'scale' || prop === 'speed' ? Number(value) : value;
        continue;
      }

      const typeMatch = field.match(/^type_(.+?)_(animation|sound|scale|speed)$/);
      if (typeMatch) {
        const [, key, prop] = typeMatch;
        const mappingKey = `type_${key}`;
        if (!customMappings[mappingKey]) customMappings[mappingKey] = {};
        customMappings[mappingKey][prop] = prop === 'scale' || prop === 'speed' ? Number(value) : value;
        continue;
      }
    }

    // Remove entries where the custom animation is empty (user cleared the override)
    for (const [key, data] of Object.entries(customMappings)) {
      if (!data.animation) delete customMappings[key];
    }

    await setSetting('customMappings', JSON.stringify(customMappings));

    ui.notifications.info('Animation mappings saved.');
  }

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    // Reset button
    html.find('.isaf-btn-reset').on('click', async (ev) => {
      ev.preventDefault();
      await setSetting('customMappings', '{}');
      await setSetting('itemOverrides', '{}');
      this.render(true);
      ui.notifications.info('Animation mappings reset to defaults.');
    });

    // Test buttons
    html.find('.isaf-btn-test').on('click', (ev) => {
      ev.preventDefault();
      const animationPath = ev.currentTarget.closest('tr')?.querySelector('input[name$="_animation"]')?.value;
      if (animationPath) {
        this._testAnimation(animationPath);
      }
    });

    // Remove override buttons
    html.find('.btn-remove-override').on('click', async (ev) => {
      ev.preventDefault();
      const itemId = ev.currentTarget.dataset.itemId;
      if (itemId) {
        const overrides = this._getItemOverrides();
        delete overrides[itemId];
        await setSetting('itemOverrides', JSON.stringify(overrides));
        this.render(true);
      }
    });

    // File picker buttons
    html.find('.isaf-file-picker-btn').on('click', (ev) => {
      ev.preventDefault();
      const input = ev.currentTarget.previousElementSibling;
      if (!input) return;

      const fp = new FilePicker({
        type: input.dataset.type ?? 'video',
        current: input.value,
        callback: (path) => {
          input.value = path;
          input.dispatchEvent(new Event('change'));
        }
      });
      fp.browse();
    });
  }

  /**
   * Test-play an animation on a controlled token.
   * @param {string} animationPath
   */
  _testAnimation(animationPath) {
    if (typeof Sequence === 'undefined') {
      ui.notifications.error('Sequencer module is required to preview animations.');
      return;
    }

    const token = canvas.tokens.controlled[0];
    if (!token) {
      ui.notifications.warn('Select a token on the canvas to preview the animation.');
      return;
    }

    new Sequence(MODULE_ID)
      .effect()
      .file(animationPath)
      .atLocation(token)
      .scale(1.0)
      .play();
  }

  /**
   * Parse custom mappings from settings.
   * @returns {Object}
   */
  _getCustomMappings() {
    try {
      return JSON.parse(getSetting('customMappings') || '{}');
    } catch {
      return {};
    }
  }

  /**
   * Parse item overrides from settings.
   * @returns {Object}
   */
  _getItemOverrides() {
    try {
      return JSON.parse(getSetting('itemOverrides') || '{}');
    } catch {
      return {};
    }
  }
}
