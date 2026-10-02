const phase=(ids,minutes,label)=>ids.map((exerciseId,i)=>({type:'work',exerciseId,seconds:Math.floor(minutes*60/ids.length),label,index:i}));
const make=(id,title,level,type,equipment,groups)=>{
 const segments=[...phase(groups.warm,8,'WARM-UP'),...phase(groups.prep,7,'MOBILITY + ACTIVATION'),...phase(groups.main,25,'MAIN WORK'),...phase(groups.finish,15,'FINISHER / CONDITIONING'),...phase(groups.cool,5,'COOL DOWN')];
 const total=segments.reduce((s,x)=>s+x.seconds,0);const diff=3600-total;if(diff)segments[segments.length-1].seconds+=diff;
 return{id,title,subtitle:`60 λεπτά · ${type}`,level,type,methodology:type,equipment,focus:type,duration:60,seconds:3600,segments};
};
const B={warm:['local:inchworm','local:squat','local:reverse_lunge','local:dead_bug'],prep:['compound:bw_squat_kneedrive','local:glute_bridge','local:push_up','local:band_row'],cool:['local:childs_pose','local:hip_flexor_stretch']};
const A={warm:['local:inchworm','local:lateral_lunge','local:plank_shoulder_tap','local:overhead_squat'],prep:['local:deadlift','local:push_press','local:bent_over_row','local:kettlebell_swing'],cool:['local:childs_pose','local:hip_flexor_stretch']};
export const expandedFunctionalPrograms=[
make('b-upper-60','Beginner Upper Body','Beginner','Upper Body','Dumbbells + Bands',{...B,main:['local:dumbbell_bench_press','local:dumbbell_row','local:dumbbell_shoulder_press','local:dumbbell_biceps_curl','local:overhead_triceps_extension'],finish:['compound:band_squat_row','local:push_up','local:band_face_pull']}),
make('b-lower-60','Beginner Lower Body','Beginner','Lower Body','Bodyweight + Dumbbells',{...B,main:['local:dumbbell_goblet_squat','local:dumbbell_reverse_lunge','local:dumbbell_romanian_deadlift','local:step_up','local:glute_bridge'],finish:['compound:bw_squat_kneedrive','local:walking_lunge','local:standing_calf_raise']}),
make('b-core-60','Beginner Core','Beginner','Core','Bodyweight + Bands',{...B,main:['local:dead_bug','local:plank','local:bird_dog','local:band_pallof_press','local:side_plank'],finish:['local:mountain_climber','local:reverse_crunch','local:plank_shoulder_tap']}),
make('b-db-60','Beginner Dumbbell Full Body','Beginner','Full Body','Dumbbells',{...B,main:['compound:db_squat_press','compound:db_deadlift_row','compound:db_lunge_curl','local:dumbbell_bench_press','local:farmer_carry'],finish:['local:dumbbell_thruster','local:mountain_climber','compound:db_lunge_rotation']}),
make('a-upper-60','Advanced Upper Body','Advanced','Upper Body','Barbell + Dumbbells',{...A,main:['local:bent_over_row','local:push_press','local:renegade_row','local:dumbbell_snatch','compound:bar_deadlift_highpull'],finish:['compound:db_burpee_row','local:dumbbell_thruster','local:battle_rope_slam']}),
make('a-lower-60','Advanced Lower Body','Advanced','Lower Body','Mixed',{...A,main:['local:front_squat','local:romanian_deadlift','local:dumbbell_bulgarian_split_squat','compound:kb_swing_squat','compound:bosu_squat_press'],finish:['local:kettlebell_swing','compound:bw_skater_squat','local:burpee']}),
make('a-core-60','Advanced Core','Advanced','Core','TRX + Dumbbells',{...A,main:['compound:trx_plank_kneetuck','local:renegade_row','local:side_plank_reach_through','local:dumbbell_russian_twist','local:hollow_rock'],finish:['local:cross_body_mountain_climber','compound:bw_bear_pushup','local:plank_jack']}),
make('a-compound-60','Advanced Compound Mix','Advanced','Hybrid','Mixed',{...A,main:['compound:bar_clean_frontsquat','compound:kb_clean_press','compound:trx_lunge_fly','compound:db_step_press','compound:battle_lunge_slam'],finish:['compound:db_burpee_row','compound:bench_burpee_step','local:battle_rope_waves']})
];
export const EXPANDED_PROGRAM_CATEGORIES=['Full Body','Strength','Conditioning','Hybrid','Upper Body','Lower Body','Core'];
