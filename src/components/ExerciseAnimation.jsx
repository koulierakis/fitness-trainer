import React from 'react';
import Exercise3DViewer from './Exercise3DViewer';

function ImageSequencePreview({exercise,compact=false}){
  const media=exercise?.media||{};
  const frames=media.imageUrls||[];
  const [frame,setFrame]=React.useState(0);

  React.useEffect(()=>{
    if(!media.enabled||frames.length<2)return;
    const timer=window.setInterval(()=>setFrame(v=>(v+1)%frames.length),850);
    return()=>window.clearInterval(timer);
  },[media.enabled,frames.join('|')]);

  if(!media.enabled||!frames.length)return <Pending3D exercise={exercise} compact={compact}/>;

  return <div className={`demo remote-sequence-demo ${compact?'demo-compact':''}`}>
    <img src={frames[frame]} alt={`${exercise?.name||'Exercise'} preview`} loading="lazy" referrerPolicy="no-referrer"/>
    <div className="mediaAttribution">{media.badge||'EXERCISE'}</div>
    {!compact&&<div className="demoLabel"><span>{media.label||'EXERCISE PREVIEW'}</span><strong>{exercise?.gr}</strong><small>{media.credit||''}</small></div>}
  </div>;
}

function Pending3D({exercise,compact=false}){
  return <div className={`demo anatomical-fallback ${compact?'demo-compact':''}`} aria-label={`3D preview pending: ${exercise?.gr||exercise?.name||''}`}>
    <div style={{minHeight:compact?150:300,display:'grid',placeItems:'center',padding:'24px',textAlign:'center',background:'radial-gradient(circle at 50% 35%, rgba(255,255,255,.08), rgba(255,255,255,.015) 42%, transparent 70%)'}}>
      <div>
        <div style={{fontSize:compact?12:13,letterSpacing:'.16em',opacity:.58}}>3D MODEL</div>
        <strong style={{display:'block',marginTop:8,fontSize:compact?16:24}}>{exercise?.gr||exercise?.name}</strong>
        {!compact&&<small style={{display:'block',marginTop:8,opacity:.55}}>Το skeletal animation δεν είναι ακόμη διαθέσιμο.</small>}
      </div>
    </div>
  </div>;
}

export default function ExerciseAnimation({exercise,compact=false}){
  if(exercise?.media3d?.type==='glb'){
    const media=exercise.media3d;
    return <Exercise3DViewer
      modelUrl={media.modelUrl}
      animationName={media.animationName}
      compact={compact}
      cameraPosition={media.camera?.position||[2.8,1.7,4.2]}
      cameraTarget={media.camera?.target||[0,1,0]}
      scale={media.model?.scale||1}
      modelPosition={media.model?.position||[0,0,0]}
      modelRotation={media.model?.rotation||[0,0,0]}
    />;
  }
  if(exercise?.media?.type==='remote-image-sequence')return <ImageSequencePreview exercise={exercise} compact={compact}/>;
  return <Pending3D exercise={exercise} compact={compact}/>;
}
