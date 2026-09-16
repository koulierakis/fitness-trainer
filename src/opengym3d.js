import {loadDatasetExercises} from './dataset';

export const OPENGYM3D_BASE='https://assiamahs.github.io/opengym3d';
export const OPENGYM3D_MANIFEST=`${OPENGYM3D_BASE}/exercises.json`;
const equipmentMap={None:'Bodyweight','Body Weight':'Bodyweight',Bodyweight:'Bodyweight',Dumbbell:'Dumbbells',Dumbbells:'Dumbbells',Barbell:'Barbell',Kettlebell:'Kettlebell',Cable:'Cables',Rope:'Battle Ropes',Band:'Resistance Bands'};
const muscleToGroup=value=>{const s=String(value||'').toLowerCase();if(/chest|pectoral/.test(s))return 'Στήθος';if(/shoulder|deltoid/.test(s))return 'Χέρια';if(/quad|hamstring|calf|leg|glute/.test(s))return 'Πόδια';if(/lat|back|trap|rhomboid/.test(s))return 'Πλάτη';if(/core|ab|oblique/.test(s))return 'Κοιλιακοί';if(/spine|erector/.test(s))return 'Ραχιαίοι';return 'Πλάτη'};
const cameraFor=item=>String(item?.camera||'front').toLowerCase()==='side'?{position:[4.2,1.6,.4],target:null}:{position:[.5,1.55,4.2],target:null};
const safeGlb=item=>{const glb=String(item?.glb||'').trim();if(!glb)return null;if(/^https:\/\//i.test(glb))return glb;if(glb.includes('..'))return null;return `${OPENGYM3D_BASE}/${glb.replace(/^\//,'')}`};
export function toAthletico3D(item){const id=String(item?.id||'').trim(),modelUrl=safeGlb(item);if(!id||!modelUrl)return null;const primary=Array.isArray(item.primary)?item.primary:[],secondary=Array.isArray(item.secondary)?item.secondary:[],steps=Array.isArray(item.steps)?item.steps:[];return {id:`opengym3d:${id}`,openGymId:id,source:'opengym3d',name:item.name||id.replaceAll('_',' '),gr:item.gr||item.name||id.replaceAll('_',' '),group:muscleToGroup(primary[0]||secondary[0]),equipment:equipmentMap[item.equipment]||item.equipment||'Bodyweight',level:'Beginner',goal:'Strength',target:primary.join(', '),secondary,instructions:steps.join(' '),cues:steps.slice(0,3),media3d:{type:'glb',modelUrl,animationName:item.animationName||null,duration:item.duration||null,loop:true,camera:cameraFor(item)}}}
async function load3D({signal}={}){const r=await fetch(OPENGYM3D_MANIFEST,{signal,cache:'no-store'});if(!r.ok)throw new Error(`OpenGym3D manifest HTTP ${r.status}`);const payload=await r.json();const list=Array.isArray(payload)?payload:Array.isArray(payload?.exercises)?payload.exercises:[];return list.map(toAthletico3D).filter(Boolean)}
export async function loadOpenGym3DExercises({signal}={}){
 const [threeD,gifs]=await Promise.allSettled([load3D({signal}),loadDatasetExercises({signal})]);
 const a=threeD.status==='fulfilled'?threeD.value:[];
 const b=gifs.status==='fulfilled'?gifs.value.map(x=>({...x,openGymId:`gif:${x.datasetId}`,media3d:{type:'gif-library-proxy'}})):[];
 if(!a.length&&!b.length)throw new Error('Exercise media sources unavailable');
 return [...a,...b];
}
