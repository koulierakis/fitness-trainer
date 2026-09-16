import React,{useMemo} from 'react';
import {X,Clock,ChevronRight} from 'lucide-react';
import ExerciseAnimation from './ExerciseAnimation';
import {buildTimeline,totalSeconds} from '../engine/workout';

const LABELS={
 'WARM-UP':'Ζέσταμα',
 'MOBILITY + ACTIVATION':'Κινητικότητα & ενεργοποίηση',
 'TECHNIQUE / CONTROL':'Τεχνική & έλεγχος',
 'MAIN WORK':'Κύριο μέρος',
 'COOL DOWN':'Αποθεραπεία'
};
const fmt=s=>`${Math.round(s/60)}′`;
const cleanLabel=s=>String(s||'').replace(/ · RECOVERY$/,'');

export default function LessonPlan({program,exercises,onClose,onExercise}){
 const timeline=useMemo(()=>buildTimeline(program,exercises),[program,exercises]);
 const sections=useMemo(()=>{
  const map=new Map();
  timeline.forEach(item=>{
   const key=cleanLabel(item.label)||'MAIN WORK';
   if(!map.has(key))map.set(key,{key,seconds:0,workSeconds:0,restSeconds:0,items:[]});
   const section=map.get(key);section.seconds+=Number(item.seconds||0);
   if(item.type==='rest'){section.restSeconds+=Number(item.seconds||0);return}
   section.workSeconds+=Number(item.seconds||0);
   const previous=section.items.find(x=>x.exercise?.id===item.exercise?.id);
   if(previous){previous.seconds+=Number(item.seconds||0);previous.rounds+=1}else section.items.push({exercise:item.exercise,seconds:Number(item.seconds||0),rounds:1});
  });
  return [...map.values()];
 },[timeline]);
 const total=totalSeconds(timeline);
 return <div className="app"><header className="topbar"><button className="iconBtn" onClick={onClose}><X/></button><div className="centerTitle"><b>{program.title}</b><small>{program.level} · {program.type}</small></div><div className="iconBtn"><Clock/></div></header><main className="main lessonPlan"><section className="lessonHero"><span>TRAINER LESSON PLAN</span><h1>{program.type} · 60′</h1><p>Ολόκληρη η δομή του μαθήματος, έτοιμη για διδασκαλία. Δεν χρειάζεται εκτέλεση χρονομέτρου.</p><strong>{fmt(total)} συνολικά</strong></section>{sections.map((section,index)=><section className="lessonSection" key={section.key}><div className="lessonSectionHead"><div><span>ΜΕΡΟΣ {index+1}</span><h2>{LABELS[section.key]||section.key}</h2></div><strong>{fmt(section.seconds)}</strong></div><p className="lessonProtocol">Εργασία {fmt(section.workSeconds)}{section.restSeconds?` · Μεταβάσεις/διαλείμματα ${fmt(section.restSeconds)}`:''}</p><div className="lessonExercises">{section.items.map((item,i)=><button className="lessonExercise" key={`${item.exercise?.id}-${i}`} onClick={()=>onExercise(item.exercise)}><div className="lessonThumb"><ExerciseAnimation exercise={item.exercise} compact/></div><div className="lessonExerciseText"><span>{i+1}. {item.exercise?.equipment}</span><h3>{item.exercise?.gr||item.exercise?.name}</h3><p>{item.exercise?.name}</p><small>{item.rounds>1?`${item.rounds} περάσματα · `:''}{item.seconds<60?`${item.seconds}″`:`${Math.round(item.seconds/60)}′`} συνολικός χρόνος</small></div><ChevronRight/></button>)}</div></section>)}</main></div>;
}