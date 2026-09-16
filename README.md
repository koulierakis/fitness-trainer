# ATHLETICO FITNESS TRAINER

Private mobile-first React/Vite PWA for Functional Training and Pilates Reformer.

## Functional exercise media

Functional exercises use animated GIF demonstrations from the configured ExerciseDB V1 feed. GIFs loop automatically so the trainer can see the movement without opening a video player.

Media is enabled by default:

```env
VITE_ENABLE_EXERCISE_MEDIA=true
```

## Athletico taxonomy

- Levels: Beginner / Advanced
- Core equipment: Bodyweight, Dumbbells, Barbell, Kettlebell, TRX, Battle Ropes
- Muscle groups: Χέρια, Στήθος, Πλάτη, Πόδια, Κοιλιακοί, Ραχιαίοι
- Stretching is a standalone exercise category
- Flexibility and Mobility remain distinct training goals

## 60-minute programs

Ready sessions are exactly 60:00 and are available for Beginner and Advanced. Current program families: Full Body, Strength, Conditioning, Mobility, Flexibility and Stretching.

## Features

- Animated GIF exercise demonstrations
- Functional exercise library with equipment and muscle-group metadata
- Beginner / Advanced classification
- Ready 60-minute Functional sessions
- Interval workout player
- Greek voice search and workout controls
- Favorites and workout history in localStorage
- Pilates Reformer section
- PWA shell for mobile use

## Local run

```bash
npm install
npm run dev
```

## Production build

```bash
npm run build
```
