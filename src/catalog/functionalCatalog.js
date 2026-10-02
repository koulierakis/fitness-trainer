import {exercises as baseExercises} from '../data';

export const FUNCTIONAL_BODY_AREAS=['Πόδια','Χέρια','Πλάτη','Στήθος','Κορμός','Full Body','Stretching'];
export const FUNCTIONAL_MUSCLES=['Δικέφαλοι','Τρικέφαλοι','Ώμοι','Στήθος','Πλάτη','Κοιλιακοί','Ραχιαίοι','Γλουτοί','Τετρακέφαλοι','Δικέφαλοι μηριαίοι','Γάμπες','Απαγωγοί','Προσαγωγοί'];
export const FUNCTIONAL_LEVELS=['Beginner','Advanced'];

const visual=()=>({start:null,execution:null,return:null,gif:null,video:null,model3d:null});

const advancedPattern=/snatch|clean|jerk|thruster|turkish|overhead squat|renegade|burpee|power|plyo|jump|windmill|single-leg/i;
const areaFromGroup=g=>{
  if(['Πόδια','Γλουτοί'].includes(g))return'Πόδια';
  if(['Δικέφαλοι','Τρικέφαλοι','Ώμοι','Χέρια'].includes(g))return'Χέρια';
  if(g==='Πλάτη')return'Πλάτη';
  if(g==='Στήθος')return'Στήθος';
  if(['Κορμός','Κοιλιακοί','Ραχιαίοι'].includes(g))return'Κορμός';
  if(g==='Stretching')return'Stretching';
  return'Full Body';
};
const musclesFor=e=>{
  const n=(e.name+' '+e.gr+' '+e.movement).toLowerCase(),out=[];
  const add=(...x)=>x.forEach(v=>!out.includes(v)&&out.push(v));
  if(/squat|lunge|step|split/.test(n))add('Τετρακέφαλοι','Γλουτοί');
  if(/deadlift|rdl|hinge|swing|hip thrust|bridge/.test(n))add('Δικέφαλοι μηριαίοι','Γλουτοί','Ραχιαίοι');
  if(/calf/.test(n))add('Γάμπες');
  if(/row|pull|lat|back/.test(n))add('Πλάτη','Δικέφαλοι');
  if(/press|push-up|push up|chest/.test(n))add('Στήθος','Τρικέφαλοι');
  if(/shoulder|overhead|lateral raise|front raise|arnold/.test(n))add('Ώμοι','Τρικέφαλοι');
  if(/curl|biceps/.test(n))add('Δικέφαλοι');
  if(/triceps|dip/.test(n))add('Τρικέφαλοι');
  if(/plank|crunch|dead bug|hollow|mountain|pallof|rotation|woodchop|core/.test(n))add('Κοιλιακοί');
  if(/abduct|lateral band walk|side step/.test(n))add('Απαγωγοί','Γλουτοί');
  if(/adduct|copenhagen/.test(n))add('Προσαγωγοί');
  if(!out.length){
    if(e.group==='Στήθος')add('Στήθος');
    else if(e.group==='Πλάτη')add('Πλάτη');
    else if(e.group==='Ώμοι')add('Ώμοι');
    else if(e.group==='Γλουτοί')add('Γλουτοί');
    else if(e.group==='Πόδια')add('Τετρακέφαλοι','Δικέφαλοι μηριαίοι');
    else add('Κοιλιακοί');
  }
  return out;
};

export const enrichedBaseExercises=baseExercises.map(e=>{
  const primary=musclesFor(e);
  return {...e,trainingType:'functional',bodyArea:areaFromGroup(e.group),primaryMuscles:primary,secondaryMuscles:(e.secondaryMuscles||[]).filter(Boolean),level:advancedPattern.test(e.name+' '+e.movement)?'Advanced':'Beginner',visuals:e.visuals||visual()};
});

const compound=(id,name,gr,equipment,level,bodyArea,primary,secondary,movement,goal='Strength')=>({
  id:`compound:${id}`,name,gr,trainingType:'functional',group:bodyArea,bodyArea,equipment,level,
  primaryMuscles:primary,secondaryMuscles:secondary,movement,goal,
  instructions:`Εκτέλεσε την ακολουθία ${gr} με ελεγχόμενο ρυθμό. Ολοκλήρωσε το πρώτο μέρος της κίνησης πριν περάσεις στο επόμενο και κράτησε σταθερό κορμό.`,
  cues:['Καθαρή μετάβαση μεταξύ κινήσεων','Σταθερός κορμός','Έλεγξε το φορτίο και την τροχιά'],
  mistakes:['Βιαστική ένωση των κινήσεων','Απώλεια ουδέτερης σπονδυλικής θέσης','Υπερβολικό φορτίο που χαλάει την τεχνική'],
  regression:'Χώρισε την άσκηση στα επιμέρους μέρη ή μείωσε το φορτίο.',
  progression:'Αύξησε σταδιακά φορτίο, επαναλήψεις ή πυκνότητα μόνο με καθαρή τεχνική.',
  reps:'6–10 σύνθετες επαναλήψεις',rest:45,safety:'Σταμάτησε αν υπάρχει πόνος και προσαρμόζεις φορτίο/εύρος στην τεχνική.',visuals:visual()
});

export const compoundExercises=[
compound('db_squat_press','Dumbbell Squat to Press','Squat με πιέσεις ώμων','Dumbbells','Beginner','Full Body',['Τετρακέφαλοι','Γλουτοί','Ώμοι'],['Κοιλιακοί','Τρικέφαλοι'],'Squat + Vertical Push'),
compound('db_lunge_curl','Dumbbell Reverse Lunge to Curl','Προβολή πίσω με κάμψη δικεφάλων','Dumbbells','Beginner','Full Body',['Τετρακέφαλοι','Γλουτοί','Δικέφαλοι'],['Κοιλιακοί','Δικέφαλοι μηριαίοι'],'Lunge + Curl'),
compound('db_deadlift_row','Dumbbell Deadlift to Row','Deadlift με κωπηλατική','Dumbbells','Beginner','Full Body',['Δικέφαλοι μηριαίοι','Γλουτοί','Πλάτη'],['Δικέφαλοι','Ραχιαίοι','Κοιλιακοί'],'Hinge + Pull'),
compound('db_step_press','Dumbbell Step-Up to Press','Step-up με πίεση ώμων','Dumbbells','Advanced','Full Body',['Τετρακέφαλοι','Γλουτοί','Ώμοι'],['Κοιλιακοί','Γάμπες','Τρικέφαλοι'],'Step-Up + Press'),
compound('db_burpee_row','Dumbbell Burpee to Row','Burpee με κωπηλατική αλτήρων','Dumbbells','Advanced','Full Body',['Στήθος','Πλάτη','Τρικέφαλοι'],['Κοιλιακοί','Γλουτοί','Τετρακέφαλοι'],'Burpee + Row','Conditioning'),
compound('db_lunge_rotation','Dumbbell Lunge with Rotation','Προβολή με στροφή κορμού','Dumbbells','Beginner','Full Body',['Τετρακέφαλοι','Γλουτοί','Κοιλιακοί'],['Προσαγωγοί','Απαγωγοί'],'Lunge + Rotation'),
compound('bar_deadlift_highpull','Barbell Deadlift to High Pull','Deadlift με high pull','Barbell','Advanced','Full Body',['Δικέφαλοι μηριαίοι','Γλουτοί','Πλάτη','Ώμοι'],['Δικέφαλοι','Ραχιαίοι'],'Hinge + Pull','Power'),
compound('bar_frontsquat_press','Barbell Front Squat to Press','Front squat με πίεση','Barbell','Advanced','Full Body',['Τετρακέφαλοι','Γλουτοί','Ώμοι'],['Κοιλιακοί','Τρικέφαλοι'],'Squat + Press'),
compound('bar_clean_frontsquat','Clean to Front Squat','Clean σε front squat','Barbell','Advanced','Full Body',['Τετρακέφαλοι','Γλουτοί','Δικέφαλοι μηριαίοι'],['Πλάτη','Ώμοι','Κοιλιακοί'],'Clean + Squat','Power'),
compound('kb_swing_squat','Kettlebell Swing to Goblet Squat','Swing σε goblet squat','Kettlebell','Advanced','Full Body',['Γλουτοί','Δικέφαλοι μηριαίοι','Τετρακέφαλοι'],['Κοιλιακοί','Ραχιαίοι'],'Hinge + Squat','Conditioning'),
compound('kb_clean_press','Kettlebell Clean to Press','Kettlebell clean & press','Kettlebell','Advanced','Full Body',['Γλουτοί','Ώμοι'],['Δικέφαλοι μηριαίοι','Τρικέφαλοι','Κοιλιακοί'],'Clean + Press','Power'),
compound('kb_lunge_pass','Kettlebell Reverse Lunge with Pass','Προβολή πίσω με πέρασμα kettlebell','Kettlebell','Beginner','Full Body',['Τετρακέφαλοι','Γλουτοί','Κοιλιακοί'],['Απαγωγοί','Προσαγωγοί'],'Lunge + Anti-rotation'),
compound('trx_squat_row','TRX Squat to Row','TRX squat με κωπηλατική','TRX','Beginner','Full Body',['Τετρακέφαλοι','Γλουτοί','Πλάτη'],['Δικέφαλοι','Κοιλιακοί'],'Squat + Pull'),
compound('trx_lunge_fly','TRX Reverse Lunge to Y Fly','TRX προβολή πίσω σε Y fly','TRX','Advanced','Full Body',['Τετρακέφαλοι','Γλουτοί','Ώμοι'],['Πλάτη','Κοιλιακοί'],'Lunge + Shoulder Raise'),
compound('trx_plank_kneetuck','TRX Plank to Knee Tuck','TRX σανίδα με μάζεμα γονάτων','TRX','Advanced','Κορμός',['Κοιλιακοί'],['Ώμοι','Τρικέφαλοι'],'Plank + Knee Tuck','Core'),
compound('band_squat_row','Band Squat to Row','Squat με κωπηλατική λάστιχου','Resistance Bands','Beginner','Full Body',['Τετρακέφαλοι','Γλουτοί','Πλάτη'],['Δικέφαλοι','Κοιλιακοί'],'Squat + Pull'),
compound('band_lunge_press','Band Lunge to Press','Προβολή με πίεση λάστιχου','Resistance Bands','Beginner','Full Body',['Τετρακέφαλοι','Γλουτοί','Ώμοι'],['Τρικέφαλοι','Κοιλιακοί'],'Lunge + Press'),
compound('battle_squat_waves','Battle Rope Squat Waves','Squat με κύματα battle rope','Battle Ropes','Beginner','Full Body',['Τετρακέφαλοι','Ώμοι'],['Γλουτοί','Κοιλιακοί'],'Squat + Waves','Conditioning'),
compound('battle_lunge_slam','Battle Rope Lunge to Slam','Προβολή με slam battle rope','Battle Ropes','Advanced','Full Body',['Τετρακέφαλοι','Γλουτοί','Ώμοι'],['Κοιλιακοί','Ραχιαίοι'],'Lunge + Slam','Conditioning'),
compound('bench_step_kneedrive','Step-Up to Knee Drive','Step-up με ανέβασμα γονάτου','Bench/Step','Beginner','Πόδια',['Τετρακέφαλοι','Γλουτοί'],['Γάμπες','Κοιλιακοί','Απαγωγοί'],'Step-Up + Balance'),
compound('bench_burpee_step','Burpee to Step-Up','Burpee σε step-up','Bench/Step','Advanced','Full Body',['Στήθος','Τετρακέφαλοι','Γλουτοί'],['Τρικέφαλοι','Κοιλιακοί'],'Burpee + Step-Up','Conditioning'),
compound('bosu_squat_press','BOSU Squat to Press','BOSU squat με πίεση','BOSU','Advanced','Full Body',['Τετρακέφαλοι','Γλουτοί','Ώμοι'],['Κοιλιακοί','Απαγωγοί'],'Squat + Press','Stability'),
compound('bw_squat_kneedrive','Squat to Knee Drive','Squat με ανέβασμα γονάτου','Bodyweight','Beginner','Full Body',['Τετρακέφαλοι','Γλουτοί','Κοιλιακοί'],['Απαγωγοί','Γάμπες'],'Squat + Balance'),
compound('bw_lunge_reach','Reverse Lunge to Overhead Reach','Προβολή πίσω με έκταση χεριών','Bodyweight','Beginner','Full Body',['Τετρακέφαλοι','Γλουτοί','Κοιλιακοί'],['Ώμοι','Δικέφαλοι μηριαίοι'],'Lunge + Reach'),
compound('bw_bear_pushup','Bear Crawl to Push-Up','Bear crawl σε push-up','Bodyweight','Advanced','Full Body',['Στήθος','Τρικέφαλοι','Κοιλιακοί'],['Ώμοι','Τετρακέφαλοι'],'Locomotion + Push','Conditioning'),
compound('bw_skater_squat','Skater to Squat','Skater σε squat','Bodyweight','Advanced','Πόδια',['Γλουτοί','Τετρακέφαλοι','Απαγωγοί'],['Προσαγωγοί','Γάμπες','Κοιλιακοί'],'Lateral + Squat','Conditioning')
];

export const functionalExercises=[...enrichedBaseExercises,...compoundExercises];
