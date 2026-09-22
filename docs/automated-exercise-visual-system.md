# ATHLETICO TRAINER — AUTOMATED EXERCISE VISUAL SYSTEM

## Camera rules (continued)
- Push-Up: side view showing wrist/shoulder relationship, trunk line and elbow path.
- Plank: side view; do not fabricate movement for an isometric hold.
- Reformer Footwork / Leg Press: strict side profile showing body alignment, footbar contact and carriage travel.
- Use a fixed camera within one exercise. Preserve framing and focal length across START / EXECUTION / RETURN.

## Asset contract
Each supported exercise owns three WebP assets: `start.webp`, `execution.webp`, `return.webp`. Asset paths are additive and keyed by the existing exercise ID. Existing GIF/3D media remains untouched and remains the fallback until all three keyframes exist.

## Motion contract
Default loop: START → EXECUTION → RETURN → EXECUTION → START. Remotion reads the manifest dynamically; it does not encode exercise-specific IDs in the composition.

For isometrics such as Plank, EXECUTION and RETURN represent maintained form/breathing checkpoints rather than invented joint motion.

## Integration
The keyframe layer is optional. Render it only when the manifest contains the existing exercise ID and all assets resolve. Otherwise use the existing GIF → 3D → MotionPreview chain. Do not mutate exercise objects, IDs, filters, search indexes, favorites, history, program timelines or Greek voice handling.

## Quality gates
- Same character identity, body proportions, clothing, studio, lighting and per-exercise camera across all three frames.
- Full relevant kinetic chain visible; no cropped feet/hands when they are biomechanically important.
- Check neutral spine, joint tracking, support contacts and equipment interactions.
- Reformer: verify carriage/rail alignment, footbar, shoulder rests, headrest, spring-side geometry and visible carriage displacement.
- Reject frames with anatomy artifacts, duplicated limbs, impossible contacts, inconsistent equipment or changed character identity.

## Pilot scope
Only the five requested real repository targets are included. No full-library generation is performed.
