# Functional library completion scope

Functional is the current priority. Reformer work is intentionally paused until the Functional catalogue is complete.

## Source of truth
- Remote ExerciseDB V1 catalogue is loaded page-by-page at runtime.
- Every imported remote exercise is admitted only when it has an animated GIF URL.
- The local 60-exercise catalogue remains as a curated compatibility layer for existing 60-minute programs.
- Duplicate names are merged/de-duplicated in the application.

## Functional taxonomy
- Levels: Beginner / Intermediate / Advanced.
- Muscle/body groups are normalized to the Greek application taxonomy.
- Equipment remains metadata/filtering; it does not create duplicate exercises.

## Media policy
- Prefer the source animated GIF for every remote exercise.
- Never invent or guess media URLs.
- Existing verified GLB media may be used when available.
- Generic MotionPreview is a graceful fallback only when a curated local exercise has no verified source animation.

## QA
- Production build.
- Existing 3D asset verification.
- 60-minute program validation.
- GIF taxonomy checks, including Intermediate classification.

## Remaining acceptance check
The branch is ready for merge only after GitHub Actions passes. Runtime catalogue size depends on the current upstream ExerciseDB response and is displayed by the app rather than hard-coded.
