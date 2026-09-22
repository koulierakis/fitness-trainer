import React,{useEffect,useState} from 'react';
import visualManifest from '../visuals/exercise-visual-manifest.json';

export function KeyframeExercisePreview({exercise,compact=false,onUnavailable}){
  const spec=visualManifest.exercises[exercise?.id];
  const [index,setIndex]=useState(0);
  const [failed,setFailed]=useState(false);
  const order=['start','execution','return','execution','start'];
  useEffect(()=>{setFailed(false);setIndex(0)},[exercise?.id]);
  useEffect(()=>{if(!spec||failed)return;const t=setInterval(()=>setIndex(i=>(i+1)%order.length),650);return()=>clearInterval(t)},[exercise?.id,Boolean(spec),failed]);
  useEffect(()=>{if(failed)onUnavailable?.()},[failed,onUnavailable]);
  if(!spec||failed)return null;
  const key=order[index],src=spec.frames[key].asset;
  return <div className={`demo athletico-keyframe-demo ${compact?'demo-compact':''}`}>
    <img src={src} alt={`${exercise.gr||exercise.name} ${key}`} loading="lazy" onError={()=>setFailed(true)}/>
  </div>;
}

export const hasKeyframeVisual=exerciseId=>Boolean(visualManifest.exercises[exerciseId]);
