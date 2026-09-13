# FITNESS TRAINER v2.3

Standalone mobile-first React/Vite PWA for Functional Training and Pilates Reformer.

## Exercise data and media

The external exercise source is **yuhonas/free-exercise-db**:

- Repository: https://github.com/yuhonas/free-exercise-db
- Runtime JSON: https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/dist/exercises.json
- License: Unlicense / Public Domain

The upstream dataset contains 800+ exercises with level, equipment, primary/secondary muscles, instructions, category and image paths. It provides multiple JPG frames rather than GIF files, so Fitness Trainer cycles the available frames to create a lightweight movement preview.

Media is enabled by default:

```env
VITE_ENABLE_EXERCISE_MEDIA=true
```

## Features

- Large Functional exercise library from free-exercise-db
- Beginner / Intermediate / Advanced filtering
- Equipment, muscle-group and goal filters
- Open-source exercise previews
- Ready Functional workouts and interval player
- Greek voice search and workout controls
- Favorites and workout history in localStorage
- Pilates Reformer 50-minute program section
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
