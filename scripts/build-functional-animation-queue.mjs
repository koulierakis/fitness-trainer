import {exercises} from '../src/data.js';

const existing3D=new Set([
  'back_squat','bear_crawl','bicep_curl','bicycle_crunch','burpee','clean_and_jerk','crunch','front_raise','jog',
  'jump_push_up','jumping_jack','kettlebell_swing','lunge_video','overhead_squat','pistol_squat','plank','push_up',
  'run','seated_meditation','situp','snatch','squat','squat_video','sumo_high_pull','walk'
]);

const equipmentProp=e=>{
  const x=String(e||'').toLowerCase();
  if(x.includes('dumbbell'))return 'dumbbells';
  if(x.includes('kettlebell'))return 'kettlebell';
  if(x.includes('barbell'))return 'barbell';
  if(x.includes('band'))return 'resistance-band';
  if(x.includes('cable'))return 'cable-handle';
  if(x.includes('rope'))return 'battle-rope';
  if(x.includes('bench')||x.includes('step'))return 'bench-step';
  if(x.includes('trx'))return 'trx';
  if(x.includes('bosu'))return 'bosu';
  return 'none';
};

const queue=exercises.map((x,index)=>({
  order:index+1,
  id:x.id,
  openGymId:x.openGymId||null,
  name:x.name,
  gr:x.gr,
  movement:x.movement||null,
  equipment:x.equipment||'Bodyweight',
  prop:equipmentProp(x.equipment),
  status:x.openGymId&&existing3D.has(x.openGymId)?'existing-3d':'needs-motion',
  output:`public/animations/functional/${String(x.id).replace(/^local:/,'')}.glb`
}));

const existing=queue.filter(x=>x.status==='existing-3d');
const pending=queue.filter(x=>x.status==='needs-motion');
console.log(JSON.stringify({total:queue.length,existing3D:existing.length,needsMotion:pending.length,queue},null,2));
if(queue.length!==201)process.exit(1);
