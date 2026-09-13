# FITNESS TRAINER v2.4

Standalone mobile-first React/Vite PWA for Functional Training and Pilates Reformer.

## Exercise data and illustrated media

The external exercise source is **RepDB/exercise-dataset**.

- Repository: https://github.com/RepDB/exercise-dataset
- Runtime JSON: https://exercise-dataset.com/exercises.json
- License: RepDB Free Tier License v1.0
- Attribution: Exercise data by [RepDB](https://repdb.co)

The free dataset provides 512px flat digital exercise illustrations, generally with a start and peak pose. Fitness Trainer alternates those poses to create a lightweight movement preview without using gym photographs or real-person photography.

Media is enabled by default:

```env
VITE_ENABLE_EXERCISE_MEDIA=true
```

## Features

- Large Functional exercise library from RepDB
- Beginner / Intermediate / Advanced filtering
- Equipment, muscle-group and goal filters
- Digital illustrated start/peak exercise previews
- Ready Functional workouts and interval player
- Greek voice search and workout controls
- Favorites and workout history in localStorage
- Pilates Reformer 50-minute program section
- PWA shell for mobile use

## Attribution

Exercise data by [RepDB](https://repdb.co).

## Local run

```bash
npm install
npm run dev
```

## Production build

```bash
npm run build
```
