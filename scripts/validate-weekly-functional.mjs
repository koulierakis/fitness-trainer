import assert from 'node:assert/strict';
import {programs,validatePrograms} from '../src/programs60.js';
import {functionalExercises} from '../src/catalog/functionalCatalog.js';
import {buildTimeline,totalSeconds,validateProgramReferences} from '../src/engine/workout.js';

const expected=[
 'Beginner Full Body','Beginner Strength','Beginner Conditioning','Beginner Hybrid',
 'Advanced Full Body','Advanced Strength','Advanced Conditioning','Advanced Hybrid'
];
const expectedPhases={warmup:480,activation:420,main:1500,finisher:900,cooldown:300};
assert.equal(programs.length,8,'The weekly Functional set must contain exactly 8 programs');
assert.deepEqual(programs.map(p=>p.title),expected,'Weekly program titles/order changed');
assert.ok(validatePrograms(),'Program-level schema/duration validation failed');
assert.equal(validateProgramReferences(programs,functionalExercises).length,0,'Broken exercise references');
assert.ok(functionalExercises.every(x=>!Object.hasOwn(x,'level')),'Difficulty belongs to programs, not exercises');
for(const p of programs){
 assert.match(p.week,/^\d{4}-\d{2}-\d{2}$/,'Invalid weekly refresh date: '+p.id);
 assert.equal(p.week,programs[0].week,'Mismatched weekly refresh dates: '+p.id);
 assert.equal(p.duration,60);
 assert.equal(p.seconds,3600);
 assert.ok(['Beginner','Advanced'].includes(p.level));
 const timeline=buildTimeline(p,functionalExercises);
 assert.equal(totalSeconds(timeline),3600,'Resolved timeline lost time: '+p.id);
 const phases=Object.fromEntries(Object.keys(expectedPhases).map(key=>[key,0]));
 for(const item of timeline){
  assert.ok(Number.isInteger(item.seconds)&&item.seconds>0,'Invalid segment duration: '+p.id);
  assert.ok(Object.hasOwn(phases,item.stage),'Unknown stage: '+item.stage);
  phases[item.stage]+=item.seconds;
 }
 assert.deepEqual(phases,expectedPhases,'Wrong phase duration: '+p.id);
 const main=new Set(timeline.filter(x=>x.stage==='main'&&x.type==='work').map(x=>x.exercise.id));
 assert.ok(main.size>=5,'Insufficient exercise variety in '+p.id);
 const cool=timeline.filter(x=>x.stage==='cooldown'&&x.type==='work');
 assert.equal(new Set(cool.map(x=>x.exercise.id)).size,5,'Cool-down must use five distinct movements: '+p.id);
 console.log(`${p.title}: 60:00 verified; main=${main.size} movements; intervals=${p.mainRatio.join('/')}`);
}
console.log('Weekly Functional QA PASS: 8 sessions, 8+7+25+15+5 minutes, all references resolved, no exercise difficulty.');
