import {functionalExercises,FUNCTIONAL_MUSCLES,FUNCTIONAL_LEVELS} from '../src/catalog/functionalCatalog.js';
import {reformerExercises,REFORMER_CATEGORIES,REFORMER_LEVELS} from '../src/catalog/reformerCatalog.js';
import {expandedFunctionalPrograms} from '../src/catalog/functionalPrograms.js';
import {reformerPrograms} from '../src/catalog/reformerPrograms.js';

const all=[...functionalExercises,...reformerExercises];
const ids=all.map(x=>x.id);
if(new Set(ids).size!==ids.length)throw new Error('Duplicate exercise id');
for(const x of functionalExercises){
 if(!FUNCTIONAL_LEVELS.includes(x.level))throw new Error('Bad Functional level: '+x.id);
 if(!Array.isArray(x.primaryMuscles)||!x.primaryMuscles.length)throw new Error('Missing Functional primaryMuscles: '+x.id);
}
for(const x of reformerExercises){
 if(!REFORMER_LEVELS.includes(x.level))throw new Error('Bad Reformer level: '+x.id);
 if(!REFORMER_CATEGORIES.includes(x.bodyArea))throw new Error('Bad Reformer category: '+x.id);
 if(!x.visuals||!('start'in x.visuals)||!('execution'in x.visuals)||!('return'in x.visuals))throw new Error('Missing 3-frame visual schema: '+x.id);
}
const known=new Set(ids);
for(const p of expandedFunctionalPrograms){
 if(p.seconds!==3600)throw new Error('Functional program duration != 3600: '+p.id);
 for(const s of p.segments)if(s.type==='work'&&!known.has(s.exerciseId))throw new Error('Broken Functional ref '+p.id+' -> '+s.exerciseId);
}
for(const p of reformerPrograms){
 const min=p.segments.reduce((n,s)=>n+s.minutes,0);
 if(min!==50)throw new Error('Reformer program duration != 50: '+p.id);
 for(const s of p.segments)if(!known.has(s.exerciseId))throw new Error('Broken Reformer ref '+p.id+' -> '+s.exerciseId);
}
console.log('Catalog QA OK');
console.log('Functional exercises:',functionalExercises.length);
console.log('Reformer exercises:',reformerExercises.length);
console.log('Extra Functional programs:',expandedFunctionalPrograms.length);
console.log('Reformer programs:',reformerPrograms.length);
console.log('Functional muscle taxonomy:',FUNCTIONAL_MUSCLES.length);
