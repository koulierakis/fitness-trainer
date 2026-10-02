import React,{useCallback,useEffect,useState} from 'react';
import Exercise3DViewer from './Exercise3DViewer';
import {KeyframeExercisePreview,hasKeyframeVisual} from './KeyframeExercisePreview';

const REPDB_BODYWEIGHT_SQUAT={
  start:'https://raw.githubusercontent.com/RepDB/exercise-dataset/main/images/flat/bodyweight-squat-start.webp',
  peak:'https://raw.githubusercontent.com/RepDB/exercise-dataset/main/images/flat/bodyweight-squat-peak.webp'
};

function RepDBPoseDemo({exercise,compact=false}){
  return <div className={`demo repdb-pose-demo ${compact?'demo-compact':''}`}>
    <style>{`.repdb-pose-demo{position:relative;overflow:hidden;display:grid;place-items:center;min-height:${compact?'112px':'300px'};background:#11161c}.repdb-pose-demo .poseStage{position:relative;width:min(100%,420px);height:${compact?'112px':'300px'}}.repdb-pose-demo img{position:absolute;inset:0;width:100%;height:100%;object-fit:contain;animation:repdbPose 2.2s ease-in-out infinite}.repdb-pose-demo img.peak{animation-delay:-1.1s}@keyframes repdbPose{0%,42%{opacity:1;transform:scale(1)}50%,92%{opacity:0;transform:scale(.985)}100%{opacity:1;transform:scale(1)}}`}</style>
    <div className="poseStage"><img src={REPDB_BODYWEIGHT_SQUAT.start} alt="Bodyweight squat start position"/><img className="peak" src={REPDB_BODYWEIGHT_SQUAT.peak} alt="Bodyweight squat bottom position"/></div>
  </div>;
}

function AnimatedGifPreview({exercise,compact=false,onError}){
  const media=exercise?.media||{};
  const src=media.imageUrl||(media.imageUrls||[])[0];
  if(!media.enabled||!src)return <NoVisualPreview exercise={exercise} compact={compact}/>;
  return <div className={`demo remote-sequence-demo ${compact?'demo-compact':''}`}>
    <img src={src} alt={`${exercise?.name||'Exercise'} animated demonstration`} loading="lazy" onError={onError}/>
    <div className="mediaAttribution">{media.badge||'GIF DEMO'}</div>
  </div>;
}

export function NoVisualPreview({exercise,compact=false}){
  const three=exercise?.visuals||{};
  const hasPlannedFrames=('start'in three)||('execution'in three)||('return'in three);
  return <div className={`demo no-visual-preview ${compact?'demo-compact':''}`} aria-label={`Δεν υπάρχει ακόμη επαληθευμένη προεπισκόπηση για ${exercise?.gr||exercise?.name||''}`}>
    <div className="noVisualInner">
      <strong>{exercise?.trainingType==='reformer'?'REFORMER':'EXERCISE'}</strong>
      <span>Προεπισκόπηση υπό δημιουργία</span>
      {!compact&&<small>{hasPlannedFrames?'Start · Execution · Return':'Θα προστεθεί μόνο επαληθευμένο visual'}</small>}
    </div>
  </div>;
}

export default function ExerciseAnimation({exercise,compact=false}){
  const media3d=exercise?.media3d;
  const[degraded,setDegraded]=useState(null);
  const[keyframesFailed,setKeyframesFailed]=useState(false);
  useEffect(()=>setKeyframesFailed(false),[exercise?.id]);
  useEffect(()=>setDegraded(null),[exercise?.id,media3d?.modelUrl,exercise?.media?.imageUrl]);
  const fallback=useCallback(()=><NoVisualPreview exercise={exercise} compact={compact}/>,[exercise,compact]);

  if(hasKeyframeVisual(exercise?.id)&&!keyframesFailed)return <KeyframeExercisePreview exercise={exercise} compact={compact} onUnavailable={()=>setKeyframesFailed(true)}/>;
  if(exercise?.id==='local:squat')return <RepDBPoseDemo exercise={exercise} compact={compact}/>;

  if(exercise?.media?.type==='animated-gif'&&exercise.media.enabled&&exercise.media.imageUrl&&!degraded){
    return <AnimatedGifPreview exercise={exercise} compact={compact} onError={()=>setDegraded('gif-error')}/>;
  }
  if(media3d?.type==='glb'&&!degraded){
    return <Exercise3DViewer key={`${exercise?.id}|${media3d.modelUrl}`} modelUrl={media3d.modelUrl} animationName={media3d.animationName} compact={compact} cameraPosition={media3d.camera?.position||[2.8,1.7,4.2]} scale={media3d.model?.scale||1} modelPosition={media3d.model?.position||[0,0,0]} modelRotation={media3d.model?.rotation||[0,0,0]} fallback={fallback} onNoAnimation={()=>setDegraded('no-clips')}/>;
  }
  return <NoVisualPreview exercise={exercise} compact={compact}/>;
}
