// Athletico Fitness Trainer — weekly Functional rotation 2026-10-31.
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
 return {...publicMeta,duration:60,seconds,week:'2026-10-31',phaseMinutes:{...PHASE_MINUTES},mainRatio,finishRatio,segments,
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
    "main": [
      "squat",
      "dumbbell_romanian_deadlift",
      "trx_chest_press",
      "band_row",
      "dumbbell_reverse_lunge",
      "suitcase_carry",
      "glute_bridge"
    ],
    "finish": [
      "lateral_step_up",
      "bear_plank",
      "battle_rope_waves",
      "farmer_carry",
      "slow_mountain_climber"
    ],
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
    "main": [
      "dumbbell_goblet_squat",
      "dumbbell_row",
      "dumbbell_floor_press",
      "kettlebell_deadlift",
      "trx_reverse_lunge",
      "band_pallof_press",
      "push_up"
    ],
    "finish": [
      "wall_sit",
      "suitcase_carry",
      "trx_face_pull",
      "side_plank"
    ],
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
    "main": [
      "squat",
      "lateral_step_up",
      "battle_rope_waves",
      "lunge_to_knee_drive",
      "band_squat_press",
      "bear_crawl"
    ],
    "finish": [
      "lateral_shuffle",
      "slow_mountain_climber",
      "walking_lunge",
      "battle_rope_side_waves",
      "step_up"
    ],
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
    "main": [
      "dumbbell_goblet_squat",
      "trx_chest_press",
      "dumbbell_row",
      "dumbbell_reverse_lunge",
      "kettlebell_deadlift",
      "push_up",
      "suitcase_carry"
    ],
    "finish": [
      "battle_rope_waves",
      "step_up",
      "band_squat_press",
      "plank_shoulder_tap"
    ],
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
    "main": [
      "back_squat",
      "dumbbell_thruster",
      "renegade_row",
      "dumbbell_lateral_lunge",
      "kettlebell_clean_press",
      "romanian_deadlift",
      "suitcase_carry"
    ],
    "finish": [
      "battle_rope_slam",
      "bear_crawl_shoulder_tap",
      "kettlebell_swing",
      "skater_step",
      "burpee"
    ],
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
    "main": [
      "deadlift",
      "dumbbell_bench_press",
      "dumbbell_single_leg_rdl",
      "bent_over_row",
      "dumbbell_lateral_lunge",
      "push_up",
      "kettlebell_rack_carry"
    ],
    "finish": [
      "suitcase_carry",
      "half_kneeling_pallof_press",
      "trx_face_pull",
      "glute_bridge"
    ],
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
    "main": [
      "burpee",
      "battle_rope_waves",
      "dumbbell_thruster",
      "lateral_shuffle",
      "kettlebell_swing",
      "bear_crawl",
      "skater_step"
    ],
    "finish": [
      "battle_rope_side_waves",
      "squat_thrust",
      "cross_body_mountain_climber",
      "skater_jump",
      "dumbbell_clean_squat_press"
    ],
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
    "main": [
      "push_up",
      "dumbbell_clean_press",
      "dumbbell_step_up",
      "cable_row",
      "kettlebell_reverse_lunge",
      "dumbbell_thruster",
      "kettlebell_suitcase_carry"
    ],
    "finish": [
      "burpee",
      "battle_rope_alternating_waves",
      "kettlebell_swing",
      "bear_crawl_shoulder_tap"
    ],
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
    [
      42,
      38
    ],
    [
      35,
      30
    ],
    "Anti-rotation, lateral movement and balanced push/pull"
  ],
  [
    "b-strength-60",
    "Beginner Strength",
    "Beginner",
    "Strength",
    "Dumbbells + Kettlebell + TRX + Bands",
    "bStrength",
    [
      38,
      47
    ],
    [
      30,
      35
    ],
    "Tempo-controlled squat/hinge and unilateral strength"
  ],
  [
    "b-conditioning-60",
    "Beginner Conditioning",
    "Beginner",
    "Conditioning",
    "Bodyweight + Bands + Battle Ropes",
    "bConditioning",
    [
      35,
      30
    ],
    [
      35,
      30
    ],
    "Low-impact multidirectional aerobic intervals"
  ],
  [
    "b-hybrid-60",
    "Beginner Hybrid",
    "Beginner",
    "Hybrid",
    "Bodyweight + Dumbbells + TRX + Kettlebell + Bands",
    "bHybrid",
    [
      40,
      40
    ],
    [
      40,
      30
    ],
    "Alternating unilateral strength and steady conditioning"
  ],
  [
    "a-full-body-60",
    "Advanced Full Body",
    "Advanced",
    "Full Body",
    "Barbell + Dumbbells + Kettlebell + Battle Ropes",
    "aFull",
    [
      45,
      30
    ],
    [
      45,
      20
    ],
    "Posterior-chain strength and multiplanar control"
  ],
  [
    "a-strength-60",
    "Advanced Strength",
    "Advanced",
    "Strength",
    "Barbell + Dumbbells + Kettlebell + TRX",
    "aStrength",
    [
      40,
      50
    ],
    [
      35,
      35
    ],
    "Submaximal posterior-chain strength with longer recovery"
  ],
  [
    "a-conditioning-60",
    "Advanced Conditioning",
    "Advanced",
    "Conditioning",
    "Bodyweight + Dumbbells + Kettlebell + Battle Ropes",
    "aConditioning",
    [
      45,
      20
    ],
    [
      40,
      20
    ],
    "Multidirectional high-density metabolic work"
  ],
  [
    "a-hybrid-60",
    "Advanced Hybrid",
    "Advanced",
    "Hybrid",
    "Bodyweight + Dumbbells + Kettlebell + Cables + Battle Ropes",
    "aHybrid",
    [
      45,
      30
    ],
    [
      40,
      20
    ],
    "Unilateral compound strength with power-endurance finisher"
  ]
];
export const PROGRAM_CATEGORIES=['Full Body','Strength','Conditioning','Hybrid'];
export const programs=specs.map(([id,title,level,type,equipment,key,mainRatio,finishRatio,emphasis])=>make({id,title,subtitle:`31/10 · ${emphasis}`,level,type,methodology:type,equipment,focus:type,mainRatio,finishRatio},W[key]));
export const validatePrograms=()=>{
 const expected=['Beginner Full Body','Beginner Strength','Beginner Conditioning','Beginner Hybrid','Advanced Full Body','Advanced Strength','Advanced Conditioning','Advanced Hybrid'];
 if(programs.length!==8||programs.some((p,i)=>p.title!==expected[i]||p.seconds!==3600||p.duration!==60||!['Beginner','Advanced'].includes(p.level)))return false;
 return programs.every(p=>{
  const totals=p.segments.reduce((m,s)=>(m[s.stage]=(m[s.stage]||0)+s.seconds,m),{});
  return Object.keys(PHASE_MINUTES).every(stage=>totals[stage]===PHASE_MINUTES[stage]*60)
   &&p.segments.every(s=>Number.isInteger(s.seconds)&&s.seconds>0&&(s.type==='rest'||(s.type==='work'&&s.exerciseId.startsWith('local:'))));
 });
};
