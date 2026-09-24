# Runware Pilot QC Gate

This gate applies to the controlled Athletico pilot only: 10 exercises × 3 frames = 30 outputs.

## Production prerequisites

- Exactly 10 selected stable exercise IDs and exactly 30 frame tasks.
- Every frame has a deterministic control map or an approved pose source.
- RepDB or any other prohibited source is never used for conditioning.
- One approved Athletico master-character reference or compatible character LoRA is used consistently.
- Base model, ControlNet and IP-Adapter/LoRA AIR IDs are explicitly selected and compatibility-validated.
- RUNWARE_API_KEY is supplied only as an environment secret.
- A hard `--max-cost-usd` ceiling is set before paid generation.

## Automatic frame gate

Each output must:
- decode successfully as WEBP;
- match the requested dimensions;
- have non-zero file size;
- have provenance metadata (exercise ID, phase, model, seed/task UUID, control ID, character mode, cost, generation time);
- map to exactly one START, EXECUTION or RETURN asset path.

## Visual/biomechanical gate

Reject a frame for any of:
- extra/missing/fused limbs or impossible joints;
- incorrect hand, foot or joint contact;
- incorrect equipment, grip, strap, bar, kettlebell, dumbbell or TRX geometry;
- pose materially diverging from its control;
- biomechanically unsafe or exercise-inaccurate position;
- cropped body/equipment needed to understand the exercise;
- character identity/outfit/environment inconsistency;
- text, logo or watermark artifacts.

A 3-frame exercise is accepted only when all three frames pass. Static/isometric exercises may intentionally repeat the same mechanically correct pose.

## Pilot acceptance

Do not scale beyond the pilot merely because generation succeeded. Produce a 10-row contact sheet (START | EXECUTION | RETURN) and record PASS/FAIL per frame plus rejection reason. Scaling is allowed only after the pilot is reviewed as a set and failed frames are regenerated or explicitly excluded.
