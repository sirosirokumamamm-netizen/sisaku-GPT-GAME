# Boss majesty — 2026-10-22

This update supersedes the demon's shared royal teleport from `blade-evolution.md`. Save IDs and inventory formats are unchanged.

## Player readability and effects

- Manual skills retain a dark contour, colored blade and bright core above ordinary combat effects. Strong warning outlines, refuges and the player contour still receive the final gameplay priority.
- Brief skill names appear beside the actor. Existing anticipation, release timing, range snapshots and growth-screen gates remain intact.
- Added separate blade, flame, ice, lightning, wind, earth, dark, light and blood blooms, plus curved hellfire, flying fragments, demon dash wakes and a persistent royal aura. The full-arena blast avoids drawing fire inside its refuge.
- The major-attack announcement is a single compact HUD panel; it does not stack a banner, cut-in and generic danger panel over the field.

## Boss styles and balance

- Demon: physical, continuous straight dashes; no ordinary celestial teleport. First form uses black falling stars, arena-length flame pillars and a dark sweeping blade. Second form uses committed damaging charges, individually telegraphed follow-up charges, two broad sword sweeps and a sword scar extending to the arena edge.
- Infernal Dominion covers every arena corner outside a reachable refuge. It has a 3.15-second tell and a 120-unit refuge. It deals 92 base damage (124 after the demon multiplier), and does not cancel a player skill already charging. Ordinary damaging charge: 64 base (86 scaled), with swept collision and at most one hit per charge.
- Demon HP 5500 → 6500; base attack 42 → 50; second-form assault/exposure rhythm 8/5 → 10/3.8 seconds. The established 75% phase recovery and over-cap potion remain. The boss retains clear windows for counterattacks.
- Tidal boss casts water bursts, arena-length currents and a vortex; it no longer uses the shared leap pattern. The ancient sentinel uses two crystal beam axes and heavy repositioning. Beast retains its mobile charge/leap style; dragon keeps flight and fire. God retains celestial teleport and full-arena judgment; Shadow King retains shadow passages, doubles and remembered footprints.
- Refuges sample the expanded arena near the player, including the far right. Their center is reachable, and their radius stays within the arena whenever a valid candidate exists.

## Sound

- 47 original synthesized profiles: individual skills, three charging timbres, material/weakness/kill impacts, boss roars/attacks and three ultimates.
- Each profile layers two pitched oscillators with filtered noise and an envelope. Noise is cached per audio context. Music/effect settings and browser gesture requirements remain supported.
- At most 36 active synthesis voices; normal events reserve headroom for boss sounds. Same-timbre impact throttling and the existing compressor prevent an uncontrolled pileup.

## Verification

- `tests/boss-majesty.cjs`: 35 rules for continuous rush movement, actual single-hit damage, just dodge, cleanup, exposed windows, recurring attacks in both forms, full-arena coverage/refuge safety, boss identities and player contrast. Portrait/landscape renders have no runtime errors.
- Offline Web Audio renders all 47 profiles: distinct non-silent signals, finite samples, peak amplitude 0.078 without the game compressor. Real AudioContext voice budget, mute and zero effect volume also verified.
- Startup, combat-evolution, sovereign-depth and native two-finger signature tests passed. Seven complete stage journeys cover all 35 rooms and bosses. A separate first-stage run without timed dodges still clears.
- `majesty-boss-performance.json` explicitly forces and samples a real full-arena destruction effect. DPR 2, 844×390: CPU p95 3.5 ms, frame p95 33.4 ms, max 163 effects. `majesty-skills-performance.json` covers player signatures with 24/30 enemies. These isolated cloud Chromium samples are not physical-phone measurements.
- `index.html` is regenerated with `scripts/build.cjs`. `swordsman-game.zip` is untouched.
