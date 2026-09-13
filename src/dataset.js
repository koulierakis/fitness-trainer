export const DATASET_URL = 'https://exercise-dataset.com/exercises.json';
export const DATASET_REPO = 'https://github.com/RepDB/exercise-dataset';
export const DATASET_MEDIA_ROOT = 'https://exercise-dataset.com/';
export const DATASET_LICENSE = 'RepDB Free Tier License v1.0';
export const DATASET_ATTRIBUTION = 'Exercise data by RepDB (repdb.co)';

const levelMap = { beginner: 'Beginner', intermediate: 'Intermediate', advanced: 'Advanced' };
const equipmentMap = {
  dumbbell:'Αλτήρες', barbell:'Μπάρα', kettlebell:'Kettlebell', cable:'Τροχαλία',
  resistance_band:'Λάστιχα', loop_band:'Λάστιχα', suspension_trainer:'TRX', battle_rope:'Battle Ropes',
  pull_up_bar:'Μονόζυγο', flat_bench:'Πάγκος', plyo_box:'Plyo Box', stability_ball:'Stability Ball',
  smith_machine:'Smith Machine', leg_press:'Leg Press', leg_extension:'Leg Extension', leg_curl:'Leg Curl',
  rower:'Κωπηλατικό', treadmill:'Διάδρομος', stationary_bike:'Ποδήλατο', stair_climber:'Stair Climber',
  jump_rope:'Σχοινάκι', plates:'Δίσκος', rings:'Κρίκοι', sled:'Έλκηθρο', slam_ball:'Slam Ball'
};
const groupMap = {
  chest:'Στήθος', back:'Πλάτη', shoulders:'Ώμοι', upper_arms:'Χέρια', lower_arms:'Χέρια',
  upper_legs:'Πόδια', lower_legs:'Πόδια', core:'Κορμός', full_body:'Full Body'
};
const muscleGroupMap = {
  abs:'Κορμός', obliques:'Κορμός', lower_back:'Πλάτη', lats:'Πλάτη', traps:'Πλάτη', rhomboids:'Πλάτη',
  chest:'Στήθος', pectorals:'Στήθος', deltoids:'Ώμοι', shoulders:'Ώμοι', biceps:'Χέρια', triceps:'Χέρια', forearms:'Χέρια',
  quadriceps:'Πόδια', hamstrings:'Πόδια', calves:'Πόδια', adductors:'Πόδια', abductors:'Πόδια', glutes:'Γλουτοί', hip_flexors:'Πόδια'
};
const goalMap = { strength:'Strength', hypertrophy:'Strength', endurance:'Endurance', mobility:'Mobility', flexibility:'Mobility', conditioning:'Conditioning', power:'Power', balance:'Balance' };
const titleCase = value => String(value || '').replace(/_/g,' ').replace(/\b\w/g, m => m.toUpperCase());
const first = value => Array.isArray(value) && value.length ? value[0] : '';
const absUrl = path => path ? `${DATASET_MEDIA_ROOT}${String(path).replace(/^\//,'')}` : '';

export function toFitnessExercise(item, mediaEnabled=true){
  const primary=item.primary_muscles||[], secondary=item.secondary_muscles||[], primaryMuscle=first(primary);
  const flat=item.images?.flat||{};
  const frames=[flat.start,flat.peak,flat.main].filter(Boolean).map(absUrl);
  const uniqueFrames=[...new Set(frames)];
  const equipment=item.is_bodyweight ? 'Bodyweight' : (equipmentMap[item.equipment]||titleCase(item.equipment||'Bodyweight'));
  const goal=goalMap[first(item.goals)]||titleCase(first(item.goals)||item.category||'Strength');
  const instructions=Array.isArray(item.instructions_en)?item.instructions_en:[];
  const tips=Array.isArray(item.tips_en)?item.tips_en:[];
  const sourceGroup=groupMap[item.body_part]||muscleGroupMap[primaryMuscle]||titleCase(item.body_part||primaryMuscle||'Full Body');
  return {
    id:`repdb:${item.id}`, datasetId:item.id, source:'repdb',
    name:item.name_en||titleCase(item.id), gr:item.name_en||titleCase(item.id),
    group:sourceGroup, sourceBodyPart:item.body_part||'',
    equipment, sourceEquipment:item.equipment||'',
    level:levelMap[item.difficulty]||titleCase(item.difficulty||'Intermediate'),
    goal, target:primaryMuscle||item.body_part||'', muscleGroup:primary.join(', '), secondary,
    instructions:instructions.join(' '), instructionSteps:instructions,
    cues:tips.length?tips.slice(0,3):instructions.slice(0,3), cue:first(tips)||first(instructions)||'',
    mistakes:[], regression:'Δεν παρέχεται από το source dataset.', progression:'Δεν παρέχεται από το source dataset.',
    reps:'—', rest:30,
    safety:'Exercise metadata and illustrations by RepDB. Validate technique and individual suitability before coaching use.',
    attribution:DATASET_ATTRIBUTION,
    media:{
      id:item.id, type:'remote-image-sequence', enabled:mediaEnabled, imageUrls:uniqueFrames,
      imageUrl:uniqueFrames[0]||'', sourcePath:flat.start||flat.main||'',
      badge:'REPDB', label:'DIGITAL EXERCISE MODEL', credit:'Exercise data by RepDB (repdb.co)'
    }
  };
}

export async function loadDatasetExercises({signal}={}){
  const response=await fetch(DATASET_URL,{signal,cache:'force-cache'});
  if(!response.ok)throw new Error(`Dataset HTTP ${response.status}`);
  const data=await response.json();
  if(!data || !Array.isArray(data.exercises))throw new Error('RepDB dataset response is invalid');
  const mediaEnabled=import.meta.env.VITE_ENABLE_EXERCISE_MEDIA!=='false';
  return data.exercises.map(item=>toFitnessExercise(item,mediaEnabled));
}
