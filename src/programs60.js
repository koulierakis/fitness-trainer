// Athletico Functional Training — all programs are exactly 60:00.
// Difficulty belongs to programs only. Exercise selection prioritises compound, athletic movement patterns.
const O=id=>`opengym3d:${id}`;

function block(ids,duration,work,rest,label){
  const out=[];
  let left=duration, i=0;
  while(left>0){
    const w=Math.min(work,left);
    if(w>0){out.push({type:'work',exerciseId:ids[i%ids.length],seconds:w,label});left-=w;i++;}
    if(left<=0)break;
    const r=Math.min(rest,left);
    if(r>0){out.push({type:'rest',seconds:r,label:`${label} · RECOVERY`});left-=r;}
  }
  return out;
}

const phase=(ids,minutes,work,rest,label)=>block(ids,minutes*60,work,rest,label);
const make=(meta,phases)=>{
  const segments=phases.flat();
  const seconds=segments.reduce((a,b)=>a+b.seconds,0);
  if(seconds!==3600)throw new Error(`${meta.id} must equal 3600s, got ${seconds}`);
  return {...meta,duration:60,segments};
};

const mobility=[O('squat'),O('reverse_lunge'),O('good_morning'),O('glute_bridge'),O('superman')];
const stability=[O('plank'),O('glute_bridge'),O('reverse_lunge'),O('pistol_squat'),O('superman')];
const core=[O('plank'),O('bicycle_crunch'),O('situp'),O('glute_bridge'),O('superman')];
const foundational=[O('squat'),O('push_up'),O('reverse_lunge'),O('bent_over_row'),O('romanian_deadlift'),O('overhead_press')];
const strength=[O('back_squat'),O('deadlift'),O('bent_over_row'),O('overhead_press'),O('romanian_deadlift'),O('push_up')];
const athletic=[O('clean_and_jerk'),O('snatch'),O('overhead_squat'),O('sumo_high_pull'),O('kettlebell_swing'),O('burpee')];
const conditioning=[O('burpee'),O('kettlebell_swing'),O('high_knees'),O('jump_push_up'),O('jumping_jack'),O('sumo_high_pull')];
const unilateral=[O('reverse_lunge'),O('lunge'),O('pistol_squat'),O('romanian_deadlift'),O('overhead_press')];

const commonBeginner=(mainIds,mainWork=40,mainRest=20)=>[
  phase(mobility,8,40,20,'WARM-UP'),
  phase(stability,10,45,15,'MOBILITY + ACTIVATION'),
  phase(foundational,15,60,30,'STRENGTH / SKILL'),
  phase(mainIds,22,mainWork,mainRest,'MAIN SET'),
  phase(mobility,5,40,20,'COOL DOWN')
];

const commonAdvanced=(mainIds,mainWork=50,mainRest=10)=>[
  phase(mobility,8,45,15,'DYNAMIC WARM-UP'),
  phase(stability,10,50,10,'MOBILITY + ACTIVATION'),
  phase(strength,15,75,15,'STRENGTH / SKILL'),
  phase(mainIds,22,mainWork,mainRest,'MAIN SET'),
  phase(mobility,5,45,15,'COOL DOWN')
];

export const programs=[
  make({id:'b-full-body-60',title:'Beginner Full Body 60',subtitle:'Βασικά μοτίβα κίνησης, τεχνική και πλήρης προπόνηση όλου του σώματος.',level:'Beginner',type:'Full Body',methodology:'Controlled Circuit',equipment:'Bodyweight + Barbell / Dumbbells',focus:'Full Body'},commonBeginner(foundational,45,30)),

  make({id:'b-strength-60',title:'Beginner Strength Patterns 60',subtitle:'Squat, hinge, push, pull και lunge με ελεγχόμενη πυκνότητα.',level:'Beginner',type:'Strength',methodology:'Movement Patterns',equipment:'Barbell + Bodyweight',focus:'Strength'},commonBeginner(strength,55,35)),

  make({id:'b-conditioning-60',title:'Beginner Conditioning 60',subtitle:'Conditioning με σύνθετες κινήσεις και επαρκή αποκατάσταση.',level:'Beginner',type:'Conditioning',methodology:'Aerobic Power Circuit',equipment:'Bodyweight + Kettlebell',focus:'Conditioning'},commonBeginner([O('kettlebell_swing'),O('burpee'),O('high_knees'),O('reverse_lunge'),O('push_up')],40,30)),

  make({id:'b-hybrid-60',title:'Beginner Hybrid 60',subtitle:'Δύναμη και conditioning σε μία συνεδρία χωρίς περιττές isolation ασκήσεις.',level:'Beginner',type:'Hybrid',methodology:'Strength + Conditioning',equipment:'Mixed',focus:'Hybrid'},commonBeginner([O('back_squat'),O('bent_over_row'),O('push_up'),O('kettlebell_swing'),O('reverse_lunge')],45,25)),

  make({id:'b-core-stability-60',title:'Beginner Core & Stability 60',subtitle:'Έλεγχος κορμού, ισορροπία και σταθερότητα μέσα από ολοκληρωμένα μοτίβα.',level:'Beginner',type:'Core',methodology:'Core + Stability',equipment:'Bodyweight',focus:'Core / Stability'},commonBeginner([O('plank'),O('glute_bridge'),O('reverse_lunge'),O('superman'),O('push_up')],45,30)),

  make({id:'b-mobility-60',title:'Beginner Mobility & Control 60',subtitle:'Κινητικότητα και ενεργός έλεγχος με squat, hinge, lunge και σταθεροποίηση.',level:'Beginner',type:'Mobility',methodology:'Mobility Strength',equipment:'Bodyweight + Light load',focus:'Mobility'},[
    phase(mobility,12,45,15,'MOBILITY FLOW'),phase(stability,12,45,15,'STABILITY'),phase(foundational,16,60,30,'CONTROLLED STRENGTH'),phase([O('squat'),O('reverse_lunge'),O('good_morning'),O('overhead_squat')],15,45,30,'MOBILITY CIRCUIT'),phase(mobility,5,40,20,'COOL DOWN')
  ]),

  make({id:'b-density-60',title:'Beginner Density Builder 60',subtitle:'Σταδιακή αύξηση έργου ανά λεπτό χωρίς απώλεια τεχνικής.',level:'Beginner',type:'High Density',methodology:'Progressive Density',equipment:'Bodyweight + Kettlebell',focus:'Work Capacity'},commonBeginner([O('squat'),O('push_up'),O('kettlebell_swing'),O('reverse_lunge'),O('bent_over_row'),O('burpee')],45,20)),

  make({id:'b-tabata-60',title:'Beginner Tabata Intro 60',subtitle:'Κλασικός λόγος 20/10 στο κύριο block, με τεχνική προετοιμασία πριν την ένταση.',level:'Beginner',type:'Tabata',methodology:'20/10 Intervals',equipment:'Bodyweight + Kettlebell',focus:'Conditioning'},[
    phase(mobility,8,40,20,'WARM-UP'),phase(stability,10,45,15,'ACTIVATION'),phase(foundational,15,60,30,'TECHNIQUE'),phase([O('squat'),O('push_up'),O('high_knees'),O('kettlebell_swing')],22,20,10,'TABATA 20/10'),phase(mobility,5,40,20,'COOL DOWN')
  ]),

  make({id:'a-high-density-60',title:'Advanced High Density 60',subtitle:'Υψηλό έργο ανά λεπτό με σύνθετες πολυαρθρικές κινήσεις.',level:'Advanced',type:'High Density',methodology:'50/10 Density',equipment:'Mixed',focus:'Work Capacity'},commonAdvanced([O('clean_and_jerk'),O('burpee'),O('kettlebell_swing'),O('bent_over_row'),O('overhead_squat'),O('sumo_high_pull')],50,10)),

  make({id:'a-tabata-60',title:'Advanced Tabata Power 60',subtitle:'20/10 κύριο block με δυναμικές σύνθετες κινήσεις και αυστηρή τεχνική.',level:'Advanced',type:'Tabata',methodology:'20/10 Power Intervals',equipment:'Bodyweight + Kettlebell + Barbell',focus:'Power / Conditioning'},[
    phase(mobility,8,45,15,'DYNAMIC WARM-UP'),phase(stability,10,50,10,'ACTIVATION'),phase(strength,15,75,15,'POWER PREP'),phase([O('burpee'),O('kettlebell_swing'),O('sumo_high_pull'),O('jump_push_up'),O('high_knees')],22,20,10,'TABATA 20/10'),phase(mobility,5,45,15,'COOL DOWN')
  ]),

  make({id:'a-strength-60',title:'Advanced Complex Strength 60',subtitle:'Βαριά βασικά μοτίβα και σύνθετες κινήσεις σε ελεγχόμενα intervals.',level:'Advanced',type:'Strength',methodology:'Complex Strength',equipment:'Barbell',focus:'Strength'},commonAdvanced([O('back_squat'),O('deadlift'),O('bent_over_row'),O('overhead_press'),O('romanian_deadlift'),O('overhead_squat')],70,20)),

  make({id:'a-hybrid-60',title:'Advanced Athletic Hybrid 60',subtitle:'Strength, power και metabolic conditioning με athletic complexes.',level:'Advanced',type:'Hybrid',methodology:'Athletic Complex',equipment:'Barbell + Kettlebell + Bodyweight',focus:'Hybrid'},commonAdvanced([O('clean_and_jerk'),O('snatch'),O('kettlebell_swing'),O('burpee'),O('overhead_squat'),O('push_up')],45,15)),

  make({id:'a-conditioning-60',title:'Advanced Conditioning Power 60',subtitle:'Υψηλή καρδιοαναπνευστική απαίτηση με σύνθετα full-body patterns.',level:'Advanced',type:'Conditioning',methodology:'Power Conditioning',equipment:'Mixed',focus:'Conditioning'},commonAdvanced(conditioning,45,15)),

  make({id:'a-core-60',title:'Advanced Core Integration 60',subtitle:'Ο κορμός δουλεύει μέσα σε push, hinge, unilateral και overhead μοτίβα.',level:'Advanced',type:'Core',methodology:'Integrated Core',equipment:'Bodyweight + Barbell',focus:'Core / Strength'},commonAdvanced([O('overhead_squat'),O('push_up'),O('romanian_deadlift'),O('pistol_squat'),O('plank'),O('superman')],50,15)),

  make({id:'a-stability-60',title:'Advanced Stability & Unilateral 60',subtitle:'Μονόπλευρη φόρτιση, έλεγχος λεκάνης και δυναμική σταθερότητα.',level:'Advanced',type:'Stability',methodology:'Unilateral Control',equipment:'Bodyweight + Barbell',focus:'Stability'},commonAdvanced(unilateral,50,15)),

  make({id:'a-mobility-strength-60',title:'Advanced Mobility Strength 60',subtitle:'Ενεργό εύρος κίνησης υπό φορτίο με overhead squat, lunge και hinge.',level:'Advanced',type:'Mobility',methodology:'Loaded Mobility',equipment:'Barbell + Bodyweight',focus:'Mobility / Strength'},[
    phase(mobility,10,45,15,'DYNAMIC MOBILITY'),phase(stability,10,50,10,'STABILITY'),phase([O('overhead_squat'),O('good_morning'),O('reverse_lunge'),O('romanian_deadlift')],20,70,20,'LOADED MOBILITY'),phase([O('overhead_squat'),O('pistol_squat'),O('push_up'),O('bent_over_row')],15,45,15,'INTEGRATION'),phase(mobility,5,45,15,'COOL DOWN')
  ])
];
