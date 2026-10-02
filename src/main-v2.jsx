import React,{useEffect,useMemo,useState} from 'react';
import {createRoot} from 'react-dom/client';
import {Home,Dumbbell,Mic,Play,Search,Settings2,X,ChevronRight} from 'lucide-react';
import './styles.css';
import {programs as basePrograms,PROGRAM_CATEGORIES} from './programs60';
import {loadDatasetExercises} from './dataset';
import ExerciseAnimation from './components/ExerciseAnimation';
import LessonPlan from './components/LessonPlan';
import ReformerProgramPlan from './components/ReformerProgramPlan';
import {functionalExercises,FUNCTIONAL_BODY_AREAS,FUNCTIONAL_MUSCLES,FUNCTIONAL_LEVELS} from './catalog/functionalCatalog';
import {expandedFunctionalPrograms,EXPANDED_PROGRAM_CATEGORIES} from './catalog/functionalPrograms';
import {reformerExercises,REFORMER_CATEGORIES,REFORMER_LEVELS} from './catalog/reformerCatalog';
import {reformerPrograms,reformerProgramCategories} from './catalog/reformerPrograms';

const norm=s=>String(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
const functionalPrograms=[...basePrograms,...expandedFunctionalPrograms];
const functionalProgramCategories=[...new Set([...PROGRAM_CATEGORIES,...EXPANDED_PROGRAM_CATEGORIES])];

const remoteArea=x=>x.bodyArea||x.group||'Λοιπά';
const remoteMuscles=x=>{
 const source=[...(x.primaryMuscles||[]),...(x.secondaryMuscles||[])].map(norm).join(' ');
 const out=[];
 const add=v=>!out.includes(v)&&out.push(v);
 if(/biceps/.test(source))add('Δικέφαλοι');
 if(/triceps/.test(source))add('Τρικέφαλοι');
 if(/shoulder|deltoid/.test(source))add('Ώμοι');
 if(/pectoral|chest/.test(source))add('Στήθος');
 if(/lat|trap|rhomboid|back/.test(source))add('Πλάτη');
 if(/abdominal|abs|oblique/.test(source))add('Κοιλιακοί');
 if(/spine|erector|lower back/.test(source))add('Ραχιαίοι');
 if(/glute/.test(source))add('Γλουτοί');
 if(/quad/.test(source))add('Τετρακέφαλοι');
 if(/hamstring/.test(source))add('Δικέφαλοι μηριαίοι');
 if(/calf|gastrocnemius|soleus/.test(source))add('Γάμπες');
 if(/abductor/.test(source))add('Απαγωγοί');
 if(/adductor/.test(source))add('Προσαγωγοί');
 return out;
};
const normalizeRemote=x=>({...x,trainingType:'functional',bodyArea:remoteArea(x),detailedMuscles:remoteMuscles(x),visuals:x.visuals||{start:null,execution:null,return:null,gif:x.media?.imageUrl||null,video:null,model3d:null}});

function App(){
 const[mode,setMode]=useState('functional');
 const[tab,setTab]=useState('home');
 const[remote,setRemote]=useState([]);
 const[status,setStatus]=useState('loading');
 const[detail,setDetail]=useState(null);
 const[lesson,setLesson]=useState(null);
 const[q,setQ]=useState('');
 const[equipment,setEquipment]=useState('Όλα');
 const[bodyArea,setBodyArea]=useState('Όλα');
 const[muscle,setMuscle]=useState('Όλα');
 const[goal,setGoal]=useState('Όλα');
 const[level,setLevel]=useState('Όλα');
 const[pLevel,setPLevel]=useState('Beginner');
 const[pType,setPType]=useState('Full Body');

 useEffect(()=>{
  const c=new AbortController();
  loadDatasetExercises({signal:c.signal})
   .then(x=>{setRemote(x.filter(e=>e.media?.imageUrl).map(normalizeRemote));setStatus('ready')})
   .catch(()=>setStatus('error'));
  return()=>c.abort();
 },[]);

 useEffect(()=>{
  setQ('');setEquipment('Όλα');setBodyArea('Όλα');setMuscle('Όλα');setGoal('Όλα');setLevel('Όλα');
  setPLevel('Beginner');setPType('Full Body');setDetail(null);setLesson(null);
 },[mode]);

 const functionalLibrary=useMemo(()=>{
  const seen=new Set();
  return[...functionalExercises,...remote].filter(x=>{
   const key=norm(x.name||x.gr);
   if(seen.has(key))return false;
   seen.add(key);return true;
  });
 },[remote]);

 const exercises=mode==='functional'?functionalLibrary:reformerExercises;

 const values=key=>[...new Set(exercises.map(x=>x[key]).filter(Boolean))].sort();
 const filtered=useMemo(()=>exercises.filter(x=>{
  const muscles=[...(x.primaryMuscles||[]),...(x.detailedMuscles||[])];
  const hay=norm([x.name,x.gr,x.bodyArea,x.group,x.equipment,x.goal,x.movement,...muscles,...(x.tags||[])].join(' '));
  return(!q||hay.includes(norm(q)))
   &&(equipment==='Όλα'||x.equipment===equipment)
   &&(bodyArea==='Όλα'||x.bodyArea===bodyArea||x.group===bodyArea)
   &&(muscle==='Όλα'||muscles.includes(muscle))
   &&(goal==='Όλα'||x.goal===goal)
   &&(level==='Όλα'||x.level===level);
 }),[exercises,q,equipment,bodyArea,muscle,goal,level]);

 const programSource=mode==='functional'?functionalPrograms:reformerPrograms;
 const programCategories=mode==='functional'?functionalProgramCategories:reformerProgramCategories;
 const visiblePrograms=programSource.filter(p=>(pLevel==='Όλα'||p.level===pLevel)&&(pType==='Όλα'||p.type===pType||p.focus===pType));

 const Filter=({label,value,set,options})=><div className="filterBlock"><label>{label}</label><div className="chips">{['Όλα',...options].map(v=><button key={v} className={value===v?'on':''} onClick={()=>set(v)}>{v}</button>)}</div></div>;

 if(lesson){
  return lesson.trainingType==='reformer'
   ?<ReformerProgramPlan program={lesson} exercises={reformerExercises} onClose={()=>setLesson(null)} onExercise={exercise=>{setDetail(exercise);setLesson(null)}}/>
   :<LessonPlan program={lesson} exercises={functionalLibrary} onClose={()=>setLesson(null)} onExercise={exercise=>{setDetail(exercise);setLesson(null)}}/>;
 }

 if(detail)return <div className="app">
  <header className="topbar"><button className="iconBtn" onClick={()=>setDetail(null)}><X/></button><div className="centerTitle"><b>{detail.trainingType==='reformer'?'Pilates Reformer':'Functional'}</b><small>{detail.level}</small></div><span/></header>
  <main className="main">
   <ExerciseAnimation exercise={detail}/>
   <section className="detail">
    <p className="kicker">{detail.level} · {detail.equipment} · {detail.bodyArea||detail.group}</p>
    <h1>{detail.gr||detail.name}</h1><small>{detail.name}</small>
    {detail.description&&<><h3>Περιγραφή</h3><p>{detail.description}</p></>}
    <h3>Εκτέλεση</h3><p>{detail.instructions}</p>
    {detail.returnDescription&&<><h3>Επιστροφή</h3><p>{detail.returnDescription}</p></>}
    {detail.breathing&&<><h3>Αναπνοή</h3><p>{detail.breathing}</p></>}
    <h3>Κύριες κατηγορίες</h3><p>{(detail.primaryMuscles||[]).join(' · ')||detail.bodyArea}</p>
    {detail.mistakes?.length>0&&<><h3>Συχνά λάθη</h3><p>{detail.mistakes.join(' · ')}</p></>}
    {detail.trainingType==='reformer'&&<div className="reformerSettings"><h3>Ρυθμίσεις Reformer</h3><p>Springs: {detail.springSetting}</p><p>Footbar: {detail.footbarPosition}</p><p>Straps: {detail.straps}</p><p>Επαναλήψεις: {detail.reps}</p></div>}
   </section>
  </main>
 </div>;

 return <div className="app">
  <header className="topbar"><div className="brand"><span>ATHLETICO</span><strong>Fitness Trainer</strong></div><button className="iconBtn"><Mic/></button></header>
  <main className="main">
   <div className="modeSwitch">
    <button className={mode==='functional'?'on':''} onClick={()=>setMode('functional')}>Functional</button>
    <button className={mode==='reformer'?'on':''} onClick={()=>setMode('reformer')}>Pilates Reformer</button>
   </div>

   {tab==='home'&&<>
    <section className="hero">
     <p className="kicker">{mode==='functional'?'FUNCTIONAL TRAINING':'PILATES REFORMER'}</p>
     <h1>{mode==='functional'?'Ασκησιολόγιο & προγράμματα.':'Reformer ασκησιολόγιο & προγράμματα.'}</h1>
     <p>{exercises.length} ασκήσεις · {programSource.length} έτοιμα προγράμματα {mode==='functional'&&status==='loading'?'· φόρτωση μεγάλης βάσης…':''}</p>
    </section>
    <div className="quickGrid">
     <button onClick={()=>setTab('library')}><Dumbbell/>Ασκησιολόγιο</button>
     <button onClick={()=>setTab('programs')}><Play/>Έτοιμα προγράμματα</button>
    </div>
   </>}

   {tab==='library'&&<>
    <div className="pageHead"><div><span>{mode==='functional'?'FUNCTIONAL LIBRARY':'PILATES REFORMER LIBRARY'}</span><h1>Ασκησιολόγιο</h1></div></div>
    <div className="searchBox"><Search/><input value={q} onChange={e=>setQ(e.target.value)} placeholder="Αναζήτηση άσκησης..."/></div>
    <div className="filterPanel">
     <Filter label="Επίπεδο" value={level} set={setLevel} options={mode==='functional'?FUNCTIONAL_LEVELS:REFORMER_LEVELS}/>
     <Filter label="Κατηγορία σώματος" value={bodyArea} set={setBodyArea} options={mode==='functional'?FUNCTIONAL_BODY_AREAS:REFORMER_CATEGORIES}/>
     {mode==='functional'&&<Filter label="Αναλυτική μυϊκή ομάδα" value={muscle} set={setMuscle} options={FUNCTIONAL_MUSCLES}/>}
     <Filter label="Εξοπλισμός" value={equipment} set={setEquipment} options={values('equipment')}/>
     {mode==='functional'&&<Filter label="Στόχος" value={goal} set={setGoal} options={values('goal')}/>}
    </div>
    <p className="resultMeta">{filtered.length} ασκήσεις {mode==='functional'&&status==='error'?'· εξωτερική βάση προσωρινά μη διαθέσιμη':''}</p>
    <div className="exerciseGrid">{filtered.map(ex=><article className="exerciseCard" key={ex.id} onClick={()=>setDetail(ex)}>
     <div className="exerciseVisual"><ExerciseAnimation exercise={ex} compact/></div>
     <div className="exerciseContent"><div className="miniRow"><span>{ex.equipment}</span></div><h3>{ex.gr||ex.name}</h3><p>{ex.name}</p><div className="metaPills"><span>{ex.level}</span><span>{ex.bodyArea||ex.group}</span></div></div>
    </article>)}</div>
   </>}

   {tab==='programs'&&<>
    <div className="pageHead"><div><span>{mode==='functional'?'FUNCTIONAL LESSON PLANS':'REFORMER LESSON PLANS'}</span><h1>Έτοιμα προγράμματα</h1></div></div>
    <Filter label="Επίπεδο" value={pLevel} set={setPLevel} options={mode==='functional'?FUNCTIONAL_LEVELS:REFORMER_LEVELS}/>
    <Filter label="Κατηγορία" value={pType} set={setPType} options={programCategories}/>
    <div className="programList">{visiblePrograms.map(p=><button className="programCard" key={p.id} onClick={()=>setLesson(p)}><div><span>{p.level} · {p.type||p.focus} · {p.duration||60}′</span><h3>{p.title}</h3><p>Προβολή πλήρους δομής μαθήματος</p></div><ChevronRight/></button>)}</div>
   </>}
  </main>
  <nav className="bottomNav">
   <button className={tab==='home'?'on':''} onClick={()=>setTab('home')}><Home/>Home</button>
   <button className={tab==='library'?'on':''} onClick={()=>setTab('library')}><Dumbbell/>Ασκήσεις</button>
   <button className="voiceNav"><Mic/></button>
   <button className={tab==='programs'?'on':''} onClick={()=>setTab('programs')}><Play/>Programs</button>
   <button onClick={()=>setTab('home')}><Settings2/>Settings</button>
  </nav>
 </div>;
}
createRoot(document.getElementById('root')).render(<App/>);
