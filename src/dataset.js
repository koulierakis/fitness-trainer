export const DATASET_URL = 'https://oss.exercisedb.dev/api/v1/exercises';
export const DATASET_REPO = 'https://oss.exercisedb.dev/docs';
export const DATASET_LICENSE = 'ExerciseDB V1 free hosted API';
export const DATASET_ATTRIBUTION = 'ExerciseDB V1 by AscendAPI';

// Athletico Functional taxonomy: equipment-first, then level and muscle group.
// Stretching is intentionally a standalone category; Flexibility remains a program goal.
const equipmentMap = {
  'body weight':'Bodyweight', dumbbell:'Dumbbells', barbell:'Barbell', kettlebell:'Kettlebell',
  rope:'Battle Ropes', 'battle rope':'Battle Ropes', 'suspension':'TRX', 'suspension trainer':'TRX', trx:'TRX'
};
const groupMap = {
  back:'Πλάτη', chest:'Στήθος', shoulders:'Χέρια', 'upper arms':'Χέρια', 'lower arms':'Χέρια',
  'upper legs':'Πόδια', 'lower legs':'Πόδια', waist:'Κοιλιακοί', cardio:'Κοιλιακοί'
};
const muscleGroupMap = {
  abs:'Κοιλιακοί', spine:'Ραχιαίοι', erector_spinae:'Ραχιαίοι', 'erector spinae':'Ραχιαίοι',
  lats:'Πλάτη', traps:'Πλάτη', pectorals:'Στήθος', delts:'Χέρια', biceps:'Χέρια', triceps:'Χέρια', forearms:'Χέρια',
  quads:'Πόδια', quadriceps:'Πόδια', hamstrings:'Πόδια', calves:'Πόδια', glutes:'Πόδια'
};
const titleCase = value => String(value || '').replace(/_/g,' ').replace(/\b\w/g,m=>m.toUpperCase());
const first = value => Array.isArray(value) && value.length ? value[0] : '';
const norm = value => String(value||'').toLowerCase().replace(/[_-]/g,' ');
const advancedTerms=['clean','snatch','jerk','thruster','burpee','turkish get up','muscle up','pistol','handstand','plyometric','jump squat','push press','overhead squat','renegade','complex'];
const stretchingTerms=['stretch','stretching','flexor stretch','extension stretch'];
const isAdvanced = item => advancedTerms.some(term=>norm(item.name).includes(term));
const isStretch = item => stretchingTerms.some(term=>norm(item.name).includes(term));

export function toFitnessExercise(item, mediaEnabled=true){
  const bodyPart=first(item.bodyParts);
  const target=first(item.targetMuscles);
  const equipmentRaw=first(item.equipments)||'body weight';
  const instructions=Array.isArray(item.instructions)?item.instructions:[];
  const secondary=Array.isArray(item.secondaryMuscles)?item.secondaryMuscles:[];
  const stretching=isStretch(item);
  const group=stretching?'Stretching':(muscleGroupMap[target]||groupMap[bodyPart]||'Πλάτη');
  const equipment=equipmentMap[norm(equipmentRaw)]||titleCase(equipmentRaw);
  const gifUrl=item.gifUrl||'';
  const level=isAdvanced(item)?'Advanced':'Beginner';

  return {
    id:`ascend:${item.exerciseId}`, datasetId:item.exerciseId, source:'ascend-exercisedb-v1',
    name:item.name||titleCase(item.exerciseId), gr:item.name||titleCase(item.exerciseId),
    group, sourceBodyPart:bodyPart||'', equipment, sourceEquipment:equipmentRaw,
    level, goal:stretching?'Stretching':'Strength', target:target||bodyPart||'',
    muscleGroup:(item.targetMuscles||[]).join(', '), secondary,
    instructions:instructions.join(' '), instructionSteps:instructions,
    cues:instructions.slice(0,3), cue:first(instructions)||'', mistakes:[],
    regression:'Μείωσε φορτίο, εύρος κίνησης ή πολυπλοκότητα.',
    progression:'Αύξησε φορτίο ή πολυπλοκότητα μόνο με άριστη τεχνική.',
    reps:stretching?'20–40s':'8–12 επαναλήψεις', rest:stretching?15:30,
    safety:'Η επίδειξη είναι οπτική αναφορά. Η επιλογή και προσαρμογή της άσκησης γίνεται από τον γυμναστή.',
    attribution:DATASET_ATTRIBUTION,
    media:{
      id:item.exerciseId, type:'animated-gif', enabled:mediaEnabled,
      imageUrls:gifUrl?[gifUrl]:[], imageUrl:gifUrl, sourcePath:gifUrl,
      badge:'GIF DEMO', label:'ANIMATED EXERCISE DEMO', credit:'ExerciseDB V1 · AscendAPI'
    }
  };
}

async function fetchDatasetPage({signal,after=null,limit=100}={}){
  const url=new URL(DATASET_URL);
  url.searchParams.set('limit',String(limit));
  if(after)url.searchParams.set('after',after);
  const response=await fetch(url.toString(),{signal,cache:'no-store'});
  if(!response.ok)throw new Error(`ExerciseDB HTTP ${response.status}`);
  const payload=await response.json();
  const items=Array.isArray(payload?.data)?payload.data:[];
  if(!items.length)throw new Error('ExerciseDB V1 response is invalid or empty');
  return {items,meta:payload?.meta||{}};
}

export async function loadDatasetExercises({signal}={}){
  const all=[];
  const seen=new Set();
  let after=null;
  let hasNext=true;
  let guard=0;
  while(hasNext&&guard<100){
    const {items,meta}=await fetchDatasetPage({signal,after,limit:100});
    for(const item of items){
      if(item?.exerciseId&&!seen.has(item.exerciseId)){
        seen.add(item.exerciseId);
        all.push(item);
      }
    }
    hasNext=Boolean(meta.hasNextPage&&meta.nextCursor);
    after=hasNext?meta.nextCursor:null;
    guard+=1;
  }
  if(!all.length)throw new Error('ExerciseDB V1 catalog is empty');
  const mediaEnabled=import.meta.env.VITE_ENABLE_EXERCISE_MEDIA!=='false';
  return all.map(item=>toFitnessExercise(item,mediaEnabled));
}
