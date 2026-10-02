import React,{useMemo} from 'react';
import {X,Clock,ChevronRight} from 'lucide-react';
import ExerciseAnimation from './ExerciseAnimation';

export default function ReformerProgramPlan({program,exercises,onClose,onExercise}){
 const byId=useMemo(()=>new Map(exercises.map(x=>[x.id,x])),[exercises]);
 const items=program.segments.map((segment,index)=>({segment,index,exercise:byId.get(segment.exerciseId)})).filter(x=>x.exercise);
 const total=items.reduce((n,x)=>n+x.segment.minutes,0);
 return <div className="app">
  <header className="topbar"><button className="iconBtn" onClick={onClose}><X/></button><div className="centerTitle"><b>{program.title}</b><small>{program.level} · {program.focus}</small></div><div className="iconBtn"><Clock/></div></header>
  <main className="main lessonPlan">
   <section className="lessonHero"><span>PILATES REFORMER · LESSON PLAN</span><h1>{program.focus} · {total}′</h1><p>Πραγματικές ασκήσεις από το Reformer ασκησιολόγιο, με ρυθμίσεις και coaching στοιχεία.</p><strong>{total}′ συνολικά</strong></section>
   <section className="lessonSection">
    <div className="lessonSectionHead"><div><span>ΑΣΚΗΣΕΙΣ</span><h2>{program.title}</h2></div><strong>{items.length}</strong></div>
    <div className="lessonExercises">{items.map(({segment,exercise,index})=><button className="lessonExercise" key={exercise.id+'-'+index} onClick={()=>onExercise(exercise)}>
      <div className="lessonThumb"><ExerciseAnimation exercise={exercise} compact/></div>
      <div className="lessonExerciseText"><span>{index+1}. {exercise.bodyArea}</span><h3>{exercise.gr}</h3><p>{exercise.name}</p><small>{segment.minutes}′ · Springs: {exercise.springSetting}</small></div><ChevronRight/>
    </button>)}</div>
   </section>
  </main>
 </div>
}