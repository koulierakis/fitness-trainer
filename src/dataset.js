export const DATASET_URL = 'https://oss.exercisedb.dev/api/v1/exercises';
export const DATASET_REPO = 'https://oss.exercisedb.dev/docs';
export const DATASET_LICENSE = 'ExerciseDB V1 free hosted API';
export const DATASET_ATTRIBUTION = 'ExerciseDB V1 by AscendAPI';

const equipmentMap = {
  'body weight':'Bodyweight', dumbbell:'Αλτήρες', barbell:'Μπάρα', kettlebell:'Kettlebell', cable:'Τροχαλία',
  band:'Λάστιχα', 'resistance band':'Λάστιχα', assisted:'Assisted', leverage:'Machine',
  'smith machine':'Smith Machine', 'stability ball':'Stability Ball', 'bosu ball':'BOSU',
  rope:'Σχοινί', 'weighted':'Βάρος', 'medicine ball':'Medicine Ball', 'ez barbell':'EZ Bar'
};
const groupMap = {
  back:'Πλάτη', chest:'Στήθος', shoulders:'Ώμοι', 'upper arms':'Χέρια', 'lower arms':'Χέρια',
  'upper legs':'Πόδια', 'lower legs':'Πόδια', waist:'Κορμός', cardio:'Full Body', neck:'Αυχένας'
};
const muscleGroupMap = {
  abs:'Κορμός', spine:'Πλάτη', lats:'Πλάτη', traps:'Πλάτη', pectorals:'Στήθος',
  delts:'Ώμοι', biceps:'Χέρια', triceps:'Χέρια', forearms:'Χέρια',
  quads:'Πόδια', quadriceps:'Πόδια', hamstrings:'Πόδια', calves:'Πόδια', glutes:'Γλουτοί',
  'cardiovascular system':'Full Body'
};
const titleCase = value => String(value || '').replace(/_/g,' ').replace(/\b\w/g,m=>m.toUpperCase());
const first = value => Array.isArray(value) && value.length ? value[0] : '';

export function toFitnessExercise(item, mediaEnabled=true){
  const bodyPart=first(item.bodyParts);
  const target=first(item.targetMuscles);
  const equipmentRaw=first(item.equipments)||'body weight';
  const instructions=Array.isArray(item.instructions)?item.instructions:[];
  const secondary=Array.isArray(item.secondaryMuscles)?item.secondaryMuscles:[];
  const group=groupMap[bodyPart]||muscleGroupMap[target]||titleCase(bodyPart||target||'Full Body');
  const equipment=equipmentMap[equipmentRaw]||titleCase(equipmentRaw);
  const gifUrl=item.gifUrl||'';

  return {
    id:`ascend:${item.exerciseId}`, datasetId:item.exerciseId, source:'ascend-exercisedb-v1',
    name:item.name||titleCase(item.exerciseId), gr:item.name||titleCase(item.exerciseId),
    group, sourceBodyPart:bodyPart||'', equipment, sourceEquipment:equipmentRaw,
    level:'Intermediate', goal:'Strength', target:target||bodyPart||'',
    muscleGroup:(item.targetMuscles||[]).join(', '), secondary,
    instructions:instructions.join(' '), instructionSteps:instructions,
    cues:instructions.slice(0,3), cue:first(instructions)||'', mistakes:[],
    regression:'Δεν παρέχεται από το free API.', progression:'Δεν παρέχεται από το free API.',
    reps:'—', rest:30,
    safety:'Animated exercise reference from ExerciseDB V1. Validate technique and individual suitability before coaching use.',
    attribution:DATASET_ATTRIBUTION,
    media:{
      id:item.exerciseId,
      type:'remote-image-sequence',
      enabled:mediaEnabled,
      imageUrls:gifUrl?[gifUrl]:[],
      imageUrl:gifUrl,
      sourcePath:gifUrl,
      badge:'EXERCISEDB',
      label:'ANIMATED EXERCISE DEMO',
      credit:'ExerciseDB V1 · AscendAPI'
    }
  };
}

export async function loadDatasetExercises({signal}={}){
  const response=await fetch(DATASET_URL,{signal,cache:'no-store'});
  if(!response.ok)throw new Error(`ExerciseDB HTTP ${response.status}`);
  const payload=await response.json();
  const items=Array.isArray(payload?.data)?payload.data:[];
  if(!items.length)throw new Error('ExerciseDB V1 response is invalid or empty');
  const mediaEnabled=import.meta.env.VITE_ENABLE_EXERCISE_MEDIA!=='false';
  return items.map(item=>toFitnessExercise(item,mediaEnabled));
}
