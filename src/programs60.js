// Functional ready programs: program difficulty only Beginner/Advanced; every session is exactly 3600 seconds.
const block=(ids,duration,work,rest,label)=>{const out=[];let left=duration,i=0;while(left>0){const w=Math.min(work,left);out.push({type:'work',exerciseId:ids[i%ids.length],seconds:w,label});left-=w;i++;if(left<=0)break;const r=Math.min(rest,left);out.push({type:'rest',seconds:r,label:`${label} · RECOVERY`});left-=r;}return out};
const phase=(ids,min,work,rest,label)=>block(ids,min*60,work,rest,label);
const session=(ids,work,rest,level)=>[
 ...phase(ids.slice(0,4),8,40,20,'WARM-UP'),
 ...phase(ids.slice(1,5),10,45,15,'MOBILITY + ACTIVATION'),
 ...phase(ids,15,level==='Beginner'?55:70,level==='Beginner'?35:20,'STRENGTH / SKILL'),
 ...phase(ids,22,work,rest,'MAIN WORK'),
 ...phase(ids.slice(0,3),5,40,20,'COOL DOWN')
];
const make=(meta,segments)=>{const seconds=segments.reduce((n,s)=>n+s.seconds,0);if(seconds!==3600)throw new Error(`${meta.id}: ${seconds}s, expected 3600`);return {...meta,duration:60,seconds,segments};};
export const PROGRAM_CATEGORIES=["Full Body","Strength","Conditioning","Hybrid","High Density","HIIT","Tabata","Core","Mobility","Stability / Balance","Strength + Conditioning","Metabolic","Functional Athletic"];
const P={
 full:['local:squat','local:push_up','local:reverse_lunge','local:dumbbell_row','local:dumbbell_romanian_deadlift','local:farmer_carry'],
 strength:['local:back_squat','local:deadlift','local:bent_over_row','local:overhead_press','local:dumbbell_split_squat','local:renegade_row'],
 conditioning:['local:kettlebell_swing','local:burpee','local:mountain_climber','local:dumbbell_thruster','local:battle_rope_waves','local:reverse_lunge'],
 hybrid:['local:dumbbell_goblet_squat','local:push_up','local:kettlebell_swing','local:trx_row','local:farmer_carry','local:mountain_climber'],
 density:['local:dumbbell_thruster','local:renegade_row','local:kettlebell_swing','local:burpee','local:battle_rope_slam','local:split_squat'],
 hiit:['local:burpee','local:mountain_climber','local:kettlebell_swing','local:battle_rope_waves','local:dumbbell_snatch','local:push_up'],
 tabata:['local:squat','local:push_up','local:mountain_climber','local:kettlebell_swing','local:battle_rope_waves','local:dumbbell_thruster'],
 core:['local:plank','local:side_plank','local:dead_bug','local:band_pallof_press','local:suitcase_carry','local:cable_woodchop'],
 mobility:['local:inchworm','local:lateral_lunge','local:split_squat','local:overhead_squat','local:dead_bug','local:reverse_lunge'],
 stability:['local:plank_shoulder_tap','local:single_leg_glute_bridge','local:trx_reverse_lunge','local:suitcase_carry','local:bosu_squat','local:bosu_push_up'],
 sc:['local:back_squat','local:dumbbell_row','local:kettlebell_swing','local:dumbbell_thruster','local:farmer_carry','local:burpee'],
 metabolic:['local:kettlebell_swing','local:battle_rope_slam','local:dumbbell_clean_press','local:mountain_climber','local:dumbbell_reverse_lunge','local:push_up'],
 athletic:['local:hang_power_clean','local:push_press','local:dumbbell_snatch','local:farmer_carry','local:lateral_lunge','local:bear_crawl']
};
const specs=[['Full Body','full'],['Strength','strength'],['Conditioning','conditioning'],['Hybrid','hybrid'],['High Density','density'],['HIIT','hiit'],['Tabata','tabata'],['Core','core'],['Mobility','mobility'],['Stability / Balance','stability'],['Strength + Conditioning','sc'],['Metabolic','metabolic'],['Functional Athletic','athletic']];
const rotate=(a,n)=>a.slice(n).concat(a.slice(0,n));
const advanced=a=>a.map((id,i)=>i===0?'local:clean_and_jerk':i===3?'local:snatch':id);
const ratios=(type,level)=>type==='Tabata'?[20,10]:type==='HIIT'?(level==='Beginner'?[35,25]:[45,15]):type==='High Density'?(level==='Beginner'?[45,15]:[55,5]):(level==='Beginner'?[40,20]:[50,10]);
export const programs=['Beginner','Advanced'].flatMap(level=>specs.flatMap(([type,key])=>[1,2].map(variant=>{let ids=rotate(P[key],variant===1?0:2);if(level==='Advanced'&&!['Core','Mobility','Stability / Balance'].includes(type))ids=advanced(ids);const [work,rest]=ratios(type,level);const slug=type.toLowerCase().replaceAll(' + ','-plus-').replaceAll(' / ','-').replaceAll(' ','-');return make({id:`${level[0].toLowerCase()}-${slug}-${String(variant).padStart(2,'0')}`,title:`${level} ${type} ${String(variant).padStart(2,'0')}`,subtitle:`60 λεπτά ${type} με διαφορετική επιλογή κινήσεων, πυκνότητα και training stimulus.`,level,type,methodology:type,equipment:'Mixed',focus:type,variant},session(ids,work,rest,level));})));
export const validatePrograms=()=>programs.length===52&&programs.every(p=>p.seconds===3600&&['Beginner','Advanced'].includes(p.level));
