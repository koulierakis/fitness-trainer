# Athletico Image Engine v1

## Objective
Build an independent exercise-image generation service. Do not depend on Perchance or scrape proprietary generators.

## Production contract
Input: exercise_id, exercise_name, phase (start|execution|return), biomechanical_description, character_reference, seed.
Output: WebP plus model/seed/conditioning/QC provenance.

## Pipeline
Exercise spec -> deterministic pose/control -> fixed Athletico character conditioning -> open-weight image model -> WebP -> automatic QC -> visual/biomechanical review.

## Non-negotiable gates
- Same approved Athletico character across all phases.
- Pose control is required for production; text-only generation is exploratory only.
- START/EXECUTION/RETURN must be mechanically coherent.
- RepDB images are forbidden as generative conditioning.
- No secret/API key may be committed.
- Every production image records model ID/version, seed, prompt/spec hash, pose/control reference, character reference method and generation time.
- Reject corrupt files, wrong dimensions, missing provenance, extra/missing limbs, malformed hands/feet, bad equipment contact, pose divergence and unsafe biomechanics.

## First acceptance test
Exercise: right-arm kettlebell windmill.
Generate exactly three full-body frames: START, EXECUTION, RETURN.
Do not scale to the full library until this exercise passes identity, pose, anatomy and biomechanics QC.

## Backend interface
POST /api/image-engine/generate
JSON:
{
  "exercise_id": "local:kettlebell_windmill",
  "exercise_name": "Kettlebell Windmill",
  "phase": "start",
  "biomechanical_description": "...",
  "character_reference": "...",
  "seed": 12345
}

The implementation should expose the generation backend behind an adapter so the base model can be replaced without changing the exercise manifest or application UI.

## Model selection rule
Before locking a base model, verify its current license permits the intended Athletico use and verify compatible pose and identity conditioning. Do not hard-code unverified model identifiers.
