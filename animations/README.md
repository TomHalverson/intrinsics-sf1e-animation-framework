# Animation Files

Place your `.webm` animation files in the subdirectories here.
Each subdirectory corresponds to a weapon category or type.

## Directory Structure

```
animations/
├── laser/           → Laser weapon animations
│   ├── laser_beam.webm
│   └── laser_fire.ogg
├── plasma/          → Plasma weapon animations
│   ├── plasma_bolt.webm
│   └── plasma_fire.ogg
├── projectile/      → Projectile/ballistic weapon animations
│   ├── bullet.webm
│   ├── heavy_round.webm
│   ├── sniper_round.webm
│   ├── gunshot.ogg
│   ├── pistol_fire.ogg
│   ├── rifle_fire.ogg
│   ├── heavy_fire.ogg
│   └── sniper_fire.ogg
├── flame/           → Flame weapon animations
│   ├── flame_jet.webm
│   └── flame_burst.ogg
├── cryo/            → Cryo weapon animations
│   ├── cryo_beam.webm
│   └── cryo_fire.ogg
├── shock/           → Shock/electric weapon animations
│   ├── shock_arc.webm
│   └── shock_zap.ogg
├── sonic/           → Sonic weapon animations
│   ├── sonic_wave.webm
│   └── sonic_blast.ogg
├── disintegrator/   → Disintegrator weapon animations
│   ├── disintegrate_beam.webm
│   └── disintegrate.ogg
├── disruption/      → Disruption weapon animations
│   ├── disruption_pulse.webm
│   └── disruption.ogg
├── melee/           → Melee weapon animations
│   ├── basic_melee.webm
│   ├── advanced_melee.webm
│   ├── melee_swing.ogg
│   └── melee_heavy.ogg
├── grenade/         → Grenade animations
│   ├── grenade_toss.webm
│   └── grenade_throw.ogg
├── solarian/        → Solarian weapon animations
│   ├── solar_strike.webm
│   └── solar_fire.ogg
└── generic/         → Generic fallback animations
    ├── energy_bolt.webm
    ├── acid_bolt.webm
    └── energy_fire.ogg
```

## Animation Requirements

- **Format**: `.webm` (VP9 codec recommended, with alpha channel for transparency)
- **Orientation**: Horizontal, pointing **left to right** — Sequencer will rotate to match attacker→target direction
- **Resolution**: 800×200 or similar aspect ratio for projectile beams; square for melee/impact effects
- **Duration**: 0.5 – 2.0 seconds recommended
- **Background**: Transparent (alpha channel)

## Sound Requirements

- **Format**: `.ogg` (Vorbis) or `.mp3`
- **Duration**: Match the animation length
- **Normalization**: Keep volume levels consistent across files

## JB2A Fallback

If you have JB2A (Jules & Ben's Animated Assets) installed, the framework will automatically
fall back to JB2A animations when custom animation files are not found. No `.webm` files needed
in that case — just install JB2A and the framework handles the rest.
