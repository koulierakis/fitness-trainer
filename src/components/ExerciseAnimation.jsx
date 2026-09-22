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
    {!compact&&<div className="demoLabel"><span>OPEN-SOURCE POSE DEMO · RepDB</span><strong>{exercise?.gr||exercise?.name}</strong><small>Exercise data/images by RepDB (repdb.co)</small></div>}
  </div>;
}

function AnimatedGifPreview({exercise,compact=false,onError}){
  const media=exercise?.media||{};
  const src=media.imageUrl||(media.imageUrls||[])[0];
  if(!media.enabled||!src)return <MotionPreview exercise={exercise} compact={compact}/>;
  return <div className={`demo remote-sequence-demo ${compact?'demo-compact':''}`}>
    <img src={src} alt={`${exercise?.name||'Exercise'} animated demonstration`} loading="lazy" onError={onError}/>
    <div className="mediaAttribution">{media.badge||'GIF DEMO'}</div>
    {!compact&&<div className="demoLabel"><span>{media.label||'ANIMATED EXERCISE DEMO'}</span><strong>{exercise?.gr}</strong><small>{media.credit||''}</small></div>}
  </div>;
}
const motionKind=exercise=>{const m=String(exercise?.movement||'').toLowerCase(),n=String(exercise?.name||'').toLowerCase();if(n.includes('push-up')||n.includes('plank')||n.includes('mountain climber')||n.includes('bear crawl'))return'horizontal';if(m.includes('squat')||m.includes('lunge')||n.includes('squat')||n.includes('lunge'))return'lower';if(m.includes('hinge')||n.includes('deadlift')||n.includes('swing'))return'hinge';if(m.includes('rotation')||n.includes('woodchop')||n.includes('pallof'))return'rotate';if(m.includes('push')||n.includes('press')||n.includes('thruster'))return'press';if(m.includes('pull')||n.includes('row'))return'pull';return'general'};
export function MotionPreview({exercise,compact=false,height}){const kind=motionKind(exercise),horizontal=kind==='horizontal';return <div className={`demo motion-preview motion-${kind} ${compact?'demo-compact':''}`} style={height?{height}:undefined} aria-label={`Motion preview: ${exercise?.gr||exercise?.name||''}`}><style>{`.motion-preview{position:relative;overflow:hidden;display:grid;place-items:center;min-height:${compact?'112px':'300px'}}.motion-preview svg{width:${compact?'86%':'78%'};max-width:420px;height:${compact?'106px':'260px'}}.motion-preview .mline{stroke:currentColor;stroke-width:6;stroke-linecap:round;fill:none}.motion-preview .mjoint{fill:currentColor}.motion-preview .figure{transform-box:fill-box;transform-origin:center;animation:mg 1.8s ease-in-out infinite}@keyframes mg{0%,100%{transform:translateY(-4px)}50%{transform:translateY(7px)}}`}</style><svg viewBox="0 0 220 220" aria-hidden="true" style={{color:'rgba(240,244,248,.92)'}}><g className="figure" transform={horizontal?'rotate(88 110 110)':''}><circle className="mjoint" cx="110" cy="42" r="13"/><path className="mline" d="M110 57 L110 116 M110 75 L78 98 M110 75 L144 98 M110 116 L84 170 M110 116 L140 170"/></g></svg>{!compact&&<div className="demoLabel"><span>ΚΙΝΗΣΗ ΑΣΚΗΣΗΣ</span><strong>{exercise?.gr||exercise?.name}</strong></div>}</div>}
export default function ExerciseAnimation({exercise,compact=false}){const media3d=exercise?.media3d;const[degraded,setDegraded]=useState(null);const[keyframesFailed,setKeyframesFailed]=useState(false);useEffect(()=>setKeyframesFailed(false),[exercise?.id]);if(hasKeyframeVisual(exercise?.id)&&!keyframesFailed)return <KeyframeExercisePreview exercise={exercise} compact={compact} onUnavailable={()=>setKeyframesFailed(true)}/>;if(exercise?.id==='local:squat')return <RepDBPoseDemo exercise={exercise} compact={compact}/>;useEffect(()=>setDegraded(null),[exercise?.id,media3d?.modelUrl,exercise?.media?.imageUrl]);const fallback=useCallback(()=><MotionPreview exercise={exercise} compact={compact}/>,[exercise,compact]);if(exercise?.media?.type==='animated-gif'&&exercise.media.enabled&&exercise.media.imageUrl&&!degraded)return <AnimatedGifPreview exercise={exercise} compact={compact} onError={()=>setDegraded('gif-error')}/>;if(media3d?.type==='glb'&&!degraded)return <Exercise3DViewer key={`${exercise?.id}|${media3d.modelUrl}`} modelUrl={media3d.modelUrl} animationName={media3d.animationName} compact={compact} cameraPosition={media3d.camera?.position||[2.8,1.7,4.2]} scale={media3d.model?.scale||1} modelPosition={media3d.model?.position||[0,0,0]} modelRotation={media3d.model?.rotation||[0,0,0]} fallback={fallback} onNoAnimation={()=>setDegraded('no-clips')}/>;return <MotionPreview exercise={exercise} compact={compact}/>}
