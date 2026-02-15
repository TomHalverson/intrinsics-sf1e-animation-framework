// ============================================
// Solarian Weapon Animation Script
// ============================================

export default async function solarian(seq, { sourceToken, targetToken, isHit, scale }) {
  const effect = seq.effect()
    .file('jb2a.melee_generic.slash.01.yellow')
    .atLocation(sourceToken)
    .stretchTo(targetToken)
    .scale(scale)
    .zIndex(10);

  if (!isHit) {
    effect.opacity(0.4).randomRotation();
  }
}
