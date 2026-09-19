// Athletico weekly Functional set — exactly 8 programs, Beginner/Advanced only.
// Difficulty belongs to programs, never individual exercises. Every session is exactly 3600 seconds.
const block=(ids,duration,work,rest,label)=>{const out=[];let left=duration,i=0;while(left>0){const w=Math.min(work,left);out.push({type:'work',exerciseId:ids[i%ids.length],seconds:w,label});left-=w;i++;if(left<=0)break;const r=Math.min(rest,left);out.push({type:'rest',seconds:r,label:`${label} · RECOVERY`});left-=r;}return out};
const phase=(ids,min,work,rest,label)=>block(ids,min*60,work,rest,label);
const make=(meta,segments)=>{const seconds=segments.reduce((n,s)=>n+s.seconds,0);if(seconds!==3600)throw new Error(`${meta.id}: ${seconds}s, expected 3600`);return {...meta,duration:60,seconds,segments};};
const weeklySession=({warm,prep,main,finish,level,mainRatio=[45,15]})=>[
 ...phase(warm,8,40,20,'WARM-UP'),
 ...phase(prep,7,45,15,'MOBILITY + ACTIVATION'),
 ...phase(main,25,level==='Beginner'?mainRatio[0]:Math.max(mainRatio[0],55),level==='Beginner'?mainRatio[1]:Math.min(mainRatio[1],15),'MAIN WORK'),
 ...phase(finish,15,level==='Beginner'?45:55,level==='Beginner'?15:5,'FINISHER / CONDITIONING'),
 ...phase(warm.slice().reverse(),5,40,20,'COOL DOWN')
];
const W={
 bFull:{warm:['local:inchworm','local:squat','local:reverse_lunge','local:dead_bug'],prep:['local:split_squat','local:push_up','local:dumbbell_row','local:single_leg_glute_bridge'],main:['local:dumbbell_goblet_squat','local:push_up','local:dumbbell_row','local:dumbbell_romanian_deadlift','local:farmer_carry'],finish:['local:mountain_climber','local:reverse_lunge','local:plank_shoulder_tap']},
 bStrength:{warm:['local:inchworm','local:squat','local:split_squat','local:dead_bug'],prep:['local:dumbbell_goblet_squat','local:dumbbell_row','local:push_up','local:single_leg_glute_bridge'],main:['local:dumbbell_goblet_squat','local:dumbbell_romanian_deadlift','local:dumbbell_row','local:dumbbell_floor_press','local:farmer_carry'],finish:['local:suitcase_carry','local:split_squat','local:plank']},
 bConditioning:{warm:['local:inchworm','local:squat','local:reverse_lunge','local:plank'],prep:['local:kettlebell_goblet_squat','local:push_up','local:mountain_climber','local:dead_bug'],main:['local:kettlebell_swing','local:dumbbell_thruster','local:reverse_lunge','local:mountain_climber','local:farmer_carry'],finish:['local:battle_rope_waves','local:burpee','local:plank_shoulder_tap']},
 bHybrid:{warm:['local:inchworm','local:lateral_lunge','local:squat','local:dead_bug'],prep:['local:dumbbell_goblet_squat','local:dumbbell_row','local:push_up','local:split_squat'],main:['local:dumbbell_romanian_deadlift','local:dumbbell_row','local:dumbbell_thruster','local:push_up','local:suitcase_carry'],finish:['local:kettlebell_swing','local:mountain_climber','local:reverse_lunge']},
 aFull:{warm:['local:inchworm','local:lateral_lunge','local:overhead_squat','local:plank_shoulder_tap'],prep:['local:front_squat','local:bent_over_row','local:push_press','local:deadlift'],main:['local:clean_and_jerk','local:front_squat','local:bent_over_row','local:renegade_row','local:dumbbell_snatch'],finish:['local:kettlebell_swing','local:burpee','local:dumbbell_thruster']},
 aStrength:{warm:['local:inchworm','local:split_squat','local:overhead_squat','local:dead_bug'],prep:['local:back_squat','local:deadlift','local:bent_over_row','local:overhead_press'],main:['local:back_squat','local:deadlift','local:bent_over_row','local:push_press','local:renegade_row'],finish:['local:farmer_carry','local:dumbbell_thruster','local:kettlebell_swing']},
 aConditioning:{warm:['local:inchworm','local:lateral_lunge','local:squat','local:plank_shoulder_tap'],prep:['local:kettlebell_swing','local:dumbbell_thruster','local:push_up','local:reverse_lunge'],main:['local:clean_and_jerk','local:kettlebell_swing','local:dumbbell_snatch','local:burpee','local:renegade_row'],finish:['local:battle_rope_slam','local:mountain_climber','local:dumbbell_thruster']},
 aHybrid:{warm:['local:inchworm','local:overhead_squat','local:split_squat','local:side_plank'],prep:['local:deadlift','local:push_press','local:bent_over_row','local:kettlebell_swing'],main:['local:hang_power_clean','local:push_press','local:renegade_row','local:dumbbell_split_squat','local:kettlebell_clean_press'],finish:['local:burpee','local:battle_rope_waves','local:dumbbell_snatch']}
};
const specs=[
 ['b-full-body-60','Beginner Full Body','Beginner','Full Body','Bodyweight + Dumbbells',W.bFull,[45,20]],
 ['b-strength-60','Beginner Strength','Beginner','Strength','Dumbbells',W.bStrength,[50,25]],
 ['b-conditioning-60','Beginner Conditioning','Beginner','Conditioning','Bodyweight + Kettlebell + Dumbbells',W.bConditioning,[40,20]],
 ['b-hybrid-60','Beginner Hybrid','Beginner','Hybrid','Bodyweight + Dumbbells + Kettlebell',W.bHybrid,[45,20]],
 ['a-full-body-60','Advanced Full Body','Advanced','Full Body','Mixed',W.aFull,[60,10]],
 ['a-strength-60','Advanced Strength','Advanced','Strength','Barbell + Dumbbells + Kettlebell',W.aStrength,[65,15]],
 ['a-conditioning-60','Advanced Conditioning','Advanced','Conditioning','Mixed',W.aConditioning,[55,5]],
 ['a-hybrid-60','Advanced Hybrid','Advanced','Hybrid','Mixed',W.aHybrid,[60,10]]
];
export const PROGRAM_CATEGORIES=['Full Body','Strength','Conditioning','Hybrid'];
export const programs=specs.map(([id,title,level,type,equipment,set,ratio])=>make({id,title,subtitle:`Weekly refresh · 60 λεπτά ${type} με νέα ακολουθία και πυκνότητα.`,level,type,methodology:type,equipment,focus:type,week:'2026-09-19'},weeklySession({...set,level,mainRatio:ratio})));
export const validatePrograms=()=>programs.length===8&&programs.every(p=>p.seconds===3600&&['Beginner','Advanced'].includes(p.level));
