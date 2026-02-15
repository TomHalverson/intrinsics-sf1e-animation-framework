# Animation Scripts

Animations are **JavaScript files** (not video files). Each script exports a default
async function that receives a Sequencer `Sequence` and an animation context object.

## How It Works

1. When an attack is made, the framework resolves the weapon category/type
2. It looks up the matching `.js` script in this folder
3. The script builds a Sequencer animation (effects, sounds, etc.)
4. The framework plays the sequence

**Macro Overrides**: Any category or individual weapon can be overridden with a
Foundry macro via the config UI or right-click menu. Macros receive the same
context variables.

## Script Format

Each script must export a default async function:

```js
// animations/laser/laser.js
export default async function laser(seq, context) {
  // seq     — a Sequencer Sequence instance (add effects/sounds to it)
  // context — { sourceToken, targetToken, isHit, scale, speed, attackMode,
  //             weaponInfo, soundVolume, soundEnabled }

  const effect = seq.effect()
    .file('jb2a.laser_beam.01.red')
    .atLocation(context.sourceToken)
    .stretchTo(context.targetToken)
    .scale(context.scale)
    .speed(context.speed)
    .zIndex(10);

  if (!context.isHit) {
    effect.opacity(0.5).missed();
  }

  // Optionally add sound
  if (context.soundEnabled) {
    seq.sound()
      .file('modules/intrinsics-sf1e-animation-framework/animations/laser/laser_fire.ogg')
      .volume(context.soundVolume);
  }
}
```

The framework creates the `Sequence` and calls `.play()` after your function returns.
You just need to add effects and sounds to the sequence.

## Context Object

| Property       | Type    | Description                                      |
|----------------|---------|--------------------------------------------------|
| `sourceToken`  | Token   | The attacking token on the canvas                |
| `targetToken`  | Token   | The target token on the canvas                   |
| `isHit`        | boolean | Whether the attack roll hit                      |
| `scale`        | number  | Final scale (includes global multiplier)         |
| `speed`        | number  | Final speed in ms (includes global multiplier)   |
| `attackMode`   | string  | `'melee'` or `'ranged'`                          |
| `weaponInfo`   | object  | Full weapon metadata (category, type, damage, etc.) |
| `soundVolume`  | number  | 0.0 to 1.0                                       |
| `soundEnabled` | boolean | Whether the user has sounds enabled              |

## Macro Override Format

When creating a Foundry macro to override an animation, the macro receives
the same context variables as scope:

```js
// Example Foundry Macro
const seq = new Sequence('intrinsics-sf1e-animation-framework');
seq.effect()
  .file('jb2a.fire_bolt.orange')
  .atLocation(sourceToken)
  .stretchTo(targetToken)
  .scale(scale)
  .speed(speed);

if (soundEnabled) {
  seq.sound()
    .file('path/to/custom_sound.ogg')
    .volume(soundVolume);
}

await seq.play();
```

## Directory Structure

```
animations/
├── laser/           → Laser weapon animations
│   └── laser.js
├── plasma/          → Plasma weapon animations
│   └── plasma.js
├── projectile/      → Projectile/ballistic weapon animations
│   ├── projectile.js
│   ├── small_arms.js
│   ├── longarms.js
│   ├── heavy.js
│   └── sniper.js
├── flame/           → Flame weapon animations
│   └── flame.js
├── cryo/            → Cryo weapon animations
│   └── cryo.js
├── shock/           → Shock/electric weapon animations
│   └── shock.js
├── sonic/           → Sonic weapon animations
│   └── sonic.js
├── disintegrator/   → Disintegrator weapon animations
│   └── disintegrator.js
├── disruption/      → Disruption weapon animations
│   └── disruption.js
├── melee/           → Melee weapon animations
│   ├── basic_melee.js
│   └── advanced_melee.js
├── grenade/         → Grenade animations
│   └── grenade.js
├── solarian/        → Solarian weapon animations
│   └── solarian.js
└── generic/         → Generic fallback animations
    └── generic.js
```

## JB2A Fallback

The default scripts use JB2A (Jules & Ben's Animated Assets) database paths.
If you have JB2A installed, the animations will work out of the box.
If not, the framework falls back to built-in JB2A path lookups.

You can replace any script with your own effects — use `.webm` files,
custom Sequencer database paths, or any other Sequencer-compatible source.
