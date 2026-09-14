export const OPENGYM3D_BASE='https://assiamahs.github.io/opengym3d';
export const OPENGYM3D_MANIFEST=`${OPENGYM3D_BASE}/exercises.json`;

const greekNames={
  push_up:'Κάμψεις',
  squat:'Καθίσματα',
  plank:'Σανίδα',
  burpee:'Burpee',
  bicep_curl:'Κάμψεις δικεφάλων',
  front_raise:'Μπροστινές άρσεις ώμων',
  jumping_jack:'Jumping Jacks',
  situp:'Ροκανίσματα Sit-Up',
  back_squat:'Back Squat με μπάρα',
  snatch:'Snatch',
  jump_push_up:'Εκρηκτικές κάμψεις',
  pistol_squat:'Pistol Squat',
  bicycle_crunch:'Bicycle Crunch',
  overhead_squat:'Overhead Squat',
  sumo_high_pull:'Sumo High Pull',
  clean_and_jerk:'Clean & Jerk',
  kettlebell_swing:'Kettlebell Swing'
};

const equipmentMap={
  None:'Bodyweight',
  'Body Weight':'Bodyweight',
  Bodyweight:'Bodyweight',
  Dumbbell:'Dumbbells',
  Dumbbells:'Dumbbells',
  Barbell:'Barbell',
  Kettlebell:'Kettlebell',
  Cable:'Cables',
  Rope:'Ropes',
  Band:'Resistance Bands'
};

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

const goalFor=item=>{
  const id=String(item?.id||'');
  if(/burpee|jump|snatch|clean|high_pull|swing/.test(id))return 'Conditioning';
  if(/plank|situp|crunch/.test(id))return 'Endurance';
  return 'Strength';
};

function cameraFor(value){
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
  const equipment=equipmentMap[item.equipment]||item.equipment||'Bodyweight';
  const camera=cameraFor(item.camera);
  return {
    id:`opengym3d:${item.id}`,
    openGymId:item.id,
    source:'opengym3d',
    name:item.name||String(item.id).replaceAll('_',' '),
    gr:greekNames[item.id]||item.name||String(item.id).replaceAll('_',' '),
    group:muscleToGroup(primary[0]||secondary[0]),
    equipment,
    goal:goalFor(item),
    target:primary.join(', '),
    muscleGroup:primary.join(', '),
    secondary,
    instructions:steps.join(' '),
    instructionSteps:steps,
    cues:steps.slice(0,3),
    cue:steps[0]||'',
    mistakes:[],
    regression:'',
    progression:'',
    reps:'10–12 επαναλήψεις',
    rest:30,
    safety:'Δώσε προτεραιότητα στην τεχνική και σταμάτησε αν υπάρχει πόνος.',
    media3d:{
      type:'glb',
      modelUrl:item.glb?.startsWith('http')?item.glb:`${OPENGYM3D_BASE}/${item.glb||`assets/${item.id}.glb`}`,
      animationName:item.animationName||item.id,
      duration:item.duration||5,
      loop:true,
      camera
    }
  };
}

const FALLBACK_LIVE_IDS=[
  'push_up','squat','plank','burpee','situp','snatch','back_squat','jump_push_up',
  'pistol_squat','bicycle_crunch','overhead_squat','sumo_high_pull','clean_and_jerk',
  'kettlebell_swing','jumping_jack','bicep_curl','front_raise'
];

const fallbackRecords=FALLBACK_LIVE_IDS.map(id=>({
  id,
  name:id.replaceAll('_',' ').replace(/\b\w/g,m=>m.toUpperCase()),
  equipment:id.includes('bar')||['snatch','overhead_squat','sumo_high_pull','clean_and_jerk','back_squat'].includes(id)?'Barbell':id==='kettlebell_swing'?'Kettlebell':id==='bicep_curl'||id==='front_raise'?'Dumbbell':'None',
  primary:[],secondary:[],steps:[],camera:id==='kettlebell_swing'?'side':'front',
  glb:`assets/${id}.glb`
}));

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
    console.warn('OpenGym3D manifest unavailable; using verified fallback list.',err);
    return fallbackRecords.map(toAthletico3D);
  }
}
