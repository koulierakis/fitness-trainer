export function buildTimeline(program,exercises){
 const byId=new Map(exercises.map(x=>[x.id,x]));
 const byOpenGymId=new Map();
 for(const x of exercises.filter(x=>x.openGymId)){const prev=byOpenGymId.get(x.openGymId);if(!prev||x.media3d)byOpenGymId.set(x.openGymId,x)}
 const resolveExercise=id=>{const raw=String(id||''),direct=byId.get(raw),openId=raw.replace(/^opengym3d:|^local:/,'');const media=byOpenGymId.get(openId);if(direct&&media&&media!==direct)return {...media,...direct,media3d:media.media3d||direct.media3d};return direct||media||null};
 if(Array.isArray(program?.segments)&&program.segments.length)return program.segments.flatMap((segment,index)=>{if(segment.type==='rest')return [{...segment,index}];const exercise=resolveExercise(segment.exerciseId);return exercise?[{...segment,index,type:'work',exercise}]:[]});
 const work=program.work||45,rest=program.rest||20,rounds=program.rounds||2,out=[];
 for(let r=1;r<=rounds;r++)program.items.forEach((id,i)=>{const exercise=resolveExercise(id);if(!exercise)return;out.push({type:'work',exercise,seconds:work,round:r,label:program.type||'WORK'});if(!(r===rounds&&i===program.items.length-1))out.push({type:'rest',seconds:rest,round:r,label:'RECOVERY'})});
 return out;
}
export const totalSeconds=t=>t.reduce((a,b)=>a+Number(b.seconds||0),0);
export const validateProgramReferences=(programs,exercises)=>{const ids=new Set(exercises.flatMap(x=>[x.id,x.openGymId&&`local:${x.openGymId}`,x.openGymId&&`opengym3d:${x.openGymId}`]).filter(Boolean));return programs.flatMap(p=>(p.segments||[]).filter(s=>s.type==='work'&&!ids.has(s.exerciseId)).map(s=>({program:p.id,exerciseId:s.exerciseId}))) };
