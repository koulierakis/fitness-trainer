// Athletico Fitness Trainer — weekly Functional rotation 2026-10-24.
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
 return {...publicMeta,duration:60,seconds,week:'2026-10-24',phaseMinutes:{...PHASE_MINUTES},mainRatio,finishRatio,segments,
  safety:'Beginner: έλεγξε τεχνική και αναπνοή, χρησιμοποίησε regressions. Advanced: μόνο υπομέγιστα φορτία, χωρίς προσπάθεια μέγιστης άρσης με χρονόμετρο. Σταμάτησε σε πόνο, ζάλη ή δυσφορία.'};
};
const W={
  "bFull": {
    "warm": [
      "arm_swings",
      "bodyweight_good_morning",
      "ankle_rocker",
      "thoracic_rotation",
      "squat",
      "lateral_lunge",
      "shoulder_circles",
      "hamstring_sweep"
    ],
    "prep": [
      "glute_activation_bridge",
      "band_pull_apart",
      "dead_bug",
      "split_squat",
      "band_row",
      "bird_dog",
      "plank"
    ],
    "main": [
      "dumbbell_goblet_squat",
      "trx_row",
      "dumbbell_step_up",
      "push_up",
      "kettlebell_deadlift",
      "suitcase_carry",
      "dumbbell_floor_press"
    ],
    "finish": [
      "step_up_knee_drive",
      "slow_mountain_climber",
      "plank_shoulder_tap",
      "lateral_shuffle",
      "farmer_carry"
    ],
    "cool": [
      "hip_flexor_stretch",
      "hamstring_sweep",
      "childs_pose",
      "kneeling_lat_stretch",
      "cat_cow"
    ]
  },
  "bStrength": {
    "warm": [
      "cat_cow",
      "shoulder_circles",
      "bodyweight_good_morning",
      "ankle_rocker",
      "squat",
      "arm_swings",
      "glute_activation_bridge",
      "thoracic_rotation"
    ],
    "prep": [
      "band_pull_apart",
      "glute_bridge",
      "dead_bug",
      "incline_push_up",
      "band_lateral_walk",
      "split_squat",
      "bird_dog"
    ],
    "main": [
      "dumbbell_split_squat",
      "dumbbell_bench_press",
      "kettlebell_rdl",
      "trx_row",
      "dumbbell_step_up",
      "band_pallof_press",
      "dumbbell_shoulder_press"
    ],
    "finish": [
      "farmer_carry",
      "bird_dog_row",
      "band_face_pull",
      "wall_sit"
    ],
    "cool": [
      "calf_stretch",
      "hip_flexor_stretch",
      "kneeling_lat_stretch",
      "childs_pose",
      "cat_cow"
    ]
  },
  "bConditioning": {
    "warm": [
      "ankle_rocker",
      "lateral_shuffle",
      "arm_swings",
      "squat",
      "hamstring_sweep",
      "shoulder_circles",
      "bodyweight_good_morning",
      "thoracic_rotation"
    ],
    "prep": [
      "step_up",
      "glute_activation_bridge",
      "slow_mountain_climber",
      "band_row",
      "plank",
      "lateral_lunge",
      "bird_dog"
    ],
    "main": [
      "step_up_knee_drive",
      "band_squat_press",
      "kettlebell_deadlift",
      "skater_step",
      "battle_rope_alternating_waves",
      "bear_crawl"
    ],
    "finish": [
      "squat_thrust",
      "battle_rope_waves",
      "walking_lunge",
      "mountain_climber"
    ],
    "cool": [
      "cat_cow",
      "calf_stretch",
      "hip_flexor_stretch",
      "childs_pose",
      "kneeling_lat_stretch"
    ]
  },
  "bHybrid": {
    "warm": [
      "shoulder_circles",
      "bodyweight_good_morning",
      "lateral_lunge",
      "ankle_rocker",
      "arm_swings",
      "squat",
      "cat_cow",
      "thoracic_rotation"
    ],
    "prep": [
      "band_lateral_walk",
      "glute_bridge",
      "incline_push_up",
      "bird_dog",
      "step_up",
      "band_row",
      "dead_bug"
    ],
    "main": [
      "dumbbell_step_up",
      "band_row",
      "kettlebell_goblet_squat",
      "dumbbell_floor_press",
      "kettlebell_rdl",
      "farmer_carry",
      "push_up"
    ],
    "finish": [
      "band_squat_press",
      "lateral_shuffle",
      "plank_shoulder_tap",
      "step_up_knee_drive"
    ],
    "cool": [
      "hamstring_sweep",
      "hip_flexor_stretch",
      "kneeling_lat_stretch",
      "cat_cow",
      "childs_pose"
    ]
  },
  "aFull": {
    "warm": [
      "inchworm",
      "ankle_rocker",
      "lateral_lunge",
      "thoracic_rotation",
      "bodyweight_good_morning",
      "squat",
      "plank_shoulder_tap",
      "arm_swings"
    ],
    "prep": [
      "front_squat",
      "bent_over_row",
      "push_up",
      "single_leg_rdl",
      "kettlebell_halo",
      "band_face_pull",
      "dead_bug"
    ],
    "main": [
      "hang_power_clean",
      "front_squat",
      "renegade_row",
      "dumbbell_snatch",
      "push_press",
      "dumbbell_bulgarian_split_squat",
      "clean_and_jerk"
    ],
    "finish": [
      "battle_rope_power_slam",
      "skater_jump",
      "kettlebell_clean_press",
      "mountain_climber"
    ],
    "cool": [
      "childs_pose",
      "hip_flexor_stretch",
      "hamstring_sweep",
      "kneeling_lat_stretch",
      "cat_cow"
    ]
  },
  "aStrength": {
    "warm": [
      "ankle_rocker",
      "inchworm",
      "bodyweight_good_morning",
      "thoracic_rotation",
      "squat",
      "band_pull_apart",
      "lateral_lunge",
      "glute_activation_bridge"
    ],
    "prep": [
      "back_squat",
      "dumbbell_row",
      "glute_bridge",
      "overhead_press",
      "dead_bug",
      "band_face_pull",
      "split_squat"
    ],
    "main": [
      "back_squat",
      "dumbbell_romanian_deadlift",
      "dumbbell_floor_press",
      "chest_supported_row",
      "dumbbell_reverse_lunge",
      "single_arm_dumbbell_press"
    ],
    "finish": [
      "farmer_carry",
      "band_pallof_press",
      "bird_dog_row",
      "kettlebell_rack_carry"
    ],
    "cool": [
      "hip_flexor_stretch",
      "hamstring_sweep",
      "calf_stretch",
      "kneeling_lat_stretch",
      "childs_pose"
    ]
  },
  "aConditioning": {
    "warm": [
      "lateral_shuffle",
      "inchworm",
      "arm_swings",
      "squat",
      "ankle_rocker",
      "thoracic_rotation",
      "lateral_lunge",
      "shoulder_circles"
    ],
    "prep": [
      "kettlebell_deadlift",
      "plank_shoulder_tap",
      "dumbbell_goblet_squat",
      "band_row",
      "skater_step",
      "bear_crawl",
      "push_up"
    ],
    "main": [
      "devil_press",
      "kettlebell_clean_squat_press",
      "battle_rope_alternating_waves",
      "skater_jump",
      "dumbbell_snatch",
      "renegade_row"
    ],
    "finish": [
      "kettlebell_swing",
      "battle_rope_power_slam",
      "burpee",
      "plank_jack"
    ],
    "cool": [
      "cat_cow",
      "hip_flexor_stretch",
      "calf_stretch",
      "childs_pose",
      "kneeling_lat_stretch"
    ]
  },
  "aHybrid": {
    "warm": [
      "inchworm",
      "shoulder_circles",
      "bodyweight_good_morning",
      "ankle_rocker",
      "lateral_lunge",
      "squat",
      "arm_swings",
      "thoracic_rotation"
    ],
    "prep": [
      "kettlebell_halo",
      "front_squat",
      "band_face_pull",
      "single_leg_rdl",
      "push_up",
      "plank_shoulder_tap",
      "glute_bridge"
    ],
    "main": [
      "clean_and_press",
      "dumbbell_bulgarian_split_squat",
      "renegade_row",
      "kettlebell_front_rack_squat",
      "dumbbell_snatch",
      "trx_row",
      "deadlift"
    ],
    "finish": [
      "battle_rope_power_slam",
      "squat_thrust",
      "kettlebell_swing",
      "skater_jump"
    ],
    "cool": [
      "childs_pose",
      "hip_flexor_stretch",
      "hamstring_sweep",
      "kneeling_lat_stretch",
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
    "Bodyweight + Dumbbells + TRX + Kettlebell",
    "bFull",
    [
      40,
      35
    ],
    [
      35,
      25
    ],
    "Squat / push / pull / carry, moderate pace"
  ],
  [
    "b-strength-60",
    "Beginner Strength",
    "Beginner",
    "Strength",
    "Dumbbells + Kettlebell + TRX + Bands",
    "bStrength",
    [
      35,
      40
    ],
    [
      35,
      25
    ],
    "Controlled unilateral strength and upper/lower balance"
  ],
  [
    "b-conditioning-60",
    "Beginner Conditioning",
    "Beginner",
    "Conditioning",
    "Bodyweight + Bands + Kettlebell + Battle Ropes",
    "bConditioning",
    [
      40,
      35
    ],
    [
      35,
      25
    ],
    "Low-impact conditioning and locomotion"
  ],
  [
    "b-hybrid-60",
    "Beginner Hybrid",
    "Beginner",
    "Hybrid",
    "Bodyweight + Dumbbells + Kettlebell + Bands",
    "bHybrid",
    [
      40,
      35
    ],
    [
      35,
      25
    ],
    "Strength circuits followed by controlled aerobic intervals"
  ],
  [
    "a-full-body-60",
    "Advanced Full Body",
    "Advanced",
    "Full Body",
    "Barbell + Dumbbells + Kettlebell + Battle Ropes",
    "aFull",
    [
      50,
      25
    ],
    [
      45,
      15
    ],
    "Full-body compound power and multi-planar control"
  ],
  [
    "a-strength-60",
    "Advanced Strength",
    "Advanced",
    "Strength",
    "Barbell + Dumbbells + Kettlebell + Bands",
    "aStrength",
    [
      40,
      35
    ],
    [
      40,
      20
    ],
    "Submaximal compound strength, strict technique, loaded carries"
  ],
  [
    "a-conditioning-60",
    "Advanced Conditioning",
    "Advanced",
    "Conditioning",
    "Bodyweight + Dumbbells + Kettlebell + Battle Ropes",
    "aConditioning",
    [
      55,
      20
    ],
    [
      45,
      15
    ],
    "High-density metabolic work with controlled transitions"
  ],
  [
    "a-hybrid-60",
    "Advanced Hybrid",
    "Advanced",
    "Hybrid",
    "Barbell + Dumbbells + Kettlebell + TRX",
    "aHybrid",
    [
      50,
      25
    ],
    [
      45,
      15
    ],
    "Compound strength-to-conditioning progression"
  ]
];
export const PROGRAM_CATEGORIES=['Full Body','Strength','Conditioning','Hybrid'];
export const programs=specs.map(([id,title,level,type,equipment,key,mainRatio,finishRatio,emphasis])=>make({id,title,subtitle:`24/10 · ${emphasis}`,level,type,methodology:type,equipment,focus:type,mainRatio,finishRatio},W[key]));
export const validatePrograms=()=>{
 const expected=['Beginner Full Body','Beginner Strength','Beginner Conditioning','Beginner Hybrid','Advanced Full Body','Advanced Strength','Advanced Conditioning','Advanced Hybrid'];
 if(programs.length!==8||programs.some((p,i)=>p.title!==expected[i]||p.seconds!==3600||p.duration!==60||!['Beginner','Advanced'].includes(p.level)))return false;
 return programs.every(p=>{
  const totals=p.segments.reduce((m,s)=>(m[s.stage]=(m[s.stage]||0)+s.seconds,m),{});
  return Object.keys(PHASE_MINUTES).every(stage=>totals[stage]===PHASE_MINUTES[stage]*60)
   &&p.segments.every(s=>Number.isInteger(s.seconds)&&s.seconds>0&&(s.type==='rest'||(s.type==='work'&&s.exerciseId.startsWith('local:'))));
 });
};
