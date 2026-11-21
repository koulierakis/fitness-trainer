// Athletico Fitness Trainer — weekly Functional rotation 2026-11-21.
// Exactly eight 60-minute sessions. Difficulty belongs to PROGRAMS, not exercises.
// Exercise references use canonical local:* IDs; the UI merges QA-manifest GLB media at runtime.
const intervalBlock=(ids,minutes,work,rest,stage,label)=>{
 if(!Array.isArray(ids)||!ids.length||!Number.isInteger(minutes)||minutes<=0||work<=0||rest<0)throw new Error('Invalid Functional interval block');
 const out=[];let remaining=minutes*60,i=0;
 while(remaining>0){
  const seconds=Math.min(work,remaining);
  out.push({type:'work',exerciseId:`local:${ids[i%ids.length]}`,seconds,stage,label});
  remaining-=seconds;
  if(remaining>0&&rest>0){const recovery=Math.min(rest,remaining);out.push({type:'rest',seconds:recovery,stage,label:`${label} · RECOVERY`});remaining-=recovery;}
  i++;
 }
 return out;
};
const PHASE_MINUTES=Object.freeze({warmup:8,activation:7,main:25,finisher:15,cooldown:5});
const make=(meta,set)=>{
 const segments=[
  ...intervalBlock(set.warm,PHASE_MINUTES.warmup,40,20,'warmup','WARM-UP'),
  ...intervalBlock(set.prep,PHASE_MINUTES.activation,40,20,'activation','MOBILITY + ACTIVATION'),
  ...intervalBlock(set.main,PHASE_MINUTES.main,...meta.mainRatio,'main','MAIN WORK'),
  ...intervalBlock(set.finish,PHASE_MINUTES.finisher,...meta.finishRatio,'finisher',meta.type==='Strength'?'ACCESSORY / CONTROL':'FINISHER / CONDITIONING'),
  ...intervalBlock(set.cool,PHASE_MINUTES.cooldown,50,10,'cooldown','COOL DOWN')
 ];
 const seconds=segments.reduce((n,s)=>n+s.seconds,0);
 if(seconds!==3600)throw new Error(`${meta.id}: expected 3600s, got ${seconds}s`);
 const {mainRatio,finishRatio,...publicMeta}=meta;
 return {...publicMeta,duration:60,seconds,week:'2026-11-21',phaseMinutes:{...PHASE_MINUTES},mainRatio,finishRatio,segments,
  safety:'Beginner: έλεγξε τεχνική και αναπνοή, χρησιμοποίησε regressions. Advanced: μόνο υπομέγιστα φορτία, χωρίς προσπάθεια μέγιστης άρσης με χρονόμετρο. Σταμάτησε σε πόνο, ζάλη ή δυσφορία.'};
};
const W={
  "bFull": {
    "warm": [
      "arm_swings",
      "ankle_rocker",
      "bodyweight_good_morning",
      "lateral_lunge",
      "thoracic_rotation",
      "squat",
      "shoulder_circles",
      "hamstring_sweep"
    ],
    "prep": [
      "glute_activation_bridge",
      "band_pull_apart",
      "bird_dog",
      "split_squat",
      "band_row",
      "dead_bug",
      "plank"
    ],
    "main": ["dumbbell_goblet_squat","trx_row","step_up","dumbbell_floor_press","band_pallof_press","farmer_carry","glute_bridge"],
    "finish": ["skater_step","battle_rope_waves","slow_mountain_climber","suitcase_carry"],
    "cool": [
      "childs_pose",
      "hip_flexor_stretch",
      "calf_stretch",
      "kneeling_lat_stretch",
      "cat_cow"
    ]
  },
  "bStrength": {
    "warm": [
      "shoulder_circles",
      "bodyweight_good_morning",
      "ankle_rocker",
      "cat_cow",
      "arm_swings",
      "split_squat",
      "thoracic_rotation",
      "hamstring_sweep"
    ],
    "prep": [
      "band_external_rotation",
      "glute_bridge",
      "dead_bug",
      "incline_push_up",
      "band_lateral_walk",
      "trx_row",
      "bird_dog"
    ],
    "main": ["kettlebell_deadlift","dumbbell_floor_press","trx_squat","band_row","dumbbell_reverse_lunge","suitcase_carry","dead_bug"],
    "finish": ["side_plank","band_pallof_press","glute_bridge","bird_dog"],
    "cool": [
      "hip_flexor_stretch",
      "kneeling_lat_stretch",
      "hamstring_sweep",
      "calf_stretch",
      "childs_pose"
    ]
  },
  "bConditioning": {
    "warm": [
      "lateral_shuffle",
      "arm_swings",
      "ankle_rocker",
      "squat",
      "thoracic_rotation",
      "shoulder_circles",
      "bodyweight_good_morning",
      "lateral_lunge"
    ],
    "prep": [
      "step_up",
      "band_lateral_walk",
      "glute_activation_bridge",
      "slow_mountain_climber",
      "dead_bug",
      "bird_dog",
      "band_row"
    ],
    "main": ["step_up","skater_step","battle_rope_waves","farmer_carry","lateral_shuffle","band_row"],
    "finish": ["walking_lunge","slow_mountain_climber","squat","plank_shoulder_tap"],
    "cool": [
      "calf_stretch",
      "childs_pose",
      "cat_cow",
      "hip_flexor_stretch",
      "kneeling_lat_stretch"
    ]
  },
  "bHybrid": {
    "warm": [
      "cat_cow",
      "shoulder_circles",
      "arm_swings",
      "lateral_lunge",
      "ankle_rocker",
      "bodyweight_good_morning",
      "squat",
      "thoracic_rotation"
    ],
    "prep": [
      "glute_activation_bridge",
      "band_pull_apart",
      "step_up",
      "bird_dog",
      "dead_bug",
      "incline_push_up",
      "band_row"
    ],
    "main": ["dumbbell_goblet_squat","band_row","dumbbell_romanian_deadlift","incline_push_up","farmer_carry","step_up","dead_bug"],
    "finish": ["skater_step","battle_rope_waves","suitcase_carry","glute_bridge"],
    "cool": [
      "kneeling_lat_stretch",
      "hamstring_sweep",
      "hip_flexor_stretch",
      "childs_pose",
      "cat_cow"
    ]
  },
  "aFull": {
    "warm": [
      "inchworm",
      "lateral_lunge",
      "bodyweight_good_morning",
      "ankle_rocker",
      "thoracic_rotation",
      "squat",
      "arm_swings",
      "plank_shoulder_tap"
    ],
    "prep": [
      "band_face_pull",
      "glute_bridge",
      "single_leg_rdl",
      "push_up",
      "dead_bug",
      "kettlebell_halo",
      "trx_row"
    ],
    "main": ["front_squat","bent_over_row","dumbbell_step_up","dumbbell_bench_press","single_leg_rdl","renegade_row","suitcase_carry"],
    "finish": ["battle_rope_power_slam","bear_crawl","kettlebell_swing","plank_shoulder_tap"],
    "cool": [
      "hip_flexor_stretch",
      "kneeling_lat_stretch",
      "calf_stretch",
      "childs_pose",
      "cat_cow"
    ]
  },
  "aStrength": {
    "warm": [
      "inchworm",
      "bodyweight_good_morning",
      "ankle_rocker",
      "squat",
      "arm_swings",
      "thoracic_rotation",
      "lateral_lunge",
      "band_pull_apart"
    ],
    "prep": [
      "band_row",
      "glute_activation_bridge",
      "dead_bug",
      "split_squat",
      "push_up",
      "kettlebell_deadlift",
      "band_external_rotation"
    ],
    "main": ["back_squat","dumbbell_bench_press","dumbbell_romanian_deadlift","dumbbell_bulgarian_split_squat","cable_row","farmer_carry","band_pallof_press"],
    "finish": ["trx_row","side_plank","suitcase_carry","glute_bridge"],
    "cool": [
      "hamstring_sweep",
      "hip_flexor_stretch",
      "childs_pose",
      "kneeling_lat_stretch",
      "calf_stretch"
    ]
  },
  "aConditioning": {
    "warm": [
      "lateral_shuffle",
      "arm_swings",
      "ankle_rocker",
      "squat",
      "inchworm",
      "lateral_lunge",
      "thoracic_rotation",
      "shoulder_circles"
    ],
    "prep": [
      "band_squat_press",
      "bear_crawl",
      "glute_activation_bridge",
      "plank_shoulder_tap",
      "kettlebell_deadlift",
      "skater_step",
      "push_up"
    ],
    "main": ["kettlebell_swing","battle_rope_alternating_waves","dumbbell_step_up","cross_body_mountain_climber","dumbbell_thruster","bear_crawl","skater_jump"],
    "finish": ["squat_thrust","battle_rope_power_slam","push_up","lateral_shuffle","plank_shoulder_tap"],
    "cool": [
      "calf_stretch",
      "hip_flexor_stretch",
      "cat_cow",
      "childs_pose",
      "kneeling_lat_stretch"
    ]
  },
  "aHybrid": {
    "warm": [
      "arm_swings",
      "inchworm",
      "bodyweight_good_morning",
      "lateral_lunge",
      "ankle_rocker",
      "squat",
      "thoracic_rotation",
      "shoulder_circles"
    ],
    "prep": [
      "kettlebell_halo",
      "band_face_pull",
      "dead_bug",
      "trx_row",
      "single_leg_rdl",
      "glute_activation_bridge",
      "plank_shoulder_tap"
    ],
    "main": ["front_squat","dumbbell_clean_press","cable_row","dumbbell_bulgarian_split_squat","renegade_row","farmer_carry","kettlebell_goblet_squat"],
    "finish": ["battle_rope_alternating_waves","kettlebell_swing","bear_crawl","skater_jump"],
    "cool": [
      "childs_pose",
      "kneeling_lat_stretch",
      "hip_flexor_stretch",
      "calf_stretch",
      "cat_cow"
    ]
  }
};
const specs=[
  [
    "b-full-body-60",
    "Beginner Full Body",
    "Beginner",
    "Full Body",
    "Bodyweight + Dumbbells + TRX + Bands + Battle Ropes",
    "bFull",
    [38,42],
    [32,38],
    "Controlled push/pull and lateral stability"
  ],
  [
    "b-strength-60",
    "Beginner Strength",
    "Beginner",
    "Strength",
    "Dumbbells + Kettlebell + TRX + Bands",
    "bStrength",
    [30,55],
    [28,42],
    "Hinge control, pulling strength and carries"
  ],
  [
    "b-conditioning-60",
    "Beginner Conditioning",
    "Beginner",
    "Conditioning",
    "Bodyweight + Bands + Battle Ropes",
    "bConditioning",
    [36,34],
    [32,38],
    "Low impact steady movement with planned recovery"
  ],
  [
    "b-hybrid-60",
    "Beginner Hybrid",
    "Beginner",
    "Hybrid",
    "Bodyweight + Dumbbells + TRX + Kettlebell + Bands",
    "bHybrid",
    [34,46],
    [32,38],
    "Posterior chain strength alternating with aerobic work"
  ],
  [
    "a-full-body-60",
    "Advanced Full Body",
    "Advanced",
    "Full Body",
    "Barbell + Dumbbells + Kettlebell + Battle Ropes",
    "aFull",
    [43,32],
    [43,27],
    "Squat/pull strength and anti-rotation"
  ],
  [
    "a-strength-60",
    "Advanced Strength",
    "Advanced",
    "Strength",
    "Barbell + Dumbbells + Kettlebell + TRX",
    "aStrength",
    [32,58],
    [32,43],
    "Heavy-pattern submaximal sets and full recovery"
  ],
  [
    "a-conditioning-60",
    "Advanced Conditioning",
    "Advanced",
    "Conditioning",
    "Bodyweight + Dumbbells + Kettlebell + Battle Ropes",
    "aConditioning",
    [44,21],
    [44,21],
    "Alternating upper/lower metabolic density"
  ],
  [
    "a-hybrid-60",
    "Advanced Hybrid",
    "Advanced",
    "Hybrid",
    "Bodyweight + Dumbbells + Kettlebell + Cables + Battle Ropes",
    "aHybrid",
    [40,35],
    [44,21],
    "Unilateral strength, push/pull and aerobic power"
  ]
];
export const PROGRAM_CATEGORIES=['Full Body','Strength','Conditioning','Hybrid'];
export const programs=specs.map(([id,title,level,type,equipment,key,mainRatio,finishRatio,emphasis])=>make({id,title,subtitle:`21/11 · ${emphasis}`,level,type,methodology:type,equipment,focus:type,mainRatio,finishRatio},W[key]));
export const validatePrograms=()=>{
 const expected=['Beginner Full Body','Beginner Strength','Beginner Conditioning','Beginner Hybrid','Advanced Full Body','Advanced Strength','Advanced Conditioning','Advanced Hybrid'];
 if(programs.length!==8||programs.some((p,i)=>p.title!==expected[i]||p.seconds!==3600||p.duration!==60||!['Beginner','Advanced'].includes(p.level)))return false;
 return programs.every(p=>{
  const totals=p.segments.reduce((m,s)=>(m[s.stage]=(m[s.stage]||0)+s.seconds,m),{});
  return Object.keys(PHASE_MINUTES).every(stage=>totals[stage]===PHASE_MINUTES[stage]*60)
   &&p.segments.every(s=>Number.isInteger(s.seconds)&&s.seconds>0&&(s.type==='rest'||(s.type==='work'&&s.exerciseId.startsWith('local:'))));
 });
};
