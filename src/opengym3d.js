export const OPENGYM3D_BASE='https://assiamahs.github.io/opengym3d';
export const OPENGYM3D_MANIFEST=`${OPENGYM3D_BASE}/exercises.json`;

const greekNames={
  back_squat:'Back Squat με μπάρα',
  bent_over_row:'Κωπηλατική σκυφτός με μπάρα',
  bicep_curl:'Κάμψεις δικεφάλων',
  bicycle_crunch:'Bicycle Crunch',
  burpee:'Burpee',
  calf_raise:'Άρσεις γαστροκνημίων',
  clean_and_jerk:'Clean & Jerk',
  crunch:'Ροκανίσματα',
  deadlift:'Deadlift',
  dumbbell_shoulder_press:'Πιέσεις ώμων με αλτήρες',
  front_raise:'Μπροστινές άρσεις ώμων',
  glute_bridge:'Γέφυρα γλουτών',
  good_morning:'Good Morning',
  hammer_curl:'Hammer Curl',
  high_knees:'High Knees',
  jump_push_up:'Εκρηκτικές κάμψεις',
  jumping_jack:'Jumping Jacks',
  kettlebell_swing:'Kettlebell Swing',
  lateral_raise:'Πλάγιες άρσεις ώμων',
  lunge:'Προβολές',
  overhead_press:'Overhead Press',
  overhead_squat:'Overhead Squat',
  overhead_tricep_extension:'Εκτάσεις τρικεφάλων πάνω από το κεφάλι',
  pistol_squat:'Pistol Squat',
  plank:'Σανίδα',
  push_up:'Κάμψεις',
  reverse_lunge:'Προβολές πίσω',
  romanian_deadlift:'Romanian Deadlift',
  situp:'Sit-Up',
  snatch:'Snatch',
  squat:'Καθίσματα',
  sumo_high_pull:'Sumo Deadlift High Pull',
  sumo_squat:'Sumo Squat',
  superman:'Superman',
  wall_sit:'Wall Sit'
};

const equipmentById={
  back_squat:'Barbell',bent_over_row:'Barbell',clean_and_jerk:'Barbell',deadlift:'Barbell',good_morning:'Barbell',
  overhead_press:'Barbell',overhead_squat:'Barbell',romanian_deadlift:'Barbell',snatch:'Barbell',sumo_high_pull:'Barbell',
  dumbbell_shoulder_press:'Dumbbells',bicep_curl:'Dumbbells',front_raise:'Dumbbells',hammer_curl:'Dumbbells',lateral_raise:'Dumbbells',overhead_tricep_extension:'Dumbbells',
  kettlebell_swing:'Kettlebell'
};

const equipmentMap={None:'Bodyweight','Body Weight':'Bodyweight',Bodyweight:'Bodyweight',Dumbbell:'Dumbbells',Dumbbells:'Dumbbells',Barbell:'Barbell',Kettlebell:'Kettlebell',Cable:'Cables',Rope:'Ropes',Band:'Resistance Bands'};

const muscleToGroup=value=>{
  const s=String(value||'').toLowerCase();
  if(/chest|pectoral/.test(s))return 'Στήθος';
  if(/bicep|tricep|forearm|arm/.test(s))return 'Χέρια';
  if(/shoulder|deltoid/.test(s))return 'Ώμοι';
  if(/quad|hamstring|calf|leg/.test(s))return 'Πόδια';
  if(/glute/.test(s))return 'Γλουτοί';
  if(/lat|back|trap|rhomboid/.test(s))return 'Πλάτη';
  if(/core|ab|oblique/.test(s))return 'Κορμός';
  return 'Full Body';
};

const compoundIds=new Set(['back_squat','bent_over_row','burpee','clean_and_jerk','deadlift','dumbbell_shoulder_press','good_morning','jump_push_up','kettlebell_swing','lunge','overhead_press','overhead_squat','pistol_squat','push_up','reverse_lunge','romanian_deadlift','snatch','squat','sumo_high_pull','sumo_squat']);
const stabilityIds=new Set(['plank','glute_bridge','superman','wall_sit','bicycle_crunch']);
const conditioningIds=new Set(['burpee','high_knees','jump_push_up','jumping_jack','clean_and_jerk','snatch','sumo_high_pull','kettlebell_swing']);

const goalFor=item=>{
  const id=String(item?.id||'');
  if(conditioningIds.has(id))return 'Conditioning';
  if(stabilityIds.has(id))return 'Stability';
  if(/situp|crunch/.test(id))return 'Core';
  return 'Strength';
};

function cameraFor(value,id){
  if(['deadlift','romanian_deadlift','good_morning','kettlebell_swing','push_up','glute_bridge','superman'].includes(id))return {position:[4.4,1.6,0],target:[0,1,0]};
  switch(String(value||'front').toLowerCase()){
    case 'side':return {position:[4.4,1.6,0],target:[0,1,0]};
    case 'back':return {position:[0,1.7,-4.2],target:[0,1,0]};
    case '3-4':
    case 'threequarter':return {position:[3.2,1.7,3.2],target:[0,1,0]};
    default:return {position:[2.8,1.7,4.2],target:[0,1,0]};
  }
}

export function toAthletico3D(item){
  const primary=Array.isArray(item.primary)?item.primary:[];
  const secondary=Array.isArray(item.secondary)?item.secondary:[];
  const steps=Array.isArray(item.steps)?item.steps:[];
  const id=String(item.id||'');
  const equipment=equipmentById[id]||equipmentMap[item.equipment]||item.equipment||'Bodyweight';
  const camera=cameraFor(item.camera,id);
  return {
    id:`opengym3d:${id}`,
    openGymId:id,
    source:'opengym3d',
    name:item.name||id.replaceAll('_',' '),
    gr:greekNames[id]||item.name||id.replaceAll('_',' '),
    group:muscleToGroup(primary[0]||secondary[0]),
    equipment,
    goal:goalFor(item),
    movement:compoundIds.has(id)?'Compound':'Accessory',
    target:primary.join(', '),
    muscleGroup:primary.join(', '),
    secondary,
    instructions:steps.join(' ')||'Εκτέλεσε την κίνηση ελεγχόμενα, με σταθερό κορμό και πλήρες ασφαλές εύρος κίνησης.',
    instructionSteps:steps,
    cues:steps.slice(0,3),
    cue:steps[0]||'',
    mistakes:[],
    regression:'',
    progression:'',
    reps:conditioningIds.has(id)?'30–45s':'8–12 επαναλήψεις',
    rest:conditioningIds.has(id)?30:45,
    safety:'Δώσε προτεραιότητα στην τεχνική και σταμάτησε αν υπάρχει πόνος.',
    media3d:{type:'glb',modelUrl:item.glb?.startsWith('http')?item.glb:`${OPENGYM3D_BASE}/${item.glb||`assets/${id}.glb`}`,animationName:item.animationName||id,duration:item.duration||5,loop:true,camera}
  };
}

const FALLBACK_LIVE_IDS=['back_squat','bent_over_row','bicep_curl','bicycle_crunch','burpee','calf_raise','clean_and_jerk','crunch','deadlift','dumbbell_shoulder_press','front_raise','glute_bridge','good_morning','hammer_curl','high_knees','jump_push_up','jumping_jack','kettlebell_swing','lateral_raise','lunge','overhead_press','overhead_squat','overhead_tricep_extension','pistol_squat','plank','push_up','reverse_lunge','romanian_deadlift','situp','snatch','squat','sumo_high_pull','sumo_squat','superman','wall_sit'];

const fallbackRecords=FALLBACK_LIVE_IDS.map(id=>({id,name:id.replaceAll('_',' ').replace(/\b\w/g,m=>m.toUpperCase()),equipment:equipmentById[id]||'None',primary:[],secondary:[],steps:[],camera:'front',glb:`assets/${id}.glb`}));

export async function loadOpenGym3DExercises({signal}={}){
  try{
    const r=await fetch(OPENGYM3D_MANIFEST,{signal,cache:'no-store'});
    if(!r.ok)throw new Error(`OpenGym3D manifest HTTP ${r.status}`);
    const payload=await r.json();
    const list=Array.isArray(payload)?payload:Array.isArray(payload?.exercises)?payload.exercises:[];
    if(!list.length)throw new Error('OpenGym3D manifest empty');
    return list.map(toAthletico3D);
  }catch(err){
    if(err?.name==='AbortError')throw err;
    console.warn('OpenGym3D manifest unavailable; using bundled fallback catalogue.',err);
    return fallbackRecords.map(toAthletico3D);
  }
}
