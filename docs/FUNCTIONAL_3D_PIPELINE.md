# Athletico Functional 3D Animation Pipeline

Goal: one consistent Athletico humanoid rig with a distinct, anatomically correct motion clip for every curated Functional exercise.

## Rules

- Never reuse a motion merely because the exercise name is similar.
- Preserve the canonical exercise IDs in `src/data.js`.
- Existing verified OpenGym3D GLBs remain valid source clips.
- New clips must be reviewed for movement identity, start/end pose, joint continuity, looping, equipment path and foot contact before being mapped.
- A missing or rejected clip must fall back to MotionPreview; never ship a wrong movement.
- Generated clips are stored/mapped separately from canonical exercise metadata.

## Production path

1. Reference motion: record or obtain a legally usable short reference video showing one full exercise repetition from a clear angle.
2. Motion extraction: convert the reference to skeletal motion/BVH with a video-to-motion pipeline.
3. Retarget: transfer the motion to the single Athletico humanoid rig.
4. Equipment: attach the correct dumbbell, kettlebell, barbell, band, cable handle, bench/step or other prop to the appropriate joint(s), with world-space constraints where required.
5. Clean-up: remove foot sliding, joint flips, penetrations and discontinuities; trim to a clean repetition and create a seamless loop.
6. Export: animated GLB, one clip per exercise.
7. Validate: GLB v2, skinned mesh, animation clip present, finite bounds, loadable in Exercise3DViewer.
8. Register: map only after visual review.

## Batch manifest

The generation queue is produced by `scripts/build-functional-animation-queue.mjs`. Existing verified OpenGym3D IDs are marked `existing-3d`; every other exercise is marked `needs-motion`.

This queue is deliberately separate from `src/data.js`, so animation production cannot corrupt search, Greek voice search, programs, favorites or history.
