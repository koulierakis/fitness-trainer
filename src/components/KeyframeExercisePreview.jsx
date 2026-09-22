import React,{useEffect,useState} from 'react';
import visualManifest from '../visuals/exercise-visual-manifest.json';

export function KeyframeExercisePreview({exercise,compact=false,onUnavailable}){
  const spec=visualManifest.exercises[exercise?.id];
  const [index,setIndex]=useState(0);
  const order=['start','execution','return','execution','start'];
  useEffect(()=>{if(!spec)return;setIndex(0);const t=setInterval(()=>setIndex(i=>(i+1)%order.length),650);return()=>clearInterval(t)},[exercise?.id,Boolean(spec)]);
  if(!spec){onUnavailable?.();return null}
  const key=order[index],src=spec.frames[key].asset;
  return <div className={`demo athletico-keyframe-demo ${compact?'demo-compact':''}`}>
    <img src={src} alt={`${exercise.gr||exercise.name} ${key}`} loading="lazy"/>
  </div>;
}

export const hasKeyframeVisual=exerciseId=>Boolean(visualManifest.exercises[exerciseId]);
