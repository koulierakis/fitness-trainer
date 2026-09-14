export function buildTimeline(program, exercises){
  const byId=new Map(exercises.map(x=>[x.id,x]));
  const byOpenGymId=new Map(exercises.filter(x=>x.openGymId).map(x=>[x.openGymId,x]));
  const resolveExercise=id=>byId.get(id)||(String(id).startsWith('opengym3d:')?byOpenGymId.get(String(id).replace('opengym3d:','')):null);

  if(Array.isArray(program?.segments)&&program.segments.length){
    return program.segments.flatMap((segment,index)=>{
      if(segment.type==='rest')return [{...segment,index}];
      const ex=resolveExercise(segment.exerciseId);
      if(!ex)return [];
      return [{...segment,index,type:'work',exercise:ex}];
    });
  }

  const work=program.work||45, rest=program.rest||20, rounds=program.rounds||2;
  const out=[];
  for(let r=1;r<=rounds;r++){
    program.items.forEach((id,i)=>{
      const ex=resolveExercise(id); if(!ex) return;
      out.push({type:'work',exercise:ex,seconds:work,round:r,label:program.type||'WORK'});
      if(!(r===rounds && i===program.items.length-1)) out.push({type:'rest',exercise:ex,seconds:rest,round:r,label:'RECOVERY'});
    });
  }
  return out;
}

export const totalSeconds=t=>t.reduce((a,b)=>a+Number(b.seconds||0),0);
