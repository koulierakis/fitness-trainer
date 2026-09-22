# Athletico zero-cost local image backend

This backend uses **local/self-hosted ComfyUI**. It has no per-image API fee and
does not call ComfyUI paid Partner/API nodes. Compute is supplied by the machine
running ComfyUI.

## Safety contract

- RepDB is forbidden as conditioning.
- Every biomechanics-critical frame receives the deterministic pose control map
  produced by `pose_control.py`.
- Character identity comes from `ATHLETICO_MASTER_CHARACTER_V1.png`.
- Existing QC, resume, provenance and failure queue remain authoritative.
- Runware remains an optional fallback only.

## Required local workflow

Export a working ComfyUI graph in **API format** to:

`src/visuals/comfyui-athletico-workflow.json`

The graph must contain exactly one node with each of these titles:

- `ATHLETICO_PROMPT` — text input node with a `text` field.
- `ATHLETICO_CHARACTER` — LoadImage node for IP-Adapter/reference conditioning.
- `ATHLETICO_POSE` — LoadImage node feeding OpenPose ControlNet.
- `ATHLETICO_SEED` — sampler node exposing a `seed` field.

The workflow itself owns the exact open model/checkpoint, IP-Adapter and
OpenPose ControlNet selection. This deliberately avoids silently inventing model
filenames that may not be installed or architecture-compatible.

## Dry run

`python run_generator.py --backend comfyui --dry-run`

## Pilot

Only after the dry run has zero blockers:

`python run_generator.py --backend comfyui --resume`

The controlled pilot remains exactly 10 exercises × 3 frames = 30 images.
